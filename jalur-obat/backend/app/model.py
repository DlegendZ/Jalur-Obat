# ============================================================
# Full pipeline: route-aware GNN (GAT) + Gradio JSON inference
# ============================================================

# --------- (Optional) install (uncomment if needed) ----------
# !pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
# !pip install torch-geometric torch-scatter torch-sparse torch-cluster torch-spline-conv
# !pip install pandas scikit-learn matplotlib seaborn gradio

# ============================================================
# Imports
# ============================================================
import pandas as pd
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from sklearn.preprocessing import LabelEncoder, MinMaxScaler
from sklearn.model_selection import train_test_split
from torch_geometric.data import Data, DataLoader
from torch_geometric.nn import GATConv, global_mean_pool
import matplotlib.pyplot as plt
import gradio as gr
import json
from datetime import datetime

# ============================================================
# Step 1: Load & inspect data
# ============================================================
df = pd.read_csv("dummy_batch_data (1).csv")  # adjust filename if needed
print("Shape:", df.shape)
print(df.info())
print(df.head())

# Fill nan placeholders for pos fields
df['prev_pos'] = df['prev_pos'].fillna("UNK")
df['pos_code'] = df['pos_code'].fillna("UNK")

# ============================================================
# Step 2: Feature engineering (include route features)
# ============================================================
# 1) Encode condition
condition_encoder = LabelEncoder()
df['condition_encoded'] = condition_encoder.fit_transform(df['condition'].astype(str))

# 2) Build a single pos encoder that includes prev_pos & pos_code + UNK
pos_vals = pd.Series(list(df['prev_pos'].unique()) + list(df['pos_code'].unique())).unique()
pos_encoder = LabelEncoder()
pos_encoder.fit(pos_vals.astype(str))

# Add encoded columns (use pos_encoder)
df['prev_pos_encoded'] = pos_encoder.transform(df['prev_pos'].astype(str))
df['pos_encoded'] = pos_encoder.transform(df['pos_code'].astype(str))

# 3) Scale numeric sensors
scaler = MinMaxScaler()
df[['temperature']] = df[['temperature']].fillna(0)
df[['humidity']] = df[['humidity']].fillna(0)
df[['temperature_scaled','humidity_scaled']] = scaler.fit_transform(df[['temperature','humidity']])

# 4) batch index (same as before)
batch_encoder = LabelEncoder()
df['batch_idx'] = batch_encoder.fit_transform(df['batch_id'])

# ============================================================
# Step 3: Build graph_list with node features & edge_attr
# ============================================================
graph_list = []
batch_ids_unique = df['batch_idx'].unique()

for b in batch_ids_unique:
    batch_df = df[df['batch_idx'] == b].sort_values('timestamp')
    if len(batch_df) < 2:
        continue

    # Node features: prev_pos_encoded, pos_encoded, condition_encoded, temp_scaled, hum_scaled
    node_cols = ['prev_pos_encoded','pos_encoded','condition_encoded','temperature_scaled','humidity_scaled']
    x = torch.tensor(batch_df[node_cols].values, dtype=torch.float)

    # Edges: sequential (i -> i+1)
    src = torch.arange(0, len(batch_df)-1, dtype=torch.long)
    tgt = torch.arange(1, len(batch_df), dtype=torch.long)
    edge_index = torch.stack([src, tgt], dim=0)

    # Edge attributes: whether pos changed (1 if changed, 0 if same)
    edge_features = []
    pos_seq = batch_df['pos_code'].astype(str).values
    for i in range(len(pos_seq)-1):
        changed = 1.0 if pos_seq[i] != pos_seq[i+1] else 0.0
        edge_features.append([changed])
    edge_attr = torch.tensor(edge_features, dtype=torch.float)  # shape [num_edges, 1]

    # Target label: risk_score of last node in batch
    y = torch.tensor([batch_df['risk_score'].values[-1]], dtype=torch.float)

    data = Data(x=x, edge_index=edge_index, edge_attr=edge_attr, y=y)
    graph_list.append(data)

print(f"Total graphs prepared: {len(graph_list)}")

# ============================================================
# Step 4: Train/test split & DataLoader
# ============================================================
train_graphs, test_graphs = train_test_split(graph_list, test_size=0.2, random_state=42)
train_loader = DataLoader(train_graphs, batch_size=32, shuffle=True)
test_loader  = DataLoader(test_graphs, batch_size=32, shuffle=False)

# ============================================================
# Step 5: Route-aware GNN (GAT) model
# ============================================================
class RouteGNN(nn.Module):
    def __init__(self, in_channels, hidden_channels):
        super(RouteGNN, self).__init__()
        # GATConv supports edge attributes when edge_dim is set
        self.gat1 = GATConv(in_channels, hidden_channels, edge_dim=1, heads=2, concat=False)
        self.gat2 = GATConv(hidden_channels, hidden_channels, edge_dim=1, heads=2, concat=False)
        self.lin = nn.Linear(hidden_channels, 1)

    def forward(self, data):
        x, edge_index = data.x, data.edge_index
        edge_attr = data.edge_attr if hasattr(data, 'edge_attr') else None
        batch = data.batch

        x = F.relu(self.gat1(x, edge_index, edge_attr))
        x = F.relu(self.gat2(x, edge_index, edge_attr))
        x = global_mean_pool(x, batch)  # graph-level readout
        x = self.lin(x)
        return x.squeeze()

# ============================================================
# Step 6: Train model
# ============================================================
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
in_channels = 5  # prev_pos_enc, pos_enc, condition_enc, temp_scaled, humidity_scaled
model = RouteGNN(in_channels=in_channels, hidden_channels=32).to(device)
optimizer = torch.optim.Adam(model.parameters(), lr=0.01)
criterion = nn.MSELoss()

epochs = 15
for epoch in range(epochs):
    model.train()
    total_loss = 0.0
    for batch in train_loader:
        batch = batch.to(device)
        optimizer.zero_grad()
        out = model(batch)
        loss = criterion(out, batch.y)
        loss.backward()
        optimizer.step()
        total_loss += loss.item() * batch.num_graphs
    avg_loss = total_loss / len(train_graphs)
    print(f"[Train] Epoch {epoch+1}/{epochs} - Avg Loss: {avg_loss:.4f}")

# save route model state_dict
torch.save(model.state_dict(), "route_gnn.pth")
# or if you prefer wrapped dict:
# torch.save({"state_dict": model.state_dict()}, "route_gnn.pth")

# save encoders and scaler
import pickle, joblib
with open("pos_encoder.pkl", "wb") as f:
    pickle.dump(pos_encoder, f)
with open("condition_encoder.pkl", "wb") as f:
    pickle.dump(condition_encoder, f)
joblib.dump(scaler, "scaler.pkl")

# ============================================================
# Step 7: Evaluate on test set
# ============================================================
model.eval()
preds, targets = [], []
with torch.no_grad():
    for batch in test_loader:
        batch = batch.to(device)
        out = model(batch)
        preds.extend(out.cpu().numpy().tolist() if out.numel()>1 else [out.cpu().item()])
        targets.extend(batch.y.cpu().numpy().tolist())

from sklearn.metrics import mean_squared_error, r2_score
mse = mean_squared_error(targets, preds)
r2  = r2_score(targets, preds)
print(f"Test MSE: {mse:.4f}, R2: {r2:.4f}")

# Plot preds vs true
plt.figure(figsize=(6,6))
plt.scatter(targets, preds, alpha=0.5)
plt.xlabel("True Risk Score")
plt.ylabel("Predicted Risk Score")
plt.title("Predicted vs True")
plt.grid(True)
plt.show()

# ============================================================
# Step 8: Helper functions for inference (handle unseen pos/condition)
# ============================================================
# Build mapping dicts with UNK fallback
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

# ============================================================
# Step 9: Gradio: JSON-based inference (route logs)
# ============================================================
def predict_from_json(input_text):
    # parse json text (input via gr.Code)
    try:
        input_json = json.loads(input_text)
    except Exception as e:
        return f"Invalid JSON: {e}"

    if "route" not in input_json:
        return "JSON must include a 'route' array."

    logs = input_json["route"]
    if not isinstance(logs, list) or len(logs) < 2:
        return "route must be a list with at least 2 log entries."

    # Build node list: ensure each log has pos_code, condition, temperature, humidity, timestamp (timestamp optional)
    node_features = []
    timestamps = []
    for i, log in enumerate(logs):
        pos = log.get("pos_code", "UNK")
        cond = log.get("condition", condition_classes[0])
        temp = float(log.get("temperature", 0.0))
        hum  = float(log.get("humidity", 0.0))

        # prev_pos: from previous log if exists, else UNK
        if i == 0:
            prev_pos = log.get("prev_pos", "UNK")
        else:
            prev_pos = logs[i-1].get("pos_code", "UNK")

        prev_enc = encode_pos_safe(prev_pos)
        pos_enc  = encode_pos_safe(pos)
        cond_enc = encode_condition_safe(cond)

        # scale temp/humidity using same scaler (note: scaler expects 2D)
        temp_scaled, hum_scaled = scaler.transform([[temp, hum]])[0]

        node_features.append([prev_enc, pos_enc, cond_enc, temp_scaled, hum_scaled])

        # timestamp: if provided, try parse so we can sort; otherwise preserve index order
        ts = log.get("timestamp", None)
        if ts is None:
            timestamps.append(i)
        else:
            try:
                timestamps.append(datetime.fromisoformat(ts))
            except:
                try:
                    timestamps.append(datetime.strptime(ts, "%Y-%m-%d %H:%M:%S"))
                except:
                    timestamps.append(i)

    # sort nodes by timestamp if timestamps are actual datetimes
    try:
        # create DataFrame to sort easily
        tmp = pd.DataFrame(node_features, columns=['prev_enc','pos_enc','cond_enc','t_s','h_s'])
        tmp['ts'] = timestamps
        if any(isinstance(t, datetime) for t in timestamps):
            tmp = tmp.sort_values('ts').reset_index(drop=True)
        node_features = tmp[['prev_enc','pos_enc','cond_enc','t_s','h_s']].values.tolist()
    except Exception:
        pass

    # Build tensors
    x = torch.tensor(node_features, dtype=torch.float)

    # Build sequential edges and edge_attr (changed flag)
    if x.shape[0] < 2:
        return "Need at least 2 nodes after parsing."

    src = torch.arange(0, x.shape[0]-1, dtype=torch.long)
    tgt = torch.arange(1, x.shape[0], dtype=torch.long)
    edge_index = torch.stack([src, tgt], dim=0)

    # edge_attr: compare pos_enc of consecutive nodes
    pos_seq = [int(row[1]) for row in node_features]
    edge_attr_list = []
    for i in range(len(pos_seq)-1):
        edge_attr_list.append([1.0 if pos_seq[i] != pos_seq[i+1] else 0.0])
    edge_attr = torch.tensor(edge_attr_list, dtype=torch.float)

    # Create Data and predict
    data = Data(x=x, edge_index=edge_index, edge_attr=edge_attr)
    data.batch = torch.zeros(x.shape[0], dtype=torch.long)

    model.eval()
    with torch.no_grad():
        out = model(data.to(device))
        score = float(out.item())

    return round(score, 2)

# Gradio interface
interface = gr.Interface(
    fn=predict_from_json,
    inputs=gr.Code(label="Input Route JSON (paste example)", language="json"),
    outputs=gr.Number(label="Predicted Risk Score"),
    title="Route-aware GNN Risk Predictor (JSON)",
    description="Paste JSON {\"route\": [ {pos_code, condition, temperature, humidity, timestamp (opt)} , ... ] }"
)

print("Launching Gradio...")
interface.launch()
