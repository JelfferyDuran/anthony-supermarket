# Bodeguetto Content Engine

> Lightweight pointer — the engine itself lives in its own repository (below). **Do not
> duplicate the codebase here.** This note exists so the Anthony's brain links to it.

## What it is

Autonomous-but-bounded content production for the store's TikTok account **@bodeguetto**
(Latino/bodega/food/discovery). Orchestrated by Hermes. Owner: Noel.

## Repository

- Local: `/opt/data/projects/bodeguetto-content-engine` (Phase 1 complete — store signals + capture missions)
- Remote: `JelfferyDuran/bodeguetto-content-engine` — **PRIVATE**, pending owner creation
- Entry docs: `AGENTS.md`, `BODEGUETTO_CONTENT_ENGINE.md`, `HERMES_BOOTSTRAP.md`

## Relationship to this repo

- Store Signals come from Noel's Telegram voice/text (e.g. "Se acabó la Malta hoy.") and
  store observations → structured opportunities → HYBRID content jobs → Capture Missions
  asking for only the real footage needed (2–4 vertical clips).
- Pricing truth for any on-screen price cards comes from this repo's Pricing Hub data.
  Never invent prices.
- Compliance constitution: original footage + licensed/approved-AI assets only; identifiable
  customers → YELLOW (owner approval); no publish without approval. Hermes never touches the
  Supabase service-role key.

## Status (2026-08-15)

- Phase 0 spine: ✅ acceptance-tested (no publish)
- Phase 1 signals + missions: ✅ acceptance-tested ("Se acabó la Malta hoy." → job BG-… → NEEDS_FOOTAGE, $0.00)
- Phase 2 (Postiz + R2 real publish): not started — requires owner confirmation + Postiz credentials

## For the owner

When Noel sends a store observation on Telegram, Hermes can ingest it via the
`kfs-content-pipeline` MCP (`ingest_store_signal`) or `scripts/ingest-signal.py`.
