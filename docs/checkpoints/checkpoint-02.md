# Checkpoint 02 — ASM Pricing Hub (2026-09-06)

**Author:** Hermes (Windows session) — handoff for ChatGPT Astra / next agent.
**Repo:** `C:\Users\Jayto\anthony-supermarket`, branch `main` (HEAD `b865613` — user's BOD-1 TikTok video commit, NOT agent work).
**Mode:** RESUME-ABLE. Start here, then follow `docs/ASTRA_UPGRADE_PLAN.md`. Pick up from PR #47 (below).

---

## ASTRA'S LAST FOOTPRINT — PR #47 (discovered 2026-09-05, this is where Astra stopped)

- **PR #47**: "Growth plan: conversion research, bilingual concept, and storefront resilience"
  - Branch: `agent/growth-conversion-plan-2026-09-05` (created **2026-09-05 07:27 UTC = 3:27 AM local**)
  - Contains: `docs/growth/CONVERSION_PLAN.md` (research + recommendation), `docs/growth/concept.html` (bilingual CSS-depth concept), WebGL resilience fix in `index.html`, `scripts/test-storefront-resilience.cjs`, CI workflow, brain/ + CURRENT_STATE/SESSION_LOG updates.
  - **Created BEFORE the 2026-09-05 18:11 UTC handoff zip** → it is from a PREVIOUS Astra run, not the post-handoff session.
- **The post-handoff Astra run left NO trace**: no commits/branches after 2026-09-05T17:00Z, no checkpoint in `docs/checkpoints/`, no checkout in WSL, no astra/chatgpt/export dirs in Downloads/Desktop/Documents, no working-tree changes. It burned its free usage in the ChatGPT cloud without pushing.
- PR #47 is **iteration-2-adjacent work** (conversion/digital layer) — useful, but it did NOT touch the iteration-1 blocker.

## DONE (verified 2026-09-05/06 — real tool output)

- **Hub serves:** `http://localhost:3401/pricing-hub/` → HTTP 200. Public tunnel was `https://choices-killing-discretion-ideas.trycloudflare.com/pricing-hub/` → 200 (tunnel may be gone now — it is TEMPORARY; auth-gate before re-exposing).
- **API:** `GET /api/pricing/config` → `{"ocrConfigured":true,"ocrProvider":"paddle","storeConfigured":false}` — **storeConfigured still FALSE, upload box still disabled.**
- **Containers:** `anthony-paddleocr` Up healthy (:8120→8000, PaddleOCR v3.3.0, models loaded); `anthony-supermarket-server` :3401.
- **OCR e2e:** provider `paddle`, 5.7s, 25 lines, subtotal $544.82 from `invoices/peimco-new/peimco_frozen_clear.jpg`. Junk header/footer lines leak into items; no qty-per-row yet.
- **Secret-free patch:** `docs/checkpoints/LOCAL_FIXES.patch` (451 lines, 6 files). Verified faithful via `git apply --check --reverse`. Secret scan clean (`server/.env` gitignored, not in patch).
- **PR #47 located** via `git fetch origin --prune` + `gh pr list --state all`; contents verified (`docs/growth/CONVERSION_PLAN.md` readable on the remote branch; PR files/comments listed).

## NEXT (Iteration 1 — exact first commands, same as checkpoint-01, STILL BLOCKED)

1. Verify env delivery of Supabase vars into the container (cheap, decisive):
   ```
   docker exec anthony-supermarket-server printenv SUPABASE_URL
   docker exec anthony-supermarket-server printenv SUPABASE_ANON_KEY
   ```
   - Empty → env_file delivery bug (same class as the old PRICING_SERVE_STATIC issue). Check `docker-compose.yml` env_file + rebuild with `--no-cache`.
2. Read `server/pricing-store.js` + `server/index.js` store-creation branch: does the driver require `SERVICE_ROLE_KEY` / `PRICING_MANAGER_TOKEN` in addition to URL + ANON_KEY? (Hypothesis b.)
3. Fix → re-test `curl http://localhost:3401/api/pricing/config` → expect `storeConfigured:true` → hub Upload box appears (tab "Invoice Intake").
4. Then: manager login end-to-end → OCR junk-line filter + qty-per-row → NRS CSV calibration → decide on PR #47's conversion plan after iter 1 is solid.

## BLOCKED (and why)

- **Root cause of `storeConfigured:false` NOT proven.** Hypotheses in order: (a) env_file delivery, (b) missing store driver key(s), (c) Supabase tables absent.
- **NRS daily report CSV** not yet supplied — user provides from his email (never touch his credentials). Calibrate `parsePosCsv` to real columns when it arrives.
- **Permanent deploy:** Vercel token expired → user must run `vercel login` himself.
- **Astra free usage ran out** — continuity artifacts: this checkpoint + zip + PR #47 + GitHub branch.

## Notes for next agent

- `server/index.js` does NOT load dotenv → env reaches container ONLY via `env_file` in docker-compose.yml.
- Paddle contract: `POST /ocr/b64` `{image: base64, filename}` → `{"lines":[{text,score,box}]}` — key is **box** (4 points), NOT bbox. Server reaches it at `http://host.docker.internal:8120`.
- Work on a feature branch; explicit `git add <files>` (no blanket `git add -A`); commit per milestone; PR before merge. Never prune containers/images you did not create for this work.
- Require manager auth before exposing the hub through ANY public tunnel.
- PR #47's `docs/growth/CONVERSION_PLAN.md` is Astra's iteration-2 thinking — review it AFTER iter 1 core works, or cherry-pick its resilience fix (`index.html` WebGL guard) if you touch the storefront.
- If this session has no Windows/WSL checkout (e.g. Linux): `git clone` the repo, apply `docs/checkpoints/LOCAL_FIXES.patch`, and remember Docker steps require the Windows host (or a Docker-capable environment).
- User decision pending: `feat/astra-handoff` branch + PR for the local fixes (offered, not accepted; fixes remain uncommitted + in patch).
