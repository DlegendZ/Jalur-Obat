import torch
import torch.nn as nn
import torch.nn.functional as F
from torch_geometric.nn import GATConv, global_mean_pool
from torch_geometric.data import Data

import pandas as pd
import pickle, joblib
from datetime import datetime

# ==========================================
# 1. Load Encoders & Scaler
# ==========================================
pos_encoder = pickle.load(open("model/pos_encoder.pkl", "rb"))
condition_encoder = pickle.load(open("model/condition_encoder.pkl", "rb"))
scaler = joblib.load("model/scaler.pkl")

pos_classes = list(pos_encoder.classes_)
condition_classes = list(condition_encoder.classes_)

pos2idx = {c: i for i, c in enumerate(pos_classes)}
cond2idx = {c: i for i, c in enumerate(condition_classes)}

def encode_pos_safe(v):
    v = str(v) if pd.notnull(v) else "UNK"
    return pos2idx.get(v, pos2idx.get("UNK", 0))

def encode_condition_safe(v):
    v = str(v) if pd.notnull(v) else condition_classes[0]
    return cond2idx.get(v, 0)

# ==========================================
# 2. GNN Model (same as training)
# ==========================================
class RouteGNNImproved(nn.Module):
    def __init__(self, num_pos, num_cond,
                 emb_dim=32, cont_dim=2,
                 gat_hidden=64, gat_heads=4,
                 dropout=0.25):
        super().__init__()

        # embeddings
        self.emb_prev = nn.Embedding(num_pos, emb_dim)
        self.emb_pos  = nn.Embedding(num_pos, emb_dim)
        self.emb_cond = nn.Embedding(num_cond, emb_dim // 2)

        total = emb_dim + emb_dim + (emb_dim // 2) + cont_dim
        self.lin_in = nn.Linear(total, gat_hidden)

        # GAT layers
        self.gat1 = GATConv(gat_hidden, gat_hidden, heads=gat_heads, concat=False, edge_dim=1)
        self.bn1 = nn.BatchNorm1d(gat_hidden)

        self.gat2 = GATConv(gat_hidden, gat_hidden, heads=gat_heads, concat=False, edge_dim=1)
        self.bn2 = nn.BatchNorm1d(gat_hidden)

        self.dropout = nn.Dropout(dropout)
        self.lin_out = nn.Linear(gat_hidden, 1)

    def forward(self, data):
        x_raw = data.x
        prev_idx = x_raw[:, 0].long()
        pos_idx  = x_raw[:, 1].long()
        cond_idx = x_raw[:, 2].long()
        cont = x_raw[:, 3:]

        prev_emb = self.emb_prev(prev_idx)
        pos_emb  = self.emb_pos(pos_idx)
        cond_emb = self.emb_cond(cond_idx)

        node_feat = torch.cat([prev_emb, pos_emb, cond_emb, cont], dim=1)

        h = F.relu(self.lin_in(node_feat))
        h = F.relu(self.gat1(h, data.edge_index, data.edge_attr))
        h = self.bn1(h)

        h = F.relu(self.gat2(h, data.edge_index, data.edge_attr))
        h = self.bn2(h)

        hg = global_mean_pool(h, data.batch)
        out = self.lin_out(hg).squeeze()

        return out

# ==========================================
# 3. Load Model
# ==========================================
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

num_pos = len(pos_encoder.classes_)
num_cond = len(condition_encoder.classes_)

model = RouteGNNImproved(num_pos, num_cond).to(device)
model.load_state_dict(torch.load("model/route_gnn_improved.pth", map_location=device))
model.eval()

# ==========================================
# 4. Inference Function
# ==========================================
def predict_route(json_data):

    logs = json_data.get("route", None)
    if logs is None or not isinstance(logs, list) or len(logs) < 2:
        return {"error": "JSON must contain 'route' list with at least 2 entries"}

    node_features = []
    timestamps = []

    # Build nodes
    for i, log in enumerate(logs):
        pos = log.get("pos_code", "UNK")
        cond = log.get("condition", condition_classes[0])
        temp = float(log.get("temperature", 0.0))
        hum  = float(log.get("humidity", 0.0))

        prev_pos = logs[i-1].get("pos_code", "UNK") if i > 0 else log.get("prev_pos", "UNK")

        prev_enc = encode_pos_safe(prev_pos)
        pos_enc  = encode_pos_safe(pos)
        cond_enc = encode_condition_safe(cond)
        temp_scaled, hum_scaled = scaler.transform([[temp, hum]])[0]

        node_features.append([prev_enc, pos_enc, cond_enc, temp_scaled, hum_scaled])

        ts = log.get("timestamp", i)
        try:
            timestamps.append(datetime.fromisoformat(ts))
        except:
            timestamps.append(i)

    # Reorder nodes by timestamp (optional)
    try:
        df = pd.DataFrame(node_features)
        df["ts"] = timestamps
        if any(isinstance(t, datetime) for t in timestamps):
            df = df.sort_values("ts").reset_index(drop=True)
        node_features = df.iloc[:, :5].values.tolist()
    except:
        pass

    # Build tensors
    x = torch.tensor(node_features, dtype=torch.float)

    src = torch.arange(0, x.shape[0] - 1)
    tgt = torch.arange(1, x.shape[0])
    edge_index = torch.stack([src, tgt], dim=0)

    pos_seq = [int(n[1]) for n in node_features]
    edge_attr = torch.tensor(
        [[1.0 if pos_seq[i] != pos_seq[i+1] else 0.0] for i in range(len(pos_seq)-1)],
        dtype=torch.float
    )

    data = Data(x=x, edge_index=edge_index, edge_attr=edge_attr)
    data.batch = torch.zeros(x.shape[0], dtype=torch.long)

    with torch.no_grad():
        pred = model(data.to(device)).item()

    return {"risk_score": float(pred)}
