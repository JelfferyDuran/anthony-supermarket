#!/usr/bin/env python3
"""
NRS POS Daily Sales Analyzer — Anthony's Supermarket
=====================================================
Reads raw NRS POS CSV exports (dropped in inbox/ by the daily fetch job
or manually) and produces:
  1. Daily KPIs (gross/net sales, transactions, avg ticket, payment split)
  2. Monetary-leak indicators (voids, refunds, discounts, no-sales, drawer anomalies)
  3. Item-level top movers + margin insight (if cost data present)
  4. A time-series history (data/daily_history.json) for trend detection
  5. A concise briefing (reports/<date>.md + stdout) for Telegram delivery

Usage:
  python nrs-analyze.py [--date YYYY-MM-DD] [--brief]
  python nrs-analyze.py --demo          # generate a demo CSV and analyze it
"""
import argparse
import csv
import json
import os
import re
import sys
from collections import defaultdict
from datetime import datetime, timedelta

BASE = os.path.dirname(os.path.abspath(__file__))
INBOX = os.path.join(BASE, "inbox")
DATA = os.path.join(BASE, "data")
REPORTS = os.path.join(BASE, "reports")
HISTORY = os.path.join(DATA, "daily_history.json")
os.makedirs(INBOX, exist_ok=True)
os.makedirs(DATA, exist_ok=True)
os.makedirs(REPORTS, exist_ok=True)


# ── Tolerant CSV discovery ────────────────────────────────────────────
def discover_files(target_date):
    """Find CSVs in inbox/ matching target date (or newest if no date)."""
    candidates = []
    for f in os.listdir(INBOX):
        if not f.lower().endswith(".csv"):
            continue
        path = os.path.join(INBOX, f)
        mtime = os.path.getmtime(path)
        # Match by filename date pattern if present: YYYY-MM-DD, YYYYMMDD, etc.
        name_date = None
        m = re.search(r"(20\d{2})[-_]?(\d{2})[-_]?(\d{2})", f)
        if m:
            name_date = f"{m.group(1)}-{m.group(2)}-{m.group(3)}"
        candidates.append((path, mtime, name_date, f))

    if target_date:
        exact = [c for c in candidates if c[2] == target_date]
        if exact:
            return [c[0] for c in exact]
        # Fall back to any file modified on that date
        td = datetime.strptime(target_date, "%Y-%m-%d")
        mod = [c for c in candidates if datetime.fromtimestamp(c[1]).date() == td.date()]
        if mod:
            return [c[0] for c in mod]
        return []
    if not candidates:
        return []
    candidates.sort(key=lambda c: c[1], reverse=True)
    return [c[0] for c in candidates]


def read_csv_any(path):
    """Read a CSV with encoding fallback; return (header, rows)."""
    for enc in ("utf-8-sig", "utf-8", "latin-1", "cp1252"):
        try:
            with open(path, "r", encoding=enc, newline="") as f:
                sample = f.read(4096)
                f.seek(0)
                dialect = csv.Sniffer().sniff(sample, delimiters=",;\t|") if sample else csv.excel
                reader = csv.reader(f, dialect)
                rows = [r for r in reader if any(c.strip() for c in r)]
                if rows:
                    header = [h.strip().lower() for h in rows[0]]
                    return header, rows[1:]
        except (UnicodeDecodeError, csv.Error):
            continue
    return [], []


# ── Column mapping (tolerant to NRS export variants) ──────────────────
def find_col(header, *names):
    for i, h in enumerate(header):
        for n in names:
            if n in h:
                return i
    return None


def to_float(v):
    if v is None:
        return 0.0
    s = str(v).strip().replace("$", "").replace(",", "").replace(" ", "")
    if s in ("", "-", "--", "N/A"):
        return 0.0
    try:
        return float(s)
    except ValueError:
        return 0.0


def normalize_item(name):
    return re.sub(r"\s+", " ", str(name).strip().upper())


# ── Main analysis ─────────────────────────────────────────────────────
def analyze(path):
    header, rows = read_csv_any(path)
    if not rows:
        return None

    c_date = find_col(header, "date", "fecha", "day")
    c_time = find_col(header, "time", "hora")
    c_item = find_col(header, "item", "product", "producto", "desc", "description", "plu", "upc", "sku")
    c_qty = find_col(header, "qty", "quantity", "cantidad", "units")
    c_price = find_col(header, "price", "precio", "unit price", "rate")
    c_total = find_col(header, "total", "amount", "monto", "sales", "ext", "line total")
    c_pay = find_col(header, "payment", "pay", "tender", "type", "method", "forma")
    c_void = find_col(header, "void", "anul", "cancel")
    c_refund = find_col(header, "refund", "return", "devol")
    c_discount = find_col(header, "discount", "descuento", "markdown")
    c_cashier = find_col(header, "cashier", "employee", "user", "operator", "clerk", "vendedor")
    c_dept = find_col(header, "dept", "department", "departamento", "category", "grupo")
    c_cost = find_col(header, "cost", "costo")

    # Aggregate
    gross = 0.0
    net = 0.0
    txn_count = 0
    txns = set()
    pay_split = defaultdict(float)
    pay_count = defaultdict(int)
    voids = 0.0
    void_count = 0
    refunds = 0.0
    refund_count = 0
    discounts = 0.0
    items = defaultdict(lambda: {"qty": 0.0, "rev": 0.0, "cost": 0.0})
    cashier_stats = defaultdict(lambda: {"sales": 0.0, "txns": 0, "voids": 0.0})
    dept_stats = defaultdict(lambda: {"rev": 0.0, "qty": 0.0})
    no_sale_count = 0
    rows_used = 0

    for r in rows:
        # skip summary/total rows
        joined = " ".join(r).lower()
        if any(k in joined for k in ("grand total", "total sales", "report total", "page ")):
            continue

        line_total = to_float(r[c_total]) if c_total is not None and c_total < len(r) else 0.0
        qty = to_float(r[c_qty]) if c_qty is not None and c_qty < len(r) else 0.0
        price = to_float(r[c_price]) if c_price is not None and c_price < len(r) else 0.0

        is_void = False
        is_refund = False
        if c_void is not None and c_void < len(r):
            v = str(r[c_void]).strip().lower()
            is_void = v in ("y", "yes", "1", "true", "void", "anulado")
        if c_refund is not None and c_refund < len(r):
            v = str(r[c_refund]).strip().lower()
            is_refund = v in ("y", "yes", "1", "true", "refund", "return", "devolucion")
        # Negative totals often indicate voids/refunds too
        if line_total < 0:
            if is_refund or c_void is None:
                is_refund = True

        if is_void:
            voids += abs(line_total)
            void_count += 1
            if c_cashier is not None and c_cashier < len(r):
                cashier_stats[str(r[c_cashier]).strip()]["voids"] += abs(line_total)
            continue
        if is_refund:
            refunds += abs(line_total)
            refund_count += 1
            continue

        # Payment method
        pay = "OTHER"
        if c_pay is not None and c_pay < len(r):
            p = str(r[c_pay]).strip().upper()
            if any(k in p for k in ("CASH", "EFECTIVO", "EFECT")):
                pay = "CASH"
            elif any(k in p for k in ("CARD", "CREDIT", "DEBIT", "VISA", "MASTER", "AMEX", "DISCOVER", "TARJETA")):
                pay = "CARD"
            elif any(k in p for k in ("CHECK", "CHEQUE", "EBT", "SNAP", "WIC", "GIFT")):
                pay = p.split()[0]
            else:
                pay = p.split()[0] if p else "OTHER"
        pay_split[pay] += line_total
        pay_count[pay] += 1

        gross += line_total
        net += line_total  # net tracked after voids/refunds excluded

        # Transaction id if present
        c_txn = find_col(header, "tran", "ticket", "receipt", "order", "no", "#")
        if c_txn is not None and c_txn < len(r) and str(r[c_txn]).strip():
            txns.add(str(r[c_txn]).strip())

        # Item aggregation
        if c_item is not None and c_item < len(r) and str(r[c_item]).strip():
            name = normalize_item(r[c_item])
            if name in ("NO SALE", "NO SALE / DRAWER", "OPEN DRAWER", "PAID OUT", "PAID IN", "CASH IN", "CASH OUT"):
                no_sale_count += 1
            else:
                it = items[name]
                it["qty"] += qty if qty else (1 if line_total else 0)
                it["rev"] += line_total
                if c_cost is not None and c_cost < len(r):
                    it["cost"] += to_float(r[c_cost]) * (qty if qty else 1)
        if c_cashier is not None and c_cashier < len(r) and str(r[c_cashier]).strip():
            cs = cashier_stats[str(r[c_cashier]).strip()]
            cs["sales"] += line_total
            cs["txns"] += 1
        if c_dept is not None and c_dept < len(r) and str(r[c_dept]).strip():
            d = dept_stats[str(r[c_dept]).strip()]
            d["rev"] += line_total
            d["qty"] += qty
        if c_discount is not None and c_discount < len(r):
            discounts += abs(to_float(r[c_discount]))

        rows_used += 1

    txn_count = len(txns) if txns else int(sum(pay_count.values()) or rows_used)
    avg_ticket = (net / txn_count) if txn_count else 0.0

    # Leak indicators
    leak_flags = []
    if void_count > 0:
        void_rate = void_count / txn_count if txn_count else 0
        leak_flags.append({"type": "voids", "label": "Voids/Anulaciones",
                           "count": void_count, "amount": round(voids, 2),
                           "rate_pct": round(void_rate * 100, 2),
                           "alert": void_rate > 0.05})
    if refund_count > 0:
        refund_rate = refund_count / txn_count if txn_count else 0
        leak_flags.append({"type": "refunds", "label": "Refunds/Devoluciones",
                           "count": refund_count, "amount": round(refunds, 2),
                           "rate_pct": round(refund_rate * 100, 2),
                           "alert": refund_rate > 0.03})
    if no_sale_count > 5:
        leak_flags.append({"type": "no_sales", "label": "No-Sale/Drawer opens",
                           "count": no_sale_count, "amount": 0,
                           "rate_pct": round((no_sale_count / txn_count * 100) if txn_count else 0, 2),
                           "alert": True})
    if discounts > 0 and net > 0:
        disc_pct = discounts / (net + discounts) * 100
        leak_flags.append({"type": "discounts", "label": "Discounts/Descuentos",
                           "count": 0, "amount": round(discounts, 2),
                           "rate_pct": round(disc_pct, 2),
                           "alert": disc_pct > 10})

    # Top movers
    top_items = sorted(items.items(), key=lambda kv: kv[1]["rev"], reverse=True)[:10]
    top_by_qty = sorted(items.items(), key=lambda kv: kv[1]["qty"], reverse=True)[:5]
    worst_margin = sorted(
        [(k, v) for k, v in items.items() if v["cost"] > 0],
        key=lambda kv: (kv[1]["rev"] - kv[1]["cost"]) / kv[1]["rev"] if kv[1]["rev"] else 1
    )[:5]

    return {
        "source": os.path.basename(path),
        "rows": rows_used,
        "gross": round(gross, 2),
        "net": round(net, 2),
        "txn_count": txn_count,
        "avg_ticket": round(avg_ticket, 2),
        "pay_split": {k: round(v, 2) for k, v in pay_split.items()},
        "pay_count": dict(pay_count),
        "voids": round(voids, 2),
        "void_count": void_count,
        "refunds": round(refunds, 2),
        "refund_count": refund_count,
        "discounts": round(discounts, 2),
        "no_sale_count": no_sale_count,
        "leak_flags": leak_flags,
        "top_items": [{"name": k, "qty": round(v["qty"], 2), "rev": round(v["rev"], 2)} for k, v in top_items],
        "top_by_qty": [{"name": k, "qty": round(v["qty"], 2), "rev": round(v["rev"], 2)} for k, v in top_by_qty],
        "worst_margin": [{"name": k, "rev": round(v["rev"], 2), "cost": round(v["cost"], 2),
                          "margin_pct": round(((v["rev"] - v["cost"]) / v["rev"] * 100) if v["rev"] else 0, 1)}
                         for k, v in worst_margin],
        "cashier_stats": {k: {"sales": round(v["sales"], 2), "txns": v["txns"], "voids": round(v["voids"], 2)}
                          for k, v in sorted(cashier_stats.items(), key=lambda kv: -kv[1]["sales"])},
        "dept_stats": {k: {"rev": round(v["rev"], 2), "qty": round(v["qty"], 2)}
                       for k, v in sorted(dept_stats.items(), key=lambda kv: -kv[1]["rev"])},
    }


# ── History + trend ───────────────────────────────────────────────────
def load_history():
    if os.path.exists(HISTORY):
        try:
            with open(HISTORY, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}
    return {}


def save_history(history):
    with open(HISTORY, "w", encoding="utf-8") as f:
        json.dump(history, f, indent=2, ensure_ascii=False)


def trend_comment(daily, history, target_date):
    """Compare today vs previous 7-day average; flag anomalies."""
    keys = sorted(history.keys())
    past = [history[k]["net"] for k in keys if k < target_date and history[k].get("net")]
    if not past:
        return "No prior data yet — baseline building."
    avg = sum(past[-7:]) / min(len(past[-7:]), 7)
    if avg <= 0:
        return "No prior data yet — baseline building."
    delta = (daily["net"] - avg) / avg * 100
    if delta < -15:
        return f"⚠️ Net sales {delta:.0f}% BELOW 7-day avg (${avg:,.0f}). Check for: closed early, out-of-stock, cashier error, or missing drawer."
    if delta > 25:
        return f"🔥 Net sales {delta:.0f}% ABOVE 7-day avg (${avg:,.0f}). Strong day — verify drawer counts match."
    return f"Net sales {delta:+.0f}% vs 7-day avg (${avg:,.0f}). Within normal range."


# ── Briefing output ───────────────────────────────────────────────────
def format_brief(daily, target_date, trend):
    lines = []
    lines.append(f"🛒 *Anthony's — NRS Sales {target_date}*")
    lines.append("")
    lines.append(f"*Net Sales:* ${daily['net']:,.2f}")
    lines.append(f"*Transactions:* {daily['txn_count']} · *Avg Ticket:* ${daily['avg_ticket']:,.2f}")
    if daily["pay_split"]:
        ps = " · ".join(f"{k}: ${v:,.0f}" for k, v in sorted(daily["pay_split"].items(), key=lambda kv: -kv[1]))
        lines.append(f"*Payments:* {ps}")
    lines.append("")
    if daily["leak_flags"]:
        lines.append("*🔍 Leak Checks:*")
        for f in daily["leak_flags"]:
            icon = "🚨" if f["alert"] else "✅"
            amt = f" ${f['amount']:,.2f}" if f["amount"] else ""
            lines.append(f"{icon} {f['label']}: {f['count']}x{amt} ({f['rate_pct']}%)")
    else:
        lines.append("*Leak Checks:* ✅ No flags (voids/refunds/discounts under thresholds)")
    lines.append("")
    if daily["top_items"]:
        top = ", ".join(f"{t['name'][:22]} ${t['rev']:,.0f}" for t in daily["top_items"][:5])
        lines.append(f"*Top Sellers:* {top}")
    if daily["cashier_stats"]:
        cs = daily["cashier_stats"]
        top_cashier = next(iter(cs.items()))
        lines.append(f"*Top Cashier:* {top_cashier[0]} — ${top_cashier[1]['sales']:,.0f} ({top_cashier[1]['txns']} txns)")
    lines.append("")
    lines.append(trend)
    return "\n".join(lines)


# ── Demo mode ─────────────────────────────────────────────────────────
def make_demo_csv(target_date):
    path = os.path.join(INBOX, f"nrs_sales_{target_date}.csv")
    with open(path, "w", encoding="utf-8", newline="") as f:
        w = csv.writer(f)
        w.writerow(["Date", "Time", "Transaction#", "Item", "Qty", "Price", "Total", "Payment", "Cashier", "Dept", "Void"])
        items = [("Yellow Rice", 3.99, 40), ("Chicken", 6.99, 25), ("Ground Beef", 5.49, 30),
                 ("Plantains", 0.99, 80), ("Goya Beans", 2.49, 55), ("Milk 1gal", 4.11, 35),
                 ("Bread", 1.98, 45), ("Eggs 18ct", 5.78, 22), ("Orange Juice", 5.28, 18),
                 ("Cheese 16oz", 7.92, 15)]
        import random
        random.seed(42)
        txn = 1000
        for i in range(320):
            txn += 1
            pay = "CASH" if i % 3 else "CARD"
            cashier = random.choice(["Maria", "Juan", "Carlos", "Luis"])
            n = random.randint(1, 6)
            for j in range(n):
                name, price, _ = random.choice(items)
                qty = random.randint(1, 3)
                total = round(price * qty, 2)
                w.writerow([target_date, f"{random.randint(9,20):02d}:{random.randint(0,59):02d}", txn,
                            name, qty, price, total, pay, cashier, "GROCERY", ""])
        # inject some voids + refunds
        for _ in range(14):
            txn += 1
            name, price, _ = random.choice(items)
            w.writerow([target_date, "12:00", txn, name, 1, price, -price, "CASH", "Juan", "GROCERY", "Y"])
        for _ in range(6):
            txn += 1
            name, price, _ = random.choice(items)
            w.writerow([target_date, "14:00", txn, name, 1, price, -price, "CARD", "Maria", "GROCERY", ""])
        for _ in range(7):
            txn += 1
            w.writerow([target_date, "16:00", txn, "NO SALE", "", "", "", "CASH", "Carlos", "", ""])
    return path


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--date", default=None)
    ap.add_argument("--brief", action="store_true")
    ap.add_argument("--demo", action="store_true")
    args = ap.parse_args()

    target = args.date or datetime.now().strftime("%Y-%m-%d")
    if args.demo:
        print(f"[demo] generating sample CSV for {target}")
        make_demo_csv(target)

    files = discover_files(target)
    if not files:
        print(f"No CSV found in {INBOX} for {target} (or none at all).")
        print("Drop an NRS export here (nrs_sales_YYYY-MM-DD.csv) or run --demo.")
        sys.exit(2)

    history = load_history()
    result = None
    for f in files:
        r = analyze(f)
        if r:
            result = r
            break
    if not result:
        print(f"Could not parse any CSV for {target}.")
        sys.exit(1)

    history[target] = {"net": result["net"], "gross": result["gross"], "txns": result["txn_count"],
                       "voids": result["voids"], "refunds": result["refunds"],
                       "pay_split": result["pay_split"], "flags": [f["type"] for f in result["leak_flags"]],
                       "source": result["source"]}
    save_history(history)

    trend = trend_comment(result, history, target)
    brief = format_brief(result, target, trend)

    # Save report
    report_path = os.path.join(REPORTS, f"{target}.md")
    with open(report_path, "w", encoding="utf-8") as f:
        f.write(brief + "\n\n---\n\n```json\n" + json.dumps(result, indent=2, ensure_ascii=False) + "\n```\n")
    with open(os.path.join(REPORTS, f"{target}.json"), "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2, ensure_ascii=False)

    print(brief)
    print(f"\n[stored] {report_path}")


if __name__ == "__main__":
    main()
