# ── Stage 1: Build the NestJS API ──────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm install --ignore-scripts

COPY prisma ./prisma/
RUN npx prisma generate

COPY . .
RUN npm run build
RUN npx tsc prisma/seed.ts --outDir dist/prisma --skipLibCheck --module commonjs --target ES2022 --moduleResolution node

# ── Stage 2: Production Runtime ─────────────────────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production \
    PORT=5005

RUN apk add --no-cache openssl curl

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install --omit=dev
RUN npx prisma generate

COPY --from=builder /app/dist ./dist
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Build arguments for version diagnostics
ARG APP_VERSION=1.0.0
ARG APP_COMMIT=dev
ENV APP_VERSION=$APP_VERSION \
    APP_COMMIT=$APP_COMMIT

EXPOSE 5005

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 5005) + '/api/health').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "dist/src/main.js"]
