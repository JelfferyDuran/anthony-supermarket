# 🦁 Anthony's Supermarket — Agent Task assignments

> **Mission:** Build a world-class Three.js immersive grocery shopping experience with unified command center

---

## 📋 Task Overview

This document breaks down the consolidation roadmap into specific, actionable tasks for AI agents to execute in parallel.

---

## 🎯 Phase 2: Repository Consolidation

### Agent 1: Repo Structure & Initial Setup

**Goal:** Create unified repo structure and push initial commit

**Tasks:**
- [ ] Create directory structure (already done locally)
- [ ] Copy Pricing Hub HTML to `apps/pricing-hub/`
- [ ] Write comprehensive README.md
- [ ] Add LICENSE file (MIT)
- [ ] Create .gitignore
- [ ] Initialize package.json with workspaces
- [ ] Push to GitHub: `github.com/JelfferyDuran/anthony-supermarket`

**Commands:**
```bash
cd ~/anthony-supermarket
git add .
git commit -m "feat: initial monorepo structure with consolidated apps"
git branch -M main
git remote add origin https://github.com/JelfferyDuran/anthony-supermarket.git
git push -u origin main
```

**Deliverable:** Live GitHub repo with initial structure

---

### Agent 2: App Submodule Integration

**Goal:** Integrate existing repos as git submodules or subtrees

**Tasks:**
- [ ] Add anthony-superapp as submodule in `apps/delivery/`
- [ ] Add inventree.AnthonysSuperApp as submodule in `apps/inventory/`
- [ ] Add biomenu-Anthony-s-Supermarket-App as submodule in `apps/menu/`
- [ ] Document submodule workflow in CONTRIBUTING.md
- [ ] Test cloning with submodules

**Commands:**
```bash
cd ~/anthony-supermarket
git submodule add https://github.com/JelfferyDuran/anthony-superapp apps/delivery
git submodule add https://github.com/JelfferyDuran/inventree.AnthonysSuperApp apps/inventory
git submodule add https://github.com/JelfferyDuran/biomenu-Anthony-s-Supermarket-App apps/menu
git commit -m "feat: add app submodules"
```

**Deliverable:** All apps accessible via submodules

---

## 🎨 Phase 3: Three.js Website

### Agent 3: Three.js Site Scaffolding

**Goal:** Set up Vite + React + Three.js project structure

**Tasks:**
- [ ] Create Vite project in `website/`
- [ ] Install dependencies:
  - three
  - @react-three/fiber
  - @react-three/drei
  - gsap
  - react-router-dom
  - tailwindcss
- [ ] Configure Tailwind CSS
- [ ] Set up project structure:
  ```
  website/
    src/
      scenes/
        Storefront.jsx
        GroceryAisle.jsx
        ProduceSection.jsx
        DeliCounter.jsx
        MeatDepartment.jsx
      components/
        Product.jsx
        ShoppingCart.jsx
        Navigation.jsx
        Modal.jsx
      styles/
      App.jsx
      main.jsx
    public/
      models/
      textures/
  ```
- [ ] Create basic scene with camera, lights, renderer
- [ ] Add ground plane and skybox
- [ ] Test render in browser

**Package.json scripts:**
```json
{
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview"
}
```

**Deliverable:** Working Three.js dev environment

---

### Agent 4: 3D Store Modeling

**Goal:** Create basic 3D models for store environment

**Tasks:**
- [ ] Model store exterior (simple box geometry + textures)
- [ ] Create aisle shelving units
- [ ] Design shopping cart model
- [ ] Build product placeholders (boxes, cans, produce)
- [ ] Add signage (Anthony's Supermarket logo)
- [ ] Export as GLTF/GLB files
- [ ] Place in `website/public/models/`

**Tools:**
- Blender (free)
- Or use Drei primitives for MVP

**Deliverable:** Basic 3D assets for store walkthrough

---

### Agent 5: First-Person Controls

**Goal:** Implement player movement and camera controls

**Tasks:**
- [ ] Install `@react-three/drei` for controls
- [ ] Implement PointerLockControls for FPS view
- [ ] Add WASD movement
- [ ] Add collision detection (walls, shelves)
- [ ] Implement sprint (Shift key)
- [ ] Add crouch (Ctrl key)
- [ ] Create mini-map overlay
- [ ] Add teleport waypoints for quick navigation

**Code structure:**
```jsx
// src/components/Player.jsx
function Player() {
  const { camera } = useThree()
  // WASD movement logic
  // Collision detection
  return <PointerLockControls />
}
```

**Deliverable:** Smooth first-person walkthrough

---

### Agent 6: Interactive Products

**Goal:** Make products clickable with add-to-cart functionality

**Tasks:**
- [ ] Create Product component with onClick handler
- [ ] Add hover effects (highlight, scale)
- [ ] Implement raycasting for click detection
- [ ] Create product data structure:
  ```js
  {
    id: 'milk-001',
    name: 'Whole Milk',
    price: 3.99,
    model: 'milk.glb',
    position: [x, y, z]
  }
  ```
- [ ] Add click → info modal
- [ ] Implement "Add to Cart" button
- [ ] Update cart count in real-time
- [ ] Persist cart to localStorage

**Deliverable:** Clickable products with shopping cart

---

### Agent 7: Shopping Cart System

**Goal:** Full cart functionality with checkout flow

**Tasks:**
- [ ] Create CartContext for state management
- [ ] Implement cart UI (slide-out panel)
- [ ] Add quantity controls (+/-)
- [ ] Calculate subtotal, tax, total
- [ ] Implement remove item
- [ ] Create checkout modal
- [ ] Add payment method selection
- [ ] Integrate Stripe for payments (test mode)
- [ ] Generate order confirmation

**UI Components:**
- CartIcon (with badge)
- CartPanel (slide-out)
- CartItem (row)
- CheckoutModal
- OrderConfirmation

**Deliverable:** Complete shopping cart with checkout

---

## 💰 Phase 4: Pricing Hub

### Agent 8: Pricing Hub React Migration

**Goal:** Convert standalone HTML to React component

**Tasks:**
- [ ] Create React app in `apps/pricing-hub/`
- [ ] Port HTML structure to JSX
- [ ] Convert vanilla JS to React hooks
- [ ] Create components:
  - InvoiceUploader
  - ItemTable
  - FilterBar
  - ExportButton
  - VendorSelector
- [ ] Add TypeScript types
- [ ] Implement Claude AI integration for invoice extraction
- [ ] Test all existing functionality

**API endpoints needed:**
```
POST /api/extract-invoice  # Claude AI
GET  /api/invoices         # List all
POST /api/invoices         # Create
PUT  /api/invoices/:id     # Update
DELETE /api/invoices/:id   # Delete
GET  /api/export/csv       # Export pricing sheet
```

**Deliverable:** React-based Pricing Hub

---

### Agent 9: Pricing Hub Backend

**Goal:** Add MongoDB persistence and API layer

**Tasks:**
- [ ] Set up Express server
- [ ] Configure MongoDB connection
- [ ] Create Invoice model:
  ```js
  {
    vendor: String,
    invoiceNumber: String,
    date: Date,
    items: [{
      name: String,
      quantity: Number,
      unitCost: Number,
      retailPrice: Number,
      category: String
    }],
    total: Number
  }
  ```
- [ ] Implement CRUD endpoints
- [ ] Add authentication (JWT)
- [ ] Create invoice upload endpoint
- [ ] Integrate Claude API for extraction
- [ ] Add CSV export endpoint
- [ ] Deploy to Vercel/Railway

**Deliverable:** Backend API with database

---

## 🚚 Phase 5: Delivery Integration

### Agent 10: Delivery System Setup

**Goal:** Get anthony-superapp running locally

**Tasks:**
- [ ] Follow setup docs in apps/delivery/README.md
- [ ] Install Node.js dependencies
- [ ] Set up MongoDB for delivery app
- [ ] Configure environment variables
- [ ] Run admin dashboard
- [ ] Run customer app
- [ ] Run rider app
- [ ] Test order flow end-to-end
- [ ] Document any issues/solutions

**Deliverable:** Working delivery system

---

### Agent 11: Single Sign-On Integration

**Goal:** Unified authentication across all apps

**Tasks:**
- [ ] Set up Auth0 or implement JWT auth
- [ ] Create shared auth service in `packages/auth/`
- [ ] Implement login/register pages
- [ ] Add social login (Google, Facebook)
- [ ] Create user profile management
- [ ] Sync user data across apps
- [ ] Implement role-based access (customer, admin, rider)

**Deliverable:** Unified authentication system

---

## 📊 Phase 6: Command Center

### Agent 12: Dashboard Scaffolding

**Goal:** Create command center dashboard app

**Tasks:**
- [ ] Create Next.js app in `apps/command-center/`
- [ ] Install dependencies:
  - recharts (charts)
  - framer-motion (animations)
  - socket.io-client (real-time)
  - tailwindcss
- [ ] Set up dashboard layout:
  - Sidebar navigation
  - Top bar with user menu
  - Main content area
  - Widget grid system
- [ ] Create auth wrapper
- [ ] Add route protection

**Deliverable:** Dashboard framework

---

### Agent 13: Analytics Widgets

**Goal:** Build real-time analytics visualizations

**Tasks:**
- [ ] Sales Overview widget (line chart)
- [ ] Top Products widget (bar chart)
- [ ] Vendor Performance (radar chart)
- [ ] Profit Margins (pie chart)
- [ ] Recent Orders table
- [ ] Low Stock Alerts list
- [ ] Revenue vs Expenses (area chart)
- [ ] Customer Satisfaction gauge

**Data sources:**
- Delivery app orders
- Pricing Hub invoices
- Inventory app stock levels

**Deliverable:** Live analytics dashboard

---

### Agent 14: 3D Data Visualization

**Goal:** Three.js visualizations for command center

**Tasks:**
- [ ] Create 3D bar chart for sales
- [ ] Build rotating globe for delivery locations
- [ ] Implement force-directed graph for vendor relationships
- [ ] Add animated product flow visualization
- [ ] Create inventory heatmap
- [ ] Add time-slider for historical data

**Deliverable:** Immersive 3D analytics

---

## 📱 Phase 7: Mobile & Deployment

### Agent 15: PWA Configuration

**Goal:** Make Three.js site installable as PWA

**Tasks:**
- [ ] Add manifest.json
- [ ] Configure service worker
- [ ] Implement offline fallback
- [ ] Add install prompt
- [ ] Test on iOS and Android
- [ ] Optimize for mobile performance
- [ ] Add touch controls for mobile

**Deliverable:** Installable PWA

---

### Agent 16: Docker Deployment

**Goal:** Containerize entire stack

**Tasks:**
- [ ] Create Dockerfile for each app:
  - website (nginx)
  - pricing-hub (node)
  - command-center (node)
  - backend (node + mongodb)
- [ ] Write docker-compose.yml
- [ ] Configure networking
- [ ] Add health checks
- [ ] Set up volumes for persistence
- [ ] Test local deployment
- [ ] Document deployment steps

**Deliverable:** One-command deployment

---

### Agent 17: CI/CD Pipeline

**Goal:** Automated testing and deployment

**Tasks:**
- [ ] Set up GitHub Actions workflow
- [ ] Add linting step
- [ ] Add testing step
- [ ] Add build step
- [ ] Configure auto-deploy to Vercel
- [ ] Add Docker build/push to GHCR
- [ ] Set up staging environment
- [ ] Add manual production deploy trigger

**Deliverable:** Automated CI/CD

---

## 🧪 Phase 8: Testing & QA

### Agent 18: E2E Testing

**Goal:** Comprehensive end-to-end test suite

**Tasks:**
- [ ] Set up Playwright
- [ ] Write tests for:
  - User registration/login
  - Product browsing
  - Add to cart
  - Checkout flow
  - Order tracking
  - Admin dashboard
- [ ] Add visual regression tests
- [ ] Test on Chrome, Firefox, Safari
- [ ] Mobile responsive tests
- [ ] Performance tests (Lighthouse)

**Deliverable:** Full E2E test suite

---

### Agent 19: Accessibility Audit

**Goal:** WCAG 2.1 AA compliance

**Tasks:**
- [ ] Run axe-core audit
- [ ] Add ARIA labels
- [ ] Implement keyboard navigation
- [ ] Add screen reader support
- [ ] Test color contrast
- [ ] Add skip links
- [ ] Create accessibility statement
- [ ] Document accessibility features

**Deliverable:** Accessible application

---

## 📊 Progress Tracking

| Agent | Task | Status | ETA |
|-------|------|--------|-----|
| 1 | Repo Setup | 🔄 In Progress | Today |
| 2 | Submodules | ⏳ Pending | Day 2 |
| 3 | Three.js Scaffold | ⏳ Pending | Day 3 |
| 4 | 3D Modeling | ⏳ Pending | Day 5 |
| 5 | FPS Controls | ⏳ Pending | Day 6 |
| 6 | Interactive Products | ⏳ Pending | Day 7 |
| 7 | Shopping Cart | ⏳ Pending | Day 9 |
| 8 | Pricing Hub React | ⏳ Pending | Day 10 |
| 9 | Pricing Hub Backend | ⏳ Pending | Day 12 |
| 10 | Delivery Setup | ⏳ Pending | Day 14 |
| 11 | SSO Integration | ⏳ Pending | Day 16 |
| 12 | Command Center | ⏳ Pending | Day 18 |
| 13 | Analytics Widgets | ⏳ Pending | Day 20 |
| 14 | 3D Viz | ⏳ Pending | Day 22 |
| 15 | PWA | ⏳ Pending | Day 24 |
| 16 | Docker | ⏳ Pending | Day 26 |
| 17 | CI/CD | ⏳ Pending | Day 28 |
| 18 | E2E Tests | ⏳ Pending | Day 30 |
| 19 | Accessibility | ⏳ Pending | Day 32 |

---

## 🚀 Quick Start for Agents

```bash
# Clone the repo
git clone https://github.com/JelfferyDuran/anthony-supermarket.git
cd anthony-supermarket

# Install dependencies
npm install

# Start specific app
npm run dev:pricing-hub
npm run dev:command-center

# Or start all
npm run dev
```

---

*Created: July 16, 2026*  
*Last Updated: July 16, 2026*
