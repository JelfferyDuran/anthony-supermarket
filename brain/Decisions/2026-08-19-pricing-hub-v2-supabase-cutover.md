# Pricing Hub v2 — Supabase cutover, and why PR #32 was not merged

Date: 2026-08-19 · Agent: Claude Code · Owner: Noel Duran

## Decision 1 — PR #32 is superseded, not merged

PR #32 (`feature/invoice-pricing-pipeline`) was branched at `3927b3f` and never rebased. By 2026-08-19 `main`
was 16 commits ahead, and merging the branch as it stood would have **destroyed live data**:

- its `pricing-hub/index.html` contains **0 items**; `main` has **157**. The merge would have wiped the
  entire embedded catalog, including the 8/13 Hershey's and 8/19 Family Food grabs.
- its `server/index.js` is UTF-8 **mojibake-corrupted** (every emoji and em dash mangled: `🦁` → `ðŸ¦`) and
  converted to CRLF, producing 803 deleted lines of pure churn.
- its `server/package-lock.json` reverts 4,137 lines of dependency state.

The genuinely new work in that branch is six files. Those were **ported forward** onto a branch cut from
current `main`, cleaned of the encoding damage, and extended. The resulting change to `server/index.js` is
**+45/−1**, entirely additive.

**PR #32 should be closed as superseded.** Nothing in it is lost; nothing in it is merged.

## Decision 2 — ALL_ITEMS is a ledger, not a catalog

Reconciling the embedded arrays against the schema surfaced that 11 vendor item numbers appear on two
different invoices. These are not duplicate products — they are the same product bought twice, and the second
purchase is a **price change**. The clearest case is Van Camps Yellowfin Tuna 48/5oz (item #1101), which
`scripts/verify-pricing-hub.js` already asserts moved $113.55 → $98.95 per case.

So the seed maps the hub's 157 rows to **146 products, 157 invoice lines, and 11 price transitions**. Pack
sizes were confirmed identical within every merged group; a group whose pack size differed would have been
left unmerged rather than guessed. This means the price-history timeline is populated from real evidence on
day one instead of starting empty.

`pricing_products.hub_item_ids` records every hub row that resolved to a product, so the Kingdom OS collector
can still find a product by any id it parses out of the file.

## Decision 3 — historical invoices are `backfilled`, not `approved`

The 9 invoices already in the hub were priced and shelved before an approval flow existed. There is no
`auth.users` row to attribute them to. Rather than weaken the approval constraint or invent an approver, they
carry a distinct `backfilled` status. The audit trail therefore never claims a manager approved something no
manager clicked, and the constraint stays strict for everything that actually flows through review.

## Decision 4 — the embedded arrays stay, verbatim

The Kingdom OS (Hermes-owned) parses `apps/pricing-hub/index.html` every two hours and its write-back endpoint
patches item lines in place. v2 therefore keeps `const VENDORS = {…}` and `const ALL_ITEMS = […]` **byte-for-byte
unchanged**, in the same one-object-per-line format, and rebuilds only the UI around them.

The arrays are also the offline fallback: the hub renders them unconditionally on boot and layers server data
on top afterwards, so a slow or dead API never shows the owner a blank page.
`scripts/verify-pricing-hub.js` now asserts this contract structurally, so a future UI change cannot quietly
break the mirror.

## Still open for the owner

1. **Markup rule.** `AGENTS.md` says ×1.70; the hub slider defaults to 65%. Both are implemented and kept
   distinct — 1.70 derives an approved retail from cost, 65% is a shelf preview that never writes. They should
   be unified behind one server-authoritative rule.
2. **The slider is largely inert today.** 154 of 157 items carry an owner-set retail, and `calcRetail()`
   deliberately lets a stored price win over the formula. Moving the slider changes the *suggested* price
   (shown in the row detail) but not those stored prices. That is the pre-existing behaviour, preserved — but
   it is worth confirming it is what the owner expects.
3. **Iframe strategy** — thin loader in place vs repointing the site iframe.
4. **OCR provider and cost ceiling.**

## Not done in this change

Phase C (NRS POS CSV import, financials dashboard) and Phase D (integrations) are untouched. The migration has
**not** been applied to the production Supabase project — that is an owner-approved deployment step.
