# GitHub Pages Deployment Configuration

## ✅ Landing Page Live

The main landing page is now deployed at:
**https://jelfferyduran.github.io/anthony-supermarket/**

## 🚀 Deployment Steps

### Option 1: GitHub Pages (Recommended)

1. Go to repo settings: https://github.com/JelfferyDuran/anthony-supermarket/settings/pages
2. Under "Source", select:
   - Branch: `main`
   - Folder: `/ (root)`
3. Click "Save"
4. Wait 1-2 minutes for deployment
5. Your site will be live at: `https://jelfferyduran.github.io/anthony-supermarket/`

### Option 2: Manual Deploy Script

```bash
#!/bin/bash
# deploy.sh

# Build (if you have build step)
# npm run build

# Ensure you're on main branch
git checkout main
git pull origin main

# Force push to gh-pages branch
git subtree push --prefix . origin gh-pages

echo "✅ Deployed to GitHub Pages!"
echo "🌐 Visit: https://jelfferyduran.github.io/anthony-supermarket/"
```

### Option 3: Vercel/Netlify (Alternative)

```bash
# Vercel
vercel --prod

# Netlify
netlify deploy --prod --dir=.
```

## 📁 File Structure for Pages

```
anthony-supermarket/
├── index.html          ← Main landing page (deployed)
├── pricing-hub/
│   └── index.html      → Will be at /pricing-hub/
├── assets/
│   ├── css/
│   ├── js/
│   └── images/
└── ...
```

## 🔧 GitHub Actions Workflow (Auto-Deploy)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: '.'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

## 🎨 Custom Domain (Optional)

To use `shop.anthonyssupermarket.com`:

1. Add CNAME file:
```bash
echo "shop.anthonyssupermarket.com" > CNAME
git add CNAME
git commit -m "Add custom domain"
git push
```

2. Configure DNS:
   - CNAME: `shop` → `jelfferyduran.github.io`
   - Or A records to GitHub Pages IPs

3. In repo settings → Pages → Custom domain:
   - Enter: `shop.anthonyssupermarket.com`
   - Check "Enforce HTTPS"

## 📊 Analytics (Optional)

Add to `<head>` in index.html:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>

<!-- Plausible (privacy-friendly) -->
<script defer data-domain="shop.anthonyssupermarket.com" src="https://plausible.io/js/script.js"></script>
```

## ✅ Verification Checklist

- [ ] Landing page loads
- [ ] Three.js animation works
- [ ] All links functional
- [ ] Mobile responsive
- [ ] Contact info correct
- [ ] GitHub repo linked
- [ ] Pricing Hub accessible
- [ ] Custom domain (if using)
- [ ] HTTPS enabled
- [ ] Analytics tracking

---

*Last updated: July 16, 2026*
