# HANDOFF — NRS POS Pipeline (resume point for coding agents)

Updated: 2026-08-20 (Hermes Agent)

## Where the work stands

A partially-completed data-engineering task on Anthony's Supermarket (this repo).
The goal: pull NRS POS daily reports from Gmail, store them in the Supabase
pricing DB (`pos_import_batches` / `pos_sales`), build a bookkeeping ledger +
demand analysis, and wire a daily automation.

## What EXISTS in this repo NOW (all committed)

- `server/pos-import.js` — shared NRS CSV parser (column aliases, summary-row
  skipping, void/refund conventions; mirrors `nrs/nrs-analyze.py`).
- `server/pos-db-import.js` — **DB importer** (new): parses `nrs_sales_*.csv`,
  dedupes by sha256 into `pos_import_batches`, inserts `pos_sales`, matches rows
  to `pricing_products` (UPC evidence → exact name → strict all-tokens fuzzy),
  backfills scanned UPCs onto hub products with `--backfill-upc`.
  - Handles the Gmail email-report header: `UPC,Name,"Total Qty","Total Amount"`
    → `Item/Qty/Amount` via `fixHeader()` (only the header line is rewritten).
  - `match_method` uses only `upc` / `name` / `manual` (DB check constraint).
- `nrs/inbox/*.csv` — **35 daily sales CSVs + 35 inventory CSVs** (Jul 15 →
  Aug 18, 2026) scraped from Gmail (`no-reply@nrsplus.com`), FORCE-COMMITTED so
  any repo checkout can run the import. (Normally gitignored — `nrs/inbox/*.csv`.
  They were force-added for this handoff; delete from git later if undesired.)
- `supabase/seed/pricing_hub_seed.sql` — modified (uncommitted prior to this
  handoff; now committed).

## Scraper (lives on the VPS, NOT in this repo)

`/opt/data/bin/anthony-nrs-gmail-grab.py` — himalaya-based Gmail scrape of
no-reply@nrsplus.com; downloads both CSV attachments per email, idempotent
(state in `~/.hermes/nrs-gmail-grab.json`). Requires himalaya CLI + Gmail App
Password (config at `~/.config/himalaya/config.toml`).

## Skills (vendored in-repo — read before working)

- `docs/skills/product-finder.md` — POS demand mining: top movers, cross-sell
  combos, margin blind spots, fuzzy name matching (strict all-tokens rule).
- `docs/skills/anthony-supermarket-invoices.md` — invoice/pricing SOP, 70%
  rule (Retail = Base Cost × 1.70), vault workspace layout, vision verification.
- `docs/skills/product-price-monitor.md` — price-watch/watchdog patterns
  (silent unless change; baseline before scheduling).

## DB state — TREAT AS DIRTY, do a clean slate

An earlier import run inserted 35 batches with WRONG data (UPC-as-item-name,
before the header fix), those rows were deleted, but a re-run aborted mid-way
(now-fixed constraint error) and one file may be marked "already imported" with
stale rows. Safest resume: delete ALL rows from `pos_import_batches`
(`pos_sales` cascades), then re-import fresh.

## How to run (env from server/.env — SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY)

```bash
cd server
set -a && source .env && set +a
# clean slate
node -e "const {createClient}=require('@supabase/supabase-js');const c=createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}});(async()=>{await c.from('pos_sales').delete().neq('id',0);await c.from('pos_import_batches').delete().neq('id','00000000-0000-0000-0000-000000000000');console.log('cleared')})()"
# import all 35
node pos-db-import.js --backfill-upc
```

Verified targets: **35 batches, ~11,141 rows, ~$113,380.31 gross**,
product-match rate reported per batch.

## Remaining work

1. Re-import clean (above) + verify per-batch row counts/gross match CSV sums.
2. Bookkeeping ledger: daily/monthly gross, voids, refunds, net; payment mix;
   July vs Aug totals → Obsidian vault `06_FINANCIAL/`; inventory reorder list
   from the Inventory_Status CSVs ("Reorder Now" + In Stock < Count Threshold).
3. Demand analysis: `python3 /opt/data/bin/anthony-product-finder.py --all`
   (top movers, cross-sell combos, margin blind spots, slow SKUs).
4. Automation: `/opt/data/bin/nrs-daily.sh` = grab → import (cron owned by
   Hermes, not the coding agent).
5. Update `docs/agent-context/CURRENT_STATE.md` + append `SESSION_LOG.md`
   (AGENTS.md shared-context duty).
6. Commit + push, then update this HANDOFF.md with what was done.

## Rules

- Never print/commit the service-role key; never commit `.env`.
- 70% pricing rule is authoritative (Retail = Base Cost × 1.70); don't change
  migrations without a stop-and-ask note.
- Never invent values — ambiguous CSV/DB mismatch → flag in HANDOFF.md, stop.
- See AGENTS.md for full authority boundaries + shared-context duty.
