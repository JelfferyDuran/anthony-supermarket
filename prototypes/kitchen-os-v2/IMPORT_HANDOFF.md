# Anthony's Kitchen OS v2 — staging import handoff

## Scope and current status
This is an **isolated development branch** for importing the locally generated Kitchen OS v2 prototype. The complete tested archive was generated in the ChatGPT conversation as `anthonys-kitchen-os-v2-working.zip` (12 files, including two JPEG source photographs). **The ZIP itself has not been committed to GitHub**; this document is the staging handoff for Hermes to import the exact source files, preserving image binaries.

## Required destination
Import the extracted archive into `prototypes/kitchen-os-v2/` on branch `feature/kitchen-os-v2-staging`:
- `README.md`, `HERMES_HANDOFF.md`
- `server.py`, `index.html`, `studio.js`, `styles.css`
- `tv.html`, `tv.js`, `tv.css`
- `data/seed.json`
- `assets/mangu-large-original.jpg`
- `assets/picadera-original.jpg`

**Do not commit** `__pycache__`, `data/draft.json`, `data/approved.json`, `data/approved-v*.json`, tokens, or runtime artifacts. Add an appropriate `.gitignore` under the prototype if needed.

## Local verification (Windows 11)
1. Download the archive from the same ChatGPT conversation and extract it.
2. Copy all 12 files into the destination directory on this branch.
3. Run `py -3 server.py` from inside the prototype folder.
4. Open `http://127.0.0.1:8765/` and test editor, draft saving, approval snapshots, and three TV previews.
5. Confirm no process binds port 8080 and no calls to the production KFS `/set` endpoint.
6. Commit the imported files to this branch and request owner review. Do not merge or deploy automatically.

## Production safety
- This prototype is local-only and binds to `127.0.0.1:8765`, not the store LAN.
- No auth; do not expose to network or internet.
- Preview approval is **not** production authorization. No live KFS, POS, DoorDash, or Supabase integration.
- The original picadera image shows a rectangular tray, not an approved round 7-inch/9-inch product.
- Keep unapproved salad pricing and ambiguous menu variants unpublished.
- Keep original photos unchanged; edited assets require owner review.

## Development direction
Build owner-reviewed menu price book, container-specific variants, approved authentic food photography, and a coordinated three-screen visual system. Add authenticated publication adapter, audit trail, rollback, and one-TV canary only after owner approval. Keep Hermes as execution agent and owner/ChatGPT as design reviewers.
