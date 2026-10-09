#!/usr/bin/env python3
"""Build the standalone local pricing app for in-store use.

Merges ALL invoice sources into one catalog:
  1. invoices/pricing/*_items.csv          (Triunfo OCR pipeline; fallback:
     invoices/pricing-local-backup/ when the Drive symlink is dead)
  2. invoices/pricing-hub-records/*-items.csv (Goya-style: itemId,itemNo,name,cat,
     vendor,invoiceNo,boxes,boxPrice,units,costPerUnit,retail,markupPct,status)

Generates apps/pricing-store/index.html — a single self-contained file
(no server, no internet, no dependencies). Re-run after every invoice intake.
"""
import csv
import json
import os
from datetime import datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_PATH = os.path.join(ROOT, "apps", "pricing-store", "index.html")
TRIUNFO_DIRS = [
    os.path.join(ROOT, "invoices", "pricing"),              # symlink to Drive (primary)
    os.path.join(ROOT, "invoices", "pricing-local-backup"), # local fallback
]
GOYA_DIR = os.path.join(ROOT, "invoices", "pricing-hub-records")  # not pricing-hub/: that folder is published


def to_f(v):
    try:
        x = float(str(v).replace("$", "").strip())
        return x if x > 0 else None
    except (ValueError, TypeError):
        return None


def load_triumfo(items, next_id):
    for d in TRIUNFO_DIRS:
        if not os.path.isdir(d):
            continue
        for fname in sorted(os.listdir(d)):
            if not fname.endswith("_items.csv"):
                continue
            source = fname.replace("_items.csv", "")
            with open(os.path.join(d, fname), encoding="utf-8") as fh:
                for row in csv.DictReader(fh):
                    name = (row.get("name") or "").strip()
                    if not name:
                        continue
                    items.append({
                        "id": next_id,
                        "code": (row.get("code") or "").strip(),
                        "upc": (row.get("upc") or "").strip(),
                        "name": name,
                        "cat": "",
                        "vendor": "Triunfo Foods",
                        "pack": (row.get("pack") or "").strip(),
                        "unitsPerCase": to_f(row.get("units_per_case")) or 0,
                        "qtyCases": to_f(row.get("qty_cases")) or 0,
                        "caseCost": to_f(row.get("case_cost")),
                        "unitCost": to_f(row.get("unit_cost")),
                        "source": source,
                    })
                    next_id += 1
        if items:  # primary dir had data — skip the fallback
            break
    return next_id


def load_goya(items, next_id):
    if not os.path.isdir(GOYA_DIR):
        return next_id
    for fname in sorted(os.listdir(GOYA_DIR)):
        if not fname.endswith("-items.csv"):
            continue
        with open(os.path.join(GOYA_DIR, fname), encoding="utf-8") as fh:
            for row in csv.DictReader(fh):
                name = (row.get("name") or "").strip()
                if not name:
                    continue
                items.append({
                    "id": next_id,
                    "code": (row.get("itemNo") or "").strip(),
                    "upc": "",
                    "name": name,
                    "cat": (row.get("cat") or "").strip(),
                    "vendor": (row.get("vendor") or "Goya Foods").strip(),
                    "pack": f"{row.get('units') or '?'} un/caja",
                    "unitsPerCase": to_f(row.get("units")) or 0,
                    "qtyCases": to_f(row.get("boxes")) or 0,
                    "caseCost": to_f(row.get("boxPrice")),
                    "unitCost": to_f(row.get("costPerUnit")),
                    "source": f"{(row.get('vendor') or 'Goya').split()[0]} inv {row.get('invoiceNo') or '?'}",
                })
                next_id += 1
    return next_id


def load_items():
    items = []
    next_id = load_triumfo(items, 1)
    next_id = load_goya(items, next_id)
    return items


def build_html(items):
    data_json = json.dumps(items, ensure_ascii=False)
    built_at = datetime.now().strftime("%Y-%m-%d %H:%M")
    return f"""<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Pricing Hub — Anthony's Supermarket</title>
<style>
  :root {{
    --bg:#0f130d; --card:#161c11; --border:#33402a; --text:#e4eadc;
    --accent:#81B554; --accent2:#c9e6a9; --warn:#e0b34a; --bad:#e07a5a;
  }}
  * {{ box-sizing:border-box; }}
  body {{ margin:0; font-family:system-ui,sans-serif; background:var(--bg); color:var(--text); }}
  header {{ padding:14px 18px; border-bottom:1px solid var(--border); display:flex;
    flex-wrap:wrap; gap:10px; align-items:center; justify-content:space-between; position:sticky; top:0; background:var(--bg); z-index:5; }}
  h1 {{ font-size:1.15rem; margin:0; }}
  h1 span {{ color:var(--accent); }}
  .search {{ flex:1; min-width:220px; padding:10px 14px; font-size:1rem; border-radius:10px;
    border:1px solid var(--border); background:var(--card); color:var(--text); }}
  select {{ padding:10px; border-radius:10px; border:1px solid var(--border); background:var(--card); color:var(--text); }}
  .stats {{ font-size:.8rem; color:var(--accent2); }}
  main {{ padding:16px; display:grid; grid-template-columns:repeat(auto-fill,minmax(240px,1fr)); gap:12px; }}
  .item {{ background:var(--card); border:1px solid var(--border); border-radius:12px; padding:14px; cursor:pointer; }}
  .item:hover {{ border-color:var(--accent); }}
  .item .name {{ font-weight:600; margin-bottom:6px; }}
  .item .meta {{ font-size:.75rem; color:var(--accent2); opacity:.8; }}
  .item .retail {{ font-size:1.6rem; font-weight:700; color:var(--accent); margin-top:8px; }}
  .item .cost {{ font-size:.75rem; opacity:.75; }}
  .item.incomplete {{ border-color:var(--warn); }}
  .item.incomplete .retail {{ color:var(--warn); }}
  .vendor-chip {{ display:inline-block; font-size:.65rem; font-weight:700; padding:2px 8px; border-radius:99px; margin-bottom:6px; }}
  .vc-triunfo {{ background:#2a3a1f; color:#a8d080; }}
  .vc-goya {{ background:#3a2a1f; color:#e0b37a; }}
  .empty {{ padding:40px; text-align:center; opacity:.7; }}
  /* price tag modal */
  #modal {{ display:none; position:fixed; inset:0; background:rgba(0,0,0,.65); z-index:10;
    align-items:center; justify-content:center; padding:20px; }}
  #modal.open {{ display:flex; }}
  .tag {{ background:#fff; color:#000; border-radius:10px; padding:24px; text-align:center; width:320px; }}
  .tag .tname {{ font-size:1.1rem; font-weight:700; margin-bottom:4px; }}
  .tag .tpack {{ font-size:.75rem; color:#333; margin-bottom:10px; }}
  .tag .tprice {{ font-size:3.2rem; font-weight:800; }}
  .tag .tcost {{ font-size:.7rem; color:#666; margin-top:8px; }}
  .btns {{ margin-top:16px; display:flex; gap:8px; justify-content:center; flex-wrap:wrap; }}
  button {{ padding:10px 16px; border-radius:10px; border:1px solid var(--border);
    background:var(--card); color:var(--text); cursor:pointer; font-size:.9rem; }}
  button.primary {{ background:var(--accent); color:#0f130d; font-weight:700; border:none; }}
  @media print {{
    body {{ background:#fff; color:#000; }}
    header, main, .btns {{ display:none !important; }}
    #modal {{ display:flex; position:static; background:#fff; padding:0; }}
  }}
</style>
</head>
<body>
<header>
  <h1>🦁 Anthony's <span>Pricing Hub</span></h1>
  <input id="q" class="search" type="search" placeholder="Buscar producto, código o UPC...">
  <select id="vendor"></select>
  <select id="src"></select>
  <span class="stats" id="stats"></span>
</header>
<main id="grid"></main>

<div id="modal"><div class="tag" id="tagBody"></div>
  <div class="btns">
    <button class="primary" onclick="window.print()">🖨️ Imprimir etiqueta</button>
    <button onclick="closeModal()">Cerrar</button>
  </div>
</div>

<script>
const ITEMS = {data_json};
const BUILT_AT = "{built_at}";
const MARKUP = 1.70;

const $ = id => document.getElementById(id);
const srcSel = $("src"), venSel = $("vendor"), grid = $("grid"), stats = $("stats");

function fmt(n) {{ return n == null ? "?" : "$" + n.toFixed(2); }}
function retail(it) {{
  if (it.unitCost != null) return Math.round(it.unitCost * MARKUP * 100) / 100;
  return null;
}}
function vendorClass(v) {{ return v.toLowerCase().startsWith("triunfo") ? "vc-triunfo" : "vc-goya"; }}
function initFilters() {{
  const vendors = [...new Set(ITEMS.map(i => i.vendor))].sort();
  venSel.innerHTML = '<option value="all">Todos los proveedores</option>' +
    vendors.map(v => `<option value="${{v}}">${{v}}</option>`).join("");
  const sources = [...new Set(ITEMS.map(i => i.source))].sort();
  srcSel.innerHTML = '<option value="all">Todas las facturas</option>' +
    sources.map(s => `<option value="${{s}}">${{s}}</option>`).join("");
}}
function render() {{
  const q = $("q").value.trim().toLowerCase();
  const src = srcSel.value, ven = venSel.value;
  const rows = ITEMS.filter(it => {{
    if (ven !== "all" && it.vendor !== ven) return false;
    if (src !== "all" && it.source !== src) return false;
    if (!q) return true;
    return (it.name + " " + it.code + " " + it.upc + " " + it.cat).toLowerCase().includes(q);
  }});
  const complete = rows.filter(r => retail(r) != null).length;
  stats.textContent = `${{rows.length}} productos · ${{complete}} con precio · ×1.70 · actualizado ${{BUILT_AT}}`;
  if (!rows.length) {{ grid.innerHTML = '<div class="empty">Sin resultados</div>'; return; }}
  grid.innerHTML = rows.map(it => {{
    const r = retail(it);
    return `<div class="item ${{r == null ? "incomplete" : ""}}" onclick="showTag(${{it.id}})">
      <span class="vendor-chip ${{vendorClass(it.vendor)}}">${{it.vendor}}</span>
      <div class="name">${{escapeHtml(it.name)}}</div>
      <div class="meta">${{it.cat ? escapeHtml(it.cat) + " · " : ""}}${{it.pack || "—"}} · ${{it.unitsPerCase || "?"}} un/caja · code ${{it.code || "—"}}</div>
      <div class="retail">${{r == null ? "FALTA PRECIO" : fmt(r)}}</div>
      <div class="cost">costo unidad ${{fmt(it.unitCost)}}</div>
    </div>`;
  }}).join("");
}}
function escapeHtml(s) {{
  return (s||"").replace(/[&<>"']/g, c => ({{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}}[c]));
}}
function showTag(id) {{
  const it = ITEMS.find(i => i.id === id);
  const r = retail(it);
  $("tagBody").innerHTML = `
    <div class="tname">${{escapeHtml(it.name)}}</div>
    <div class="tpack">${{it.vendor}} · ${{it.pack || ""}} ${{it.unitsPerCase ? "· " + it.unitsPerCase + " un/caja" : ""}}</div>
    <div class="tprice">${{r == null ? "—" : fmt(r)}}</div>
    <div class="tcost">UPC ${{it.upc || "—"}} · código ${{it.code || "—"}}<br>costo unidad ${{fmt(it.unitCost)}}</div>`;
  $("modal").classList.add("open");
}}
function closeModal() {{ $("modal").classList.remove("open"); }}
$("modal").addEventListener("click", e => {{ if (e.target.id === "modal") closeModal(); }});
$("q").addEventListener("input", render);
srcSel.addEventListener("change", render);
venSel.addEventListener("change", render);
initFilters();
render();
</script>
</body>
</html>"""


def main():
    items = load_items()
    complete = sum(1 for i in items if i["unitCost"] is not None)
    vendors = {}
    for i in items:
        vendors[i["vendor"]] = vendors.get(i["vendor"], 0) + 1
    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    with open(OUT_PATH, "w", encoding="utf-8") as fh:
        fh.write(build_html(items))
    print(f"built {OUT_PATH}")
    print(f"items: {len(items)} ({complete} con precio unitario, {len(items) - complete} incompletos)")
    for v, n in sorted(vendors.items()):
        print(f"  {v}: {n}")


if __name__ == "__main__":
    main()
