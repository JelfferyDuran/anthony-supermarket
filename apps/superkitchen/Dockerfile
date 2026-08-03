# Multi-stage build for Anthony's Super Kitchen Mini App
# Stage 1: build frontend (Vite + React)
FROM node:22-alpine AS frontend
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY index.html vite.config.js ./
COPY public ./public
COPY src ./src
RUN npm run build

# Stage 2: backend runtime
FROM node:22-alpine
WORKDIR /app
COPY server/package.json server/package-lock.json ./server/
RUN cd server && npm ci --omit=dev
COPY --from=frontend /app/dist ./dist
COPY server ./server
COPY src/data ./src/data
ENV NODE_ENV=production
EXPOSE 3002
CMD ["node", "server/index.js"]
