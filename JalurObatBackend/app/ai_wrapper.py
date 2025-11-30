import base64
import requests

GOOGLE_API_KEY = "AIzaSyCTpPem3PeVtxfnMkCrsJTc0ZSzRZuEspU"
GEMINI_URL = (
    "https://generativelanguage.googleapis.com/v1beta/models/"
    "gemini-2.0-flash-vision:generateContent?key=" + GOOGLE_API_KEY
)

def analyze_image_with_ai(image_base64: str) -> str:
    prompt = """
    You are an image classifier.

    Choose EXACTLY ONE label:
    Safe
    Need Attention
    Bad

    Rules:
    - No explanation.
    - No extra words.
    - Output exactly one label.
    """

    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt},

                    # GEMINI NEW FORMAT (MUST BE THIS)
                    {
                        "inlineData": {
                            "mimeType": "image/jpeg",
                            "data": image_base64  # <-- raw base64 ONLY
                        }
                    },

                    {"text": "Classify it."}
                ]
            }
        ]
    }

    response = requests.post(GEMINI_URL, json=payload)

    try:
        data = response.json()

        text = (
            data.get("candidates", [{}])[0]
                .get("content", {})
                .get("parts", [{}])[0]
                .get("text", "")
                .strip()
        )

        allowed = ["Safe", "Need Attention", "Bad"]

        for lbl in allowed:
            if lbl.lower() in text.lower():
                return lbl

        return "Need Attention"

    except Exception as e:
        print("ERROR:", e)
        print("RAW RESPONSE:", response.text)
        return "Error"
