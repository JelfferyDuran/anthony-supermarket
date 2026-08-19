# Pricing Hub V2 Upgrade: Handoff to Hermes

**Status**: Four binding owner decisions implemented, all tests passing (90 server, 30 SQL, 83 hub verifier), code committed to branch `claude/pricing-hub-v2-upgrade-cyu5dm`, tree clean and ready for production deployment.

**Handoff Date**: 2026-08-19  
**Previous Context**: All decisions locked in `PRICING_HUB_V2_UPGRADE.md` §1b (owner, 2026-08-19)

---

## 1. What's Complete

### Decision 1: 70% Markup Rule (1.70× multiplier)
- **Status**: Implemented and committed
- **Files Changed**: 
  - `apps/pricing-hub/index.html` — 16 retail prices updated (+$1.00 each)
  - `server/pricing-engine.js` — unified rule: all retail = cost × 1.70, snapped to .99
  - `server/pricing-engine.test.js` — test added: hub preview markup always equals 70% when multiplier is 1.70
  - `scripts/verify-pricing-hub.js` — 83 verification checks (all pass)
  - `supabase/seed/pricing_hub_seed.sql` — regenerated at 70%
- **Retail Impact**: 16 items increased $1.00 each; projected +$420 revenue on current stock
- **Tests**: All passing; retail prices verified for consistency with formula

### Decision 2: Keep the Iframe
- **Status**: No changes needed; iframe strategy already satisfied in existing code

### Decision 3: Gemini Free-Tier OCR Provider
- **Status**: Implemented with webhook fallback strategy
- **Files Created**:
  - `server/pricing-ocr.js` — provider selection, Gemini API calls (key in `x-goog-api-key` header, not URL)
  - `server/pricing-ocr.test.js` — 14 tests (all passing)
- **Provider Precedence**: Explicit `PRICING_OCR_WEBHOOK_URL` wins if set (operator's choice); falls back to in-process Gemini if `GEMINI_API_KEY` is configured
- **Security Note**: Gemini API key travels as header, never in URL (prevents log/error exposure)
- **Webhook Integration**: Hermes's ocr-webhook.js service proven against real Family Food invoice (16/16 lines, $1,239.19 exact)

### Decision 4: Multi-Channel Intake (Hub + Telegram + WhatsApp)
- **Status**: Implemented with per-channel allowlists and sender fingerprinting
- **Files Created**:
  - `server/pricing-intake.js` — channel validation, per-channel allowlists, sender normalization
  - `server/pricing-intake.test.js` — 16 tests (all passing)
  - `supabase/migrations/20260819234500_add_intake_channel_provenance.sql` — new columns on `pricing_invoices`
- **Key Behavior**: 
  - Telegram: allowlist from `HERMES_CHAT_ID` + `PRICING_TELEGRAM_CHAT_IDS`
  - WhatsApp: allowlist from `PRICING_WHATSAPP_NUMBERS` (supports multiple number formats)
  - Sender stored as `channel:sha256(sender)[:12]` fingerprint (privacy-preserving)
  - Reply message: "Nothing is priced yet: every line is waiting for review in the Pricing Hub"

---

## 2. ⚠️ CRITICAL TIMING: OS Multiplier Sync

**The 16 retail price increases (+$1.00 each) will be REVERTED unless OS multiplier flips to 1.70 in the same deployment window.**

### What to do:
1. **Identify**: Kingdom OS collector hardcodes `1.65` multiplier (check both write-back endpoint and sync logic)
2. **Change to**: `1.70` (must match hub decision)
3. **Timing**: Deploy this change **before** next scheduled OS sync or immediately after hub prices go live — do not allow a gap where hub shows 70% but OS still calculates 65%
4. **Validation**: After OS flip, run next sync and confirm retail prices remain at +$1.00 levels (do not revert to old prices)

---

## 3. Production Deployment Steps

### Phase 1: Database Migrations (in order)

Run these Supabase migrations in sequence. They are idempotent but depend on ordering:

```bash
# Migration 1: invoice pricing pipeline (base tables)
supabase db push 20260812013000_add_invoice_pricing_pipeline.sql

# Migration 2: reconcile pricing hub dataset (align inventory)
supabase db push 20260819213000_reconcile_pricing_hub_dataset.sql

# Migration 3: POS sales and financials (add costing history)
supabase db push 20260819230000_add_pos_sales_and_financials.sql

# Migration 4: intake provenance (channel tracking)
supabase db push 20260819234500_add_intake_channel_provenance.sql
```

### Phase 2: Seed Data

After all migrations pass:

```bash
node scripts/seed-pricing-from-hub.js --apply
```

This regenerates the hub at 70% markup and commits the seed transaction.

### Phase 3: Environment Configuration

Ensure these are set in production before deploying server code:

```bash
# Gemini OCR (if using in-process provider)
GEMINI_API_KEY=<your-api-key>
GEMINI_MODEL=gemini-2.5-flash

# OR Webhook OCR (if using Hermes's service)
PRICING_OCR_WEBHOOK_URL=https://your-ocr-webhook-host/extract
PRICING_OCR_WEBHOOK_TOKEN=<shared-secret>
OCR_MODEL=google/gemini-2.5-flash
OCR_PORT=8799

# Multi-channel intake
PRICING_INTAKE_BRIDGE_KEY=<shared-secret>
PRICING_WHATSAPP_NUMBERS=1201555010,12015550101  # comma-separated
PRICING_TELEGRAM_CHAT_IDS=<chat-id-list>
HERMES_CHAT_ID=<hermes-chat-id>
```

**Note**: Explicit `PRICING_OCR_WEBHOOK_URL` takes precedence over `GEMINI_API_KEY`. Both can be set (webhook for primary, Gemini as fallback).

### Phase 4: Server Deploy

Deploy `server/` code to production. All tests have passed locally:
- 90 server tests ✓
- 30 SQL constraint checks ✓
- 83 hub verifier checks ✓

---

## 4. Validation Checklist Before Go-Live

- [ ] **OS Multiplier Sync**: Confirm `1.70` is deployed and synced before hub prices go live
- [ ] **Database Migrations**: All 4 migrations applied successfully; no rollback errors
- [ ] **Seed Data**: Pricing hub regenerated at 70%; spot checks confirm new retail values (e.g., Van Camps 3.99, Mama Tere Papa Criolla 9.99)
- [ ] **OCR Provider Test**: 
  - If webhook: submit test invoice to `POST /intake/hub`, confirm extraction succeeds
  - If Gemini: confirm `GEMINI_API_KEY` is set and API is accessible
- [ ] **Intake Channel Test**: Submit test intake to each channel (hub, Telegram, WhatsApp); confirm allowlist works and `source_channel` + `source_sender_ref` are recorded
- [ ] **Real NRS Export Validation** (if available): Run `node server/pos-import.js <path-to-nrs-export>` and confirm parser matches live column names and produces valid cost history
- [ ] **Browser Live Test**: Open Pricing Hub, verify slider defaults to 70%, modify a cost value, confirm retail recalculates to 70% with .99 rounding

---

## 5. Remaining Tasks

### Real NRS Export Validation
When you obtain the live NRS export file, run:

```bash
node server/pos-import.js <path-to-export.xlsx>
```

This parser is intentionally mirrored from `nrs/nrs-analyze.py` so the dashboard and daily briefing agree on row meaning. Tested against fixtures; needs real file to confirm live column names match expectations.

**Expected behavior**:
- Parses vendor/SKU/cost columns
- Stores immutable cost history (cost in effect on sale date, walked back through price changes)
- Computes costed revenue (unit cost × qty sold)
- Validates no zero-cost sales (except reference items)

### Browser Live Test (Optional but Recommended)
After deployment, open the Pricing Hub in a browser:

1. Verify slider defaults to 70%
2. Enter a new cost value (e.g., cost $10.00 → retail should be $17.99)
3. Verify .99 rounding applies consistently
4. Check that old prices (from before markup change) render correctly
5. Monitor console for errors (expect favicon 404 is normal; watch for pricing calculation errors)

---

## 6. Decisions Already Locked

These decisions are finalized and should not be revisited without owner approval:

| Decision | Choice | Lock Date | Rationale |
|----------|--------|-----------|-----------|
| Markup rule | 70% (1.70×) | 2026-08-19 | Unified rule: all retail = cost × 1.70, snapped to .99 |
| Iframe strategy | Keep existing | 2026-08-19 | No rearchitecting; iframe scope/sandbox as-is |
| OCR provider | Gemini free-tier | 2026-08-19 | Free API; webhook fallback if needed; in-process Gemini for local dev |
| Intake channels | Hub + Telegram + WhatsApp | 2026-08-19 | Per-channel allowlists; sender fingerprinting for privacy |

---

## 7. Contact Points

- **Pricing Hub V2 decisions**: See `PRICING_HUB_V2_UPGRADE.md` §1b (owner approval document)
- **Test results**: All 90 server tests, 30 SQL checks, and 83 hub verifier checks pass locally. Run `npm test` to confirm
- **PR History**: Branch `claude/pricing-hub-v2-upgrade-cyu5dm` contains three commits:
  - Your OCR webhook service (Hermes)
  - Merge + security fix (Gemini key in header, not URL)
  - Four binding decisions implementation (Claude)

---

## 8. Quick Start Checklist

1. **Pull latest**: `git fetch origin claude/pricing-hub-v2-upgrade-cyu5dm && git checkout claude/pricing-hub-v2-upgrade-cyu5dm`
2. **Run tests**: `npm test` (expect 90/90 server tests passing)
3. **Review changes**: `git log --oneline -3` (confirm three commits present)
4. **Flip OS multiplier**: Update Kingdom OS collector to `1.70` before deployment window
5. **Deploy migrations**: Run 4 Supabase migrations in order
6. **Seed data**: `node scripts/seed-pricing-from-hub.js --apply`
7. **Deploy server**: Push `server/` code to production
8. **Validate**: Test OCR, intake channels, and browser rendering at 70%

---

**End of Handoff**

All code is ready for production. The critical path is: OS multiplier sync → DB migrations → seed → server deploy → validation.
