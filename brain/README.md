# Brain Workspace

This directory is the writable knowledge workspace inside the Anthony's Supermarket Obsidian vault.

## Structure
- `00 - Anthony HQ.md` — home/dashboard
- `Inbox/` — unsorted captures and ideas
- `Decisions/` — durable decisions, tradeoffs, and rationale
- `Sessions/` — lightweight session notes and handoffs
- `Attachments/` — small supporting files only

## Source-of-truth model
- **Obsidian/repo Markdown** = shared working brain
- **GitHub** = version history, backup, collaboration, review
- **Supabase/Vercel/Render/Telegram** = live runtime truth

Do not copy live secrets or customer PII into notes. If live infrastructure disagrees with a note, verify live state and then correct the note through Git.
