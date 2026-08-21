# Pricing Hub V2 — Immersive Hub + Invoice/Financial Data Collection (handoff spec)

**Status:** Ready for Claude Code (or another coding agent) · **Owner:** Noel Duran (Anthony's Supermarket)
**Author:** Hermes Agent · **Date:** 2026-08-19 · **Target repo:** `github.com/JelfferyDuran/anthony-supermarket`

This is the build plan for the next major upgrade: turn the single-file Pricing Hub into a
fully built, immersive pricing + invoice + financials system for the store, with integrations
as a later phase. It builds on the **existing PR #32 foundation** — do not restart from scratch.

---

## 1. Mission & boundary

One app (in this repo) owns the store's **staff-side** pricing, invoice intake, and financial
visibility. It must NOT become the customer ordering surface.

- **In scope:** immersive Pricing Hub UI · invoice data collection (scan/PDF → OCR review → approve)
- NRS POS CSV sales import · vendor/category margin analytics · price history + price-change alerts ·
  price-gun / label exports · financial summary (vendor spend, COGS, NET21 aging).
- **Later phase (integrations):** catalog API for the customer app (`anthony-superapp`), NRS POS API,
  bank feeds (Plaid), Telegram intake, inventory, Kingdom OS mirror update (Hermes-owned).
- Boundary already decided in `brain/Decisions/2026-08-12-invoice-pricing-and-superapp-boundary.md` +
  `docs/INVOICE_PRICING_PIPELINE.md` (from PR #32): the customer app **consumes an approved catalog
  API**; it never calculates or approves retail prices.

## 1b. Owner decisions (answered 2026-08-19 — binding)

1. **Markup rule → 70% (1.70×)** — the vault rule wins. The hub's 65% default becomes **70%** and the
   server becomes the single authority. ⚠️ **Coordinated switch (do not half-apply):** all 157 stored
   `retail` snapshots were computed at 65% — the V2 seed must **recompute every retail snapshot at
   70%** (`.99` rounding), else the "synced override" logic will pin stale 65% prices. The Kingdom OS
   collector + its write-back endpoint hardcode `1.65` — Hermes flips those to `1.70` in the same
   change window. The vault 1.70× rule then matches everywhere.
2. **Iframe strategy → keep the iframe in place.** The site keeps loading the hub where it is today;
   `apps/pricing-hub/index.html` becomes a thin loader for the v2 bundle (or the bundle replaces the
   file in place). Root `pricing-hub/index.html` stays a synced copy.
3. **OCR provider → FREE, upload-the-invoice-here flow.** Primary: **Gemini Flash via Google AI
   Studio free API key** (`GEMINI_API_KEY`; Gemini 2.5 Flash / 3 Flash, free tier ≈ 15 RPM / 1,500
   requests/day, image + PDF vision, structured JSON output — enough for a small store's invoice
   volume). Wired as `PRICING_OCR_WEBHOOK_URL` per PR #32: upload → extract raw text + candidate line
   items + JSON → `needs_review`. Fallbacks: local **Tesseract/PaddleOCR** (zero cost, no key) and the
   existing Hermes vision review path. ⚠️ Free tier = Google may use content to improve products —
   invoices are internal; if that's a problem later, the paid tier is a few $/month (no training use).
4. **Intake channels → hub UI + Telegram + WhatsApp (per-number allowlists).** The store owner
   uploads the invoice directly in chat (Kingdom Hermes bot on Telegram, and the WhatsApp bridge —
   "other numbers" = other chat IDs get allowlisted per channel). PR #32's Telegram allowlist commands
   extend to a multi-channel intake: any channel sends the scan → same OCR → same `needs_review` queue.
   Hub UI remains the staff approval surface.

## 2. Current verified state (2026-08-19, main @ `3058c09`)

- **Pricing Hub app:** `apps/pricing-hub/index.html` — single-file, ALL data embedded as JS arrays
  (`VENDORS` + `ALL_ITEMS`, no backend). **157 items · 4 vendors** (Super Trading 3 invoices, Hershey's
  Ice Cream 1, Family Food Distributors 5 incl. 6/24/26 refs). Default markup **65%** + `.99` rounding
  (`roundRetail`); `calcRetail()` honors stored `retail` when it differs from the formula (synced
  overrides). Verifier: `scripts/verify-pricing-hub.js` — ALL CHECKS PASS.
- **Root `pricing-hub/index.html`** is a synced copy the website iframes (Vercel main site
  `anthony-supermarket` — **manual CLI deploy**, NOT git-linked; it currently lags the repo — the
  ​​live iframe shows pre-8/19 data until redeployed). See "Deploy" below.
- **Data flow today (Hermes-operated, no backend):** invoice scan → OCR → audit math → vault CSVs
  (`03_INVOICES/PROCESSED`) → hub arrays appended → `verify-pricing-hub.js` → push. Obsidian vault
  keeps RAW scans + audits; repo never stores scans (Pages deploys repo root).
- **Kingdom OS dependency (IMPORTANT — do not break):** the KFS Admin OS (repo `kfs-admin-os`,
  Hermes-owned) mirrors the hub by parsing `apps/pricing-hub/index.html` every 2h into its `data.json`
  and exposes a Pricing tab. Its write-back endpoint (`POST /api/pricing` on the VPS `serve_os.py`)
  patches the hub FILE + commits/pushes this repo. **If V2 moves the source of truth to Supabase,
  keep the embedded arrays + file format working as the mirror/fallback until Hermes ports the OS
  collector to the new data layer.** Coordinate, don't break the OS sync.
- **Vault pipeline (Hermes):** `03_INVOICES/INVOICE_PROCESSING_SOP.md` (6 steps: intake → extract →
  audit → price → output → update), `02_PRICING_ENGINE/Vendor_Price_History.csv`, `Exception_Log.md`.
  Vault markup rule is **1.70×**; hub default is **1.65×** — both documented; V2 should unify behind
  a single server-authoritative rule (see Decisions).
- **NRS POS:** exports CSV only (no API on record) — sales import must parse POS CSV.

## 3. Foundation to build on — PR #32 (DRAFT, unmerged)

Branch `feature/invoice-pricing-pipeline` already contains:

- `supabase/migrations/20260812013000_add_invoice_pricing_pipeline.sql` — tables: `pricing_invoices`,
  `pricing_invoice_lines`, `pricing_products`, `pricing_price_history`, label batches; SHA-256
  idempotency (`source_sha256`), UPCs as text, immutable history rows.
- `server/pricing-engine.js` + `pricing-router.js` (+ tests) — endpoints `GET /api/pricing/config`,
  `POST /api/pricing/calculate`, `POST /api/pricing/invoices/extract` (OCR webhook), Bearer +
  `x-pricing-agent-key` auth (Hermes-only header).
- Telegram allowlist `/price` + `/caseprice` commands (calculate-only).
- Full design in `docs/INVOICE_PRICING_PIPELINE.md` (controlled flow: upload → SHA → lines
  `needs_review` → UPC/SKU match (fuzzy suggests, never approves) → manager approves → transaction
  writes products + history → price-gun export `item_name,upc,price,department`).

**It is DRAFT and predates the 8/13 Hershey + 8/19 Family Food grabs** — the migration must be
reconciled against the live 157-item embedded dataset before merge.

## 4. Build phases

### Phase A — Finish & merge the PR #32 foundation (do this FIRST)
1. Check out `feature/invoice-pricing-pipeline`, review diff vs main; verify the server changes
   didn't regress `server/bot-v2/` or the ordering runtime (`node --check`, run unit tests).
2. Reconcile migration + seed with the CURRENT embedded hub data (157 items, 4 vendors, invoice
   numbers/labels; item numbers are the vendor SKU key; `—` = unknown, never invent). Provide a
   migration/seed script reading `apps/pricing-hub/index.html` arrays → Supabase.
3. Complete the documented "Next implementation slice": private invoice storage (Supabase Storage,
   private bucket) + authenticated approval transaction (reviewed lines → products + history +
   label batch) + OCR webhook wiring (`PRICING_OCR_WEBHOOK_URL`/`TOKEN` envs) + end-to-end test with
   a non-sensitive sample invoice.
4. Env: `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` (browser), server-side keys only in server env;
   NEVER service-role in browser/Telegram. Add `.env.example` entries.
5. Open PR to main with migration + seed + docs; wait for CI; owner approves.

### Phase B — Immersive Pricing Hub v2 (the app the owner sees)
Replace/upgrade the hub UI into a polished, immersive pricing workspace (this repo, `apps/pricing-hub/`):
- **Data:** read from Supabase (approved `pricing_products` + current price) with the embedded
  arrays as **offline/demo fallback** so the app never blank-screens.
- **Keep working:** vendor selector (dropdown), invoice filter, category chips, item search,
  markup slider (default 65%), `.99` retail display, per-item editable retail that **persists to
  Supabase** (server-authoritative; browser writes via an approved endpoint, not direct DB writes).
- **Add:** price history timeline per item (immutable rows), variance flag when a new invoice cost
  differs from the last (alert + `$` diff), approval queue for `needs_review` lines, price-gun /
  label export (`item_name,upc,price,department`), CSV export of any filtered view.
- **Visual bar:** premium, calm, editorial (owner taste) — not another default table page. Clean
  typography, category color chips, sticky totals, keyboard-friendly, mobile-responsive (it is
  iframed on the store website).
- **Compatibility:** the website iframes the hub — either keep `apps/pricing-hub/index.html` as a
  thin loader for the v2 bundle, or repoint the iframe (owner decision; keep root
  `pricing-hub/index.html` in sync either way). Don't silently break the iframe.
- Keep `scripts/verify-pricing-hub.js` green (extend it for the new data layer).

### Phase C — Data collection: invoices + financials
- **Invoice intake (staff-facing):** upload scan/PDF → SHA-256 dedupe → OCR (webhook) → lines land
  `needs_review` → review UI shows source image + raw text + qty/case/units/case/line total +
  cost/unit + `cost × 1.70` + prior price + variance → approve (≤ $0.01 reconciliation) → products +
  history updated, invoice marked imported. Scanner: straighten/rotate, transpose verbatim, flag
  handwriting/duplicates; ambiguous rows go to an exception queue, never guessed.
- **NRS POS sales import:** parse store POS CSV exports (NRS = CSV only) into `pos_sales`; weekly
  upload UI or drop-folder.
- **Financials view:** monthly vendor spend, cost of goods, gross margin by item/category/vendor,
  NET21 aging (invoices due), price-increase alerts, P&L summary (cost vs sales vs margin). All from
  invoice + POS data already in Supabase — no new integrations required.

### Phase D — Integrations (LATER, explicitly out of this build unless trivial)
Approved read-only **catalog API** for `anthony-superapp` (already designed in PR #32) · NRS POS API
(if one exists — confirm) · Plaid bank feeds · Telegram invoice intake via the existing bot ·
inventory counts · **Kingdom OS mirror update (Hermes)** so the OS Pricing tab reads the new data
layer instead of the file. Do not start D until A–C ship.

## 5. Quality gates (non-negotiable)

- `node --check` on every touched JS; unit tests for pricing-engine math; `verify-pricing-hub.js`
  stays ALL-PASS.
- Supabase: RLS deny-by-default; no service-role key in browser/Telegram/client code; server-only
  writes through approved endpoints; decimal arithmetic, round only final currency values; UPCs as
  text; `$0.01` max reconciliation variance; idempotent uploads by `source_sha256`.
- No secrets/PII in commits (AGENTS.md authority boundaries); `.env.example` only.
- Branch + PR workflow per AGENTS.md — NO direct pushes to main for meaningful changes (invoice data
  entry is the sole direct-push exception, and V2 should move it behind the approval flow).
- Update `docs/agent-context/CURRENT_STATE.md` + append `SESSION_LOG.md` in the same PR.
- Browser regression: EN/ES conventions intact where applicable; console clean; iframe renders.

## 6. Deploy notes (learned 2026-08-17)

- Main site `anthony-supermarket` (Vercel) is a **manual CLI deploy**, NOT git-linked:
  `cd /opt/data/anthony-supermarket && npx vercel deploy --prod --token "$(grep -oP 'VERCEL_TOKEN=\\\"?\\K[^\"]*' /opt/data/.env | head -1)" --yes`.
  Preview deployments are auth-protected on this team — verify against prod or locally.
- Repo root deploys to GitHub Pages via `.github/workflows/deploy.yml` — never commit raw scans/PDFs
  (they live in the Obsidian vault + Supabase Storage).
- Root `pricing-hub/index.html` must stay in sync with `apps/pricing-hub/index.html` (iframe target).

## 7. Open decisions for the owner (call these out in the PR)

All four were **answered 2026-08-19** (see §1b): 70% markup · keep iframe · Gemini free-tier OCR ·
hub UI + Telegram + WhatsApp intake. Remaining micro-decisions for the builder:
1. Gemini model choice for extraction (2.5 Flash vs 3 Flash) + JSON schema for invoice lines.
2. Whether OCR runs on every upload or only on images the UI marks "needs OCR" (cost/rate saving).
3. WhatsApp intake mechanics: forward-to-bot vs direct chat allowlist (depends on the bridge's
   capabilities — coordinate with Hermes).

## 8. Acceptance criteria (phase exits)

- **A:** migration + seed land on main; sample invoice end-to-end passes; CI green.
- **B:** hub reads Supabase, offline fallback works, retail edits persist server-side, price history
  + variance + approval queue visible, exports work, iframe intact, verifier green.
- **C:** one real invoice flows scan → approve → history; one real POS CSV imports; financials view
  reconciles to the month's invoice totals.
- **D (later):** catalog API consumed by superapp; OS Pricing tab mirrors the new layer.

## 9. Files to read first (in order)

1. `AGENTS.md` (repo entry point / authority boundaries)
2. `docs/agent-context/CURRENT_STATE.md` + `docs/agent-context/SESSION_LOG.md` (recent 8/19 entries)
3. `docs/INVOICE_PRICING_PIPELINE.md` + `brain/Decisions/2026-08-12-invoice-pricing-and-superapp-boundary.md` (PR #32)
4. `supabase/migrations/20260812013000_add_invoice_pricing_pipeline.sql`
5. `apps/pricing-hub/index.html` (current app + data) + `scripts/verify-pricing-hub.js`
6. `docs/agent-context/SALES_PAGE_V2_UPGRADE.md` (format precedent for this spec)
