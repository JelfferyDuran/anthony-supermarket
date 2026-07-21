# Anthony's order server

This small Express service receives website orders and sends kitchen notifications through the Telegram bot.

## Required environment

- `TELEGRAM_TOKEN`: token from BotFather. Never commit it.
- `KITCHEN_CHAT_ID`: the Telegram group or chat where kitchen orders should appear.
- `ALLOWED_ORIGINS`: the deployed website origin.

The public bot link is [@SuperAnthbot](https://t.me/SuperAnthbot).

## Run locally

```bash
cd server
npm install
copy .env.example .env
npm start
```

The website uses `http://localhost:3001` automatically on localhost. For GitHub Pages, set `window.ANTHONY_API_URL` to the deployed server URL or open the site with an `?api=https://your-server.example.com` query parameter.

## Endpoints

- `GET /api/health`
- `GET /api/menu`
- `POST /api/orders`
- `GET /api/orders/:id`

Orders are stored in `server/data/orders.json` and catalog prices are validated server-side before an order is accepted.
