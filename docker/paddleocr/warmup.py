"""Pre-load PP-OCRv5 models into /root/.paddlex cache at container start."""
from paddleocr import PaddleOCR

ocr = PaddleOCR(
    use_doc_orientation_classify=False,
    use_doc_unwarping=False,
    use_textline_orientation=False,
    lang="en",
)
# tiny 1px image to force model load
from PIL import Image
import io

img = Image.new("RGB", (32, 32), "white")
buf = io.BytesIO()
img.save(buf, format="PNG")
with open("/tmp/warm.png", "wb") as f:
    f.write(buf.getvalue())
try:
    ocr.predict("/tmp/warm.png")
except Exception as e:
    print(f"warmup predict skipped: {e}")
print("PaddleOCR models warmed.")
