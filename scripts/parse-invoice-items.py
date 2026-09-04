#!/usr/bin/env python
"""Parse OCR'd Triunfo-style invoices into structured items + pricing sheet.

Self-calibrating: finds each invoice's own header row (Item Code / Ordered /
Shipped / Description / Pack Size / UPC / CASE / Price) and derives column
x-centers from it, so it works on photos taken from different angles/scales.

Reads invoices/inbox-ocr/*.json, writes:
  invoices/pricing/<stem>_items.csv    per-item: code, name, pack, qty, case cost, unit cost, retail
  invoices/pricing/<stem>_summary.json totals
  invoices/pricing/PRICING_SHEET.md    combined human-readable sheet

Retail rule (Anthony's): Retail = unit cost x 1.70.
NOTE: Triunfo invoices print NO Grand Total — computed total = sum(qty x case price).
"""
import csv
import glob
import json
import os
import re

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OCR_DIR = os.path.join(BASE, "invoices", "inbox-ocr")
OUT_DIR = os.path.join(BASE, "invoices", "pricing")
MARKUP = 1.70

HEADER_KEYS = {
    "item code": "code",
    "ordered": "ordered",
    "shipped": "shipped",
    "description": "name",
    "pack size": "pack",
    "upc code": "upc",
    "case/unit": "unit",
    "weight": "weight",
    "unit price": "price",
    "extended": "extended",
    "extende": "extended",
    "ext": "extended",
    "price": "price",
    "upc": "upc",
    "case": "unit",
}
# how far a cell's x-center may sit from a column center (px)
X_TOL = 60
# adjacent item rows are ~8-15px apart in OCR y; group only near-identical y
Y_TOL = 7


def cx(l):
    """x-center of a cell."""
    b = l["box"]
    return (b[0][0] + b[2][0]) / 2


def cy(l):
    b = l["box"]
    return (b[0][1] + b[2][1]) / 2


def find_columns(lines):
    """Locate header row -> {colname: x_center}."""
    for l in lines:
        key = re.sub(r"\s+", " ", l["text"].strip().lower())
        if key == "item code":
            hy = cy(l)
            break
    else:
        return None
    cols = {}
    for l in lines:
        if abs(cy(l) - hy) > 25:
            continue
        key = re.sub(r"\s+", " ", l["text"].strip().lower())
        if key in HEADER_KEYS and HEADER_KEYS[key] not in cols:
            cols[HEADER_KEYS[key]] = cx(l)
    return cols if {"code", "name", "price"} <= set(cols) else None


def item_rows(lines, cols):
    """Group OCR cells into rows below the header, one row per line item."""
    header_y = min(
        cy(l) for l in lines
        if re.sub(r"\s+", " ", l["text"].strip().lower()) in HEADER_KEYS
    )
    body = [l for l in lines if cy(l) > header_y + 10 and cy(l) < header_y + 500]
    rows = []
    for l in sorted(body, key=cy):
        for row in rows:
            if abs(row["y"] - cy(l)) <= Y_TOL:
                row["cells"].append(l)
                row["ys"].append(cy(l))
                row["y"] = sum(row["ys"]) / len(row["ys"])
                break
        else:
            rows.append({"y": cy(l), "ys": [cy(l)], "cells": [l]})
    return rows


def cell_for(row, col_x, neighbors=None):
    """Best-matching cell in this row for column x.

    Nearest-center assignment: each cell goes to its nearest column.
    `neighbors` = sorted list of ALL column x-centers; a cell only claims a
    column if that column is genuinely the nearest (prevents a long product
    name from bleeding into Pack Size)."""
    col_centers = neighbors if neighbors else [col_x]
    best, bd = None, 1e9
    for l in row["cells"]:
        d = abs(cx(l) - col_x)
        # is col_x the nearest column for this cell?
        if any(abs(cx(l) - c) < d for c in col_centers if c != col_x):
            continue
        if d < bd:
            best, bd = l, d
    if best is None:
        return None
    return best["text"].strip() or None


def parse_invoice(path):
    data = json.load(open(path, encoding="utf-8"))
    lines = data["ocr"]["lines"]
    cols = find_columns(lines)
    if cols is None:
        return {"source": os.path.basename(path), "error": "header row not found"}
    items, seen_rows = [], []
    for row in item_rows(lines, cols):
        # per-row drift calibration: photos are skewed, columns drift with y.
        # every item row prints 'CASE' in the Case/Unit column — use it as an
        # anchor to shift all column centers for this row.
        drift = 0
        if "unit" in cols:
            for l in row["cells"]:
                if l["text"].strip().upper() == "CASE":
                    drift = cx(l) - cols["unit"]
                    break
        rcols = {k: v + drift for k, v in cols.items()}
        centers = sorted(set(rcols.values()))
        name = cell_for(row, rcols["name"], centers)
        if not name or not re.search(r"[A-Za-z]{3}", name or ""):
            continue
        # skip repeated description fragments already captured
        code = cell_for(row, rcols["code"], centers)
        # price: numeric cell closest to the price OR extended column center
        # (Triunfo prints nothing under Extended, and photo drift can push
        # the printed price under either header).
        price_center = rcols["price"]
        ext_center = rcols.get("extended", price_center + 60)
        price_txt, bd = None, 1e9
        for l in row["cells"]:
            t = l["text"].strip().replace(",", ".")
            if re.fullmatch(r"\d+\.\d{2}", t):
                d = min(abs(cx(l) - price_center), abs(cx(l) - ext_center))
                if d < bd:
                    price_txt, bd = t, d
        # qty: Ordered and Shipped columns sit close together (x-centers ~65px
        # apart) and hold narrow single digits, so nearest-column assignment
        # is unreliable. Instead, sweep every cell in the ordered..shipped
        # x-band for this row and take the largest numeric as the case count.
        qty = None
        if {"ordered", "shipped"} <= rcols.keys():
            lo = min(rcols["ordered"], rcols["shipped"]) - 18
            hi = max(rcols["ordered"], rcols["shipped"]) + 18
            cands = []
            for l in row["cells"]:
                if lo <= cx(l) <= hi:
                    t = l["text"].strip().replace(",", ".")
                    if re.fullmatch(r"\d+(\.\d+)?", t):
                        cands.append(float(t))
            if cands:
                qty = max(cands)
        pack = cell_for(row, rcols.get("pack"), centers)
        upc = cell_for(row, rcols.get("upc"), centers)
        try:
            price = float(price_txt) if price_txt else None
        except ValueError:
            price = None
        if qty is None and price is None:
            continue
        items.append(
            {
                "code": code, "name": name, "pack": pack, "upc": upc,
                "qty": qty, "case_price": price,
            }
        )
    total = sum((i["qty"] or 0) * (i["case_price"] or 0) for i in items)
    missing = sum(1 for i in items if i["case_price"] is None)
    return {
        "source": os.path.basename(path),
        "columns": {k: round(v) for k, v in cols.items()},
        "items": items,
        "computed_total": round(total, 2),
        "items_missing_price": missing,
    }


def parse_pack_units(pack_text):
    m = re.match(r"^\s*(\d+)\s*[xX]", pack_text or "")
    return int(m.group(1)) if m else None


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    files = sorted(f for f in glob.glob(os.path.join(OCR_DIR, "*.json"))
                   if not f.endswith("index.jsonl"))
    summaries = []
    for f in files:
        res = parse_invoice(f)
        summaries.append(res)
        stem = os.path.splitext(os.path.basename(f))[0]
        if "error" in res:
            print(f"{stem}: ERROR {res['error']}")
            continue
        with open(os.path.join(OUT_DIR, stem + "_items.csv"), "w",
                  newline="", encoding="utf-8") as fh:
            w = csv.writer(fh)
            w.writerow(["code", "name", "pack", "units_per_case", "qty_cases",
                        "case_cost", "unit_cost", "retail_price", "upc"])
            for it in res["items"]:
                upc_ = parse_pack_units(it["pack"])
                unit_cost = (round(it["case_price"] / upc_, 2)
                             if it["case_price"] and upc_ else None)
                retail = round(unit_cost * MARKUP, 2) if unit_cost else None
                w.writerow([it["code"], it["name"], it["pack"], upc_,
                            it["qty"], it["case_price"], unit_cost, retail,
                            it["upc"]])
        print(f"{stem}: {len(res['items'])} items, computed_total "
              f"${res['computed_total']}, missing_price={res['items_missing_price']}, "
              f"cols={res['columns']}")
    # combined markdown sheet
    md = ["# Anthony's Supermarket — Invoice Pricing Sheet", "",
          f"Retail rule: unit cost x {MARKUP}", ""]
    for res in summaries:
        if "error" in res:
            continue
        stem = os.path.splitext(res["source"])[0]
        md += [f"## {res['source']}", "",
               f"**Computed total: ${res['computed_total']}** "
               f"({res['items_missing_price']} items without price)", "",
               "| Code | Item | Pack | Qty | Case $ | Unit $ | Retail |",
               "|---|---|---|---|---|---|---|"]
        for it in res["items"]:
            upc_ = parse_pack_units(it["pack"])
            unit_cost = (round(it["case_price"] / upc_, 2)
                         if it["case_price"] and upc_ else None)
            retail = round(unit_cost * MARKUP, 2) if unit_cost else None
            md.append(
                f"| {it['code'] or ''} | {it['name']} | {it['pack'] or ''} | "
                f"{it['qty'] if it['qty'] is not None else ''} | "
                f"{it['case_price'] if it['case_price'] is not None else '?'} | "
                f"{unit_cost if unit_cost is not None else '?'} | "
                f"{retail if retail is not None else '?'} |")
        md.append("")
    with open(os.path.join(OUT_DIR, "PRICING_SHEET.md"), "w",
              encoding="utf-8") as fh:
        fh.write("\n".join(md))
    print("sheet ->", os.path.join(OUT_DIR, "PRICING_SHEET.md"))


if __name__ == "__main__":
    main()
