#!/usr/bin/env python
"""Anthony's Supermarket — Invoice Intake via Dockerized PaddleOCR.

Watches (or single-run) ~/anthony-supermarket/invoices/ for invoice
images/PDFs, sends each to the PaddleOCR container (POST /ocr), and saves:

  invoices/inbox-ocr/<name>.json   structured lines (text, score, box)
  invoices/inbox-ocr/<name>.txt    plain full text
  invoices/inbox-ocr/index.jsonl   append-only master index

Processed originals are moved to invoices/processed/ to avoid re-runs.
Skips files already in the index (dedupe by filename+size).

Usage:
  python invoice-intake.py                 # process everything new
  python invoice-intake.py --watch         # poll every 30s forever
  python invoice-intake.py --file x.png    # single file
"""
import argparse
import base64
import datetime
import io
import json
import os
import shutil
import sys
import time
import urllib.request

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INBOX = os.path.join(BASE, "invoices")
OUT = os.path.join(INBOX, "inbox-ocr")
PROCESSED = os.path.join(INBOX, "processed")
INDEX = os.path.join(OUT, "index.jsonl")
OCR_URL = os.environ.get("OCR_URL", "http://localhost:8120")
IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".webp", ".bmp", ".tif", ".tiff", ".pdf"}


def log(msg):
    print(f"[{datetime.datetime.now().strftime('%H:%M:%S')}] {msg}", flush=True)


def load_index_keys():
    keys = set()
    if os.path.exists(INDEX):
        with open(INDEX, encoding="utf-8") as f:
            for line in f:
                try:
                    rec = json.loads(line)
                    keys.add((rec.get("source"), rec.get("size")))
                except Exception:
                    continue
    return keys


def ocr_file(path):
    name = os.path.basename(path)
    with open(path, "rb") as f:
        data = f.read()
    payload = json.dumps({"image": base64.b64encode(data).decode(), "filename": name}).encode()
    req = urllib.request.Request(
        OCR_URL.rstrip("/") + "/ocr/b64",
        data=payload,
        headers={"Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=300) as r:
        return json.loads(r.read().decode())


def process_file(path, seen):
    name = os.path.basename(path)
    ext = os.path.splitext(name)[1].lower()
    if ext not in IMAGE_EXTS:
        log(f"skip (unsupported): {name}")
        return
    size = os.path.getsize(path)
    if (name, size) in seen:
        log(f"skip (already indexed): {name}")
        return
    stem = os.path.splitext(name)[0]
    log(f"OCR: {name} ({size // 1024} KB)")
    try:
        result = ocr_file(path)
    except Exception as e:
        log(f"ERROR {name}: {e}")
        return
    lines = result.get("lines", [])
    full_text = result.get("full_text", "")
    json_path = os.path.join(OUT, stem + ".json")
    txt_path = os.path.join(OUT, stem + ".txt")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump({"source": name, "ocr": result}, f, ensure_ascii=False, indent=2)
    with open(txt_path, "w", encoding="utf-8") as f:
        f.write(full_text)
    rec = {
        "processed_at": datetime.datetime.now().isoformat(timespec="seconds"),
        "source": name,
        "size": size,
        "line_count": result.get("line_count", len(lines)),
        "total_amount_guess": extract_total(full_text),
        "vendor_guess": extract_vendor(lines),
        "ocr_json": os.path.relpath(json_path, BASE),
        "ocr_txt": os.path.relpath(txt_path, BASE),
    }
    with open(INDEX, "a", encoding="utf-8") as f:
        f.write(json.dumps(rec, ensure_ascii=False) + "\n")
    seen.add((name, size))
    dst = os.path.join(PROCESSED, name)
    shutil.move(path, dst)
    log(f"done: {name} -> {rec['line_count']} lines, total-guess ${rec['total_amount_guess']}")


def extract_total(text):
    """Heuristic: last 'TOTAL' line's amount on an invoice."""
    import re

    best = None
    for line in text.splitlines():
        m = re.search(r"total[^0-9\-]*([0-9]{1,6}[.,][0-9]{2})", line, re.IGNORECASE)
        if m:
            best = m.group(1).replace(",", ".")
    if not best:
        for m in re.finditer(r"\$\s*([0-9]{1,6}[.,][0-9]{2})", text):
            best = m.group(1).replace(",", ".")
    return best


def extract_vendor(lines):
    """Topmost text line with letters = usually the vendor header."""
    def y_of(l):
        box = l.get("box")
        return box[0][1] if box else 10**9

    for l in sorted(lines, key=y_of):
        t = (l.get("text") or "").strip()
        if 3 <= len(t) <= 40 and any(c.isalpha() for c in t):
            return t
    return None


def process_all(seen):
    if not os.path.isdir(INBOX):
        log(f"inbox missing: {INBOX}")
        return 0
    count = 0
    for name in sorted(os.listdir(INBOX)):
        path = os.path.join(INBOX, name)
        if not os.path.isfile(path):
            continue
        before = len(seen)
        process_file(path, seen)
        if len(seen) > before:
            count += 1
    return count


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--watch", action="store_true", help="poll every 30s forever")
    ap.add_argument("--file", help="process a single file")
    args = ap.parse_args()

    os.makedirs(OUT, exist_ok=True)
    os.makedirs(PROCESSED, exist_ok=True)
    seen = load_index_keys()
    log(f"index has {len(seen)} entries; OCR at {OCR_URL}")

    if args.file:
        process_file(os.path.abspath(args.file), seen)
        return
    if args.watch:
        while True:
            process_all(seen)
            time.sleep(30)
    else:
        n = process_all(seen)
        log(f"processed {n} new file(s)")


if __name__ == "__main__":
    main()
