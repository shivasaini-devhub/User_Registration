# ==========================================
# 1. Builder Stage
# ==========================================
FROM node:22-alpine AS builder
WORKDIR /app

# Install dependencies including devDependencies for build & Prisma CLI
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

# Copy application source code
COPY . .

# Generate Prisma Client & compile NestJS TypeScript app
RUN npx prisma generate
RUN npm run build

# ==========================================
# 2. Production Dependencies Stage
# ==========================================
FROM node:22-alpine AS deps
WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --omit=dev
RUN npx prisma generate

# ==========================================
# 3. Final Production Runner Stage
# ==========================================
FROM node:22-alpine AS runner
WORKDIR /app

# Dynamic build arguments
ARG PORT=5000
ARG DATABASE_URL

ENV NODE_ENV=production
ENV PORT=${PORT}
ENV DATABASE_URL=${DATABASE_URL}

# Copy built dist, production dependencies, and Prisma assets with non-root ownership
COPY --chown=node:node --from=deps /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/package*.json ./
COPY --chown=node:node --from=builder /app/prisma ./prisma

# Security: Run as non-root user
USER node

EXPOSE 5000

CMD ["node", "dist/main.js"]