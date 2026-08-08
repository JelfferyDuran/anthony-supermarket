# Anthony's Super Kitchen — Vercel deployment target

The current GitHub Pages Mini App remains the primary cutover target because its tracked `dist/` is now reproducible and CI-verified. Vercel is an optional isolated preview/hosting target and must not replace the Anthony's Supermarket Pages root.

## Project settings

- Framework preset: Vite
- Root Directory: `apps/superkitchen`
- Build command: `npm run build --workspaces=false`
- Output directory: `dist`
- Use `phase1-cutover-v3` for preview testing before any production promotion.

`apps/superkitchen/vercel.json` contains static security headers and build/output configuration.

## Backend

The browser talks to the Supabase Edge Function at `https://cbpdiiyzzmbavsymjysb.supabase.co/functions/v1/superkitchen` unless `VITE_API_URL` is explicitly configured.

Never place `SUPABASE_SERVICE_ROLE_KEY`, a Telegram bot token, or any other server secret in Vercel browser environment variables. The Supabase publishable key may be used client-side where required.

## Telegram test gate

Before any production cutover:

1. Rotate the historical Telegram BotFather token.
2. Store the fresh token only in the Supabase Edge Function secret store and the actual Telegram bot host.
3. Launch the approved Mini App build from Telegram and place one real test order.
4. Confirm `telegramVerified=true` at order creation.
5. Confirm the bot receipt contains no customer PII.
6. Confirm the order appears in the authenticated KDS.
7. Confirm staff status transitions are written to `order_audit_log`.

Do not replace the existing GitHub Pages supermarket root with the Super Kitchen Vercel deployment. They are separate surfaces.
