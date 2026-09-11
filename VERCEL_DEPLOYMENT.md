# Anthony's Super Kitchen — Vercel Deployment Guide

## Why Vercel (not GitHub Pages)
GitHub Pages requires a paid plan for custom domains and private repos.
Vercel provides free hosting for static sites with automatic CI/CD on every push.

## Projects to Deploy

### 1. SuperKitchen Mini App (Vite/React) — **Primary front-end**
- **Repo path**: `apps/superkitchen/`
- **Build output**: `dist/`
- **Config**: `apps/superkitchen/vercel.json` (framework: `vite`)
- **Live URL**: Set after connecting repo in Vercel dashboard
- **Environment variables needed in Vercel**:
  - `VITE_API_URL` → `https://cbpdiiyzzmbavsymjysb.functions.supabase.co/superkitchen`
- **Deploy command**: `npm run build` (from `apps/superkitchen/`)
- **CI**: `.github/workflows/superkitchen-ci.yml` — validates and builds on every push

### 2. Menu App (Next.js) — **Restaurant menu landing page**
- **Repo path**: `apps/menu/`
- **Build output**: `.next/`
- **Config**: `apps/menu/vercel.json` (framework: `nextjs`)
- **Live URL**: Separate Vercel project from SuperKitchen
- **Environment variables needed in Vercel**:
  - `NEXT_PUBLIC_API_URL` → Supabase edge function URL
  - `NEXT_PUBLIC_SUPABASE_URL` → Supabase project URL
- **CI**: Same `superkitchen-ci.yml` workflow triggers on changes

## Setup Steps

1. Go to [vercel.com](https://vercel.com) → Sign in with GitHub
2. **Add Project** → Import `JelfferyDuran/anthony-supermarket`
3. Configure each framework separately:
   - **SuperKitchen**: Framework Preset = `Vite`, Root Directory = `apps/superkitchen`, Build Command = `npm run build`
   - **Menu**: Framework Preset = `Next.js`, Root Directory = `apps/menu`, Build Command = `next build`
4. Add environment variables in Vercel dashboard → Project → Settings → Environment Variables
5. Connect GitHub repo → Enable automatic deployments on push to `main`

## Domain Configuration (when ready)
- Both projects can share `kingdomfiservices.com` via Vercel domain settings
- Subdomains: `kitchen.kingdomfiservices.com`, `menu.kingdomfiservices.com`

## Telegram Mini App Deep Link Update
After deploying to Vercel, update the Mini App URL in Telegram bot settings:
- **Old**: `https://jelfferyduran.github.io/anthony-supermarket/apps/superkitchen/dist/`
- **New**: `https://<your-vercel-project>.vercel.app`
- Update `VERCEL_MINIAPP_URL` in server `.env` and in `HERMES_CHAT_ID` config

## Notes
- `vercel.json` at repo root is NOT used — each app has its own `vercel.json`
- `deploy.yml` was GitHub Pages workflow — **deleted/rewritten** for Vercel
- Supabase Edge Functions remain unchanged (hosted on Supabase, not Vercel)
- Docker containers (`anthony-supermarket-server`) continue running independently
