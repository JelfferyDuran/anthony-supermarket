# Anthony's Kitchen OS — staging prototype v2.1

This is a **real, local, runnable development prototype**, not a production deployment. It contains a price-book editor, confirmed/proposed/pending status, availability flags, three 16:9 TV boards, local snapshot approval, versioned JSON backups, and read-only TV preview pages. **It does not connect to the existing KFS server, Supabase, POS, DoorDash, or production TVs.**

## Import status (2026-10-24)

Full v2.1 package imported from `anthonys-kitchen-os-v2.1-latest-designs.zip` — 18 files including 7 assets (2 original photos + 4 AI concepts + 1 container reference), seed data, server, studio, and TV pages. See `ARCHITECTURE.md` and `IMPLEMENTATION_STATUS.md` for mode details and verified features.

## Two ways to run

### A. Local Python server (full editing + approval)
1. Open PowerShell in this folder.
2. Run `py -3 server.py` (or `python server.py`). Python 3.8+ is sufficient; no packages required.
3. Open **http://127.0.0.1:8765/** on that same laptop.
4. Edit, **Save Draft**, then **Approve Local Preview** to see the boards update. Open a TV page separately to test full-screen (`F11`).
5. To stop: press `Ctrl+C`.

### B. Static hosting (Vercel preview)
The Python backend cannot run on Vercel, so the preview adapts: TV pages and the studio fall back to `data/seed.json` plus browser `localStorage` for drafts/approvals. Everything is clearly labeled "STATIC PREVIEW MODE" and can never reach production. See `ARCHITECTURE.md`.

## Safety

- The HTTP server binds **127.0.0.1 only**. It is inaccessible to other LAN devices by default. Do not expose it to the LAN or internet; it has no user authentication.
- Port **8765**, intentionally distinct from KFS port 8080. No `/set` endpoint or KFS credentials exist here.
- **Approve Local Preview** creates a local approved snapshot only. It does not publish to a TV or remote app.
- Local draft: `data/draft.json`; approved snapshot: `data/approved.json`; backups: `data/approved-vN.json`. The server atomically writes JSON snapshots.
- Price changes automatically become pending and unavailable until reconfirmed. The local status toggle is not an identity-verified manager approval. Real production must add authentication, roles, audit logs, and a separate explicit publish action.
- Do not treat the original picadera photo as an approved round-pan product photo. It is a rectangular tray reference, deliberately labeled.
- Salad price proposals are disabled. No invented DoorDash prices. Confirm picadera side inclusions/quantities before production publication.

## Architecture / next development

`data/seed.json` → local editor → `data/draft.json` → local approval → `data/approved.json` → read-only TV renderer.

Production evolution: integrate verified authoritative kitchen catalog and role-based auth; add asset upload and photo approval workflow; create three-screen simulator; add versioned release manifest and rollback; add an authenticated local KFS adapter behind explicit manager publish, canary one TV, monitoring and fallback. Never expose KFS token or Supabase service role key to browser. Keep grocery and kitchen pricing policies separate; tenant-isolate when expanding to other businesses.

## Acceptance tests

- Three screens display different categories, are legible in fullscreen, and don't scroll.
- Draft price change does not change any TV until local approval.
- Proposed item cannot be made available and approved.
- Approving generates `approved.json`; prior version backed up.
- Production TVs remain unchanged throughout.


## v2.1 design update
See `LATEST_ASSETS.md` for the current visuals and fidelity requirements.
