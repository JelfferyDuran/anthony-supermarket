# Protected Invoice Workflow — Acceptance Contract

Status: Phase 2B design and manual-review validation implemented; private upload/OCR persistence remains gated.

## Purpose

Turn vendor invoices into reviewable employee price-and-label reports without exposing wholesale costs, invoice scans, account identifiers, or privileged credentials to the public storefront or repository.

## Required workflow

1. A manager or admin authenticates through Supabase Auth.
2. The manager starts one invoice record with vendor, invoice/order number, date, expected page count, and invoice total.
3. Private pages are uploaded to a non-public storage bucket. Browser access uses short-lived, row-authorized operations only; no public object URL or service-role key is allowed.
4. The server computes a cryptographic byte hash for each page before extraction and a separate reviewed document-page fingerprint after extraction.
5. A matching byte hash rejects an identical file. A matching vendor + invoice/order number + page number + normalized line signature rejects the same paper page photographed or scanned again with different bytes.
6. Different page numbers sharing the same verified vendor + invoice/order number are grouped into one invoice rather than treated as duplicate invoices.
7. OCR produces draft fields only: product identity, UPC, case quantity, units per case, case cost, and line amount, each with confidence and source-page coordinates.
8. A human reviews every uncertain field. Missing or ambiguous pack size, product identity, cost, or invoice math blocks the report.
9. The server verifies `case quantity × case cost = line amount` for every line and the sum of line amounts against the invoice total.
10. A no-charge/sample invoice is assigned `no_charge`; it never updates cost history and never generates a retail price.
11. A paid invoice can generate a draft using `Retail = cost per unit × 1.70`, with rounding only after the exact calculation.
12. A named manager/admin must approve the report before any future catalog price publication.
13. The system writes an append-only audit event for upload, OCR completion, field correction, reconciliation, approval, export, and publication.
14. Employees receive a print-friendly label report and CSV containing approved product and retail fields; raw scans and wholesale cost fields remain manager-only.

## Test-set expectations

The local test images supplied by the owner contain:

- two different photographs of the same no-charge sample page; the semantic page fingerprint must reject the duplicate even though the file-byte hashes differ, and the document must remain `no_charge`;
- two distinct pages of one paid invoice; the pages must be grouped into one document and reconciled together, not flagged as duplicate invoices.

The test images and their visible identifiers must remain local/private and must not be committed.

## Security acceptance

- Manager/admin authorization is enforced by the server on every invoice route.
- Roles come from protected app metadata, never user-editable metadata.
- The storage bucket is private; direct anonymous and general authenticated access is denied.
- Uploads are allowlisted by MIME type, size-limited, malware-scanned, and decoded outside the browser before OCR.
- Original filenames are not trusted as identities or storage paths.
- OCR text is untrusted input and cannot issue instructions, choose prices, call tools, or alter authorization.
- Logs exclude raw OCR text, scans, customer/account identifiers, credentials, and service-role keys.
- Duplicate handling uses both file-byte hashes and reviewed document-page fingerprints. Invoice grouping uses reviewed business identifiers plus distinct page numbers. These are separate controls.
- Retention and deletion are explicit, audited manager operations; no automatic production purge ships without a rollback/recovery policy.

## Current Phase 2B coverage

- Authenticated manager/admin pricing route.
- Manual vendor, invoice/order number, date, page count, and invoice-total entry.
- Line-level product, UPC, case quantity, units per case, case cost, and line-amount entry.
- Server-side line and invoice reconciliation.
- Separate no-charge status with pricing blocked.
- Server-authoritative exact `× 1.70` calculation and margin-safe `.49/.99` suggestion.
- Human-approval-required status, print layout, and CSV export.
- Executable CI tests for a reconciled multi-page draft, a no-charge sample, line-math mismatch, invoice-total mismatch, missing pack quantity, and unmarked zero cost.

## Gated follow-up

Private bucket creation, upload, hashing, OCR extraction, persistent invoice/audit tables, and approved catalog publication must ship in a separate reviewed migration/function PR. It must pass RLS/storage advisors, malicious-file tests, duplicate/multi-page tests, and a rollback exercise before production deployment.
