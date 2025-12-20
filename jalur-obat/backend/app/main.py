from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from .inference import predict_route
from .ai_wrapper import analyze_image_with_ai
import base64

app = FastAPI(
    title="Route GNN API",
    description="Predict risk score from route JSON + package condition",
    version="1.3",
)

# 🔓 CORS: izinkan akses dari frontend (sesuaikan origin kalau perlu)
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,       # boleh diganti ["*"] kalau mau super bebas (buat dev aja)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class RouteRequest(BaseModel):
    route: list


@app.post("/predict")
def predict(request: RouteRequest):
    """
    Endpoint untuk prediksi risk score dari route JSON.
    """
    return predict_route(request.dict())


@app.post("/analyze-image-file")
async def analyze_image_file(file: UploadFile = File(...)):
    """
    Endpoint untuk analisis gambar:
    - Terima file image (multipart/form-data, field name: "file")
    - Convert ke base64
    - Kirim ke AI wrapper
    - Balikkan status (label)
    """
    # Validasi format
    if not file.content_type.startswith("image/"):
        return {"error": "Only image uploads are allowed"}

    # Baca file
    image_bytes = await file.read()

    # Convert ke base64 (tanpa prefix)
    base64_str = base64.b64encode(image_bytes).decode("utf-8")

    # Kirim ke Google Gemini wrapper
    label = analyze_image_with_ai(base64_str)

    return {
        "filename": file.filename,
        "status": label,
    }


# Catatan run (di terminal):
# venv/Scripts/activate  (kalau pakai venv di Windows)
# uvicorn app.main:app --reload
