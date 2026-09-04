#!/usr/bin/env python
"""OCR the newest user image."""
import base64, json, os, urllib.request

OCR = "http://localhost:8120"
SRC = r"C:\Users\Jayto\anthony-supermarket\invoices\peimco-new"
OUT = os.path.join(SRC, "ocr")
os.makedirs(OUT, exist_ok=True)

name = "peimco_user_new.jpg"
path = os.path.join(SRC, name)
with open(path, "rb") as f:
    b64 = base64.b64encode(f.read()).decode()
payload = json.dumps({"image": b64, "filename": name}).encode()
req = urllib.request.Request(OCR + "/ocr/b64", data=payload, headers={"Content-Type": "application/json"})
with urllib.request.urlopen(req, timeout=300) as r:
    result = json.loads(r.read().decode())
stem = os.path.splitext(name)[0]
with open(os.path.join(OUT, stem + ".json"), "w", encoding="utf-8") as f:
    json.dump(result, f, ensure_ascii=False, indent=2)
with open(os.path.join(OUT, stem + ".txt"), "w", encoding="utf-8") as f:
    f.write(result.get("full_text", ""))
print(f"{name}: {result.get('line_count', len(result.get('lines', [])))} lines")
print("done")
