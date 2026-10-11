# The Loading Dock — Pricing Hub 3D UI

Full-3D, game-style interface for the Anthony's Supermarket Pricing Hub.
Replaces the tabbed 2D client. Same backend, same auth, same API.

Live: `https://anthony-pricing-hub-kingdom-noel.vercel.app/pricing-hub/`

## Why it exists

The old UI buried the single most important action (upload an invoice) under
tabs. The redesign makes upload unmissable — a pulsing **+** button on every
screen — and turns the invoice lifecycle into a visible game board: packages
ride a conveyor from intake to approval.

## The five zones

| Zone | What it is | What you do there |
|------|------------|-------------------|
| **DOCK** | Home base. Night-time loading dock with a central hologram pedestal and four glowing portals. | Overview at a glance: hologram shows awaiting-review count, catalog size, total retail value. Tap a portal (or bottom nav) to travel. |
| **INTAKE BAY** | Hero upload zone. Oversized inbox tray, floating package, pulsing "DROP INVOICE HERE" ring. | Tap the tray, the pulsing **+** button, or drag-drop a file (desktop). PDF/JPEG/PNG/WebP up to 10 MB. Watch the package fly in, the progress ring spin during extraction (30–90s), then ride to the Review Line. |
| **REVIEW LINE** | Packages waiting on a conveyor under a scanner arch. Each shows its invoice number and line count. | Tap a package → detail card with extracted lines, per-line product matching, editable retail, and **Approve**. Approval flies the package to the Vault with a particle burst and ticks the cleared counter. The server validates readiness (422 blockers shown in the card). |
| **AISLES** | Product catalog as store shelves in bays with hanging category boards (Dairy, Juice, Eggs, Grocery). | Browse or search; tap a box → product card with unit cost, retail, margin, and price history. Retail edits save via the API. A plaque states the pricing rule: **retail = unit cost × 1.70, .99-rounded**. |
| **VAULT** | Financials as a 3D bar chart (revenue / cost / profit) in front of a vault door, plus a POS CSV import panel. | Check the numbers; import the NRS sales CSV from the merchant portal. |

Floating HTML labels (crisp on retina, projected each frame, hidden behind
camera) name every zone, portal, category board, and package.

## Key flows

**Upload → approval (the happy path)**
1. Tap **+** anywhere → file picker (opens synchronously in the tap gesture so iOS Safari allows it).
2. Upload progress shows in a HUD card (real % via XHR; `fetch` can't report progress).
3. Extraction runs server-side (Paddle → Gemini fallback chain).
4. Package appears on the Review Line → tap → review lines → Approve.
5. Approval imports the invoice: products are created/updated in the catalog.

**Review line exceptions (Oct 9, 2026):** a line that didn't arrive (short
delivery) or is wrong/duplicate can be marked **Didn't arrive** or **Wrong
line** right on the review card. Excluded lines stay on the record (with who
marked them and when) but are left out of the approval — the approved total
reconciles against the printed invoice subtotal without them. Each line also
accepts corrected case quantity / unit cost (totals and proposed retail
recalculate live). The card shows a reconciliation strip: printed total vs
approved total vs excluded total, with the variance. If every line is
excluded, the invoice closes as rejected instead of approving nothing.
Backend: `PATCH /invoices/:id/lines` (approver gate), `store.updateLineReviews`
+ `store.closeInvoiceAsRejected`. Reuses the existing `rejected` line status —
no DB migration was needed; the approval RPC is untouched.

**Duplicate uploads** are recognized by SHA-256 — re-uploading the same file
returns the existing invoice instead of double-counting.

## Mobile design

- Portrait-first camera framing (FOV widens 55→68 on narrow screens; each zone camera pulls back with verified framing math; re-applied on rotate).
- 48px minimum touch targets; oversized invisible raycast hit-proxies; 12px drag-vs-tap threshold.
- Bottom-sheet detail panels (85dvh, internal scroll), bottom nav with `safe-area-inset-bottom`, FAB above the nav.
- Reduced cost on mobile: pixelRatio capped at 1.5, shadows off, particle bursts halved on coarse pointers / small screens.
- `touch-action: manipulation`, `dvh` units, body text ≥13px.

## Architecture

```
pricing-hub/
  index.html   — shell: importmap (three@0.160.0 via jsDelivr, core only),
                 HUD divs, sign-in gate, loader, CDN-fail fallback
  game.css     — dark neon theme (charcoal + amber/cyan), bottom sheets, toasts
  polish.css   — visual layer over game.css (#52): surfaces, focus states, motion
  js/api.js    — API client: token in localStorage `pricingToken`,
                 Authorization: Bearer on every call, XHR upload w/ progress
  js/boot.js   — init, auth gate (401 → sign-in overlay), raycast taps, main loop
  js/world.js  — the 3D set: dock, conveyors, portals, tray, shelves, vault,
                 particles, eased camera fly-to (~1.2s)
  js/zones.js  — data→3D binding: queue→packages, products→shelf boxes,
                 financials→bars, hologram stats
  js/hud.js    — sign-in, top bar, zone nav, FAB, upload choreography,
                 review/product/vault panels, search
  js/polish.js — DOM-only polish (#52): zone keys 1–5, Esc closes the panel
```

- **Backend**: `api/pricing-fn.js` (Vercel function, rewrite target) mounts
  `server/pricing-router.js` + `server/pricing-store.js`. Base `/api/pricing`.
  Endpoints used: `POST /login`, `GET /config`, `GET /products`,
  `GET /products/:id/history`, `PATCH /products/:id/retail`,
  `PATCH /products/:id/upc` (approver gate — stores a verified barcode),
  `GET /upc/lookup?name=` (manager — public Open Food Facts candidates, no POS
  needed), `GET /queue`, `POST /invoices` (multipart), `PATCH /invoices/:id/lines`,
  `POST /invoices/:id/approve`, `GET /financials`, `POST /pos/import`.
  Review lines and product cards show a "Find UPC" button when the matched
  product has no barcode (lookup → tap a candidate → saved).
- **Auth**: Supabase verifies credentials + role at login; server mints a
  30-day HS256 session token. Same `localStorage` key as the old client, so
  existing sessions carry over. Unauthenticated users see only the sign-in gate.
- **Failure modes**: Three.js CDN down → "DOCK OFFLINE" fallback with reload
  (12s watchdog). API errors surface as toasts; sign-in shows the server's
  error verbatim.

## Deploying

Static files + serverless API on Vercel (`anthony-pricing-hub`, production).
Ship via GitHub push to `main`, then create a production deployment from the
commit SHA. All files must stay under ~100KB each (connector push limit).

**Only an allowlist is published.** `vercel.json` runs
`node scripts/build-public-site.js`, which copies the public pages, `assets/`
media, `data/sale.json` and this client (`pricing-hub/index.html`, `game.css`,
`polish.css`, `js/*.js`) into `public-build/`, the only directory Vercel serves. Nothing
else in the repo is reachable. Before 2026-10-09 the whole repo root was, server
source and cost records included.

- Adding a file the client loads (a new `js/` module is picked up
  automatically; a new image, font or top-level file is not)? Add it to the
  allowlist in `scripts/build-public-site.js`. The **Public site guard** CI check
  fails if a published page references a file the allowlist leaves out.
- Never put invoice records, intake JSON/CSV or other data in `pricing-hub/`.
  They live in `invoices/pricing-hub-records/`.
- Check locally: `node --test scripts/test-public-site.cjs`.
- Paths outside the allowlist return the storefront homepage (Vercel's
  catch-all route), not a 404. When checking a URL, look at the content, not
  just the status code.

## Changelog

- **2026-10-10** — "Find UPC" button on review lines + product cards: public-database
  barcode lookup (no POS needed), manager picks a candidate, saved via
  `PATCH /products/:id/upc`. Bulk results for 24/39 missing UPCs in
  `docs/upc-lookup-2026-10-10.json`. Also fixed Vercel routing: multi-segment
  API paths (approvals, retail edits, history) were 404ing at the edge; now
  rewritten through `api/pricing-fn.js`.
- **2026-10-08** — "The Loading Dock" replaces the 2D client (full 3D, five zones).
- **2026-10-08** — Mobile polish pass: portrait framing, floating labels,
  defined zone objects, redrawn 24px icon set, mobile perf cuts.
- **2026-10-09** — Review line exceptions (short / wrong line, qty + cost edits,
  reconciliation strip).
- **2026-10-09** — Deploy publishes an allowlist only (`public-build/`); intake
  records moved to `invoices/pricing-hub-records/`.
