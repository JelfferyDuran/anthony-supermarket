# Admin, Pricing, and Traffic Boundaries

Date: 2026-08-09

## Decision
Build the manager console as a separate authenticated surface inside Super Kitchen, stacked on the Kitchen Dashboard branch while the Phase 1 rollout remains gated.

## Boundaries
- Public storefront and internal operations remain separate surfaces.
- Manager/admin API routes authorize from server-validated `app_metadata.role`; browser role display is never authoritative.
- Pricing previews require vendor/invoice identity, invoice date/page count/total, explicit product identity, case quantity, case cost, units per case, and line amount. Every line and the invoice total must reconcile. No guessed pack sizes and no `$0` pricing.
- No-charge samples are a separate blocked status, not inventory cost. Normal reports require a named human approval before any future persistence or catalog publication.
- Duplicate protection needs both a byte hash and a reviewed document-page fingerprint; two photographs of the same paper page can have different bytes.
- Price calculations run on the server using `Retail = Base Cost × 1.70`; presentation rounding never happens before calculation.
- Invoice images remain private and outside Git. Upload/OCR will not activate until protected storage, file validation, malware handling, retention, and extraction-worker authority are reviewed.
- Traffic collection is intentionally coarse and excludes customer/order PII, full IP addresses, and raw user agents.
- Menu, store settings, and staff-role mutation controls stay read-only until audit history, confirmation, server validation, and rollback exist.
- Brand identifiers are data, not translatable interface copy. Logos, official names, product brands, UPCs, and addresses are excluded from translation.

## Why
This gives employees one understandable operating surface without turning a browser dashboard into an unbounded database or infrastructure console. It also allows useful invoice pricing and traffic information to grow behind explicit security gates.

## Rollback
The dashboard is isolated behind `?admin=1` / `#admin`, the traffic schema is additive, and no existing order/menu/customer behavior is replaced by this draft.
