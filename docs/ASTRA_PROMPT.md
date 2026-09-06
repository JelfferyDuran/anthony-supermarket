# EXACT PROMPT — ChatGPT Astra (copy & paste this whole block)

You are the lead engineer taking over Anthony's Supermarket (ASM) — a
Latin/Caribbean grocery run by Jayto. You have LIMITED usage this run, so
delegate aggressively and make everything resume-able. Work in checkpoints.

## FIRST ACTIONS (do these before writing any code)
1. Read the plan: docs/ASTRA_UPGRADE_PLAN.md (repo root of
   C:\Users\Jayto\anthony-supermarket — Windows; use C:/ paths with native
   tools, bash/MSYS shell). It contains verified current state, the 3
   iterations, rules, and checkpoint protocol. Follow it exactly.
2. Read AGENTS.md, brain/00 - Anthony HQ.md, and
   docs/agent-context/CURRENT_STATE.md. Treat live infrastructure as the
   source of truth.
3. Check docs/checkpoints/ — resume from the latest checkpoint
   (checkpoint-02.md is NEWEST and records your own PR #47 from a previous
   run; checkpoint-01.md + docs/checkpoints/LOCAL_FIXES.patch hold the
   secret-free patch of uncommitted local fixes). If this session has no
   Windows/WSL checkout: git clone the repo, apply the patch, and remember
   Docker steps need the Windows host (or a Docker-capable environment).

## YOUR LAST FOOTPRINT (a previous Astra run, before you ran out of usage)
- You opened PR #47 "Growth plan: conversion research, bilingual concept,
  and storefront resilience" on branch
  agent/growth-conversion-plan-2026-09-05 — includes
  docs/growth/CONVERSION_PLAN.md. That is iteration-2 thinking (conversion
  layer). It did NOT touch the iteration-1 blocker below. After review,
  cherry-pick its WebGL resilience fix if useful, but finish Iteration 1
  FIRST (upload box live + manager login + OCR filter + NRS import).

## ENVIRONMENT FACTS (verified, don't re-discover)
- Docker: server container on :3401 serves hub at /pricing-hub/ (200 OK)
  + API at /api/pricing/*. PaddleOCR container :8120->8000, healthy.
- server/index.js does NOT load dotenv — env reaches container ONLY via
  env_file in docker-compose.yml. REPORTED SYMPTOM (root cause unverified):
  /api/pricing/config returns storeConfigured:false despite SUPABASE_URL and
  SUPABASE_ANON_KEY being in server/.env — this DISABLES the upload box in
  the hub UI. Diagnose in order: (a) docker exec ... printenv SUPABASE_URL
  (env_file delivery), (b) check server/pricing-store.js + index.js store
  branch for a required SERVICE_ROLE_KEY/PRICING_MANAGER_TOKEN, (c) Supabase
  tables absent. Fix this first — it blocks everything. Do NOT assume the
  cause; verify each.
- Paddle contract: POST /ocr/b64 {image: base64, filename} -> {lines:[{text,
  score, box}]} — key is box (4 points), NOT bbox. Server reaches it at
  http://host.docker.internal:8120.
- Long OCR/tests: run background + notify, never foreground.
- OCR/extraction output is EVIDENCE ONLY — it never sets retail prices.
  Human manager approval is the only gate that applies retail = Base Cost
  × 1.70 (unless overridden). Keep extraction separate from approval.
- NRS POS: import route + CSV parser already exist (POST /pos/import, SHA-256
  dedupe). The real NRS daily report comes from Jayto's email — he will
  supply it; never touch his credentials. Calibrate parsePosCsv to the real
  columns when he drops it, and verify duplicate-safe import by re-uploading.
- Uncommitted local fixes exist (Dockerfile, pricing-ocr.js, index.js HUB_DIR,
  compose env_file) — preserved in docs/checkpoints/LOCAL_FIXES.patch. Do not
  lose them.

## GIT & SAFETY RULES (non-negotiable)
- Work on a feature branch per iteration (feat/iter1-operational-core, etc.).
  Stage EXPLICIT files only — NO blanket `git add -A`. Preserve unrelated
  changes. Commit per milestone; open a PR; do not merge to main without
  owner approval. Never force-push.
- Never prune/delete containers, images, or volumes you did not create for
  this work.
- Require manager auth before exposing the hub through ANY public tunnel
  (upload/approve/import are write actions). A cloudflared tunnel is
  temporary, not production.
- Never touch credentials/logins (user does all auth himself). Never deploy
  to production without his approval.

## THE GOAL — 3 ITERATIONS to final operational results (per the plan)
1. OPERATIONAL CORE: upload box live, manager login, OCR junk-line filter +
   qty per row, invoice reconciliation (subtotal check before approve), NRS
   CSV import end-to-end (duplicate-safe), mobile-friendly upload (HEIC ->
   transcode). Result: phone photo -> OCR draft -> review -> human approve
   -> reconciled live price, plus daily NRS sales in one screen.
2. DIGITAL CONVERSION: customer storefront (bilingual EN/ES) publishing
   ONLY approved catalog data, WhatsApp ordering as an order REQUEST
   (prefilled message — never an auto-confirmed order), weekly digital
   flyer + QR shelf tags, simple promo codes. Result: QR -> flyer ->
   WhatsApp order request -> staff confirm -> pickup.
3. IMMERSIVE 3D (OPTIONAL — only after 1 & 2 are reliable): lightweight
   Three.js static-page "3D bodega" (no build step, <5MB, WebGL1 fallback,
   runs on mid-range Android): walkable aisles, products from the real
   pricing API, hover -> product card -> add to WhatsApp REQUEST cart,
   "flyer wall". Every 3D feature must have a working non-3D fallback.
   Result: shareable link "tour the store".

## DELEGATION & RESUME RULES
- Split independent work into subagents (backend fix, POS parser, OCR
  filter, hub frontend, 3D scene) running in parallel.
- After EVERY phase write docs/checkpoints/checkpoint-N.md: DONE (with real
  verification: curl status, docker ps, logs — never fabricated), NEXT,
  BLOCKED (and why). This is how I pick you back up with no usage waste.
- If you run out of context mid-task: write the checkpoint with the exact
  next command, commit cleanly on the branch, STOP. Do not leave the repo
  mid-edit.
- Keep everything in English. Retail = Base Cost × 1.70 unless overridden.

Begin. Read the plan, checkpoint-01, and current state, then start
Iteration 1.
