# 2026-08-10 - Super Kitchen production readiness remediation

Branch: `superkitchen-prod-readiness-audit-fixes`

This branch addresses the production-readiness audit without deploying or mutating production data.

Changes:
- Mini App loads Telegram Web App SDK so `initData` can reach the Supabase order function.
- Render bot service moves from legacy `server/` to isolated `server/bot-v2/`.
- Bot v2 can send kitchen group alerts through a token-protected notification-only endpoint.
- Telegram status callbacks and direct database writes are intentionally absent from bot v2.
- Mini App server order routes are retired with `410`; Supabase remains source of truth.
- CI guards block missing SDK, legacy Render root, public order lists, direct order table access, unaudited status writes, and bot callback mutation regressions.

Not verified:
- GitHub Actions result.
- Controlled Telegram Mini App order with `telegramVerified=true`.
- Audited KDS transition entries after that controlled order.

Do not merge or deploy until those checks are complete.
