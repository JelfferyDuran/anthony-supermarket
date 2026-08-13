# Decision — drop Three.js from the sales page, build the rack in CSS 3D

**Date:** 2026-08-13
**Made by:** Claude Code, implementing `docs/agent-context/SALES_PAGE_V2_UPGRADE.md` (issue #31)
**Status:** Implemented on `claude/sales-v2-upgrade-spec-1tsrkx`
**Affects:** `sales.html`, `data/sale.json`, `assets/promos/2026-08-pasta-night/products/cards/`

## The question

v1 of the sales page rendered 7 pasta shapes as billboarded `PlaneGeometry` cards in Three.js r128, with each card face drawn into a `CanvasTexture`. The owner asked whether Three.js should be replaced "for a better UI and composition for mobile and all screens".

## What we chose

**Removed Three.js entirely.** The card rack is now CSS 3D (`perspective` + `transform-style: preserve-3d`) driven by ~11KB of inline JavaScript that handles pointer drag, fling projection, snap-to-nearest, keyboard, and wheel.

The spec's §4 matrix starred two options: **A** (pure CSS 3D + small JS) and **B** (Swiper coverflow, ~35KB). We took **A**.

## Why

1. **Text.** This was the real defect, not the framework. `CanvasTexture` text is rasterised at a fixed resolution — soft on high-DPI phones, impossible to select, and invisible to screen readers. DOM text is crisp at every DPI, selectable, and readable by assistive tech for free. Any option that keeps a canvas keeps this problem and forces a DOM overlay to work around it.
2. **We were never rendering 3D.** The "3D showcase" was flat photos on flat planes. Shipping a WebGL engine to place seven photos on an arc is paying for a capability the page does not use.
3. **A over B: zero bytes and zero dependencies.** `sales.html` is a single self-contained file served from GitHub Pages. Option B would have added ~35KB plus a CDN origin that can fail, be blocked, or drift. Option A adds nothing and cannot break in that way. The behaviours B would have given us for free — momentum, snap, keyboard, a11y — are roughly 120 lines here, and we now control the feel.
4. **Reliability.** No WebGL context to fail on an old phone. The v1 failure mode was hiding the whole showcase.
5. **Weight.** ~600KB of engine → 0KB of library.

## Cost / what we accepted

- We own the gesture physics. Fling projection, rubber-banding at the ends, and axis detection are hand-written and hand-tested rather than battle-tested library code. This is covered by 100 automated Chromium assertions, including a fling-carries-momentum and a snap-to-exact-position check.
- No true 3D is possible now without reintroducing a renderer. That is the right trade while we are selling photographed packaged goods; revisit only if a campaign genuinely needs a 3D scene.

## The bigger perf win was not the framework

Removing Three.js mattered, but the dominant cost was images: seven **1920×2560** photos rendered into a ~280px card, and all seven loading up front because the stacked cards all sit at the same point in the viewport, which defeats native `loading="lazy"`. Fixing that — 640×640 derivatives plus hydrating only cards within ±2 of centre — moved LCP from **4.6s to 1.7s** and Lighthouse mobile performance from **80 to 99**.

Worth remembering next time: measure before blaming the framework.

## Related

- Spec: `docs/agent-context/SALES_PAGE_V2_UPGRADE.md` §4
- Log: `docs/agent-context/SESSION_LOG.md`, 2026-08-13 entry
- Issue #31
