# menu-images/ — Anthony's menu photo workflow

One folder that runs the whole food-photo operation for the order app.

## Layout

```
menu-images/
  README.md             <- this file (how the workflow runs)
  IMAGE_PROMPT.md       <- the paste-ready prompt for ChatGPT
  image-needs-list.md   <- checklist: every dish that needs a photo + status
  menu-images.json      <- same list, machine-readable (for the app later)
  raw/                  <- drop ORIGINAL photos here (taken or uploaded)
  enhanced/             <- FINAL images go here as <slug>.jpg (1024×1024)
```

## How to work it (two flows)

**Flow A — upload in chat (simplest):**
1. Take/upload the dish photo on your phone.
2. Open ChatGPT, paste `IMAGE_PROMPT.md`, attach the photo(s).
3. Save each finished image as `enhanced/<slug>.jpg`
   (slug = the name in the checklist, e.g. `mangu.jpg`).

**Flow B — from the repo folder:**
1. Drop originals into `menu-images/raw/`
   (name them `<slug>-raw.jpg` if you can, e.g. `mangu-raw.jpg`).
2. Open ChatGPT (with the repo connected, or upload the raws).
3. Paste `IMAGE_PROMPT.md` and tell it which slugs to process.
4. Save finished images to `menu-images/enhanced/<slug>.jpg`.

**Honest note:** ChatGPT does not watch GitHub folders on its own —
someone (you) pastes the prompt and points it at the folder or uploads the
photos. The folder + the prompt file just make that a one-paste job instead
of re-explaining everything each time.

## Status flow

`NEEDS PHOTO` → take it or upload it → file lands in `raw/` (mark `U`) →
ChatGPT enhances → final lands in `enhanced/` (mark `E`).
No photo at all? Mark `G` and let ChatGPT generate from the dish name.

## Rules

- Square 1024×1024, `<slug>.jpg`, no text/logos/watermarks in images.
- Prices are NOT part of this — images only. Prices stay off the app
  until Noel + Ridnell agree every price and serving.
- Update `image-needs-list.md` status as you go so the next person
  knows what's missing.
