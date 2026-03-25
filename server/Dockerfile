# ── Stage 1: Install dependencies ────────────────────────────────────────────
FROM node:18-alpine AS deps

WORKDIR /app

# Copy package files first (layer cache — only reinstalls if package.json changes)
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# ── Stage 2: Production image ─────────────────────────────────────────────────
FROM node:18-alpine AS runner

WORKDIR /app

# Security: run as non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy only prod dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source
COPY src/ ./src/
COPY package.json ./

# Set ownership
RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000

CMD ["node", "src/index.js"]
