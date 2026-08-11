# ==========================================
# 1. Builder Stage
# ==========================================

FROM node:22-bookworm-slim AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y \
    openssl \
    libc6 \
    libstdc++6 \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build


# ==========================================
# 2. Production Dependencies Stage
# ==========================================

FROM node:22-bookworm-slim AS deps

WORKDIR /app

RUN apt-get update && apt-get install -y \
    openssl \
    libc6 \
    libstdc++6 \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --omit=dev

RUN npx prisma generate


# ==========================================
# 3. Production Runner
# ==========================================

FROM node:22-bookworm-slim AS runner

WORKDIR /app

RUN apt-get update && apt-get install -y \
    openssl \
    libc6 \
    libstdc++6 \
    && rm -rf /var/lib/apt/lists/*

COPY --chown=node:node \
    --from=deps /app/node_modules ./node_modules

COPY --chown=node:node \
    --from=builder /app/dist ./dist

COPY --chown=node:node \
    --from=builder /app/package*.json ./

COPY --chown=node:node \
    --from=builder /app/prisma ./prisma

USER node

EXPOSE 5000

CMD ["node", "dist/main.js"]
