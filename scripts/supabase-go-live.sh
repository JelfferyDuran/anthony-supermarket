#!/usr/bin/env bash
# SuperKitchen go-live — one command.
#   Sets the function secrets and deploys the patched edge function.
#   Run from anywhere:  bash scripts/supabase-go-live.sh
set -euo pipefail
cd "$(dirname "$0")/.."

export PATH="$PATH:/c/Users/Jayto/AppData/Roaming/npm"
REF=cbpdiiyzzmbavsymjysb

echo "==> 1/4  Supabase auth"
if supabase projects list >/dev/null 2>&1; then
  echo "     already logged in"
else
  echo "     A browser will open. Authorize, then come back to this window."
  supabase login
fi

echo "==> 2/4  Staging secrets from server/.env"
# NOTE: keep this RELATIVE — native Windows python/supabase can't read MSYS "/c/..." paths.
TMP=".secrets.tmp"
trap 'rm -f "$TMP"' EXIT
python - "$TMP" <<'PY'
import sys, re
env = open("server/.env", encoding="utf-8").read()
def get(name):
    m = re.search(rf'^{name}\s*=\s*(.+)$', env, re.M)
    return m.group(1).strip().strip('"').strip("'").strip() if m else ""
tg  = get("TELEGRAM_BOT_TOKEN") or get("TELEGRAM_TOKEN")
kid = get("KITCHEN_CHAT_ID")
assert tg and kid, "missing TELEGRAM_TOKEN / KITCHEN_CHAT_ID in server/.env"
with open(sys.argv[1], "w", encoding="utf-8", newline="\n") as f:
    f.write(f"KITCHEN_CHAT_ID={kid}\n")
    f.write(f"TELEGRAM_BOT_TOKEN={tg}\n")
print("     staged: KITCHEN_CHAT_ID, TELEGRAM_BOT_TOKEN")
PY

echo "==> 3/4  Setting function secrets on $REF"
supabase secrets set --project-ref "$REF" --env-file "$TMP"

echo "==> 4/4  Deploying superkitchen (server-side bundle, no Docker needed)"
supabase functions deploy superkitchen --project-ref "$REF" --use-api

echo
echo "==> Verify"
supabase secrets list --project-ref "$REF"
echo
echo "DONE. Send a test order from the Mini App and watch the kitchen group."
