# Multi-stage build for Node.js server
# Build context is the repo root (see docker-compose.yml)
FROM node:22-alpine AS builder
WORKDIR /app
COPY server/package*.json ./
RUN npm ci

FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY server/ .
# Pricing Hub static (served by index.js when PRICING_SERVE_STATIC=1)
COPY apps/pricing-hub/ ./apps/pricing-hub/
# Seed goes to /app/seed (NOT /app/data — that dir is a volume mount)
COPY apps/menu/scripts/anthonys-seed.json ./seed/anthonys-seed.json
EXPOSE 3001
CMD ["node", "index.js"]
