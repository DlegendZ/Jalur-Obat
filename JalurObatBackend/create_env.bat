@echo off
echo === Creating virtual environment ===
python -m venv venv

echo === Activating virtual environment ===
call venv\Scripts\activate

echo === Upgrading pip ===
python -m pip install --upgrade pip

echo === Installing PyTorch CUDA 11.8 ===
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

echo === Installing torch-geometric ===
pip install torch-geometric
pip install torch-scatter torch-sparse torch-cluster torch-spline-conv ^
    -f https://data.pyg.org/whl/torch-2.1.0+cu118.html

echo === Installing ML & utility packages ===
pip install pandas numpy scikit-learn matplotlib seaborn

echo === Installing Gradio ===
pip install gradio

echo === Installing FastAPI + Uvicorn (optional) ===
pip install fastapi uvicorn

echo === DONE ===
echo To activate env next time, run:
echo     venv\Scripts\activate
pause
