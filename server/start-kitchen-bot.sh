#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Anthony's SuperKitchen bot — standalone launcher
# ─────────────────────────────────────────────────────────────────────────────
# Runs the kitchen/ordering Telegram bot (menu, cart, checkout, order status)
# on its OWN token, separate from the invoice bot and the KFS home bot.
#
# The kitchen bot code lives in server/index.js (it also serves the hub API +
# static pricing hub on PORT). This launcher starts it with KITCHEN_BOT_TOKEN
# as TELEGRAM_TOKEN so ONLY the kitchen bot logic runs against that token.
#
# Env:
#   KITCHEN_BOT_TOKEN  (BotFather token for @Anthonysuperkitchen_bot — REQUIRED)
#   KITCHEN_CHAT_ID    (optional — kitchen group for order threads)
#   MINIAPP_API_URL    (optional — superkitchen mini-app order backend)
#   PORT               (optional, default 8810 — hub API + static)
#
# All other env comes from server/.env + /opt/data/.env.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

if [[ -z "${KITCHEN_BOT_TOKEN:-}" ]]; then
  echo "✗ KITCHEN_BOT_TOKEN not set — kitchen bot won't start" >&2
  exit 1
fi

set -a
source .env 2>/dev/null || true
source /opt/data/.env 2>/dev/null || true
set +a

# The kitchen bot token overrides whatever TELEGRAM_TOKEN would be.
export TELEGRAM_TOKEN="${KITCHEN_BOT_TOKEN}"
# Kitchen bot owns the hub API port; invoice bot doesn't touch it.
export PORT="${PORT:-8810}"

exec node index.js
