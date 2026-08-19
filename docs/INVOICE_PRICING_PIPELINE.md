# Invoice pricing and label pipeline

## Repository boundary

- `anthony-supermarket` owns staff invoice intake, OCR review, vendor/product matching, authoritative costs, pricing history, and label exports.
- `anthony-superapp` remains the Enatega-derived customer, store, rider, and ordering clients. It should consume an approved catalog API; it must not calculate or approve retail prices.

## Controlled flow

1. Staff uploads a PDF or image to private object storage.
2. A server computes SHA-256, creates `pricing_invoices`, and sends the private object to the configured OCR/extraction service.
3. Extracted lines enter `pricing_invoice_lines` as `needs_review`.
4. The server matches exact UPC or verified vendor SKU. Fuzzy descriptions can suggest but never approve a product.
5. Pricing Hub shows source image, raw text, case quantity, units/case, line total, cost/unit, `cost × 1.70`, prior price, and variance.
6. A manager resolves every ambiguity and approves lines. Reconciliation variance must be at most $0.01.
7. A server transaction updates `pricing_products`, inserts `pricing_price_history`, and marks the invoice imported.
8. Pricing Hub exports approved price-gun rows as `item_name,upc,price,department` and records the batch.
9. The customer catalog API exposes approved active products to `anthony-superapp`.

## Security and accuracy

- Private invoice images never belong in public buckets or Git.
- Browser clients never receive a service-role key and cannot write pricing tables directly.
- Preserve UPCs as text.
- Do not invent UPCs or pack sizes.
- Use decimal arithmetic; round only final currency values.
- Keep previous and new values in an immutable history row.
- Treat duplicate uploads idempotently using `source_sha256`.

## Superapp rebrand sequence

1. Keep the Enatega MIT license and required notices.
2. Replace app names, package identifiers, URLs, colors, copy, and configuration through a dedicated Anthony brand config.
3. Remove Enatega promotional/demo screenshots from rendered customer surfaces. Keep needed technical icons and license notices.
4. Use neutral placeholders where Anthony photography is not yet available; do not delete assets that the build still imports.
5. Connect only the approved read-only catalog endpoint first. Keep pricing approval and invoice uploads in the private staff system.
6. Rebrand and test each surface separately: customer web/mobile, store dashboard, rider app, admin dashboard, then API notifications.

## Connected API and Hermes/Telegram entry points

The Node server now owns one shared pricing engine and exposes:

- `GET /api/pricing/config` for UI capability/status checks.
- `POST /api/pricing/calculate` for unit-cost or case-cost calculations.
- `POST /api/pricing/invoices/extract` for manager-authorized PDF/image intake through a configured OCR webhook.

Production callers must use either `Authorization: Bearer <PRICING_MANAGER_TOKEN>` or the server-to-server `x-pricing-agent-key` header. The latter is for Hermes only and must remain in its protected environment. Local demo access is allowed only outside production when neither token is configured.

The Telegram bot supports allowlisted `/price <unit-cost>` and `/caseprice <line-total> <cases> <units-per-case>` commands. Allowed chats come from `HERMES_CHAT_ID` or `PRICING_TELEGRAM_CHAT_IDS`; other chats receive no pricing response. These commands calculate only and never approve or write product prices.

Real invoice extraction requires `PRICING_OCR_WEBHOOK_URL` and, when applicable, `PRICING_OCR_WEBHOOK_TOKEN`. Without them the API returns `OCR_NOT_CONFIGURED`; the UI may use the clearly labeled safe sample but must not represent it as OCR.

## Implemented endpoints

All pricing endpoints live under `/api/pricing` on the Node server (`server/pricing-router.js`).

| Endpoint | Least privilege | Purpose |
| --- | --- | --- |
| `GET /config` | public | Capability probe. Exposes no data — only whether the pipeline is configured. |
| `POST /calculate` | agent key | Unit/case cost calculator. No database access. |
| `GET /products` | manager | Approved catalog for the Pricing Hub. |
| `GET /products/:id/history` | manager | Immutable price history for one product. |
| `PATCH /products/:id/retail` | **approver** | Authoritative retail write. |
| `GET /queue` | manager | Lines still needing a human. |
| `POST /invoices` | manager | Upload → SHA-256 dedupe → private storage → OCR → `needs_review`. |
| `GET /invoices/:id/source` | manager | 5-minute signed URL to the source scan. |
| `POST /invoices/:id/approve` | **approver** | The approval transaction. |
| `GET /export/labels` | manager | Price-gun CSV (`item_name,upc,price,department`). |

### Three identities, not interchangeable

- **Supabase session JWT** with `app_metadata.role` of `manager` or `admin` — the ONLY identity that may approve
  a price, because an approval must be attributable to a real person in `auth.users`.
  `user_metadata` is user-writable and is never consulted for authorization.
- **`PRICING_MANAGER_TOKEN`** — a shared server-to-server operator token. It can read and extract, but it
  **cannot approve**: there is no user to record, so an approval under it would be anonymous.
- **`PRICING_AGENT_KEY`** — Hermes. Calculator only; it cannot reach any read or write path.

### The two gates are different on purpose

`priceInvoice()` gates **extraction**: is this OCR output trustworthy? It checks UPC presence and OCR
confidence. `approvalReadiness()` gates **approval**: by then a manager has resolved identity by matching a
product, so it checks only that every line is matched, the money is sane, and the lines reconcile to the
invoice within $0.01. Reusing the extraction gate at approval would reject correctly reviewed lines merely
because the vendor never printed a UPC — the normal case for 42 of the store's current items.

The database enforces the same rules inside `pricing_approve_invoice()`. The HTTP gate runs first only so the
reviewer sees a readable list instead of a raw SQL error.

## Verification

- `node --test server/pricing-engine.test.js server/pricing-pipeline.test.js` — engine math plus a full
  end-to-end run of the flow above against a non-sensitive sample invoice
  (`server/fixtures/sample-invoice.json`: fictional vendor, invented lines, no PII).
- `node scripts/test-pricing-migrations.js` — applies both migrations to a throwaway PostgreSQL database and
  asserts the SQL guarantees directly: deny-by-default RLS, SHA-256 upload idempotency, immutable history,
  the $0.01 tolerance, and the all-or-nothing approval transaction.

## Phase C — POS sales and financials

### NRS POS import

NRS has no public API (the merchant portal offers CSV download reporting only), so sales arrive as periodic
file uploads through `POST /api/pricing/pos/import`. Column aliases, numeric coercion, summary-row skipping
and the void/refund conventions in `server/pos-import.js` deliberately mirror `nrs/nrs-analyze.py`, which
already processes these exports for the daily Telegram briefing — the two paths must agree about what a row
means, or the dashboard and the briefing would report different sales for the same day.

- **Idempotent by content.** The batch is keyed on the file's SHA-256, so the daily fetch job and a manual
  drop of the same export cannot double-count a day.
- **Never guesses.** A file whose item/total columns cannot be resolved is rejected with the header it
  actually saw, so a changed NRS export format surfaces as an error rather than as wrong revenue. Undated
  rows are skipped, not back-filled.
- **Ambiguous dates.** `15/08/2026` is unambiguously D/M/Y because 15 cannot be a month. When both readings
  are valid the US convention wins, because NRS is a US POS — that choice is only ever made when either
  reading would produce a real date.
- **Voids and refunds are kept, flagged.** They are the store's leak indicators; deleting them would hide
  exactly what the owner needs to see. They are excluded from revenue, not from the record.
- **Matching.** A UPC match is evidence (`match_method = 'upc'`); a name match is a convenience
  (`'name'`). An ambiguous name matches nothing rather than the wrong product. Matching attributes cost to
  revenue — it never changes a price.

### Financials

`GET /api/pricing/financials` assembles the whole dashboard in one call so every panel describes the same
period: P&L summary, vendor spend by month, NET21 aging, margin by item/category/vendor, and cost-increase
alerts.

Two things worth knowing about the arithmetic:

- **COGS is valued at the cost in effect on the sale date**, resolved through `pricing_cost_at()` against the
  immutable price history. Using today's cost to value a sale from three weeks ago would silently misstate
  margin every time a vendor moved a price.
- **`costed_revenue_share` is reported alongside every margin figure.** Revenue whose POS row never matched a
  product contributes sales but no cost, which inflates margin. The hub shows that share next to the numbers
  and labels the profit a *floor*, because a margin computed over a partly unmatched catalog is not a fact.

NET21 is the store's standard vendor term, stored per-invoice as `payment_terms_days` so an invoice on other
terms ages correctly.

## Next implementation slice

Configure the OCR webhook and the protected Telegram/Hermes secrets in staging, then run the flow against a
real vendor invoice and one real NRS export. The POS parser has been exercised against fixtures shaped like
the store's exports but **not yet against a real NRS file** — confirming the column names on a live export is
the first thing to do when one is available.

Phase D (catalog API for the customer app, NRS/bank/Telegram integrations, Kingdom OS collector port) remains
out of scope until A–C have run against real data. Browser and Telegram clients must never receive the
Supabase service-role key.
