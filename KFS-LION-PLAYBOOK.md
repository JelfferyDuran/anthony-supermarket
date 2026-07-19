# Anthony's Supermarket — KFS Lion Agent Playbook

> Use this file to continue working with Anthony's via @her_mes_woo_bot.
> The KFS Lion is the ordering interface — not a separate bot.

---

## Project Structure

```
~/anthony-supermarket/
├── index.html              ← Professional grocery website (v4 — bilingual EN/ES)
├── KFS-LION-PLAYBOOK.md    ← This file
├── README.md               ← Project overview
├── server/
│   ├── index.js            ← Order API + Telegram bot
│   ├── package.json
│   └── data/orders.json    ← Order store (auto-created)
├── pricing-hub/
│   └── index.html          ← Wholesale-to-retail pricing tool
└── .github/workflows/deploy.yml  ← GitHub Actions auto-deploy
```

## Live Resources

| Resource | URL |
|----------|-----|
| Website (v4) | https://jelfferyduran.github.io/anthony-supermarket/ |
| Repo | https://github.com/JelfferyDuran/anthony-supermarket |
| Order API | http://localhost:3001 |
| Kitchen Bot | @Anthonysuperkitchen_bot |
| Agent | @her_mes_woo_bot (KFS Lion) |

### Website Features (v4)
- Full bilingual EN/ES toggle
- 93 products across 3 departments
- Live search + dietary tag filters (Vegan, GF, High Protein)
- Shopping cart with localStorage persistence
- Checkout with offline fallback (call-to-order)
- Order history saved locally
- 3D scene (auto-disables on mobile/reduced motion)
- Store info — hours, address, phone, map link
- Pricing Hub embed — wholesale-to-retail calculator

## Bot Setup

See server/BOT_SETUP.md for full instructions.

### Kitchen Notifications
1. Create private TG group "Cocina"
2. Add @Anthonysuperkitchen_bot as admin
3. Send any message in group
4. Get chat ID via getUpdates API
5. Export KITCHEN_CHAT_ID and restart server

## Running the Server

cd ~/anthony-supermarket/server
npm install
export TELEGRAM_TOKEN="your_token"
npm start

## Menu Sections
- Hot Food Menu — Hot Meals, Latin Sides, Breakfast
- Deli & Meats — Dairy & Eggs, Bread & Bakery, Deli Containers
- Grocery — Beverages, Snacks, Canned, Dry Goods, Condiments, Frozen, Household, Personal Care, Paper, Tea/Coffee
