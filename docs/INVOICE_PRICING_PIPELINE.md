# Invoice pricing and label pipeline

## Repository boundary

- `anthony-supermarket` owns staff invoice intake, OCR review, vendor/product matching, authoritative costs, pricing history, and label exports.
- `anthony-superapp` remains the Enatega-derived customer, store, rider, and ordering clients. It should consume an approved catalog API; it must not calculate or approve retail prices.

## Controlled flow

1. Staff uploads a PDF or image to private object storage.
2. A server computes SHA-256, creates `pricing_invoices`, and sends the private object to the configured OCR/extraction service.
3. Extracted lines enter `pricing_invoice_lines` as `needs_review`.
4. The server matches exact UPC or verified vendor SKU. Fuzzy descriptions can suggest but never approve a product.
5. Pricing Hub shows source image, raw text, case quantity, units/case, line total, cost/unit, `cost Ã— 1.70`, prior price, and variance.
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

## Next implementation slice

Connect private invoice storage and an authenticated approval transaction for reviewed lines, price history, and label batches. Then configure the OCR webhook and protected Telegram/Hermes secrets in staging and perform an end-to-end test with a non-sensitive sample invoice. Browser and Telegram clients must never receive the Supabase service-role key.
