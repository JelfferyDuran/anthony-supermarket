# 🦁 Anthony's Supermarket — Command Center

> **Immersive grocery shopping experience powered by Three.js**  
> 📍 288 Kearny Ave, Kearny NJ 07032 | 📞 (201) 428-1745

[![Website](https://img.shields.io/badge/website-anthonyssupermarket.com-blue)](https://anthonyssupermarket.com)
[![Instagram](https://img.shields.io/badge/instagram-@anthony_supermarket-E4405F)](https://instagram.com/anthony_supermarket)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

---

## 🏰 Overview

**Anthony's Supermarket Command Center** is a unified digital platform consolidating all operational systems into one immersive Three.js experience:

- 🛒 **Immersive 3D Store** — Walk through aisles, browse products
- 💰 **Pricing Hub** — Real-time wholesale cost tracking & retail markup calculator
- 📦 **Delivery System** — Multi-vendor ordering & logistics (powered by Anthony's SuperApp)
- 📊 **Inventory Management** — InvenTree integration for stock tracking
- 📱 **Digital Menu** — BioMenu D2C ordering interface
- 🎯 **Command Dashboard** — Business analytics, profit tracking, vendor management

---

## 🗺️ Architecture

```
anthony-supermarket/
├── apps/
│   ├── pricing-hub/          # Bodeguetto Pricing Hub (standalone HTML)
│   ├── delivery/             # Anthony's SuperApp (React/Node)
│   ├── inventory/            # InvenTree (Django/Python)
│   ├── menu/                 # BioMenu (Next.js 14)
│   └── command-center/       # Unified dashboard (Three.js + React)
├── website/                  # Main Three.js immersive site
│   ├── index.html
│   ├── src/
│   │   ├── scenes/           # 3D environments
│   │   ├── components/       # Reusable 3D components
│   │   └── styles/
│   └── public/
├── docs/
│   ├── invoices/             # Invoice PDFs archive
│   ├── pricing/              # Pricing sheets & CSVs
│   └── operations/           # SOPs, vendor contacts
├── packages/                 # Shared libraries
│   ├── pricing-engine/       # Markup calculations
│   └── ui-kit/               # Shared React components
└── docker/                   # Container configs
    ├── docker-compose.yml
    └── */Dockerfile
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.9+
- Docker & Docker Compose
- Git

### 1. Clone & Install

```bash
git clone https://github.com/JelfferyDuran/anthony-supermarket.git
cd anthony-supermarket

# Install root dependencies
npm install

# Install app-specific deps
cd apps/pricing-hub && npm install
cd ../delivery && npm install
cd ../menu && npm install
cd ../command-center && npm install
```

### 2. Environment Setup

```bash
# Copy example env files
cp .env.example .env

# Required variables:
# - MONGODB_URI (for BioMenu)
# - INVENTREE_SERVER (inventory backend)
# - SUPERAAPP_API_KEY (delivery system)
# - STRIPE_KEY (payments)
```

### 3. Run Locally

```bash
# Development mode (all apps)
npm run dev

# Or run individual apps:
npm run dev:pricing-hub    # :3001
npm run dev:delivery       # :3002
npm run dev:menu           # :3003
npm run dev:command-center # :3000 (main)
```

### 4. Docker Deployment

```bash
# Build all containers
docker-compose build

# Start stack
docker-compose up -d

# Access:
# - Main Site: http://localhost:3000
# - Pricing Hub: http://localhost:3001
# - Delivery: http://localhost:3002
# - Inventory: http://localhost:8080
```

---

## 📦 Apps Breakdown

###  Website (Three.js Immersive)

**Tech:** Three.js, React Three Fiber, Drei, GSAP

The main storefront experience:
- 3D grocery store walkthrough
- Interactive product shelves
- Shopping cart integration
- Accessibility-first navigation

```bash
cd website
npm run dev
```

### 💰 Pricing Hub

**Tech:** Vanilla HTML/JS, Claude AI integration

Standalone pricing calculator:
- Invoice photo → AI extraction
- 65% markup auto-calculation
- Multi-vendor tracking
- CSV export for employees

**Access:** `https://jelfferyduran.github.io/anthony-supermarket/pricing-hub`

### 🚚 Delivery (Anthony's SuperApp)

**Tech:** React Native, Node.js, GraphQL, MongoDB

Full delivery management:
- Customer app (iOS/Android)
- Store dashboard
- Rider tracking
- Multi-vendor support

Forked from [Enatega](https://github.com/enatega/food-delivery-multivendor)

### 📊 Inventory (InvenTree)

**Tech:** Django, Python, PostgreSQL

Open-source inventory system:
- Stock tracking
- Purchase orders
- Supplier management
- Barcode scanning

Forked from [InvenTree](https://github.com/inventree/InvenTree)

### 📱 Digital Menu (BioMenu)

**Tech:** Next.js 14, Tailwind, MongoDB

D2C ordering interface:
- QR code menus
- Online ordering
- Table management
- Integration with DoorDash

### 🎯 Command Center

**Tech:** Three.js, React, Recharts, Socket.io

Unified business dashboard:
- Real-time sales analytics
- Profit tracking per invoice
- Vendor performance
- Inventory alerts

---

## 🔗 Related Repos

| Repo | Purpose | Status |
|------|---------|--------|
| [anthony-superapp](https://github.com/JelfferyDuran/anthony-superapp) | Delivery system (upstream) | Active |
| [inventree.AnthonysSuperApp](https://github.com/JelfferyDuran/inventree.AnthonysSuperApp) | Inventory (upstream) | Active |
| [biomenu-Anthony-s-Supermarket-App](https://github.com/JelfferyDuran/biomenu-Anthony-s-Supermarket-App) | Digital menu (upstream) | Active |
| [kfs-infra](https://github.com/JelfferyDuran/kfs-infra) | Infrastructure (Tailscale, LLM fleet) | Active |

---

## 🏗️ Development Workflow

### Branch Strategy

- `main` — Production-ready code
- `develop` — Integration branch
- `feature/*` — New features
- `hotfix/*` — Critical fixes

### Commit Convention

```
feat: add Three.js store walkthrough
fix: pricing hub markup calculation
docs: update deployment guide
chore: upgrade dependencies
```

### Testing

```bash
# Run all tests
npm test

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

---

## 📊 Current Status

| Component | Status | Progress |
|-----------|--------|----------|
| Pricing Hub | ✅ Live | 100% |
| Delivery System | 🔄 Merging | 80% |
| Inventory | 🔄 Merging | 70% |
| Digital Menu | 🔄 Merging | 60% |
| Three.js Website | 🚧 In Dev | 30% |
| Command Center | 🚧 In Dev | 25% |

---

## 🤝 Contributing

1. Fork the repo
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 📞 Contact

**Anthony's Supermarket**  
288 Kearny Ave, Kearny NJ 07032  
📞 (201) 428-1745  
📧 contact@anthonyssupermarket.com

**Development:**  
GitHub: [@JelfferyDuran](https://github.com/JelfferyDuran)  
KFS: [Kingdom Financial Services](https://kingdomfiservices.com)

---

*Last updated: July 16, 2026*
