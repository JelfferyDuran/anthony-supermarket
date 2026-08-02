# 🍗 Anthony's Super Kitchen — Telegram Mini App

Standalone Telegram Mini App for browsing the menu, customizing items (meat /
side / premium add-ons), reviewing a cart, and handing off the order to the
existing SuperAnthbot via a deep link.

## Stack

- **Frontend:** Vite + React (built to `dist/`, served by the backend)
- **Backend:** Node/Express — order creation, order lookup, admin image-gen
- **Data:** `src/data/menu.json` — products, meats, sides, prices (no code
  changes needed to add products)
- **Bot handoff:** `https://t.me/SuperAnthbot?start=ORDER_<orderId>`

## Run

```bash
# Frontend dev server (hot reload) — proxies /api to :3002
cd apps/superkitchen
npm install
npm run dev        # http://localhost:5174

# Backend (orders + serves built frontend)
cd apps/superkitchen/server
npm install
npm start          # http://localhost:3002
```

Production: `npm run build` in `apps/superkitchen`, then the server serves the
built app from `dist/`.

## API

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/orders` | Create order → `{ orderId, total }` |
| GET | `/api/orders/:id` | Order lookup (bot deep link) |
| GET | `/api/orders` | List orders (admin) |
| POST | `/api/admin/products/:id/generate-image` | Server-side OpenAI image gen |
| GET | `/api/health` | Health + config summary |

Server-side validation enforces: items exist and are available, meat required
when `allowMeatChoice`, side required when `allowSideChoice`, price =
`basePrice + meat.priceDelta`, qty clamped 1–99.

## Bot integration (existing `server/index.js`)

The bot's `/start` handler now resolves `ORDER_<id>` deep links. Configure:

```env
MINIAPP_API_URL=http://localhost:3002   # on the bot server
MINIAPP_URL=http://localhost:3002       # shown in /start welcome
```

## Admin image generation

```bash
OPENAI_API_KEY=sk-...                   # server-side only, never in frontend
OPENAI_IMAGE_MODEL=gpt-image-2
ADMIN_TOKEN=optional-bearer-token       # guards the admin endpoint if set

curl -X POST http://localhost:3002/api/admin/products/yaroa-small/generate-image \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Yaroa in takeout container, realistic food photo"}'
```

Generated images save to `public/generated-images/<productId>.png` and the URL
is cached into `menu.json` (`imageUrl`) so the frontend reuses it. Real photos
can replace them by editing `imageUrl` in `menu.json`.

## Adding products

Edit `src/data/menu.json` — add an entry to `products` (id, category, name,
basePrice, imagePrompt, allowMeatChoice, allowSideChoice, available). No UI
code changes.
