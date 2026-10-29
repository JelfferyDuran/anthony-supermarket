# HERMES HANDOFF — Anthony's Kitchen OS v2.1 (imported 2026-10-24)

## Status
Full v2.1 package imported from `anthonys-kitchen-os-v2.1-latest-designs.zip` into `prototypes/kitchen-os-v2/` on branch `feature/kitchen-os-v2-staging` (PR #59). The ZIP itself is NOT committed (binary source retained outside repo); all 18 source files are.

## Verified
- Local server: `python server.py` → http://127.0.0.1:8765/api/health = `productionConnected:false`
- Three TV boards render with approved prices ($6/$12; 8/16/32 oz portions; picadera 7" $20 / 9" $30)
- Draft → approve → versioned backup (approved-vN.json) works; invalid approvals rejected (400)
- Static/Vercel fallback tested: pages render from seed.json + localStorage in STATIC PREVIEW MODE
- Production untouched: no KFS /set calls, no port 8080, no LAN exposure

## Boundaries
- Local server binds 127.0.0.1:8765 ONLY. No auth; never expose to LAN/internet.
- "Approve Local Preview" is NOT production authorization.
- Do NOT publish: unconfirmed prices, proposed salad pricing, AI concept images as real food.
- Picadera sides are a separate 7-inch pan; validate operational portions before production.

## Blocker
- ~~**Vercel deploy needs the owner's Vercel token** — `vercel login` at the laptop, or paste a `VERCEL_TOKEN`. Static adaptation is ready; then: `npx vercel deploy prototypes/kitchen-os-v2` (or via existing project).~~ **RESOLVED** — deployed: **https://anthonys-kitchen-os-v2-preview.vercel.app** (2026-10-24).

## Next development (with ChatGPT, owner-reviewed)
Asset approval/manifest, item modifiers/portion containers, TV assignment + scheduler, manager auth, KFS canary adapter behind explicit publish approval, operational rollback.
