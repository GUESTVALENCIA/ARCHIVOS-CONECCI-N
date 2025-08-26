# -------------------------------
# Sandra Full Backend - Dockerfile
# -------------------------------
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* .npmrc* ./ 2>/dev/null || true
RUN npm i --omit=dev

FROM node:20-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Healthcheck (optional): uses /healthz
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s CMD wget -qO- http://localhost:8787/healthz || exit 1
EXPOSE 8787
CMD ["node", "server.js"]
