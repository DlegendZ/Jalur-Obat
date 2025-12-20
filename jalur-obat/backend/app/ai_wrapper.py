import base64
import requests

GOOGLE_API_KEY = "YOUR-API-KEY-HERE" #input  your api key here
GEMINI_URL = (
    "https://generativelanguage.googleapis.com/v1beta/models/"
    "gemini-2.0-flash-vision:generateContent?key=" + GOOGLE_API_KEY
)

def analyze_image_with_ai(image_base64: str) -> str:
    prompt = """
Anda adalah **KLASIFIKATOR GAMBAR HUKUM DAN KESELAMATAN TINGKAT TERTINGGI**.
Tujuan Anda adalah menghasilkan klasifikasi yang **OBJEKTIF** dan **TEGAS**.

Klasifikasikan gambar menjadi **HANYA SATU** dari label berikut:
- **Safe**
- **Need Attention**
- **Bad**

### Definisi Kriteria & Aturan KETAT

* **Safe**: Konten yang jelas normal, tidak berbahaya, dan diperbolehkan. Ini mencakup aktivitas komersial, objek sehari-hari, atau pemandangan umum. TIDAK ADA risiko yang terlihat atau signifikan.
* **Bad**: Konten yang jelas berbahaya, ilegal, atau dilarang secara universal (Kekerasan eksplisit, konten seksual ilegal, Kebencian yang jelas).
* **Need Attention**: **DILARANG** memilih ini kecuali gambar benar-benar kacau, rusak, atau ambigu secara visual sehingga TIDAK MUNGKIN ditentukan Safe atau Bad.

### Aturan Tambahan Wajib

1.  Output **HANYA** label tunggal (cth: Safe).
2.  **JANGAN** membuat asumsi atau berimajinasi tentang apa yang tidak terlihat di dalam gambar (cth: jangan menebak isi kotak, jangan menebak apa yang terjadi di luar bingkai).
3.  **JANGAN** bersikap terlalu hati-hati. Jika gambar 99% Safe, labelnya HARUS Safe.
4.  **HANYA** gunakan Need Attention sebagai Pilihan Terakhir Mutlak jika tidak ada informasi visual yang memadai untuk keputusan Safe/Bad.

Berikan klasifikasi yang TEGAS.
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
