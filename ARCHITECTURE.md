# 🏗️ Anthony's Supermarket — System Architecture

## Current State (Phase 1 Complete)

```
┌─────────────────────────────────────────────────────────────────┐
│                    Anthony's Supermarket                        │
│              Unified Digital Presence (Monorepo)                │
│                                                                 │
│  GitHub: github.com/JelfferyDuran/anthony-supermarket          │
│  Linear: NOE-5                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ├──────────────────────────┐
                              │                          │
                    ┌─────────▼──────────┐    ┌─────────▼──────────┐
                    │   Landing Page     │    │   Documentation    │
                    │   (index.html)     │    │   (README, etc)    │
                    │   Three.js + CSS   │    │   - ROADMAP.md     │
                    │   ✅ LIVE          │    │   - AGENT_TASKS.md │
                    └────────────────────┘    │   - DEPLOY.md      │
                                              └────────────────────┘
                              │
                    ┌─────────▼──────────────────────────┐
                    │         apps/ (Monorepo)           │
                    └────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
┌───────▼────────┐   ┌───────▼────────┐   ┌───────▼────────┐
│  Pricing Hub   │   │    Delivery    │   │   Inventory    │
│  (HTML/JS)     │   │  (React/Node)  │   │  (Django/Py)   │
│  ✅ Ready      │   │  🔄 Submodule  │   │  🔄 Submodule  │
│                │   │                │   │                │
│  - Invoice     │   │  - Customer    │   │  - Stock       │
│    upload      │   │    app         │   │    tracking    │
│  - 65% markup  │   │  - Store       │   │  - Purchase    │
│  - CSV export  │   │    dashboard   │   │    orders      │
│  - AI extract  │   │  - Rider       │   │  - Barcodes    │
└────────────────┘   │    tracking    │   └────────────────
                     └────────────────┘
                              │
                     ┌────────▼────────┐
                     │  Digital Menu   │
                     │   (Next.js 14)  │
                     │   🔄 Submodule  │
                     │                 │
                     │  - QR menus     │
                     │  - Online order │
                     │  - DoorDash API │
                     └─────────────────┘
```

---

## Target State (Phase 8 Complete)

```
┌─────────────────────────────────────────────────────────────────┐
│                    Customer Touchpoints                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Three.js    │  │   Mobile     │  │   WhatsApp   │         │
│  │  Website     │  │     PWA      │  │     Bot      │         │
│  │  (Immersive) │  │  (iOS/Android)│  │  (Ordering) │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Instagram   │  │   DoorDash   │  │  Phone/In-   │         │
│  │  Shopping    │  │  Integration │  │    Store     │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────▼──────────────────────────┐
                    │      API Gateway (9router)         │
                    │         Port: 20128                │
                    │    - Authentication (JWT)          │
                    │    - Rate Limiting                 │
                    │    - Load Balancing                │
                    └────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
┌───────▼────────┐   ┌───────▼────────┐   ┌───────▼────────┐
│  Frontend      │   │   Backend      │   │   Data         │
│  Services      │   │   Services     │   │   Layer        │
│                │   │                │   │                │
│  - Three.js    │   │  - Pricing     │   │  - PostgreSQL  │
│    Store       │   │    API         │   │    (Inventory) │
│  - Pricing     │   │  - Orders      │   │  - MongoDB     │
│    Hub React   │   │    API         │   │    (Menu)      │
│  - Command     │   │  - Users       │   │  - Redis       │
│    Center      │   │    Auth        │   │    (Cache)     │
│  - Mobile PWA  │   │  - Payments    │   │                │
└────────────────┘   │    (Stripe)    │   └────────────────┘
                     │  - Analytics   │
                     └────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
┌───────▼────────┐   ┌───────▼────────┐   ┌───────▼────────┐
│  External      │   │  DevOps        │   │   Monitoring   │
│  Integrations  │   │  Infrastructure│   │   & Analytics  │
│                │   │                │   │                │
│  - DoorDash    │   │  - Docker      │   │  - Uptime      │
│  - Uber Eats   │   │  - K8s         │   │    Monitoring  │
│  - Google      │   │  - Tailscale   │   │  - Error       │
│    Shopping    │   │  - Cloudflare  │   │    Tracking    │
│  - Stripe      │   │    Tunnel      │   │  - Performance │
│  - n8n/Zapier  │   │  - GitHub      │   │    Metrics     │
│                │   │    Actions     │   │  - Business    │
│                │   │                │   │    Intelligence│
└────────────────┘   └────────────────┘   └────────────────
```

---

## Data Flow Examples

### 1. Customer Places Order (Three.js Store)

```
Customer → Three.js Store → Add to Cart → Checkout
                                    │
                                    ▼
                          API Gateway (Auth)
                                    │
                                    ▼
                          Orders API (Backend)
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
              ▼                     ▼                     ▼
      PostgreSQL            MongoDB              Redis Cache
      (Order record)       (User data)          (Session)
              │
              ▼
      Payment Processing (Stripe)
              │
              ▼
      Order Confirmation
              │
        ┌─────┴─────┐
        │           │
        ▼           ▼
    Customer    Kitchen/
    Email       Staff Dashboard
```

### 2. Invoice Upload → Pricing Update

```
Staff → Pricing Hub → Upload Invoice Photo
                              │
                              ▼
                      Claude AI API
                      (OCR + Extraction)
                              │
                              ▼
                      Parse Line Items
                              │
                              ▼
                      Calculate 65% Markup
                              │
                              ▼
                      MongoDB (Save)
                              │
              ┌───────────────┼───────────────┐
              │               │               │
              ▼               ▼               ▼
      Update Retail     Sync to         Update
      Prices            DoorDash        Command
                                        Center
```

### 3. Inventory Alert → Restock Order

```
InvenTree → Low Stock Alert
                    │
                    ▼
            Command Center
            (Dashboard Widget)
                    │
                    ▼
            Auto-generate
            Purchase Order
                    │
              ┌─────┴─────┐
              │           │
              ▼           ▼
        Email to      Update
        Vendor        Expected
                      Delivery
```

---

## Technology Stack

### Frontend
| Component | Technology | Status |
|-----------|-----------|--------|
| Landing Page | HTML/CSS/Three.js | ✅ Live |
| Three.js Store | React Three Fiber + Drei | 🚧 In Dev |
| Pricing Hub | Vanilla JS → React | 🔄 Migrating |
| Command Center | Next.js + Recharts | 📋 Planned |
| Mobile PWA | React Native / PWA | 📋 Planned |

### Backend
| Component | Technology | Status |
|-----------|-----------|--------|
| API Gateway | 9router (Node.js) | ✅ Existing |
| Pricing API | Express + MongoDB | 📋 Planned |
| Orders API | Node.js + PostgreSQL | 🔄 Submodule |
| Auth Service | JWT + bcrypt | 📋 Planned |
| Payments | Stripe API | 📋 Planned |

### Data
| Component | Technology | Status |
|-----------|-----------|--------|
| Inventory DB | PostgreSQL | 🔄 Submodule |
| Menu/Users DB | MongoDB | 🔄 Submodule |
| Cache/Session | Redis | 📋 Planned |
| File Storage | S3-compatible | 📋 Planned |

### DevOps
| Component | Technology | Status |
|-----------|-----------|--------|
| Containers | Docker + Compose | 📋 Planned |
| CI/CD | GitHub Actions | ✅ Setup |
| Hosting | GitHub Pages / Vercel | 🚧 In Progress |
| Monitoring | Sentry + Uptime | 📋 Planned |
| Network | Tailscale + Cloudflare | ✅ Existing |

---

## Security Architecture

```
┌─────────────────────────────────────────┐
│          Security Layers                │
├─────────────────────────────────────────┤
│                                         │
│  Layer 1: Network                       │
│  - Tailscale private network            │
│  - Cloudflare Tunnel (public access)    │
│  - DDoS protection                      │
│                                         │
│  Layer 2: Application                   │
│  - JWT authentication                   │
│  - Rate limiting (API gateway)          │
│  - Input validation                     │
│  - CORS policies                        │
│                                         │
│  Layer 3: Data                          │
│  - Encrypted connections (HTTPS/TLS)    │
│  - Password hashing (bcrypt)            │
│  - SQL injection prevention             │
│  - XSS protection                       │
│                                         │
│  Layer 4: Monitoring                    │
│  - Error tracking (Sentry)              │
│  - Access logs                          │
│  - Anomaly detection                    │
│  - Automated alerts                     │
│                                         │
└─────────────────────────────────────────┘
```

---

## Deployment Pipeline

```
Developer Push → GitHub
                      │
                      ▼
              GitHub Actions
                      │
            ┌─────────┴─────────┐
            │                   │
            ▼                   ▼
        Lint/Test           Build
            │                   │
            ▼                   ▼
        Pass?              Deploy
          │                 │
      ┌───┴───┐         ┌───┴───┐
      │       │         │       │
     Yes     No       Staging  Prod
      │       │         │       │
      ▼       ▼         ▼       ▼
   Merge   Notify    Auto     Manual
   to      Dev       Deploy   Approval
   Main                         │
                                ▼
                         GitHub Pages /
                         Vercel / Docker
```

---

## Next Architecture Milestones

### Phase 2: Repo Structure (✅ DONE)
- [x] Monorepo setup
- [x] Submodule integration
- [x] Documentation

### Phase 3: Three.js Foundation (2-4 weeks)
- [ ] Basic store environment
- [ ] First-person controls
- [ ] Product interactions
- [ ] Shopping cart

### Phase 4: Pricing Hub Migration (4-6 weeks)
- [ ] React component structure
- [ ] MongoDB backend
- [ ] API endpoints
- [ ] Claude AI integration

### Phase 5: Unified Auth (6-8 weeks)
- [ ] JWT authentication
- [ ] User management
- [ ] Role-based access
- [ ] SSO across apps

### Phase 6: Command Center (8-12 weeks)
- [ ] Dashboard framework
- [ ] Analytics widgets
- [ ] Real-time updates
- [ ] 3D visualizations

### Phase 7: Production Deploy (12-16 weeks)
- [ ] Docker containers
- [ ] Kubernetes orchestration
- [ ] CI/CD pipeline
- [ ] Monitoring stack

### Phase 8: Mobile & Testing (16-24 weeks)
- [ ] React Native apps
- [ ] PWA optimization
- [ ] E2E test suite
- [ ] Accessibility audit

---

*Architecture Document v1.0*  
*Created: July 16, 2026*  
*Linear: NOE-5*
