# ASM Massive Upgrade — 3-Iteration Operational Plan (ChatGPT Astra)

**Owner:** Jayto (KFS / Anthony's Supermarket)
**Repo:** `C:\Users\Jayto\anthony-supermarket` (WSL: `~/anthony-supermarket`)
**Branch:** `main` HEAD `b865613` (user's own commit 2026-09-05) — **uncommitted local fixes exist** (see §1 and `docs/checkpoints/LOCAL_FIXES.patch`). Preserve them; commit on a feature branch, not main.

> **UPDATE 2026-09-06:** a previous Astra run left **PR #47** (branch `agent/growth-conversion-plan-2026-09-05`, `docs/growth/CONVERSION_PLAN.md`) — iteration-2 conversion thinking; it did NOT fix the iteration-1 blocker. Latest checkpoint: `docs/checkpoints/checkpoint-02.md`. Resume from there.
**Mode:** DELEGATED + RESUME-ABLE. Do NOT block on the user. Write a checkpoint after every phase. Pick up from the last checkpoint when context runs out.

---

## 0. RULES OF ENGAGEMENT (non-negotiable)

1. **Read before you touch:** `AGENTS.md`, `brain/00 - Anthony HQ.md`, `docs/agent-context/CURRENT_STATE.md`, `docs/checkpoints/` (resume from latest), `server/`, `apps/pricing-hub/`, `docker-compose.yml`, `server/.env.example`.
2. **Never touch user credentials.** User does ALL logins (Google, Vercel, GitHub, Supabase dashboard, email). If a task needs credentials you don't have, stop and note it in the checkpoint — do NOT guess.
3. **No fake success.** Every claim must be backed by real tool output (curl status codes, docker ps, logs). Report failures honestly and fix them.
4. **No new parallel pipelines.** Extend the existing one (server + PaddleOCR + hub + store).
5. **Windows/WSL2 reality:**
   - Terminal = bash (MSYS). Native tools need `C:/...` paths, not `~/...`.
   - `server/index.js` does NOT load dotenv → env reaches the container via `env_file:` in docker-compose.yml ONLY.
   - Docker engine lives in WSL2; after reboot run `wsl -d docker-desktop echo start`, wait 15s.
   - Long OCR builds/tests → run in background with notify; never foreground.
6. **Paddle contract (verified):** container `anthony-paddleocr` :8120→8000; POST `/ocr/b64` with `image` (base64) + filename; response `{"lines":[{text,score,box}]}` — key is **box** (4 points), NOT bbox. Server reaches it at `http://host.docker.internal:8120` (set in `server/.env` → `PRICING_PADDLE_URL`).
7. **OCR = evidence, never authority.** OCR/extraction output is a draft for review only. It NEVER sets a retail price. Human manager approval is the only gate that applies the retail rule (`Base Cost × 1.70` unless overridden — see AGENTS.md). Keep extraction separate from price approval and from the ×1.70 rule.
8. **Git workflow — branch + PR, not main:**
   - Create a feature branch per iteration: `feat/iter1-operational-core`, `feat/iter2-digital-conversion`, `feat/iter3-immersive-store`.
   - Stage EXPLICIT files only (`git add <file> <file>`). **No blanket `git add -A`.** Preserve unrelated changes; never sweep them into a commit.
   - Commit per milestone with a clear message. Open a PR when a milestone is ready for review; do NOT merge to `main` without owner approval (docs-only direct pushes were approved historically; code changes go through PR).
   - Never force-push. Never prune/delete containers, images, or volumes you did not create for this work ("space-conscious" applies only to artifacts YOU created).
9. **Auth before tunnel:** the hub's write actions (upload, approve, import) require manager auth. NEVER expose an unauthenticated admin surface through a public tunnel. If you open a `cloudflared` test tunnel (`cloudflared tunnel --url http://localhost:3401 --no-autoupdate`; read URL from log: `grep -o "https://[a-z0-9-]*\.trycloudflare\.com" /tmp/cloudflared.log`), confirm login-gating works first and treat it as temporary.
10. **Deploy gate:** production deploy (Vercel/named tunnel) ONLY after the USER approves. Test via tunnel.
11. **Checkpoints:** after every phase write `docs/checkpoints/checkpoint-N.md` with: DONE (verified output), NEXT (exact commands), BLOCKED (and why). Resume = read the latest checkpoint and continue.

---

## 1. VERIFIED CURRENT STATE (2026-09-05 — do not re-discover, do not re-break)

- **Containers:** `anthony-paddleocr` Up healthy (PaddleOCR v3.3.0, models loaded). `anthony-supermarket-server` :3401.
- **Hub:** static app at `apps/pricing-hub/index.html`, served at `/pricing-hub/` (HTTP 200 local + via public tunnel). Same-origin API at `/api/pricing/*`.
- **OCR pipeline:** provider Paddle (local-first) in `server/pricing-ocr.js`, timeout 180s. Verified e2e: 25 lines / subtotal $544.82 from `invoices/peimco-new/peimco_frozen_clear.jpg` (5.7s). Junk header/footer lines ("Date:", "Terms:", "Sign Here:", "Payment:") still leak into items; no qty-per-row yet.
- **Backend:** `server/pricing-router.js` — routes: `/config`, `/login`, `/products`, `/queue`, `/approve`, `/pos/import` (NRS CSV, SHA-256 dedupe), `/pos/batches`, `/invoices`. Manager auth via Bearer token; `localDemo = NODE_ENV !== 'production' && !managerToken && !agentKey`.
- **REPORTED SYMPTOM — root cause unverified:** `GET /api/pricing/config` returns `{"ocrConfigured":true,"ocrProvider":"paddle","storeConfigured":false}` even though `server/.env` HAS `SUPABASE_URL` + `SUPABASE_ANON_KEY` (non-empty lengths verified without printing values). Consequence: hub enters local mode → Upload box disabled → "there's no box to upload anything". **Hypotheses to check IN ORDER (do not assume):** (a) env_file delivery to container for those vars (same bug class as PRICING_SERVE_STATIC), (b) store driver also requiring `SERVICE_ROLE_KEY` / `PRICING_MANAGER_TOKEN` (check `server/pricing-store.js` + store-creation branch in `server/index.js`), (c) Supabase tables missing. First commands: `docker exec anthony-supermarket-server printenv SUPABASE_URL` / `printenv SUPABASE_ANON_KEY`; then re-test `/api/pricing/config` expecting `storeConfigured:true`. Fix this FIRST — it unlocks everything.
- **NRS POS:** import route + parser already written (`/pos/import`, SHA-256 dedupe, `parsePosCsv` with fallbackDate, gross/voids/refunds). Pending: the actual NRS daily report CSV (user will supply — user does the email access), calibrate `parsePosCsv` to the exact NRS columns, verify duplicate-safe import with a re-upload test.
- **Pricing hub data:** 377 items, 11 vendors, 23 invoices, VENDORS registry + ALL_ITEMS, retail ×1.70. Store app `apps/pricing-store/index.html` (88 items). Production Supabase already holds a live catalog (283 products, 11,222 POS rows as of 2026-08-21 per `CURRENT_STATE.md`) — the server store is the authority when configured.
- **Deploy:** Vercel project `anthony-pricing-hub` exists but token expired → user must `vercel login`. Meanwhile: trycloudflare tunnel (temporary) or named tunnel for daily use — auth-gated.
- **Uncommitted local fixes (do not lose; in `docs/checkpoints/LOCAL_FIXES.patch`, secret-free):** `server/Dockerfile` (COPY apps/pricing-hub/), `server/index.js` (HUB_DIR without `..`), `server/pricing-ocr.js` (paddle provider), `docker-compose.yml` (single env_file), `server/.env.example` (Paddle keys), `scripts/test-paddle-ocr.js` (e2e harness).

---

## 2. THE 3 ITERATIONS (final operational results)

### ITERATION 1 — Finish the Operational Core (must be 100% before anything else)
**Goal:** Jayto uploads a photo of any invoice from his phone and it becomes an APPROVED, reconciled price record; NRS daily sales CSV imports without double-counting.

- [ ] Fix `storeConfigured:false` → hub shows Upload box live (root-cause per §1 hypotheses).
- [ ] Manager sign-in works end-to-end (`/api/pricing/login` → Bearer → approve). `PRICING_MANAGER_TOKEN` present; approve requires auth.
- [ ] OCR junk-line filter (drop "Date:", "Terms:", "Sign Here:", "Payment:", "Page", "Subtotal" from items) + extract qty per row from `box` geometry (group by row y-coordinate; price in last column). **Validate quantities against invoice subtotal** (reconciliation gate) before approve.
- [ ] Invoice reconciliation: every approve runs the existing $0.01 reconciliation + `pricing_approve_invoice` RPC gate; a failed reconcile stays in `needs_review` — never silently approves.
- [ ] NRS POS: user supplies a real daily report CSV → calibrate `parsePosCsv` (column names, date format, dollar signs, void/refund rows) → import via hub tab → **duplicate-safe verified** (re-upload same CSV → 0 new rows, SHA-256 dedupe).
- [ ] Mobile UX pass on `/pricing-hub/`: upload button thumb-reachable, no tiny targets, photo from camera roll works (accept `image/heic` → transcode to jpeg before Paddle if needed).
- [ ] Branch `feat/iter1-operational-core` → commit → PR.

**Operational result:** phone → photo → OCR draft → review queue → human approve → reconciled live price. NRS daily CSV → daily sales in hub. Everything Jayto does today manually is in one screen.

### ITERATION 2 — Digital Conversion Layer (make money digitally)
**Goal:** turn the hub into a customer-facing conversion engine — not just internal ops. **Publish ONLY manager-approved catalog data** (use the Phase D `pricing-catalog` edge function surface: id/upc/name/category/department/retailPrice/updatedAt — never cost or internal data).

- [ ] Public storefront: clean mobile-first catalog from approved data (store app 88 items → full approved catalog), search, category filter, bilingual toggle (EN/ES).
- [ ] **Ordering = REQUEST handoff, not a confirmed order.** Customer builds a cart → "Order on WhatsApp" → prefilled message to the store number. The message is an order REQUEST that staff confirms; no chat message ever auto-confirms or mutates order state (per AGENTS.md authority boundaries).
- [ ] Weekly digital flyer: auto-generated deals page (approved items only) from live pricing data — link + QR to print in-store.
- [ ] QR codes on shelf tags → item page / flyer / order link (batch-generate from products table).
- [ ] Promo codes / loyalty stub: simple "show this code" offers (no payment processing in v1 — cash at pickup).
- [ ] Admin dashboard metrics: sales by day from POS batches, top items, matched vs unmatched.
- [ ] Branch `feat/iter2-digital-conversion` → commit → PR.

**Operational result:** customer walks in → scans QR → sees flyer → sends WhatsApp order REQUEST → staff confirms → pickup. Digital revenue without a POS integration rewrite.

### ITERATION 3 — Immersive 3D Storefront (OPTIONAL — only after 1 & 2 are reliable)
**Gate:** Iterations 1 and 2 work reliably in daily use before any 3D work starts. The ordinary storefront remains the primary path; a **non-3D fallback must work for every 3D feature** (no feature is 3D-only).

- [ ] Three.js single-page "3D bodega" (no React build step — static HTML like the hub): stylized supermarket aisle with shelves; products = real items from the pricing API (Canvas-generated labels, not 3D models per item).
- [ ] Walk/glide controls (pointer + touch), aisle navigation, shelf hover → product card (price, add-to-WhatsApp REQUEST cart).
- [ ] "Flyer room" — weekly approved deals on a 3D wall.
- [ ] Target: < 5 MB total, runs on a mid-range Android (WebGL 1 fallback), loads in < 3s on 4G.
- [ ] Placeholder art pipeline: procedural geometry + simple gradients — no Blender dependency.
- [ ] Branch `feat/iter3-immersive-store` → commit → PR.

**Operational result:** optional shareable link "tour the store" — customers browse the approved catalog in 3D from their couch and send a WhatsApp order REQUEST from inside the scene. Differentiation no local competitor has.

---

## 3. DELEGATION & RESUME INSTRUCTIONS (for Astra itself)

- You have limited usage on this run. **DELEGATE aggressively**: split independent work into subagents (frontend hub, backend fix, POS parser, OCR filter, 3D scene) where possible.
- **Always write a checkpoint** (`docs/checkpoints/checkpoint-N.md`) at the end of every phase — even mid-iteration — so the next run starts from facts, not from re-discovery. Current: `checkpoint-01.md` + `LOCAL_FIXES.patch`.
- Keep each file change small and verifiable. Explicit `git add <files>`, commit per milestone on the feature branch; PR before merge. No blanket `git add -A`, no force-push.
- If you run out of context/tokens mid-task: write the checkpoint, note exactly the next command to run, commit cleanly on the branch, STOP. Do not leave the repo mid-edit without a checkpoint.
- Never fabricate a "done" — every acceptance criterion needs a curl/log/`docker ps` line in the checkpoint.
- Environment note: model is deepseek-v4-flash / local qwen3:14b; GPU offload for qwen32b is slow (~12 min/draft) — prefer small models for iteration 1/2, reserve qwen32b for 3D planning only if needed.
