# Hermes Observer Access

Purpose: give Hermes useful operational visibility without giving it Supabase service-role credentials, database bypass capability, or production mutation authority.

## Architecture

`Hermes VPS -> Supabase Auth user with app_metadata.role=agent_observer -> superkitchen-ops Edge Function -> read-only operational summary`

The observer identity is intentionally different from `kitchen`, `manager`, and `admin` staff identities.

## What Hermes may read
- API/database reachability
- active order count and counts by state
- oldest active-order age and order reference
- order count and non-cancelled gross sales for the last 24 hours
- pickup vs delivery counts
- audit-transition counts
- up to 10 recent order references with status, total, timestamps, and age

## What Hermes may never receive from this endpoint
- customer names
- phone numbers
- delivery addresses
- notes
- Telegram user IDs or Telegram auth payloads
- staff passwords
- Supabase service-role keys
- mutation endpoints

## Required role
The dedicated Supabase Auth account must have the role stored in protected app metadata:

```json
{
  "role": "agent_observer"
}
```

Do not store authorization roles in user-editable metadata.

`manager` and `admin` are also allowed to call the observer endpoint for diagnostics.

## Hermes VPS environment
Store secrets only in a protected server-side environment or secret manager. Never commit these values.

Required runtime variables for `scripts/hermes-ops-check.mjs`:

```text
SUPABASE_URL=https://cbpdiiyzzmbavsymjysb.supabase.co
SUPABASE_PUBLISHABLE_KEY=<publishable/anon key>
HERMES_OBSERVER_EMAIL=<dedicated observer email>
HERMES_OBSERVER_PASSWORD=<dedicated observer password>
```

Protect any local environment file with owner-only permissions, for example `chmod 600`.

## Smoke test

```bash
node scripts/hermes-ops-check.mjs
```

Expected result: JSON with `ok: true`, `mode: read-only`, operational counts, and no customer PII.

## Security rules
- Never give Hermes the Supabase service-role key for this workflow.
- Never use a human admin account as the permanent machine identity.
- Never commit observer credentials.
- If the observer credential is suspected compromised, disable/delete that Auth user and create a new observer identity.
- Production mutations still require the normal reviewed branch/PR/deployment path.
- Hermes must read `AGENTS.md` and the agent-context files before making project changes.
