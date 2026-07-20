# Claude Fix Prompt — Anthony's Supermarket

You are fixing and rebuilding the Anthony's Supermarket website at github.com/JelfferyDuran/anthony-supermarket.

## Current Problems

1. **GitHub Pages is STUCK in "building" status** — the last 2 workflow runs failed.
   - Check .github/workflows/deploy.yml for issues
   - GitHub is having a service outage, but the workflow file may also have problems
   - Consider switching from GitHub Actions deploy to simple "Deploy from branch" in Pages settings

2. **index.html has bugs:**
   - 1 remaining \uD8 unicode escape in JS (should be actual emoji character)
   - API endpoint is hardcoded to `http://localhost:3001/api/orders` — this will ALWAYS fail when deployed. Add a check: if hostname is github.io, show a "call to order" message instead of trying to fetch
   - Missing favicon — add an inline SVG data URI favicon
   - The checkout form should gracefully degrade when the backend is unreachable

3. **Fix the deploy workflow** — the current one uses `actions/deploy-pages@v4` which requires specific permissions. Simplify to just deploying from the main branch directly.

4. **Clean up the repo** — there are stale docs (CONSOLIDATION_COMPLETE.md, PRESENTATION_GUIDE.md, ROADMAP.md, VERIFICATION.md) that are outdated. Delete or archive them.

5. **Rebuild the site** with these features (keep what works, fix what's broken):
   - Professional forest green (#2D6A4F) and warm amber (#E07A2F) color scheme
   - Full bilingual EN/ES toggle for ALL text (37 pairs verified)
   - 88 products across 3 sections (Hot Food, Deli & Meats, Grocery)
   - Live search + tag filter chips (Vegan, GF, High Protein)
   - Shopping cart with localStorage persistence
   - Checkout with offline fallback (call-to-order message when API unreachable)
   - Order history from localStorage
   - Store info section (hours, address, phone, map)
   - Three.js scene (subtle, auto-disables on mobile)
   - SEO meta tags + JSON-LD LocalBusiness schema
   - Mobile responsive with swipe cart
   - Favicon (inline SVG data URI)

6. **Make it work WITHOUT a backend** — the site must be fully functional as a static GitHub Pages site. Checkout should show "Call (201) 428-1745 to complete your order" instead of trying to fetch a non-existent API.

## Store Info
- 288 Kearny Ave, Kearny, NJ 07032
- (201) 428-1745
- Mon–Sat 7AM–8PM, Sunday CLOSED
- Instagram: @anthony_supermarket

## Color Palette
--primary: #2D6A4F
--primary-light: #40916C
--primary-dark: #1B4332
--accent: #E07A2F
--bg: #0F0F14
--card: #1A1A24
--text: #F0F0F0
