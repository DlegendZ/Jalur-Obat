#!/bin/bash

echo "=== Creating virtual environment ==="
python3 -m venv venv

echo "=== Activating virtual environment ==="
# for Linux / macOS
source venv/bin/activate

echo "=== Upgrading pip ==="
pip install --upgrade pip

echo "=== Installing PyTorch CUDA 11.8 ==="
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

echo "=== Installing torch-geometric + extensions ==="
pip install torch-geometric
pip install torch-scatter torch-sparse torch-cluster torch-spline-conv \
    -f https://data.pyg.org/whl/torch-2.1.0+cu118.html

echo "=== Installing ML & Utility packages ==="
pip install pandas numpy scikit-learn matplotlib seaborn

echo "=== Installing Gradio ==="
pip install gradio

echo "=== Installing API packages (optional) ==="
pip install fastapi uvicorn

echo "=== DONE ==="
echo "To activate your venv next time:"
echo "    source venv/bin/activate"
