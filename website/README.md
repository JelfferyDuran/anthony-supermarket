# Anthony's Supermarket — Public Website

Bilingual (ES/EN) public website for **Anthony's Shop & Save Supermarket**,
288 Kearny Ave, Kearny NJ 07032. Built to become the content of
`anthonysupermarket.com` once the domain is recovered.

## Structure

```
website/
├── index.html      # page structure (Spanish-first, data-i18n hooks)
├── styles.css      # brand system: produce green, navy, light/dark themes
├── app.js          # language toggle, lunch-day tabs, scroll reveals,
│                   # card tilt, hero particles, theme toggle, menu data
└── assets/
    └── storefront.jpg   # ← DROP THE REAL STOREFRONT PHOTO HERE
```

## The storefront photo

The hero is designed for the real storefront photo at
`website/assets/storefront.jpg`. Until that file exists, the hero shows the
branded gradient treatment instead (the layout detects the missing image and
hides the photo frame gracefully).

To add it: in GitHub, open the `website` branch → `website/assets/` →
**Add file → Upload files** → drop in `storefront.jpg`. Done — no code change needed.

## Menu data

Lunch specials, catering trays and sides are transcribed from the store's
printed flyer (Oct 2026) in `app.js` (`MENU`, `CATERING`, `SIDES`). Dish names
stay in Spanish in both languages — they're proper names. Update prices there
when the flyer changes.

## Deploying

Any static host works (Vercel, Cloudflare Pages, Netlify): point it at the
`website/` directory. When the domain is recovered, aim `anthonysupermarket.com`
at this deployment.

## Local preview

```bash
cd website && python3 -m http.server 8000
# open http://localhost:8000
```
