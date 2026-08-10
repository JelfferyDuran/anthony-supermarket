# 🛒 NRS POS Daily Sales Intelligence — Anthony's Supermarket

Automated daily pipeline that pulls the NRS POS sales report from the merchant
portal and turns it into leak-detection insights for management.

## How it works

```
Daily cron (07:30 ET)
  └─ 1. Fetch: log into mystore.nrsplus.com (browser automation)
  │        → Reports → CSV Download → yesterday's sales CSV
  │        → saved to inbox/nrs_sales_YYYY-MM-DD.csv
  │        (if automation is blocked: manually download the CSV
  │         and drop it into inbox/ — same result)
  └─ 2. Analyze: python nrs-analyze.py --date YYYY-MM-DD
  │        → KPIs, payment split, leak flags, top sellers, cashier stats
  │        → appends to data/daily_history.json (trend baseline)
  └─ 3. Deliver: briefing sent to Telegram
```

## Directory layout

| Path | Purpose |
|------|---------|
| `inbox/` | Raw NRS CSVs (auto-downloaded or manually dropped) |
| `reports/` | Daily briefing `.md` + raw `.json` per date |
| `data/daily_history.json` | Time-series history for trend comparison |
| `.env` | NRS_USER / NRS_PASS — fill in yourself, never in chat |
| `nrs-analyze.py` | Analysis engine (KPIs + leak detection) |

## Leak indicators tracked

- **Voids** (anulaciones) — rate > 5% of transactions = alert
- **Refunds** (devoluciones) — rate > 3% = alert
- **No-Sale / drawer opens** — more than 5/day = alert (skimming red flag)
- **Discounts** — > 10% of gross = alert
- **Cash vs Card split** — compare daily vs history for drift
- **Cashier stats** — per-cashier sales/txn/voids to spot anomalies
- **Trend anomaly** — net sales < -15% or > +25% vs 7-day average flagged

## Manual use

```bash
cd ~/anthony-supermarket/nrs
python nrs-analyze.py --date 2026-08-10 --brief   # analyze a specific day
python nrs-analyze.py --demo --brief              # generate + analyze sample data
```

## Portal details

- Login: https://mystore.nrsplus.com/merchant/
- Fields: `creduser` (email/login), `credpass` (password) + reCAPTCHA
- No public API — NRS offers CSV Download Reporting + paid "Advanced Data"
  add-on ($14.95/mo) for item/profit reports. If you enable Advanced Data,
  the item-level margin analysis gets richer.
