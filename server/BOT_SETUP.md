# Anthony's Super Bot — Setup Guide

Telegram bot for ordering from Anthony's Supermarket.

## Architecture

Customer -> @AnthonySuperBot -> Order API (port 3001) -> JSON store
                              -> Kitchen TG Group notifications
                              -> WhatsApp webhook (optional)
                              -> n8n webhook (optional)

Website (v4): https://jelfferyduran.github.io/anthony-supermarket/
  - Full bilingual EN/ES, 93 products, cart, checkout, search

## Quick Start

1. Create bot via @BotFather
2. Save token
3. cd ~/anthony-supermarket/server && npm install
4. export TELEGRAM_TOKEN="your_token"
5. npm start

## Kitchen Notifications

1. Create private TG group "Cocina"
2. Add bot as admin
3. Send a message in the group
4. curl https://api.telegram.org/bot<TOKEN>/getUpdates
5. Copy chat.id (negative number)
6. export KITCHEN_CHAT_ID="-100xxx" && npm start

## Bot Commands

/start - Welcome + menu
/menu - Browse products
/cart - View cart
/order - Place order
/hours - Store hours
/contact - Location and phone

## API Endpoints

GET /api/menu - Full menu
GET /api/orders - All orders
POST /api/orders - Place order
GET /api/orders/:id - Order by ID

## ENV Variables

PORT (default 3001)
TELEGRAM_TOKEN (required)
KITCHEN_CHAT_ID (optional - kitchen alerts)
WHATSAPP_WEBHOOK (optional)
N8N_WEBHOOK_URL (optional)
