# Checkpoint 02 — Iteration 1 Audit / Corrected Restart (2026-09-05)

**Branch:** `feat/iter1-operational-core`
**Base:** `b865613fff88b8a53d5a66117118c751461e5155`
**Issue:** #48

## DONE

- Recovered and audited `ASTRA_HANDOFF_2026-09-05.zip` against current GitHub state.
- Verified current `main` differs from handoff baseline `dfb38b633f8116270d833997f3eaee882dfe363c` only by the later `BOD-1.mp4` content commit, so operational code baseline is unchanged.
- Verified `server/pricing-store.js` considers the pricing store configured only when BOTH `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are present. `SUPABASE_ANON_KEY` is not the store credential.
- Verified `docker-compose.yml` already loads `server/.env` through `env_file`.
- Verified current approval flow runs `approvalReadiness(...)` before `pricing_approve_invoice`, so an independent source subtotal is required for meaningful reconciliation.
- Reviewed `docs/checkpoints/LOCAL_FIXES.patch` and found two blockers that make it unsafe to commit unchanged:
  1. `isPaddleConfigured()` is true merely because a hard-coded default URL exists, even if Paddle was not explicitly configured.
  2. `extractWithPaddle()` derives `invoice.subtotal` from the extracted line sum. That makes reconciliation tautological and can hide missed OCR rows.
- Created GitHub Issue #48 with the corrected implementation order and guardrails.

## NEXT — STORE HOST FIRST

Run without printing secret values:

```bash
docker exec anthony-supermarket-server sh -lc 'test -n "$SUPABASE_URL" && echo SUPABASE_URL=present || echo SUPABASE_URL=missing'
docker exec anthony-supermarket-server sh -lc 'test -n "$SUPABASE_SERVICE_ROLE_KEY" && echo SUPABASE_SERVICE_ROLE_KEY=present || echo SUPABASE_SERVICE_ROLE_KEY=missing'
curl -s http://localhost:3401/api/pricing/config
```

Expected after correct env delivery:

```json
{"storeConfigured":true}
```

If the service-role key is missing, correct `server/.env` / container configuration locally. Never commit or print the secret. Do NOT weaken the pricing store to use anon credentials.

## NEXT — CODE ON THIS BRANCH

1. Port safe Docker/static-serving changes from `LOCAL_FIXES.patch`.
2. Make Paddle activation explicit/fallback-safe rather than always-on from a hard-coded URL.
3. Extract the printed invoice subtotal independently from Paddle OCR text/geometry. If no trustworthy subtotal is found, leave it unresolved and force human review; never substitute the extracted line sum as the source subtotal.
4. Add a regression test: remove one OCR item from a fixture while preserving the printed subtotal; reconciliation MUST show non-zero variance and approval MUST be blocked.
5. Then continue junk/header/footer filtering, per-row case quantity + units-per-case extraction, mobile/HEIC handling, and duplicate-safe NRS import verification.

## CURRENT PRODUCTION FACTS TO PRESERVE

- Phase D backend and manager Pricing & Inventory UI already landed previously; do not re-implement them from older branches.
- Real NRS-derived POS rows already exist in production; the remaining POS work is validation/enrichment, not rebuilding the pipeline.
- OCR/extraction is evidence only. Human manager approval remains the only retail-price authority.
- Retail rule remains unit/base cost × 1.70, with shelf rounding only after calculation.
- Service-role credentials remain server-only.

## BLOCKED

- This ChatGPT runtime cannot directly inspect the store-host Docker environment. GitHub access is available, but the local `server/.env` and running container environment are not.
- Therefore `storeConfigured:false` cannot be declared fixed until the store-host commands above are executed and `/api/pricing/config` returns `storeConfigured:true`.
- Do not merge or deploy this iteration until the reconciliation test is fixed and runtime verification is recorded.
