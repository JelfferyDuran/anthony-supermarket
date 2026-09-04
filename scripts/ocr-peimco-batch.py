#!/usr/bin/env python
"""OCR PEIMCO invoice images via PaddleOCR container, save JSON+txt per image."""
import base64, json, os, sys, urllib.request

OCR = "http://localhost:8120"
SRC = r"C:\Users\Jayto\anthony-supermarket\invoices\peimco-new"
OUT = os.path.join(SRC, "ocr")
os.makedirs(OUT, exist_ok=True)

files = [f for f in sorted(os.listdir(SRC)) if f.lower().endswith((".jpg", ".jpeg", ".png"))]
print("files:", files)

for name in files:
    path = os.path.join(SRC, name)
    with open(path, "rb") as f:
        b64 = base64.b64encode(f.read()).decode()
    payload = json.dumps({"image": b64, "filename": name}).encode()
    req = urllib.request.Request(OCR + "/ocr/b64", data=payload, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=300) as r:
            result = json.loads(r.read().decode())
    except Exception as e:
        print(f"ERROR {name}: {e}")
        continue
    stem = os.path.splitext(name)[0]
    with open(os.path.join(OUT, stem + ".json"), "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    ft = result.get("full_text", "")
    with open(os.path.join(OUT, stem + ".txt"), "w", encoding="utf-8") as f:
        f.write(ft)
    n = result.get("line_count", len(result.get("lines", [])))
    print(f"{name}: {n} lines, {len(ft)} chars")
print("done")
