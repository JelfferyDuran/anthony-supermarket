# 🦁 Anthony's Supermarket — KFS Lion Agent Playbook

> Use this file to continue working with Anthony's via @her_mes_woo_bot.
> The KFS Lion is the ordering interface — not a separate bot.

---

## Project Structure

```
~/anthony-supermarket/
├── index.html              ← Immersive Three.js website (deployed to GitHub Pages)
├── server/
│   ├── index.js            ← Order API + in-memory Telegram bot (standalone)
│   ├── package.json        ← Node.js deps (express, cors, uuid, node-telegram-bot-api)
│   ├── BOT_SETUP.md        ← Legacy bot guide (ignore — KFS Lion is the interface)
│   └── data/orders.json    ← Order store (auto-created)
├── apps/
│   └── menu/               ← BioMenu app (gitignored, local dev only)
│       ├── scripts/
│       │   ├── anthonys-seed.json    ← Seed data for MongoDB
│       │   └── update-seed.mjs       ← Seed converter
│       └── src/data/mock.ts          ← Mock restaurant data (Anthony's added locally)
└── .github/workflows/
    └── deploy.yml          ← Auto-deploys index.html to GitHub Pages
```

---

## Live Resources

| Resource | URL |
|----------|-----|
| 🌐 Website | https://jelfferyduran.github.io/anthony-supermarket/ |
| 📦 GitHub Repo | https://github.com/JelfferyDuran/anthony-supermarket |
| 🛒 Order API | `http://localhost:3001` (local server) |
| 🤖 Telegram Bot | @Anthonysuperkitchen_bot (standalone, optional now) |

---

## Menu Data (101 items across 3 menus)

### Hot Food Menu 🍳
**Categories:** Hot Meals, Latin Sides, Breakfast
**Key items:** Chicken Breast $4.93/lb, Pernil $9.99/lb, Yellow Rice $3.99, Eggs 18ct $5.78

### Deli & Meats 🥩
**Categories:** Dairy & Eggs, Bread & Bakery
**Key items:** Whole Milk $4.11/gal, OJ $5.28/52oz, Pan de Yuca $7.99/16ct

### Grocery 🛒
**Categories:** Beverages, Snacks, Canned, Dry Goods, Condiments, Frozen, Cleaning, Personal Care, Paper, Tea
**Key items:** Tuna $2.99, Jasmine Rice 8/80oz $8.99, Horchata $1.99, Clorox $5.99/6pk

Full menu JSON: `GET http://localhost:3001/api/menu`
Search: `GET http://localhost:3001/api/items?q=keyword`

---

## Ordering Flow (KFS Lion)

When a customer wants to order via @her_mes_woo:

1. **Browse menu** → Reference the 3 menus above, share items with prices
2. **Build cart** → Track items + quantities in conversation
3. **Place order** → POST to order API:

```bash
curl -X POST http://localhost:3001/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"nombre":"Chicken Breast (per lb)","precio":4.93,"cantidad":2,"id":"hot-food...","_id":"..."}],
    "tipoEntrega": "pickup",
    "cliente": {
      "nombre": "Customer Name",
      "telefono": "201-xxx-xxxx",
      "direccion": ""
    },
    "notas": ""
  }'
```

Response: `{"ok":true, "orderId":"ABC12345", "total":9.86}`

4. **Notify kitchen** → Server auto-sends alert to kitchen Telegram group
5. **Confirm customer** → KFS Lion tells customer their order number

> The `items[].id` and `items[]._id` fields are optional but help with tracking.
> At minimum, `nombre`, `precio`, and `cantidad` are required.

---

## Order States

| Estado | Meaning |
|--------|---------|
| `recibido` | New order, received |
| `preparando` | Being prepared (set via API/PATCH) |
| `listo` | Ready for pickup/delivery |
| `entregado` | Delivered/picked up |

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/menu` | Full menu |
| GET | `/api/menu/:slug` | Menu by slug (hot-food, deli-meats, grocery) |
| GET | `/api/items?q=foo` | Search |
| POST | `/api/orders` | Place order |
| GET | `/api/orders` | All orders (last 50) |
| GET | `/api/orders/:id` | Order by ID |

---

## Kitchen Notifications

When `KITCHEN_CHAT_ID` is set, the server auto-sends orders to that Telegram group.
The group has: @Anthonysuperkitchen_bot added as a member.

To check order status for the kitchen (via curl or as KFS Lion):
```bash
curl http://localhost:3001/api/orders
```

---

## What's Running

- **Order Server:** ✅ localhost:3001 (background process)
- **Telegram Bot:** @Anthonysuperkitchen_bot (standalone, for kitchen group only)
- **KFS Lion (@her_mes_woo):** The main ordering interface for customers
- **Website:** GitHub Pages, live

---

## To Continue Working

Where to pick up:

1. **KFS Lion as ordering agent** — Use this playbook to answer customer questions about Anthony's menu, build carts, and place orders via the API
2. **Kitchen group setup** — Add @Anthonysuperkitchen_bot to the kitchen Telegram group so order alerts arrive
3. **WhatsApp notifications** — Set `WHATSAPP_WEBHOOK` env var for customer confirmations
4. **BioMenu admin panel** — Start Docker, seed MongoDB for the full admin dashboard
5. **n8n integration** — Wire `N8N_WEBHOOK_URL` for advanced workflows

---

## Store Info

```
📍 288 Kearny Ave, Kearny NJ 07032
📞 (201) 428-1745
🕐 7:00 AM – 9:00 PM daily
```

## Brand Identity

- **Theme:** Dark cyberpunk-bodega with neon green (#00ff41)
- **Logo:** Crowned shopping cart
- **Style:** Bodega + Kingdom fusion
- **KFS Lion Tone:** Friendly, efficient, kingdom-themed
