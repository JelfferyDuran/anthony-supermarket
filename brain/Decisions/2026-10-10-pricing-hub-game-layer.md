# Decision — The Pricing Hub's game layer is derived from the audit trail

Date: 2026-10-10
Status: accepted (owner requested the game; production promotion pending owner go)

## Context

- The owner asked for the Pricing Hub to become "a full blown game but operational".
- A read-only check of production on 2026-10-10 showed the real problem the game has to move:
  - nothing had ever been approved through the hub;
  - 8 invoices (98 lines) were waiting, the oldest from Aug 20;
  - 4 scans were stuck before review;
  - sales stopped at Aug 19.
- Two backend defects explained much of it:
  - Vercel routed only one path segment to the API, so approve, line edits, price history and retail edits 404'd.
  - A failed read stranded scans in `extracting` forever.

## Decision

- **Score only what the pricing tables already record about people:**
  - `pricing_invoices.approved_by`: approved or closed invoices;
  - `pricing_invoice_lines.approved_by`: on rejected lines;
  - `pricing_price_history.changed_by`: hand reprices, i.e. rows not linked to an invoice line;
  - `pos_import_batches.imported_by`.

  XP, levels, streaks (store days, America/New_York), badges and the leaderboard are pure functions of those rows (`server/pricing-game.js`). There is no game table, no migration, and no client-side scoring.
- **Missions are the live work queues** (review backlog, stuck scans, Rule Guard, sales feed). They complete when the work is done, never when someone taps "complete".
- **Every game action is a normal audited operation:**
  - approve and reject through the existing routes and functions;
  - Rule Guard's Apply through `pricing_set_product_retail`, with the server computing the price;
  - rescue through the same extraction path as first intake.
- **Dock integrity** is a weighted health score shown on the HUD and the pedestal: review 30, intake 15, price rule 25, sales 20, UPC coverage 10.

## Why

- **It can't be gamed:** the browser has no way to grant XP, and the audit trail it reads is the same one approvals already depend on.
- **No schema risk:** no production migration and nothing new to back up or secure.
- **It drives the work that matters:** the biggest missions are exactly the 50-day backlog and the stuck scans.

## Guardrails / rollback

- **Operator tokens score nothing:** no person is attached to them. Shared credentials must not farm XP.
- **Leaderboards show email local parts only;** teammate ids and full emails never leave the server, and tests assert it.
- **Apply-rule ignores any client-supplied price,** and lowering a price needs an explicit confirm.
- **Rescue refuses anything not stuck,** so it cannot overwrite lines under review.
- **Rollback:** revert the branch. API changes are additive. (Deep routing comes from `main`'s `0df4412` rewrite, not this branch.)
- **Follow-ups that WOULD need a migration (owner decision):**
  - persistent "keep this price" exceptions for Rule Guard;
  - an audited unflag and UPC-assignment RPC, so the 45 flagged items and 190 missing UPCs can become missions instead of health metrics.

## Related PRs / issues

- Stacked on PR #54 (`fix/vercel-public-allowlist`)
- `pricing-hub/LOADING_DOCK.md` — "The game layer" section
