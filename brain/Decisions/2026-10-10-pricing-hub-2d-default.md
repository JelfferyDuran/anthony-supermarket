# Decision — The Pricing Hub's default UI is a 2D console at /hub

Date: 2026-10-10
Status: accepted by the owner (direction and page placement chosen explicitly); production promotion pending owner go

## Context

- The owner signed in for the first time through the hub embedded in the public homepage: a three.js world inside a 70vh iframe under customer content. They called the UI "horrible" and glitchy during the work itself.
- The 3D dock's interaction model invites glitches on phones:
  - camera flights;
  - tap-to-pick raycasts;
  - floating labels across zones;
  - WebGL in a frame.
- Its review card also lost typed retail values on re-render, and lines marked short or wrong vanished on the next refresh.

## Decision

- **A flat, mobile-first 2D console is the default,** at `/hub/` (owner's choice among: 2D default, fix the 3D, retire the 3D).
- **The 3D dock stays** at `/pricing-hub/` as an optional view.
- **The homepage no longer embeds the hub.** A small "Staff · Pricing Hub" footer link replaces the iframe, the nav link and the hero button. `/hub/` is `noindex`.
- **The game layer carries over unchanged.** The server still computes everything from the audit trail; the console only renders `/game/state`.
- **One API client and one session for both UIs:** the 2D hub imports `pricing-hub/js/api.js`.
- **`GET /invoices/:id` was added** so the review card works from the full invoice, not the needs_review queue.

## Why

- **Removes the glitch sources rather than patching them:** no WebGL, no picking, no camera tweening.
- **Faster to load:** no three.js; the page has no external scripts at all.
- **The review process gets safer:**
  - a live checklist mirrors the server's approval gate;
  - excluded lines stay visible;
  - all-excluded invoices can be closed;
  - typed values persist.
- **Customers no longer see a staff login** on the storefront homepage.

## Guardrails / rollback

- **Pricing stays server-authoritative:**
  - "Fix" names the product and the server prices it;
  - lowering a price needs a confirm;
  - below-cost retail is refused on the client and enforced on the server.
- **The new route is manager-only and read-only.** It strips `source_object_path`, `source_sha256`, `created_by` and `approved_by`.
- **The public build stays an allowlist.** `hub/` was added on purpose, and the CI guard requires its files.
- **Rollback:** revert the branch. `/pricing-hub/` and the API contract are unchanged except for the additive route.
