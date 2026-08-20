---
name: anthony-supermarket-invoices
description: "Use when processing Anthony's Supermarket vendor invoices."
version: 1.0.0
author: Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [anthony-supermarket, invoices, ocr, pricing, obsidian-vault, finance]
    related_skills: [anthony-supermarket-handoff, obsidian, credit-report-analysis]
---

# Anthony's Supermarket — Invoice Grabber

Vendor invoices (photo/scan/PDF) arrive for Anthony's Supermarket and get run
through the house pipeline. Noel triggers it by sending an invoice image with
"ASupermarket Invoice Grabber:" or just an invoice photo. Treat every invoice
as a financial audit. Output goes into the AI workspace inside the Obsidian
vault, then is committed and pushed.

## Workspace (source of truth for rules)

```
/opt/data/obsidian-vault-git/06 - Clients & Projects/Anthony_Supermarket_Dashboard/
  Anthony_SuperApp_Upgraded/ANTHONYS_SUPERMARKET_AI/
  ├── README.md                     # mission + folder map
  ├── 01_OPERATIONS/ 02_PRICING_ENGINE/ 03_INVOICES/ 04_INVENTORY/
  ├── 05_VENDORS/ 06_FINANCIAL/ 07_AUTOMATION/ 08_REFERENCE/
  ├── 09_HERMES_AGENT/HERMES_SYSTEM_PROMPT.md   # role rules (read first)
  └── 10_CLAUDE_COWORK/CHANGELOG.md             # log every major edit
```

- **03_INVOICES/INVOICE_PROCESSING_SOP.md** — canonical 6-step SOP: intake →
  extract → audit → price → output → update records.
- **02_PRICING_ENGINE/Pricing_Rules.md** — markup rule, rounding guide,
  spreadsheet columns, stop-and-ask conditions.
- **02_PRICING_ENGINE/Vendor_Price_History.csv** — per-SKU price baseline; empty
  header-only file means "no baseline yet" → first sighting becomes the baseline.
- **03_INVOICES/EXCEPTIONS/Exception_Log.md** — unresolved items with owner
  questions; keep `Resolved?` = No until the owner answers.

## SOP (condensed)

1. **Intake** — save the upright scan to `03_INVOICES/RAW_UPLOADS/`
   `Vendor_InvoiceNum_YYYY-MM-DD.jpg` (see scripts/rotate_upright.py if the
   scan arrives sideways).
2. **Extract** — vendor, invoice #, date, customer ID, route, terms, item name,
   qty, pack size, case cost, discounts, tax/freight, invoice total. Note item
   numbers (UPCs) when printed — they are the SKU key for the vendor.
3. **Audit** — line math must reconcile to the printed total (sum subtotals
   line-by-line); subtotal lines like "4 Total SCROUND" are NOT line items;
   check qty subtotals sum to Qty Total; check for duplicate charges.
4. **Price** — default rule: `Retail = Base Cost × 1.70`. Multi-pack: unit cost
   = case cost ÷ pack count, then unit retail. Round to cents after computing.
   Delivery fees/pass-through charges get NO markup — flag the policy question.
5. **Output** — processed CSV + audit note → `03_INVOICES/PROCESSED/`
   (`..._processed.csv`, `..._audit.md`). CSV columns per Pricing_Rules.md:
   `Vendor, Invoice Date, Invoice Number, Item Name, Pack Size, Quantity
   (Cases), Case Cost, Unit Cost, Retail Price, Profit per Unit, Total Profit,
   Flags, Margin Notes`. Mark estimated retail with `EST_RETAIL` flag when no
   shelf price is on record.
6. **Update records** — append `Vendor_Price_History.csv` (baseline or
   price-change row), add open items to `Exception_Log.md`, append a
   `CHANGELOG.md` entry. Then commit + push the vault (see below).

## Vision verification (never guess — house rule)

- **Fix orientation first.** Sideways scans produce hallucinated/conflicting
  field values. Save 90° and 270° rotations and vision-read the upright one.
- **Two reads disagree? Crop + zoom the region** (2–3× LANCZOS) and re-read with
  a literal-transcription prompt ("transcribe exactly, do not interpret").
  Do this for customer IDs, product names, terms, and handwritten notes.
- **Handwriting ≠ printed data.** Handwritten margin calcs (e.g.
  `234.42 − 5.00 = 229.42`) are owner notes, not the invoice total — record
  them as a flag/exception, and reconcile what they mean (delivery fee pulled
  out? check amount?).
- **Odd product names:** a quick web search can verify real products (e.g.
  Hershey's "Lil' Blue Panda" is a genuine flavor) — only log an exception when
  it truly can't be confirmed.
- **Unclear data → Exception_Log with a specific owner question**, never a guess.
  Stop-and-ask conditions: unclear pack size, cost, vague name, missing qty,
  math mismatch, duplicate cost.

## Vault push

```bash
cd /opt/data/obsidian-vault-git && git add -A && git commit -m "Invoice Grabber: <Vendor> <Invoice#> (<date>) — processed, <total>, audit + exceptions + vendor baseline" && git push origin HEAD
```
Remote has an embedded PAT (direct main pushes OK; no PR creation — same
limitation as the anthony-supermarket repo).

## Delivery style (Noel's preferences)

- Dashboard summary: ASCII box with the item table, emoji per line, ✅ math
  verification line, 💰 pricing block, 🚩 FLAGS section.
- Attach the processed CSV via `MEDIA:<path>`.
- End with a free Edge TTS voice note (`text_to_speech`, provider edge) of the
  next step / open questions.

## Pitfalls

- Rotated scans are the #1 source of wrong OCR — always rotate before reading.
- Dot-matrix/two-column invoices hide item codes in a middle column; include
  them in extraction when present.
- "CASH OR CHECK" style terms have form underscores — transcribe literally,
  don't "correct" them.
- First sighting of a vendor = baseline rows in Vendor_Price_History (Old Case
  Cost blank); later invoices compare against it for price-increase flags.
- Don't delete or overwrite prior invoice files — each invoice gets its own
  named files.

## Support files

- `references/hersheys-inve0023460478-2026-08-13.md` — worked example of a full
  grab (multi-section invoice, conflict resolution, handwriting reconciliation).
- `scripts/rotate_upright.py` — save 90°/270° rotated copies of a scan so the
  vision model can read the upright orientation.
