# Multi-stage Dockerfile optimized for Liara, Vercel, Railway, Render
# - Prefers npm ci with lockfile; falls back to npm install when missing/incompatible
# - Builds with dev deps, then prunes for a lean runtime
# - Does NOT change UI or app structure

FROM node:20-alpine AS base

# Minimal, stable deps; keep image small
RUN apk add --no-cache libc6-compat curl dumb-init

WORKDIR /app

# Create non-root user
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

# ---------------------------
# deps stage: try prod-only install using lockfile (for cache + speed)
# ---------------------------
FROM base AS deps
WORKDIR /app

# Copy package files (lockfile included if present)
COPY package.json package-lock.json* ./

# Prefer npm ci --omit=dev; if it fails (bad/missing lockfile), fall back to install
# This also ensures a valid lockfile can be generated when absent
RUN if [ -f package-lock.json ]; then \
      echo "Lockfile found. Trying 'npm ci --omit=dev --frozen-lockfile'..."; \
      npm ci --omit=dev --frozen-lockfile || (echo "npm ci failed. Rebuilding lockfile with npm install --omit=dev..." && rm -f package-lock.json && npm install --omit=dev); \
    else \
      echo "No lockfile found. Running 'npm install --omit=dev' to generate one..."; \
      npm install --omit=dev; \
    fi && npm cache clean --force

# ---------------------------
# builder stage: full install for build (needs dev deps like tailwind/postcss/types)
# ---------------------------
FROM base AS builder
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy package files
COPY package.json package-lock.json* ./

# Use lockfile if present; fallback to npm install if missing/incompatible
RUN if [ -f package-lock.json ]; then \
      echo "Using 'npm ci' for build deps..."; \
      npm ci || (echo "npm ci failed. Rebuilding lockfile with npm install..." && rm -f package-lock.json && npm install); \
    else \
      echo "No lockfile found. Running 'npm install' to generate one for build..."; \
      npm install; \
    fi

# Copy source
COPY . .

# Build Next.js (does not connect to DB; runtime connects)
RUN npm run build

# Prune dev deps for runtime
RUN npm prune --omit=dev && npm cache clean --force

# ---------------------------
# runner stage: lean runtime image
# ---------------------------
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOST=0.0.0.0
ENV HOSTNAME=0.0.0.0

# Copy runtime artifacts
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Drop privileges
USER nextjs

EXPOSE 3000

# Health check (expects an existing /api/health route)
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

ENTRYPOINT ["dumb-init","--"]
CMD ["npm","start"]
