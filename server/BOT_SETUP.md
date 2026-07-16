# 🤖 Anthony's Super Bot — Setup Guide

A Telegram bot for ordering from Anthony's Supermarket — kitchen hot food, deli, and grocery.

## Architecture

```
Customer → @AnthonySuperBot (Telegram)    → Order API → JSON store
        → Website (GitHub Pages)          → Order API → JSON store
                                              ↓
                                     n8n Webhook (optional)
                                        ↓           ↓
                                  Kitchen TG      WhatsApp
                                  Group            Customer
```

## Quick Start

### 1. Create the Telegram Bot

1. Open Telegram and message [@BotFather](https://t.me/botfather)
2. Send `/newbot`
3. Name: `Anthony's Super Bot`
4. Username: `AnthonySuperBot` (or similar)
5. Save the **token** — looks like `123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`

### 2. Configure & Run

```bash
cd ~/anthony-supermarket/server

# Install deps (already done)
npm install

# Set your bot token
export TELEGRAM_TOKEN="123456:ABC-DEF..."
export PORT=3001

# Start the server
npm start
```

The bot will be live at `@YourBotUsername` — try `/start`

### 3. Set Up Kitchen Notifications (Optional)

Create an n8n workflow:

1. **Webhook node** — POST, copy URL
2. Set `N8N_WEBHOOK_URL` env var
3. **Telegram node** — send order details to a private "Cocina" group
4. **WhatsApp node** — notify customer their order is received

## Bot Commands

| Command | Description |
|---------|-------------|
| `/start` | Welcome & main menu |
| `/hotfood` | Browse hot food menu |
| `/deli` | Browse deli & meats |
| `/grocery` | Browse grocery items |
| `/search <item>` | Search products |
| `/cart` | View your cart |
| `/checkout` | Place your order |
| `/clear` | Clear cart |
| `/help` | All commands |

## Deployment Options

### Option A — Run on Desktop (Simple)

```bash
cd ~/anthony-supermarket/server
TELEGRAM_TOKEN=xxx npm start
```

Available at `http://localhost:3001` + Telegram bot active.
Use [Tailscale Serve](https://tailscale.com/kb/1311/serve) to expose the API.

### Option B — Docker

```bash
cd ~/anthony-supermarket
docker build -t anthonys-bot server/
docker run -d -p 3001:3001 -e TELEGRAM_TOKEN=xxx anthonys-bot
```

### Option C — VPS (Production)

```bash
git clone https://github.com/JelfferyDuran/anthony-supermarket.git
cd anthony-supermarket/server
npm install
npm install -g pm2
TELEGRAM_TOKEN=xxx pm2 start index.js --name anthonys-bot
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `TELEGRAM_TOKEN` | ✅ Yes | — | Bot token from @BotFather |
| `PORT` | ❌ No | 3001 | HTTP server port |
| `N8N_WEBHOOK_URL` | ❌ No | — | n8n webhook for order dispatch |
| `MENU_DATA_PATH` | ❌ No | `../apps/menu/scripts/anthonys-seed.json` | Custom menu data path |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/menu` | Full menu JSON |
| GET | `/api/menu/:slug` | Menu by slug (hot-food, deli-meats, grocery) |
| GET | `/api/items?q=foo` | Search items |
| POST | `/api/orders` | Place an order |
| GET | `/api/orders` | Recent orders |
| GET | `/api/orders/:id` | Order status |

## Website

The immersive Three.js site at `https://jelfferyduran.github.io/anthony-supermarket/`
talks to the API at `http://localhost:3001`. For production, set up a reverse proxy
(Caddy, Nginx, Cloudflare Tunnel) to serve both.
