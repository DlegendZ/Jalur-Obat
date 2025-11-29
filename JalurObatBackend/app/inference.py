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
# 2. Recreate model architecture
# ==========================================
class RouteGNN(nn.Module):
    def __init__(self, in_channels, hidden_channels):
        super().__init__()
        self.gat1 = GATConv(in_channels, hidden_channels, edge_dim=1, heads=2, concat=False)
        self.gat2 = GATConv(hidden_channels, hidden_channels, edge_dim=1, heads=2, concat=False)
        self.lin = nn.Linear(hidden_channels, 1)

    def forward(self, data):
        x, edge_index, edge_attr, batch = (
            data.x,
            data.edge_index,
            data.edge_attr,
            data.batch
        )

        x = F.relu(self.gat1(x, edge_index, edge_attr))
        x = F.relu(self.gat2(x, edge_index, edge_attr))
        x = global_mean_pool(x, batch)
        return self.lin(x).squeeze()

# ==========================================
# 3. Load model
# ==========================================
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = RouteGNN(in_channels=5, hidden_channels=32).to(device)
model.load_state_dict(torch.load("model/route_gnn.pth", map_location=device))
model.eval()

# ==========================================
# 4. Inference function
# ==========================================
def predict_route(json_data):

    logs = json_data.get("route", None)
    if logs is None or not isinstance(logs, list) or len(logs) < 2:
        return {"error": "JSON must contain 'route' list with at least 2 entries"}

    # process nodes
    node_features = []
    timestamps = []

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

    # reorder by timestamp if real datetime
    try:
        df_tmp = pd.DataFrame(node_features)
        df_tmp["ts"] = timestamps
        if any(isinstance(t, datetime) for t in timestamps):
            df_tmp = df_tmp.sort_values("ts").reset_index(drop=True)
        node_features = df_tmp.iloc[:, :5].values.tolist()
    except:
        pass

    x = torch.tensor(node_features, dtype=torch.float)

    # build edges
    src = torch.arange(0, x.shape[0] - 1)
    tgt = torch.arange(1, x.shape[0])
    edge_index = torch.stack([src, tgt], dim=0)

    # edge attributes
    pos_seq = [int(xi[1]) for xi in node_features]
    edge_attr = torch.tensor(
        [[1.0 if pos_seq[i] != pos_seq[i+1] else 0.0] for i in range(len(pos_seq)-1)],
        dtype=torch.float
    )

    data = Data(x=x, edge_index=edge_index, edge_attr=edge_attr)
    data.batch = torch.zeros(x.shape[0], dtype=torch.long)

    with torch.no_grad():
        pred = model(data.to(device)).item()

    return {"risk_score": float(pred)}
