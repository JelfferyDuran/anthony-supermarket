# 🦁 Anthony's Supermarket — Presentation Site

**Live Demo:** https://jelfferyduran.github.io/anthony-supermarket/

---

## 🎯 Purpose

This is a **bilingual presentation platform** (English/Spanish) designed to showcase Anthony's Supermarket's digital transformation to stakeholders, including your father.

---

## ✨ Features

### 🌐 Bilingual Support
- **English / Spanish toggle** in top-right corner
- Saves language preference in browser
- Instant translation without page reload

### 📊 Working Pricing Hub
- **Live demo** with real product data
- Shows 93 products tracked
- Displays $4,511 inventory cost
- Calculates $3,852 projected profit (65% markup)
- Sample products from Super Trading & Family Food

### 🎨 Design
- **Anthony's branding** — Green (#4CAF50) matching the logo
- Community-focused messaging
- "Serving Kearny for 9 years"
- Modern glassmorphism UI
- Smooth animations
- Fully responsive (desktop & mobile)

---

## 📁 Structure

```
anthony-supermarket/
├── index.html              # Main presentation site
├── pricing-hub/
│   └── index.html          # Embedded Pricing Hub demo
├── apps/                   # Future: Full app deployments
│   ├── delivery/
│   ├── inventory/
│   └── menu/
└── docs/                   # Documentation
```

---

## 🚀 Navigation

The site has 3 sections:

1. **Home (Inicio)** — Hero section with logo, address, contact info
2. **Apps (Sistemas)** — Grid showing all 6 digital systems
3. **Pricing Hub (Precios)** — Live working demo with product table

Use the **dots on the right** or **scroll** to navigate.

---

## 📊 Pricing Hub Data

The demo shows real data from your Obsidian docs:

### Stats
- **93 products** across 5 invoices
- **$4,511.30** total inventory
- **$8,364** projected revenue
- **$3,852** projected profit

### Vendors
- **Super Trading Wholesale LLC** — Grocery, detergents, plastic & aluminum
- **Family Food Distributors** — Latin/International grocery, frozen

### Markup Formula
```
Retail Price = (Box Cost ÷ Units per Case) × 1.65
→ Rounded to nearest .99
```

### Sample Products
- Whole Milk (1 gallon) — $2.49 → $4.11
- White Bread (20oz) — $1.20 → $1.98
- Eggs (Large, 18ct) — $3.50 → $5.78
- Chicken Breast (per lb) — $2.99 → $4.93
- Ground Beef 80/20 (per lb) — $4.50 → $7.43

---

## 🎯 Presentation Tips

### For Your Father

**Start with Home:**
> "Dad, this is what we're building for Anthony's. Look — it has our address, phone, everything."

**Toggle to Spanish:**
> "Y también funciona en español para todos nuestros clientes."

**Show Apps:**
> "We're building 6 systems. The Pricing Hub is already working."

**Open Pricing Hub:**
> "See this? It tracks all 93 products we buy. Knows exactly how much we paid, and calculates the 65% markup automatically. No more manual calculations."

**Point out the profit:**
> "Right now we have $4,511 in inventory. This system tells us that'll become $8,364 in sales — $3,852 profit. All automatic."

**Future vision:**
> "Soon we'll have a 3D virtual store where customers can shop from home, and a delivery app like DoorDash but for us."

---

## 📱 Mobile Demo

The site works perfectly on phones:
- Responsive design
- Touch-friendly navigation
- Language toggle works on mobile
- Pricing Hub table scrolls horizontally

**Test on your phone:** Visit https://jelfferyduran.github.io/anthony-supermarket/

---

## 🔄 Updates

To update the presentation:

1. Edit `index.html` (main site) or `pricing-hub/index.html` (demo)
2. Commit and push:
   ```bash
   git add .
   git commit -m "Updated presentation"
   git push
   ```
3. GitHub Pages auto-deploys in 1-2 minutes

---

## 🎨 Branding

**Colors:**
- Primary: Green `#4CAF50` (matches Anthony's logo)
- Secondary: Orange `#FF9800` (warmth, community)
- Dark: `#1a1a1a`
- Light: `#f5f5f5`

**Logo:** Shopping cart emoji 🛒 (green circle background)

**Messaging:**
- "Serving the Kearny community for 9 years"
- "Fresh Fruit & Vegetables • Fresh Meat • Hot Food"
- Community-focused, not corporate

---

## 📞 Contact Info Displayed

```
📍 288 Kearny Ave, Kearny, NJ 07032
📞 (201) 428-1745
🏪 Serving the community for 9 years
🥬 Fresh Fruit & Vegetables • Fresh Meat • Hot Food
```

---

## 🚀 Next Features

Coming soon:
- [ ] Full delivery system demo
- [ ] Inventory management preview
- [ ] 3D virtual store walkthrough
- [ ] Business dashboard with real analytics
- [ ] Customer ordering interface

---

*Built with ❤️ for the Kearny community*  
*July 16, 2026*
