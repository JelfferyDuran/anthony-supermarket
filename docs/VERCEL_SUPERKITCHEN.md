# Anthony's Super Kitchen — Vercel deployment target

The Super Kitchen Mini App should be deployed as its own Vercel project with the project Root Directory set to `apps/superkitchen`.

## Required project settings

- Framework preset: Vite
- Root Directory: `apps/superkitchen`
- Build command: `npm run build --workspaces=false`
- Output directory: `dist`
- Production branch: set only after Phase 1 is approved; use `phase1-foundation-security` for preview testing first

`apps/superkitchen/vercel.json` contains the static security headers and build/output configuration.

## Backend

The browser talks to the Supabase Edge Function at `https://cbpdiiyzzmbavsymjysb.supabase.co/functions/v1/superkitchen` unless `VITE_API_URL` is explicitly configured.

Never place `SUPABASE_SERVICE_ROLE_KEY`, a Telegram bot token, or any other server secret in Vercel browser environment variables. The Supabase publishable key may be used client-side where required.

## Telegram test gate

Before promoting a Vercel preview to production:

1. Rotate the historical Telegram BotFather token.
2. Store the fresh token only in the Supabase Edge Function secret store and the actual Telegram bot host.
3. Launch the Vercel preview from Telegram and place one real test order.
4. Confirm `telegramVerified=true` at order creation.
5. Confirm the bot receipt contains no customer PII.
6. Confirm the order appears in the authenticated KDS.
7. Confirm staff status transitions are written to `order_audit_log`.

Do not replace the existing GitHub Pages supermarket root with the Super Kitchen Vercel deployment. They are separate surfaces.
