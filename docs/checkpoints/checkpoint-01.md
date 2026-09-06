# Checkpoint 01 — ASM Pricing Hub (2026-09-05)

**Author:** Hermes (Windows session) — handoff for ChatGPT Astra / next agent.
**Repo:** `C:\Users\Jayto\anthony-supermarket` (WSL `~/anthony-supermarket`), branch `main`, HEAD `dfb38b6`.
**Mode:** RESUME-ABLE. Start here, then follow `docs/ASTRA_UPGRADE_PLAN.md`.

---

## DONE (verified 2026-09-05 — real tool output, not guesses)

- **Hub serves:** `http://localhost:3401/pricing-hub/` → HTTP 200. Public tunnel `https://choices-killing-discretion-ideas.trycloudflare.com/pricing-hub/` → HTTP 200 (curl from internet).
- **API:** `GET /api/pricing/config` → HTTP 200 → `{"ocrConfigured":true,"ocrProvider":"paddle","storeConfigured":false}`.
- **Containers:** `anthony-paddleocr` Up healthy (:8120→8000, PaddleOCR v3.3.0, models loaded); `anthony-supermarket-server` :3401.
- **OCR e2e:** provider `paddle`, 5.7s, 25 lines, subtotal $544.82 from `invoices/peimco-new/peimco_frozen_clear.jpg`. Junk header/footer lines leak into items; no qty-per-row yet.
- **Secret-free patch generated:** `docs/checkpoints/LOCAL_FIXES.patch` (451 lines, 6 files). Verified: `git apply --check --reverse` PASS → patch is a faithful representation of the working tree. Files: `docker-compose.yml`, `scripts/test-paddle-ocr.js`, `server/.env.example`, `server/Dockerfile`, `server/index.js`, `server/pricing-ocr.js`.
- **Secret scan clean:** `server/.env` (real secrets) is gitignored and NOT in the patch. Only hits were empty placeholder `SUPABASE_SERVICE_ROLE_KEY=` in `.env.example` and a comment naming `GEMINI_API_KEY` (no value).
- **Uncommitted fixes confirmed in working tree:** `server/Dockerfile` (COPY apps/pricing-hub/), `server/index.js` (HUB_DIR without `..`), `server/pricing-ocr.js` (paddle provider, timeout 180s), `docker-compose.yml` (single `env_file: server/.env`).

## NEXT (Iteration 1 — exact first commands)

1. Verify env delivery of Supabase vars into the container (cheap, decisive):
   ```
   docker exec anthony-supermarket-server printenv SUPABASE_URL
   docker exec anthony-supermarket-server printenv SUPABASE_ANON_KEY
   ```
   - Empty → env_file delivery bug (same class as the old PRICING_SERVE_STATIC issue). Check `docker-compose.yml` env_file + rebuild with `--no-cache`.
2. Read `server/pricing-store.js` + `server/index.js` store-creation branch: does the driver require `SERVICE_ROLE_KEY` / `PRICING_MANAGER_TOKEN` in addition to URL + ANON_KEY? (Hypothesis b from the plan.)
3. Fix → re-test `curl http://localhost:3401/api/pricing/config` → expect `storeConfigured:true` → hub Upload box appears (tab "Invoice Intake").
4. Then: manager login end-to-end → OCR junk-line filter + qty-per-row → NRS CSV calibration.

## BLOCKED (and why)

- **Root cause of `storeConfigured:false` NOT proven.** Symptom confirmed; cause unverified. Hypotheses in order: (a) env_file delivery, (b) missing store driver key(s), (c) Supabase tables absent.
- **NRS daily report CSV** not yet supplied — user provides from his email (never touch his credentials). Calibrate `parsePosCsv` to real columns when it arrives.
- **Permanent deploy:** Vercel token expired → user must run `vercel login` himself.
- **Current public tunnel is temporary** (trycloudflare) — not for production use.

## Notes for next agent

- `server/index.js` does NOT load dotenv → env reaches container ONLY via `env_file` in docker-compose.yml.
- Paddle contract: `POST /ocr/b64` `{image: base64, filename}` → `{"lines":[{text,score,box}]}` — key is **box** (4 points), NOT bbox. Server reaches it at `http://host.docker.internal:8120`.
- Work on a feature branch; explicit `git add <files>` (no blanket `git add -A`); commit per milestone; PR before merge. Never prune containers/images you did not create for this work.
- Require manager auth before exposing the hub through ANY public tunnel.
- If this session has no Windows/WSL checkout (e.g. Linux): `git clone` the repo, apply `docs/checkpoints/LOCAL_FIXES.patch`, and remember Docker steps require the Windows host (or a Docker-capable environment).
