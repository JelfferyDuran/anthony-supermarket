---
name: product-finder
description: Use when mining POS sales for demand and pricing gaps.
version: 1.0.0
author: Hermes Agent
license: MIT
platforms: [linux]
metadata:
  hermes:
    tags: [pos, sales, demand, basket-analysis, cross-sell, pricing, margin, retail]
    category: finance
    related_skills: [product-price-monitor, xlsx, credit-report-analysis]
---

# Product Finder — POS demand mining + pricing gap detection

Mines NRS POS CSV exports (Anthony's Supermarket) for what customers actually
want and where money leaks: top movers, cross-sell combos (basket
co-occurrence), **margin blind spots** (items selling with NO cost/retail in
the Pricing Hub), hub items not selling, and peak-hour demand.

## When to Use
- User asks to find items customers want / demand signals / revenue edge
- New NRS POS CSV dropped into `inbox/` — refresh the demand scan
- Before re-pricing: which items are underpriced, overpriced, or unpriced

## Tooling (persistent in /opt/data/bin)
- `/opt/data/bin/anthony-product-finder.py` — the demand scan (this skill)
- `/opt/data/bin/anthony-overprice-watch.py` — cron watchdog tick (see below)

## Pipeline

### 1. Data source
- NRS exports land in `/opt/data/hub-branch/nrs/inbox/` as
  `nrs_sales_YYYY-MM-DD.csv` (Date, Time, Transaction#, Item, Qty, Price,
  Total, Payment, Cashier, Dept, Void columns).
- Daily KPIs/leaks already covered by `nrs-analyze.py` (same dir) — this tool
  is the demand layer on top.
- Test without real data: `python3 /opt/data/bin/anthony-product-finder.py --demo`
  (writes a synthetic basket CSV into inbox/, then runs).

### 2. Run the scan
```
python3 /opt/data/bin/anthony-product-finder.py [--date YYYY-MM-DD] [--all]
```
- Merges every matching CSV; ranks movers by revenue; counts item-pair
  co-occurrence per transaction (cross-sell); classifies blind spots.
- **Fuzzy name matching is REQUIRED** — POS names are short
  ("VAN CAMPS TUNA") vs hub names long ("Van Camps Yellowfin Tuna in Oil
  48/5oz"). Exact-match-only produces a useless report where everything looks
  unpriced. `fuzzy_match()` = token overlap after stopword strip
  (STOP: THE/AND/IN/OZ/CT/LB/sizes), min 2 significant shared tokens or
  substring containment.

### 3. Read the output
- **🏆 TOP MOVERS** — revenue-ranked; the demand core. These are what the
  store is really about (typically fresh: CHICKEN, CHEESE, EGGS, BEEF, OJ).
- **🔀 CROSS-SELL COMBOS** — pairs in ≥2 baskets. Use for shelf adjacency,
  bundle promos, WhatsApp order suggestions.
- **💡 MARGIN BLIND SPOTS** — items selling hard with no pricing-hub entry:
  their margin is untracked. "← price it!" = add cost/retail to the hub.
  Real-world finding: fresh/commodity lines (chicken, eggs, produce) are
  almost always blind — the hub only covers vendor-invoice items.
- **⚠️ HUB ITEMS NOT SELLING** — capital tied up in slow SKUs; candidates
  for promo, markdown, or removal.
- **⏰ PEAK HOUR** — staffing/promo timing.

### 4. Overpriced-item watchdog (companion)
`anthony-overprice-watch.py` parses ALL_ITEMS from
`/opt/data/hub-branch/apps/pricing-hub/index.html`, computes retail vs the
**70% rule** (retail = cost × 1.70, ±5% tolerance), and prints ONLY on
change (new over/flagged items, price moves, resolved items). Baseline
stored at `~/.hermes/price-watches/anthony-overprice.json`.

- First run = full baseline report (always prints).
- Later runs: empty stdout = silent tick (watchdog pattern), exit 0.
- Cron (no_agent=True, script in `~/.hermes/scripts/`): job
  `Anthony Pricing Hub — Overpriced Item Watch`, every 6h, delivers to
  origin. State file prevents duplicate alerts (fingerprint = sorted
  name→{retail,cost,kind}).

## Pitfalls
1. **Exact name match kills the report** — always use fuzzy_match; verify a
   known pair (e.g. "VAN CAMPS TUNA" ↔ "Van Camps Yellowfin Tuna in Oil")
   resolves before trusting blind-spot counts.
2. **Skip NO SALE / void / negative-total rows** before aggregating or they
   pollute qty/revenue.
3. **Don't schedule cron until one foreground run works** (skill rule) — and
   the script must live in `~/.hermes/scripts/` for cron (absolute paths
   rejected; internal hub path stays absolute).
4. **Watchdog silence is success** — a no-change tick prints nothing; don't
   "fix" it by adding noise. Error exit ≠ silent, cron surfaces it.
5. Demo CSV pollutes inbox — delete `nrs_sales_*.csv` demo files before real
   exports land, or scope with `--date`.

## Verification
- [ ] `python3 anthony-product-finder.py --demo` runs clean, exit 0
- [ ] Known POS↔hub pair resolves (blind spots exclude it)
- [ ] Blind spots = genuinely unpriced items only
- [ ] Watchdog: run twice → first prints baseline, second silent
- [ ] Cron job listed, enabled, next_run_at set

## Files
- Scripts: `/opt/data/bin/anthony-product-finder.py`,
  `/opt/data/bin/anthony-overprice-watch.py` (+ copy in
  `~/.hermes/scripts/` for cron)
- Hub source: `/opt/data/hub-branch/apps/pricing-hub/index.html`
- NRS analyzer (KPIs/leaks): `/opt/data/hub-branch/nrs/nrs-analyze.py`
- Watch state: `~/.hermes/price-watches/anthony-overprice.json`
