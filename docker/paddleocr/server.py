"""Anthony's Supermarket — PaddleOCR invoice OCR API.

POST /ocr        multipart file upload (image or PDF)
POST /ocr/b64    JSON {"image": "<base64>"} or {"file": "<url>"}
GET  /health     service status

Response: {"lines": [{"text", "score", "box"}], "full_text": "..."}
"""
import base64
import io
import os
import re
import tempfile

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from PIL import Image

app = FastAPI(title="Anthony's PaddleOCR Invoice API", version="1.0")

_ocr = None


def get_ocr():
    global _ocr
    if _ocr is None:
        from paddleocr import PaddleOCR

        _ocr = PaddleOCR(
            use_doc_orientation_classify=False,
            use_doc_unwarping=False,
            use_textline_orientation=False,
            lang="en",
        )
    return _ocr


def extract_lines(results):
    """Normalize PaddleOCR 3.x (and 2.x) result objects into plain dicts."""
    lines = []
    for res in results or []:
        texts = scores = boxes = None
        # 3.x: result is dict-like (keys: rec_texts, rec_scores, rec_polys...)
        try:
            texts = res.get("rec_texts") if hasattr(res, "get") else None
            scores = res.get("rec_scores") if hasattr(res, "get") else None
            boxes = res.get("rec_polys") if hasattr(res, "get") else None
        except Exception:
            pass
        # fallback: res.json['res'] structure
        if not texts and hasattr(res, "json"):
            try:
                payload = res.json.get("res", {})
                texts = payload.get("rec_texts")
                scores = payload.get("rec_scores")
                boxes = payload.get("rec_polys")
            except Exception:
                pass
        # 2.x fallback: list of [box, (text, score)]
        if not texts and isinstance(res, list):
            for item in res:
                try:
                    box, (text, score) = item[0], item[1]
                    lines.append(
                        {
                            "text": text,
                            "score": round(float(score), 4),
                            "box": [[round(float(p[0]), 1), round(float(p[1]), 1)] for p in box],
                        }
                    )
                except Exception:
                    continue
            continue
        for i, text in enumerate(texts or []):
            score = float(scores[i]) if scores and i < len(scores) else 0.0
            box = None
            if boxes and i < len(boxes):
                try:
                    box = [[round(float(p[0]), 1), round(float(p[1]), 1)] for p in boxes[i]]
                except Exception:
                    box = None
            lines.append({"text": text, "score": round(score, 4), "box": box})
    return lines


def run_ocr_file(path: str):
    ocr = get_ocr()
    try:
        results = ocr.predict(path)
    except AttributeError:
        results = ocr.ocr(path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR engine error: {e}")
    lines = extract_lines(results)
    full_text = "\n".join(l["text"] for l in lines if l["text"])
    return {"lines": lines, "full_text": full_text, "line_count": len(lines)}


def save_upload(data: bytes, filename: str) -> str:
    ext = os.path.splitext(filename or "")[1].lower()
    if not ext or not re.match(r"^\.(png|jpe?g|webp|bmp|pdf|tiff?)$", ext):
        # sniff type
        if data[:4] == b"%PDF":
            ext = ".pdf"
        else:
            try:
                Image.open(io.BytesIO(data)).verify()
                ext = "." + Image.open(io.BytesIO(data)).format.lower().replace("jpeg", "jpg")
            except Exception:
                raise HTTPException(status_code=400, detail="unsupported file type")
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=ext)
    tmp.write(data)
    tmp.close()
    return tmp.name


@app.get("/health")
def health():
    status = {"status": "ok", "models_loaded": _ocr is not None}
    try:
        import paddleocr

        status["paddleocr_version"] = getattr(paddleocr, "__version__", "unknown")
    except Exception:
        pass
    return status


@app.post("/ocr")
async def ocr_upload(file: UploadFile = File(...)):
    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="empty file")
    path = save_upload(data, file.filename)
    try:
        return run_ocr_file(path)
    finally:
        try:
            os.unlink(path)
        except Exception:
            pass


@app.post("/ocr/b64")
async def ocr_b64(payload: dict):
    import requests  # lazy

    img = payload.get("image")
    url = payload.get("file") or payload.get("url")
    if img:
        try:
            data = base64.b64decode(img)
        except Exception:
            raise HTTPException(status_code=400, detail="invalid base64")
        path = save_upload(data, payload.get("filename", "upload.png"))
        try:
            return run_ocr_file(path)
        finally:
            try:
                os.unlink(path)
            except Exception:
                pass
    if url:
        try:
            r = requests.get(url, timeout=30)
            r.raise_for_status()
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"url fetch failed: {e}")
        path = save_upload(r.content, os.path.basename(url.split("?")[0]) or "remote.png")
        try:
            return run_ocr_file(path)
        finally:
            try:
                os.unlink(path)
            except Exception:
                pass
    raise HTTPException(status_code=400, detail="provide 'image' (base64) or 'file' (url)")


@app.exception_handler(Exception)
async def unhandled(request, exc):
    return JSONResponse(status_code=500, content={"detail": str(exc)})
