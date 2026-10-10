# The Loading Dock — Pricing Hub 3D UI

> **Since 2026-10-10 the default Pricing Hub is the 2D console at `/hub/`**
> (see "The 2D hub" below). This 3D dock stays at `/pricing-hub/` as an
> optional view. Both share the API, the session and the game layer.

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
returns the existing invoice instead of double-counting. If that invoice was
stored but never read, the response says `rescuable: true` and the hub sends you
to the Rescue mission.

**Failed reads no longer strand scans (Oct 10, 2026):** if extraction fails,
the invoice drops back to `uploaded` (stored, not yet read) instead of staying
`extracting` forever. `POST /invoices/:id/extract` re-reads a stuck scan from
storage: one that is `uploaded`, or `extracting` for more than 10 minutes. It
refuses anything else, so it can never overwrite lines under review.

## The game layer — operational, not decorative

The hub plays like a game, but every number comes from real work. The server
(`server/pricing-game.js`, `GET /game/state`) derives everything from records
the pricing tables already keep:
- who approved or closed an invoice;
- who set a line aside;
- who repriced an item;
- who imported POS sales.

No new tables, and the browser cannot claim XP.

| Piece | What it is |
|---|---|
| **Player strip** (top) | Level + title, XP bar, work streak (store days, America/New_York), dock-integrity score. Tap for the player card. |
| **Missions** (left button, dock beacons) | The live work queues. They clear when the work is done. Tap a dock beacon or the MISSIONS button to open the board. |
| **Player card** | Level ring, streak, XP today/week, badges with progress, this-week and all-time leaderboard (names = email local part only), "Dock radio" team feed, XP rules. |
| **Dock integrity** | 0–100 health from five weighted parts: review backlog 30, intake flow 15, price rule 25, sales feed 20, UPC coverage 10. The pedestal ring turns red, amber or green with it. |
| **Feedback** | +XP float, level-up overlay with particle burst, "Badge unlocked" and "Mission clear" toasts. Each one is a diff between two server snapshots. |

**Missions**
- **Clear the Review Line:** invoices in `needs_review`, oldest first, each with a Review button.
- **Rescue Stuck Scans:** scans stored but never read. They also appear as red packages in the Intake Bay; tap one to re-read it.
- **Rule Guard:** items selling under retail = cost × 1.70 (.99), below-cost first. They pulse red on the shelves. **Apply** is server-priced (`POST /products/:id/apply-rule`): the browser only names the product, and lowering a price needs an explicit confirm.
- **Feed the Vault:** days of POS sales missing since the last import.

**XP**

| Action | XP |
|---|---|
| Approve an invoice | 100, +5 per line, +50 if it reconciles to the cent |
| Close a delivery that never came | 40 |
| Catch a short or wrong line | 8 |
| Reprice an item | 15 |
| Import POS sales | 60 |

**Levels:** Dock Hand (0), Receiver (250), Line Checker (600), Price Scout (1,100), Margin Keeper (1,800), Floor Captain (2,700), Dock Boss (3,900), Pricing Chief (5,400), Vault Keeper (7,200), Kingpin of the Dock (9,500).

**Notes**
- Shared operator tokens see the missions but score nothing: no person is attached to them.
- Approvals now send `invoice_line_id`. The server keeps an id only if it is a line of the invoice being approved, so the audit trail links each price to its line. Older unlinked approval rows are not double-counted as hand reprices.

## The 2D hub (`/hub/`) — the default since 2026-10-10

The owner found the 3D dock glitchy in daily use, especially embedded in the
public homepage, where it was squeezed into a 70vh iframe under customer
content. The 2D hub is the same operation without WebGL: one flat,
mobile-first console. It needs no external scripts and no three.js.

- **Where:** `https://anthony-supermarket.vercel.app/hub/` (`/hub` redirects
  there). It is `noindex`. The public homepage links to it only from a small
  "Staff · Pricing Hub" footer link.
- **Files:**
  - `hub/index.html`, `hub/hub.css`;
  - `hub/js/app.js`: boot, sign-in, hash router, shell, refresh, XP/level-up feedback;
  - `hub/js/ui.js`;
  - `hub/js/upc.js`: the shared barcode finder;
  - `hub/js/views/{today,review,products,intake,vault,me}.js`.

  It imports `pricing-hub/js/api.js`, so there is one API client and one
  session key (`pricingToken`). Signing in on either UI signs you into both.
- **Routes (hash):**
  - `#/today`: integrity, missions, team feed;
  - `#/review` and `#/review/<invoiceId>`;
  - `#/products?f=rule|noupc|flagged` and `#/products/<id>`;
  - `#/intake`, `#/vault`, `#/me`.

  Back button and deep links work.
- **Review card:** loads the invoice with every line via `GET /invoices/:id`.
  - Lines marked short or wrong stay visible and can be put back.
  - An all-excluded invoice can still be closed. Before, it vanished from the queue.
  - A live checklist mirrors the server's approval gate (unmatched lines,
    missing cost or retail, below cost, reconciliation variance), so blockers
    show before Approve.
  - Product-match suggestions come from the extracted barcode or a similar name.
  - Typed retail, cost and cases survive re-renders.
  - "View scan" opens the signed source scan.
  - After approval the card offers a price-label download and the next invoice.
- **Products:**
  - Filters: Under rule, No UPC, Flagged.
  - One-tap **Fix** for Rule Guard items.
  - Product card: rule fix (confirm before lowering), set retail (below cost
    refused), barcode lookup or typed digits, price history, cost-increase alert.
- **Intake:** camera or file pick, drag-drop, real upload progress that
  survives switching tabs, duplicate detection, and a stuck-scan rescue list
  with plain-language errors.
- **Vault:**
  - P&L with thousands separators;
  - POS import;
  - margin by category, vendor spend and invoice aging;
  - cost increases;
  - all-labels CSV.
- **Game:** the same `/game/state`. Player chip (level, XP bar, streak),
  integrity chip, XP float, level-up modal, badge and mission-clear toasts.
  The `#/me` route has badges with progress, the leaderboard and the XP guide.

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
  js/api.js    — API client: token in localStorage `pricingToken`,
                 Authorization: Bearer on every call, XHR upload w/ progress
  js/boot.js   — init, auth gate (401 → sign-in overlay), raycast taps, main loop
  js/world.js  — the 3D set: dock, conveyors, portals, tray, shelves, vault,
                 particles, eased camera fly-to (~1.2s)
  js/zones.js  — data→3D binding: queue→packages, products→shelf boxes,
                 financials→bars, hologram stats
  js/hud.js    — sign-in, top bar, zone nav, FAB, upload choreography,
                 review/product/vault panels, search
  js/game.js   — game layer: player strip, mission board, player card, health
                 panel, dock beacons, stuck-scan packages, XP/level-up feedback
```

3D labels can be scoped to a zone (`addLabel(..., { zone })`) and show only
while the camera is there. Before, far zones' titles bled into the dock view.

- **Backend**: `api/pricing-fn.js` (Vercel function, rewrite target) mounts
  `server/pricing-router.js` + `server/pricing-store.js`. Base `/api/pricing`.
  Endpoints used: `POST /login`, `GET /config`, `GET /products`,
  `GET /products/:id/history`, `PATCH /products/:id/retail`,
  `PATCH /products/:id/upc` (approver gate — stores a verified barcode),
  `GET /upc/lookup?name=` (manager — public Open Food Facts candidates, no POS
  needed), `GET /queue`, `POST /invoices` (multipart), `PATCH /invoices/:id/lines`,
  `POST /invoices/:id/approve`, `GET /financials`, `POST /pos/import`,
  `GET /game/state`, `POST /products/:id/apply-rule`, `POST /invoices/:id/extract`,
  `GET /invoices/:id` (one invoice with every line, rejected included),
  `GET /invoices/:id/source` (signed scan link), `GET /export/labels`.
  Review lines and product cards show a "Find UPC" button when the matched
  product has no barcode (lookup → tap a candidate → saved; Dock Integrity
  refreshes, since UPC coverage is part of the score).
- **Routing**: `vercel.json` rewrites `/api/pricing/:path*` to
  `/api/pricing-fn?__path=:path*`, and `api/pricing-fn.js` restores the
  original path before the router sees it. Without the rewrite Vercel only
  routed ONE segment (to `api/pricing/[...path].js`, kept as a fallback), so
  `/invoices/:id/approve`, `/invoices/:id/lines`, `/products/:id/history` and
  `/products/:id/retail` hit Vercel's 404. Unknown paths get a JSON 404. CI
  (`scripts/test-public-site.cjs`) fails if the rewrite or its target goes.
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
`js/*.js`) into `public-build/`, the only directory Vercel serves. Nothing
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
- **2026-10-10** — 2D hub at `/hub/` becomes the default (no WebGL).
  - Homepage iframe replaced by a staff footer link.
  - `GET /invoices/:id` added so excluded lines and all-excluded invoices stay workable.
- **2026-10-10** — Game layer: missions, XP, levels, streaks, badges,
  leaderboard and dock integrity, all derived server-side from the audit trail.
  Also:
  - stuck-scan rescue;
  - server-priced Apply rule;
  - client fixes: POS upload field `sales`, price-history field, vault revenue
    and cost keys, signed-in name restored after reload.
