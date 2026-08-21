# Sales Page v2 — Upgrade Specification

**For:** Claude Code / Codex / any coding agent taking over this task
**Owner:** Noel Duran (JelfferyDuran) — Anthony's Supermarket, 288 Kearny Ave, Kearny NJ 07032
**Repo:** `https://github.com/JelfferyDuran/anthony-supermarket` (pull/push access for owner-approved agents)
**Live page:** `https://jelfferyduran.github.io/anthony-supermarket/sales.html`
**Date:** 2026-08-12
**Status:** 🟡 OPEN — spec approved by owner, not yet implemented

---

## 0. Read this FIRST (repo rules — non-negotiable)

1. `AGENTS.md` at repo root — required read order, authority boundaries, branch/PR workflow.
2. `docs/agent-context/CURRENT_STATE.md` + `docs/agent-context/SESSION_LOG.md` — latest verified state.
3. `docs/agent-context/HANDOFF_PROTOCOL.md` + `docs/agent-context/OPERATING_RULES.md`.
4. Do NOT push directly to `main` for meaningful changes: branch off `main` (e.g. `sales-v2-upgrade`), open a PR. If your token can't create PRs, tell the owner — Hermes' embedded PAT cannot (no `pull_request` scope); the owner merges via the compare link.
5. Update `CURRENT_STATE.md` + append to `SESSION_LOG.md` in the SAME PR (shared-context duty).
6. Never commit secrets, tokens, customer PII. Never invent prices or sale dates.
7. Pricing rule: retail = cost × 1.70 (not needed for this page unless you add products — then ask).

## 1. What exists today (v1, live)

`sales.html` — a **standalone, single-file, bilingual (EN/ES)** sales page for the Pasta Night campaign:

- Sticky top bar with brand + EN/ES toggle (`t(en,es)` + `data-en/data-es` + `setLang()`, persisted to `localStorage["anthony-lang"]`, fires `langchange` event).
- Hero: "PASTA NIGHT" headline, gold "ANY 2 FOR $4" deal box + "Save ~28% vs $2.79" chip.
- Red FOMO banner — "WHILE SUPPLIES LAST", **no dates by design** (owner rule: sell-through = urgency).
- **Three.js r128 (CDN) interactive showcase**: 7 Rummo shapes rendered as billboarded `PlaneGeometry` cards on a rotating rack. Card faces are **CanvasTexture** (2D canvas-drawn text: shape name, "2 FOR $4", weight, "WHILE SUPPLIES LAST"). Interactions: drag/tap to spin, hover glow + scale, click-to-select → info panel (shape facts, price, "Get Directions" link). Floor ring + gold torus + particle points. Auto-rotate; `prefers-reduced-motion` disables motion. WebGL failure → `wrap.hidden=true` (page still usable).
- Product data hardcoded inline: `var PASTAS=[...]` — 7 shapes with EN/ES names, codes (Nº 66/51/221/85/94/101/83), weights, and EN/ES facts **from real packaging** (bronze-cut, free-range Italian eggs, cook times, NON-GMO). Deal price is the ONLY price: 2 for $4.
- How-it-works (3 steps), Pair-it chips (Ragu/Prego/Hunt's/Victoria/Goya), 3 recipe cards, poster display (swaps EN/ES poster image), footer with address/hours/directions/IG.
- Poster images: `assets/promos/2026-08-pasta-night/poster-en-allshapes.png` + `poster-es-chatgpt.jpg` (both live on Pages).
- Product photos available (NOT yet used on the page): `assets/promos/2026-08-pasta-night/products/*.jpg|webp` (rummo-penne-rigate-66, farfalle-85, mezzi-rigatoni-51, squared-spaghetti-221, egg-fettuccine-94, egg-pappardelle-101, lasagne-83).

Verified v1: `node --check` clean; browser regression EN/ES clean; zero console errors.

## 2. The v2 mission (owner's words + engineering translation)

> "Enhance it with all its capabilities. If you need to change three.js to something better for a better UI and composition for mobile and all screens."

**Goals, in priority order:**
1. **Best-in-class mobile & multi-screen composition** — the page must feel native on phones (portrait + landscape), tablets, desktop, and large TVs; safe-area aware; touch-first.
2. **Better tech for the 3D showcase** — replace/upgrade the rendering approach so it's lighter, crisper, more accessible, and more composable. (Decision guidance in §4.)
3. **Data-driven, weekly-swappable** — owner changes the sale weekly by editing ONE config (no code spelunking).
4. **Keep the brand, the bilingual system, and the FOMO rule intact.**

## 3. Feature requirements (v2 checklist)

### 3.1 Composition / responsive (all screens)
- [ ] Mobile-first layout; hero + deal box reflow on <480px; info panel becomes a **bottom sheet** on touch devices (drag-up, backdrop, safe-area inset `env(safe-area-inset-bottom)`).
- [ ] Portrait + landscape both verified (landscape = cards arc wider, panel docks right).
- [ ] Tablet mid-breakpoints; desktop shows more content density; 4K/TV: cap content width, scale type with `clamp()`.
- [ ] `100dvh`/`100svh` handling (no mobile URL-bar jump).
- [ ] Touch gestures: swipe to spin WITH **momentum/inertia (fling)** + **snap-to-nearest-card**; tap = select; pinch = zoom card (optional).
- [ ] Keyboard: arrow keys spin/select, Enter/Space = select, Escape closes bottom sheet, visible focus rings.

### 3.2 Rendering tech (replace/upgrade three.js — see §4)
- [ ] Text on cards MUST be **real DOM text** (or SVG text), not canvas-drawn: crisp at every DPI, selectable, screen-reader accessible. CanvasTexture text is the #1 v1 flaw.
- [ ] Product cards show the **real product photos** (`assets/promos/.../products/`) with DOM label overlays (name, code, 2 FOR $4).
- [ ] WebGL-free fallback that still looks good (CSS 3D or 2.5D) — no blank canvas on old devices.
- [ ] Only load the 3D/effect runtime when the section is in view (IntersectionObserver lazy-load), capped `devicePixelRatio` (≤2), `prefers-reduced-motion` = static composition.
- [ ] Bundle budget: total JS added ≤ ~150KB gzipped on top of current, no render-blocking on mobile.

### 3.3 Content system (weekly swap)
- [ ] Extract campaign config to ONE JSON (`data/sale.json` or inline `<script type="application/json">`): campaign name EN/ES, deal line EN/ES, save chip, products[] (image, code, name EN/ES, facts EN/ES, weight), posters EN/ES, pair-it items, recipes EN/ES, footer CTA.
- [ ] Page renders from config; empty/missing config → graceful message, not a crash.
- [ ] Update `index.html` `SPECIALS` array note: the main site's Weekly Specials section (branch `site-3d-specials`, unmerged) should ALSO read from the same JSON if feasible — single source of truth, no duplicated prices.

### 3.4 UX / delight (keep it classy, not gimmicky)
- [ ] Subtle parallax/float on hero poster; micro-interactions on select (card pulses gold).
- [ ] Share: WhatsApp share button per product + "share this sale" (WhatsApp deep link `https://wa.me/?text=...`), copy-link button.
- [ ] Optional "stock" meter per shape ONLY if owner provides stock data (default: hidden — FOMO rule says no dates, but a "getting low" bar is allowed if owner enables it).
- [ ] Confetti-free; keep vintage-grocery warmth (cream/green/gold/red palette, serif display font pairing — suggest pairing with the site's existing system fonts; do NOT add webfonts that hurt LCP unless owner approves).

### 3.5 Quality gates (mandatory before PR)
- [ ] `node --check` on extracted inline JS (or `npm run build` if you split files).
- [ ] Browser pass: EN + ES toggle, all 4 viewport widths (360px, 768px, 1280px, 1920px), touch emulation for swipe/snap, keyboard nav, WebGL-disabled fallback, zero console errors.
- [ ] Lighthouse mobile perf ≥ 85 (LCP ≤ 2.5s on 4G throttling) — three.js removal should make this easy.
- [ ] Manual content check: every word on cards is DOM text (inspect in devtools), screen reader reads product names.
- [ ] Confirm no invented prices/dates anywhere.

## 4. Rendering tech decision (owner explicitly asked to reconsider three.js)

### Context
v1 uses Three.js **r128** (2019) from CDN — heavy (~600KB min) for what is essentially a 2.5D card rack with 2D product photos. CanvasTexture text is fixed-resolution and inaccessible. For "cards with real photos + crisp text + great touch", true WebGL is overkill.

### Options (evaluated)

| Option | Weight | Mobile perf | Text/accessibility | Touch/snap | Effort | Verdict |
|---|---|---|---|---|---|---|
| **A. CSS 3D transforms (pure CSS `perspective`/`preserve-3d`) + tiny JS** | ~0KB | Excellent | Native DOM (crisp, a11y) | DIY (easy: pointer events + inertia) | Medium | ⭐ Recommended for the card rack |
| **B. Swiper.js coverflow/cube effect (DOM-based 3D carousel)** | ~35KB gz | Excellent | Native DOM | Built-in swipe/snap/inertia/keyboard/a11y | Low | ⭐ Co-recommended (fastest to ship, battle-tested) |
| **C. Upgrade to modern Three.js (r170+, ES modules, import map)** | ~600KB | Good | Still canvas → must overlay DOM | DIY | High | Keep ONLY if you add true-3D scenes (particles/env) later |
| **D. Babylon.js / Spline / model-viewer** | Heavy | Good | Varies | Varies | High | Overkill — we show photos, not 3D models |

### Recommendation
**B (Swiper coverflow-style DOM carousel) as the primary rebuild, optionally wrapped in option A for custom flair.** Product cards become real `<article>` elements: photo background + DOM text overlay + gold price tag. A **lightweight Three.js scene (particles/ambient dust) can stay as a background accent ONLY** if it's lazy-loaded and doesn't block the carousel — but it is NOT required and can be dropped for a pure-CSS vignette.

Rationale to cite in the PR: DOM text is accessible/crisp at all DPIs (a11y win), no WebGL context failures on old phones (reliability win), ~10× smaller payload (perf win), Swiper gives momentum/snap/keyboard/touch out of the box (UX win), and photos + text look identical to the approved v1 aesthetic.

### Fallback rule
Whatever you choose must degrade to a **static, readable 2D grid of product cards** when JS/WebGL is unavailable. The current v1 static grid fallback behavior is the floor.

## 5. Deliverables

1. Branch `sales-v2-upgrade` off `main` (contains `sales.html` v2 + `data/sale.json` + any split files).
2. PR with: what changed, decision rationale (cite §4), verification evidence (screenshots at 4 widths, Lighthouse numbers, console-clean note).
3. `CURRENT_STATE.md` + `SESSION_LOG.md` updated in the same PR.
4. No breaking change to the live page until merged; v1 stays live until then.

## 6. Acceptance (owner will check)

- [ ] Opens fast on a mid-range Android over 4G (LCP ≤ 2.5s).
- [ ] Fling the rack on a phone → momentum + snap, no jank (60fps).
- [ ] Text on cards is selectable/highlightable; screen reader announces product names.
- [ ] EN/ES toggle still flips EVERYTHING including card labels.
- [ ] Swapping the sale = editing `data/sale.json` only (owner demo).
- [ ] No dates anywhere; "while supplies last" everywhere.
- [ ] Still looks like Anthony's: cream/green/gold/red vintage warmth, not a generic SaaS carousel.

## 7. Reference material

- `sales.html` (v1 — the thing to upgrade)
- `index.html` (main site — bilingual conventions `t()`, `data-en/data-es`, `setLang`, `SPECIALS` array, `site-3d-specials` branch has the 3D section variant)
- `assets/promos/2026-08-pasta-night/` — posters (EN/ES), flyer, product photos (JPG + WebP), IG pack
- `docs/agent-context/SESSION_LOG.md` — 2026-08-12 entries: campaign build, AI-media skill, 3D specials, sales page v1, live deploy
- GitHub issue **#31** — "Sales page v2" (created by owner's Hermes on 2026-08-12; link in the issue body)
