# ARCHITECTURE — Anthony's Kitchen OS v2 Staging Prototype

## Purpose
Isolated, local-first staging prototype for the three-screen Anthony's Super Kitchen TV system and its management interface. It does **not** connect to production signage (KFS), Supabase, POS, DoorDash, or the live website.

## Data Flow
```
data/seed.json  →  Kitchen Studio (editor)  →  data/draft.json  →  Approve  →  data/approved.json (+ versioned backups approved-vN.json)  →  tv.html renderer
```

## Two Run Modes

### 1. Local Python Server (full mode)
- `python server.py` → binds **127.0.0.1:8765** only (not LAN-reachable)
- Endpoints:
  - `GET /api/draft` — current draft or seed
  - `GET /api/approved` — approved snapshot (empty until first approval)
  - `GET /api/health` — reports `productionConnected:false`
  - `POST /api/draft` — save draft (validated: schema v1, ≤500 items, price ≤ 2 decimals, 0–10000)
  - `POST /api/approve` — creates versioned approved snapshot; **rejects** any available-but-unconfirmed item; backs up prior version to `approved-vN.json`; sets `approvalScope: LOCAL_PREVIEW_ONLY`
  - `POST /api/reset` — restores draft from seed (requires `confirm: RESET_DRAFT`)
- Atomic JSON writes (temp file + fsync + os.replace)
- Python stdlib only (3.8+); no packages, no secrets, no external calls

### 2. Static Hosting (Vercel preview mode)
The Python backend cannot run unchanged on Vercel, so the preview is adapted:
- `tv.html?screen=1|2|3` loads `/api/approved`; on failure falls back to the browser's `localStorage` approved snapshot (`kitchen-os-approved-v2`), then to `data/seed.json`
- `index.html` (Kitchen Studio) detects the missing API and switches to **STATIC PREVIEW MODE**: drafts and approved snapshots live in `localStorage` only (per-browser, clearly labeled in the UI)
- Same safety rules enforced client-side: price edits mark items `pending`+unavailable; approval refuses available-unconfirmed items; approval writes `approvalScope: LOCAL_PREVIEW_ONLY`
- **Nothing in static mode can reach production** — no network calls beyond the static files themselves

## Scene/Board Layout (1920×1080, 16:9)
| Screen | Category | Content |
|--------|----------|---------|
| 1 | PLATOS DEL DÍA | Student $6, Regular $12, rotating meats, lunch photo |
| 2 | CARNES Y PORCIONES | 4 meats + beans in 8/16/32 oz, pernil/chicharrón by lb |
| 3 | ESPECIALIDADES | Picadera 7" $20 / 9" $30, meat+side options, mangú, empanadas, combos |

## Price Safety Rules
- Approved prices live in `data/seed.json` and are the **only** published values
- Price edits automatically set item → `pending` + `available:false` until reconfirmed
- Proposed items cannot be approved as available
- AI concept images are labeled as concepts — never presented as authentic food photography
- Original reference photos are kept unchanged

## Not Included (future work, requires owner approval + auth)
Authenticated manager login, real photo approval workflow, KFS canary adapter, publication/rollback, audit log, multi-tenant expansion.