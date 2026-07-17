# 🦁 Anthony's Supermarket — KFS Lion Agent Playbook

> Use this file to continue working with Anthony's via @her_mes_woo_bot.
> The KFS Lion is the ordering interface — not a separate bot.

---

## Project Structure

```
~/anthony-supermarket/
├── index.html              ← Immersive Three.js website (deployed to GitHub Pages)
├── KFS-LION-PLAYBOOK.md    ← This file
├── server/
│   ├── index.js            ← Order API + Telegram bot
│   ├── package.json
│   └── data/orders.json    ← Order store (auto-created)
├── apps/menu/              ← BioMenu app (gitignored, local dev only)
│   └── scripts/anthonys-seed.json
└── .github/workflows/deploy.yml
```

---

## Live Resources

| Resource | URL |
|----------|-----|
| 🌐 Website | https://jelfferyduran.github.io/anthony-supermarket/ |
| 📦 Repo | https://github.com/JelfferyDuran/anthony-supermarket |
| 🛒 Order API | `http://localhost:3001` |
| 🤖 Bot | @Anthonysuperkitchen_bot (kitchen group bot) |
| 🦁 Agent | @her_mes_woo_bot (KFS Lion — main interface) |
| 🖼️ Menu Image | https://v3b.fal.media/files/b/0aa2a6a0/myD6lOLCfHbFM5qWgEapf_mFKWyDxy.png |

---

## 📋 COMPLETE MENU

### 🥞 BREAKFAST — Huevos
| Item | Price |
|------|-------|
| 2 Huevos Fritos | $7.95 |
| 2 Huevos con Salami | $9.95 |
| 2 Huevos con Salami y Queso | $10.95 |
| 3 Huevos Revueltos con Salami, Cebolla y Apio | $10.95 |
| Chimi de Huevo | $6.95 |
| Chimi de Huevo con Queso y Salami | $8.95 |

### 🥐 BREAKFAST — Sandwiches
| Item | Price |
|------|-------|
| Sandwich de Queso | $6.00 |
| Sandwich de Salami | $6.00 |
| Sandwich de Huevo | $6.00 |
| Sandwich Mixto (Jamon y Queso) | $8.00 |
| Sandwich Cubano | $12.00 |
| Tripleta | $14.00 |
| Pan con Queso y Salami | $6.00 |

### 🥤 BREAKFAST — Drinks
| Item | Price |
|------|-------|
| Café Negro | $2.95 |
| Café con Leche | $3.95 |
| Batida de Fruta (Small) | $5.95 |
| Batida de Fruta (Large) | $7.95 |
| Jugo de Chinola | $3.95 |
| Jugo de Avena | $3.95 |

---

### 🥗 LUNCH SPECIALS — Mon–Sat
**Served with: Arroz, Habichuelas, Ensalada, Tostones o Maduros, Carne**
| Day | Special | Price |
|-----|---------|-------|
| Monday | Pollo Guisado | $9.95 |
| Tuesday | Carne de Res Guisada | $11.95 |
| Wednesday | Pescado Guisado | $11.95 |
| Thursday | Chuleta Ahumada | $10.95 |
| Friday | Bacalao Guisado | $10.95 |
| Saturday | Sancocho de Res | $11.95 |

---

### 🍛 HOT FOOD — Dinner
**Viernes Social / Friday Social**

#### Dinner Proteins
| Item | PEQ $8.99 | MED $11.99 | GRND $15.99 |
|------|-----------|------------|-------------|
| Pollo Guisado | ✅ | ✅ | ✅ |
| Pollo Horneado | ✅ | ✅ | ✅ |
| Carne de Res Guisada | +$2 | +$2 | +$2 |
| Pescado Guisado | +$2 | +$2 | +$2 |
| Chuleta Ahumada | +$1 | +$1 | +$1 |
| Costilla de Res | +$3 | +$3 | +$3 |
| Chivo Guisado | +$4 | +$4 | +$4 |
| Pernil | ✅ | ✅ | ✅ |
| Bacalao Guisado | +$3 | +$3 | +$3 |
| Rabo Guisado | +$6 | +$6 | +$6 |
| Sancocho de Res (Fri only) | — | $11.99 | — |

Each dinner comes with rice, beans, salad, tostones/maduros, plus protein.

#### Dinner Sides
| Item | PEQ | MED | GRND |
|------|-----|-----|------|
| Arroz Blanco | — | $2.99 | $4.95 |
| Habichuelas | 8oz $1.95 | 16oz $3.95 | 32oz $7.95 |
| Maduros | $3.95 | $6.95 | — |
| Tostones | $3.95 | $5.95 | — |
| Papas Fritas | $1.95 | $2.95 | — |
| Ensalada Verde | $3.95 | $4.95 | — |
| Yuca | $4.95 | $7.95 | — |
| Guineitos | $4.95 | $7.95 | — |
| Arroz con Habichuela | $3.95 | $5.95 | $8.95 |

---

### 🍽️ HOT MEALS — Bandejas (Platters)
| Item | Price |
|------|-------|
| Bandeja de Pollo Guisado | $7.95 |
| Bandeja de Pernil | $9.99 |
| Bandeja de Carne de Res | $8.95 |
| Bandeja de Pescado | $8.95 |
| Bandeja de Chivo | $9.99 |
| Bandeja de Chuleta Ahumada | $8.95 |
| Bandeja de Rabo | $11.99 |
| Bandeja de Sancocho | $9.99 |

---

### 🍳 HOT FOOD — Breakfast Lunch
| Item | Price |
|------|-------|
| Mangu con los 3 Golpes (Salami, Queso, Huevo) | $11.95 |
| Mangu con Salami y Queso | $10.95 |
| Mangu con Salami | $9.95 |
| Mangu con Cebolla | $7.95 |
| Pastelon (per lb) | $8.95 |

---

### 🍞 BAKERY
| Item | Price |
|------|-------|
| Bizcocho Dominicano | $4.95 |
| Pan de Agua | $1.00 |
| Pan de Leche | $1.00 |
| Pan de Molde | $3.99 |
| Pan de Yuca | $4.99 |
| Pan de Maiz | $2.99 |
| Galletas Dulces | $2.50 |
| Pastelillos | $1.50 |

---

### 🎉 PICADERA (Party Platter)
**$59.99 — ORDER 1 WEEK IN ADVANCE**
- 12 Bolitas de Yuca
- 12 Quipesitos
- 12 Empanaditas de Queso
- 12 Empanaditas de Pollo
- 12 Sandwichitos

### 🐔 PICA POLLO (Fried Chicken)
| Item | Price |
|------|-------|
| 3PC Fried Chicken | $8.99 |

---

### 🏆 PICALONGA — Meat Combos
_Choose from: Res Salada, Cerdo Salada, Longaniza, Alitas Fritas, Chuleta Ahumada, Queso Frito, Salami Frito, Chicharron, Orejitas_
_Served with: Tostones, Batata, or Papas Fritas_

| Combo | Price |
|-------|-------|
| 2 Carnes | $12.95 |
| 3 Carnes | $16.95 |
| 4 Carnes | $24.95 |
| 6 Carnes | $39.95 |
| 8 Carnes | $59.95 |

### 🥟 MOFONGOS
| Item | Price |
|------|-------|
| Mofongo de Longaniza | $15.95 |
| Mofongo con Queso | $15.95 |
| Mofongo con Camarones | $18.95 |
| Mofongo de Chicharron | $15.95 |

---

### 🍟 SIDE ORDERS
| Item | PEQ | MED | GRND |
|------|-----|-----|------|
| Tostones | $3.95 | $5.95 | — |
| Maduros | $3.95 | $6.95 | — |
| Papas Fritas | $1.95 | $2.95 | — |
| Arroz Blanco | $2.99 | $4.95 | $6.99 |
| Habichuelas | 8oz $1.95 | 16oz $3.95 | 32oz $7.95 |
| Bistec Contenedor | — | 16oz $9.95 | 32oz $17.95 |
| Pollo Guisado → | $7.95 | $4.95 ⚠️ | — |

> ⚠️ **Pollo Guisado MED $4.95** — likely a typo (cheaper than PEQ). Confirm actual price.

### 🥟 Appetizers
| Item | Price |
|------|-------|
| Empanadas (Queso/Res/Pollo) | $2.00 |
| Quipe (Pollo/Res) | $2.50 |
| Bola de Yuca (Queso/Res) | $2.50 |
| Yaroa Pollo MED | $7.99 |
| Yaroa Pollo GRND | $10.00 |
| Yaroa Res MED | $7.99 |
| Yaroa Res GRND | $10.00 |

### ⚖️ By the Pound
| Item | Price/lb |
|------|----------|
| Chicharron | $12.99 |
| Pernil | $12.99 |

---

### 🍽️ CATERING — Order 1 Week in Advance
#### Rice & Beans
| Item | PEQ | MED | GRND |
|------|-----|-----|------|
| Arroz Blanco | $35 | $50 | $70 |
| Arroz con Guandulez | $45 | $55 | $75 |
| Moro Rojo | $45 | $55 | $75 |
| Moro Negro | $45 | $55 | $75 |
| Pernil 55 Piezas | — | $55 **each** | — |

#### Meats
| Item | PEQ | MED | GRND |
|------|-----|-----|------|
| Carne Res Guisada | $95 | $160 | $235 |
| Pollo Guisado | $60 | $100 | $150 |
| Pollo Horneado | $60 | $90 | $120 |

#### Sides (Catering)
| Item | PEQ | MED | GRND |
|------|-----|-----|------|
| Maduros | $45 | $75 | $95 |
| Guineitos | $35 | $55 | $75 |
| Yuca | $45 | $75 | $95 |
| Ensalada Verde | $45 | $65 | $90 |

---

## 🏪 Store Info
| Field | Value |
|-------|-------|
| **Address** | 288 Kearny Ave, Kearny NJ 07032 |
| **Phone** | 201-428-1745 |
| **WhatsApp** | 732-925-5201 |
| **Website** | anthonysupermarket.com |
| **Instagram** | @anthony_supermarket |
| **Hours** | 7:00 AM – 9:00 PM daily |

---

## Ordering Flow (KFS Lion)

When a customer wants to order via @her_mes_woo:

1. **Browse menu** — Reference the sections above
2. **Build cart** — Track items + quantities
3. **Place order** — POST to API:

```bash
curl -X POST http://localhost:3001/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"nombre":"Pollo Guisado","precio":11.99,"cantidad":1}],
    "tipoEntrega": "pickup",
    "cliente": {
      "nombre": "Customer Name",
      "telefono": "201-xxx-xxxx",
      "direccion": ""
    },
    "notas": "Extra tostones"
  }'
```

Response: `{"ok":true, "orderId":"ABC12345", "total":11.99}`

4. **Kitchen notified** automatically via Telegram group
5. **Confirm customer** with order number

---

## API Reference

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/menu` | Full menu |
| POST | `/api/orders` | Place order |
| GET | `/api/orders` | All orders (last 50) |
| GET | `/api/orders/:id` | Order by ID |

---

## Quick Stats
- ~100+ items across 18 menu sections
- 6 daily lunch special menus (Mon–Sat)
- Catering: 12 items in 3 sizes each
- Store: 288 Kearny Ave, open 7AM–9PM daily

---

## Brand
- **Theme:** Dark cyberpunk-bodega, neon green (#00ff41)
- **Logo:** Crowned shopping cart
- **Style:** Bodega + Kingdom fusion
- **KFS Lion Tone:** Friendly, efficient, kingdom-themed
