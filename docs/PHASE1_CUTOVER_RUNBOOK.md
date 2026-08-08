# Anthony's Super Kitchen — Phase 1 Cutover Runbook

This runbook is the production sequence for PR #13. Keep the PR draft until the pre-merge gates below are complete.

## Never do these

- Never reuse the Telegram token that appears in repository history.
- Never paste the fresh Telegram token into GitHub, source files, browser variables, Vercel client variables, tickets, logs, or chat.
- Never deploy the delivery-enforcing Edge Function before the new checkout UI is available to customers.
- Never point `anthonys-order-api` back at the legacy root `server/index.js` as a normal production configuration. Its dependency/runtime cleanup is tracked separately.

## A. Pre-merge gates — no customer code changes yet

1. **Rotate the Telegram token in BotFather.**
   - Treat the historical value as permanently compromised.
   - Do not reuse it even for testing.
2. **Install the fresh token directly in server-side secret stores.**
   - Supabase Edge Function secret: `TELEGRAM_BOT_TOKEN`
   - Render service secret: `TELEGRAM_TOKEN`
   - Do not copy the token into this repository.
3. **Confirm the actual Render deployment/service for `anthonys-order-api`.**
   - Confirm its current public service URL and that the service is linked to this repository/Blueprint.
   - Do not change the start command yet unless the fresh token is already installed.
4. **Provision the first Supabase Auth staff account.**
   - Assign exactly one approved server-side `app_metadata.role`: `kitchen`, `manager`, or `admin`.
   - Do not add a public staff-registration flow.
5. Confirm PR #13 is still mergeable and all Super Kitchen CI jobs are green.

## B. Controlled code cutover

1. Merge PR #13 only after all pre-merge gates are complete.
2. Confirm GitHub Pages serves the new tracked `apps/superkitchen/dist/` build.
   - Telegram SDK/CSP must be present.
   - Delivery checkout must require phone + address.
   - `?staff=1` / `#staff` must show the protected staff sign-in screen.
3. Confirm the Render Blueprint deploys `anthonys-order-api` from `server/bot-v2`.
   - Build: `npm ci`
   - Start: `npm start`
   - Health: `/api/health`
   - Expected health fields include `botEnabled: true`, `telegramTransport: native-node-long-polling`, and `orderStorage: supabase-edge-function-only`.
4. Only after the new checkout UI is live, deploy the PR #13 `superkitchen` Edge Function source.
   - This enables server-side delivery phone/address enforcement while keeping the hardened baseline.

## C. Live Telegram smoke test

Place one small real test order from the actual Telegram Mini App.

Verify all of the following before declaring Phase 1 complete:

- order creation succeeds
- response reports `telegramVerified=true`
- a 16-character random order reference is returned
- database order exists once, with authoritative server pricing
- delivery order stores phone + address when delivery is selected
- public/bot receipt exposes no customer PII, address, notes, or Telegram identity
- the authenticated KDS sees the order
- staff can move the order through the permitted state sequence
- `order_audit_log` records the staff transition
- direct anonymous order-board access remains blocked

Use a clearly identified test order and complete/cancel it after verification so it does not remain in the live kitchen queue.

## D. Rollback

If the customer Mini App fails after merge:
- revert the PR merge or restore the previous known-good Pages build.

If the new Edge Function fails:
- redeploy the previously verified hardened v25 source.
- do not restore the historical Telegram token.

If bot v2 fails:
- stop the new bot process or roll Render back to its previous deployment revision while investigating.
- do not expose order data through Telegram as a workaround.
- do not restore public `/api/orders`, Telegram `/status` order enumeration, or Telegram status-mutation callbacks.

## E. Post-cutover

- Keep #14 for the separate Vite/esbuild/nanoid build-tool upgrade.
- Keep #15 for retirement/modernization of the legacy root `server/` runtime.
- Re-run Supabase security/performance advisors after any later database/schema change.
