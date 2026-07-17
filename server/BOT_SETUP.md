# 🤖 Anthony's Super Bot — Setup Guide

A Telegram bot for ordering from Anthony's Supermarket — kitchen hot food, deli, and grocery.

## Architecture

```
Customer → @AnthonySuperBot (Telegram)    → Order API → JSON store
        → Website (GitHub Pages)          → Order API → JSON store
                                              ↓
                          ┌──────────────────┼──────────────────┐
                          ↓                  ↓                  ↓
                  Kitchen TG Group    WhatsApp Customer     n8n (optional)
                  (KITCHEN_CHAT_ID)   (WHATSAPP_WEBHOOK)   (N8N_WEBHOOK_URL)
```

## Quick Start

### 1. Create the Telegram Bot

1. Open Telegram and message [@BotFather](https://t.me/botfather)
2. Send `/newbot`
3. Name: `Anthony's Super Bot`
4. Username: `AnthonySuperBot` (or similar — make it \_bot)
5. Save the **token** — looks like `123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`

### 2. Configure & Run

```bash
cd ~/anthony-supermarket/server

# Install deps (already done)
npm install

# Set your bot token
export TELEGRAM_TOKEN="123456:ABC-DEF..."

# Start the server
npm start
```

The bot will be live — try `/start`

### 3. 🔔 Set Up Kitchen Notifications (No n8n Needed)

The bot can send order alerts directly to a private Telegram group. No extra services needed.

**Step 1:** Create a private Telegram group named "Cocina 🍳"
**Step 2:** Add your bot (`@AnthonySuperBot`) to the group as an admin
**Step 3:** Send any message in the group (so the bot can see it)
**Step 4:** Get the group Chat ID:

```bash
# Run the server with your token, then send a message in the kitchen group.
# The server logs every message's chat ID:
# Or visit in browser while server is running:
curl https://api.telegram.org/bot<TELEGRAM_TOKEN>/getUpdates
```

Look for the object where `chat.title` matches your group — the `chat.id` will be a negative number like `-1001234567890`.

**Step 5:** Restart with kitchen notifications:

```bash
export KITCHEN_CHAT_ID="-1001234567890"
npm start
```

Now every order automatically alerts the kitchen group with:
- Items ordered with quantities and prices
- Pickup vs Delivery
- Customer name, phone, and delivery address
- Order timestamp

**Step 6:** Kitchen staff can use `/status` to see all pending orders and mark them ready.

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
| `/status` | 👨‍🍳 Kitchen order board (kitchen group only) |
| `/help` | All commands |

## Kitchen Workflow

1. **Order comes in** → Kitchen group gets a formatted alert with all details
2. **Kitchen starts cooking** → Staff hits "✅ Mark Ready" button in `/status`
3. **Order ready** → Status changes to "ready" (future: auto-notify customer)
4. **Done** → Order moves off the pending board

## Optional: WhatsApp & n8n

### WhatsApp Customer Confirmations

Set up a webhook URL that accepts POST with:
```json
{
  "to": "+12015551234",
  "message": "...",
  "orderId": "ABC12345"
}
```

Use:
- **Twilio** for SMS/WhatsApp API
- **WATI / ChatAPI** for WhatsApp Business
- **External n8n or Zapier** webhook

```bash
export WHATSAPP_WEBHOOK="https://your-webhook.url/whatsapp"
```

### n8n Advanced Dispatch

For full workflow automation (email receipts, inventory tracking, analytics):

```bash
export N8N_WEBHOOK_URL="https://your-n8n-instance/webhook/anthonys-orders"
```

## Deployment Options

### Option A — Run on Desktop (Simple)

```bash
cd ~/anthony-supermarket/server
TELEGRAM_TOKEN=xxx KITCHEN_CHAT_ID=-100xxx npm start
```

Available at `http://localhost:3001` + Telegram bot active.
Use [Tailscale Serve](https://tailscale.com/kb/1311/serve) to expose the API.

### Option B — Docker

```bash
cd ~/anthony-supermarket
docker build -t anthonys-bot server/
docker run -d -p 3001:3001 \
  -e TELEGRAM_TOKEN=xxx \
  -e KITCHEN_CHAT_ID=-100xxx \
  anthonys-bot
```

### Option C — VPS (Production)

```bash
git clone https://github.com/JelfferyDuran/anthony-supermarket.git
cd anthony-supermarket/server
npm install
npm install -g pm2
TELEGRAM_TOKEN=xxx KITCHEN_CHAT_ID=-100xxx pm2 start index.js --name anthonys-bot
pm2 save
pm2 startup
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `TELEGRAM_TOKEN` | ✅ Yes | — | Bot token from @BotFather |
| `KITCHEN_CHAT_ID` | ❌ No | — | Telegram group ID for kitchen alerts (negative number) |
| `WHATSAPP_WEBHOOK` | ❌ No | — | URL for WhatsApp customer notification |
| `N8N_WEBHOOK_URL` | ❌ No | — | n8n webhook for order dispatch |
| `PORT` | ❌ No | 3001 | HTTP server port |
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
