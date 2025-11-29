from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
from .inference import predict_route
from .ai_wrapper import analyze_image_with_ai  # <- pastikan ini
import base64

app = FastAPI(
    title="Route GNN API",
    description="Predict risk score from route JSON + package condition",
    version="1.3"
)

class RouteRequest(BaseModel):
    route: list

@app.post("/predict")
def predict(request: RouteRequest):
    return predict_route(request.dict())


@app.post("/analyze-image-file")
async def analyze_image_file(file: UploadFile = File(...)):
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
        "status": label
    }
