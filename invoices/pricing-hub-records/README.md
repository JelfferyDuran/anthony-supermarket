# Pricing Hub intake records

Manual-intake invoice records and the Goya item list. Moved here from
`pricing-hub/` on 2026-10-09 because `pricing-hub/` is published by the Vercel
deploy and these files carry vendor costs, case prices and our vendor account
number. They are history, not runtime data: nothing in the Pricing Hub client
reads them.

- `manual-intake-*.json`: invoices entered through manual intake (Oct 7–8, 2026).
- `goya-2026-08-31-items.{csv,json}`: Goya item list; `scripts/build-pricing-store.py`
  reads the CSV from this folder.

Do not move these back under `pricing-hub/`, `assets/` or any other published
path (see the allowlist in `scripts/build-public-site.js`).
