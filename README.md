# Anthony's Supermarket — Kearny, NJ

Professional grocery website with bilingual ordering system.
288 Kearny Ave, Kearny NJ 07032 | (201) 428-1745

Website: https://jelfferyduran.github.io/anthony-supermarket/
Instagram: @anthony_supermarket

## Features (v4)

- Bilingual EN/ES toggle for all text
- 93 products across Hot Food, Deli & Meats, Grocery
- Live search filtering across all products
- Tag filters: Vegan, Gluten Free, High Protein
- Shopping cart with localStorage persistence
- Checkout with offline fallback (call-in)
- Order history saved locally
- Three.js 3D scene (auto-disables on mobile)
- Pricing Hub markup calculator
- Responsive with swipe cart on mobile
- SEO meta tags + LocalBusiness schema

## Architecture

anthony-supermarket/
- index.html — Main website (v4)
- server/index.js — Order API + Telegram Bot
- pricing-hub/index.html — Pricing calculator
- .github/workflows/deploy.yml — GitHub Pages auto-deploy

## Quick Start

cd server
npm install
export TELEGRAM_TOKEN="your_bot_token"
npm start
# Server on http://localhost:3001
# Website deploys automatically on push to main

## Tech Stack

Website: Vanilla HTML/CSS/JS + Three.js
Order API: Express (Node.js)
Bot: node-telegram-bot-api
Data: JSON files
Deploy: GitHub Actions -> GitHub Pages

## Contact

288 Kearny Ave, Kearny, NJ 07032
(201) 428-1745
Mon-Sat 7AM-8PM | Sunday CLOSED
Instagram: @anthony_supermarket


## Simple production path

The supported MVP order flow is:

`catalog → cart → pickup/delivery request → Express API → Telegram kitchen notification`

The public website is deployed on GitHub Pages. Deploy the order API separately using [render.yaml](./render.yaml), then set the website's API URL with either:

- `window.ANTHONY_API_URL` in the deployment configuration, or
- the temporary `?api=https://your-order-api.example.com` URL parameter.

Server setup and required secrets are documented in [server/README.md](./server/README.md). The Telegram bot is [@Anthonysuperkitchen_bot](https://t.me/Anthonysuperkitchen_bot). Never commit `TELEGRAM_TOKEN`.
