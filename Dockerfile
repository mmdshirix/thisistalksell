# Multi-stage Dockerfile optimized for Liara (and other Docker platforms)
# Keeps UI/structure intact; only improves build reliability and speed

FROM node:20-alpine AS base

# Minimal deps; keep image small and secure
RUN apk add --no-cache libc6-compat curl dumb-init

WORKDIR /app

# Non-root user
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

# ---------------------------
# deps stage
# ---------------------------
FROM base AS deps
WORKDIR /app

# Copy package files (lockfile if present)
COPY package.json package-lock.json* ./

# Prefer reproducible install; fallback to npm install if lockfile missing/broken
RUN if [ -f package-lock.json ]; then \
      echo "Using npm ci --omit=dev --frozen-lockfile"; \
      npm ci --omit=dev --frozen-lockfile || (echo "npm ci failed, rebuilding lockfile with npm install --omit=dev..." && rm -f package-lock.json && npm install --omit=dev); \
    else \
      echo "No lockfile found, running npm install --omit=dev"; \
      npm install --omit=dev; \
    fi && npm cache clean --force

# ---------------------------
# builder stage
# ---------------------------
FROM base AS builder
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy package files again
COPY package.json package-lock.json* ./

# Full deps for building (TS/Tailwind/PostCSS if any)
RUN if [ -f package-lock.json ]; then \
      npm ci || (echo "npm ci failed, rebuilding lockfile with npm install..." && rm -f package-lock.json && npm install); \
    else \
      npm install; \
    fi

# Copy the rest of the source code
COPY . .

# Build Next.js project
RUN npm run build

# Prune dev dependencies after build to keep runtime small
RUN npm prune --omit=dev && npm cache clean --force

# ---------------------------
# runner stage (lean runtime)
# ---------------------------
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOST=0.0.0.0
ENV HOSTNAME=0.0.0.0

# Copy runtime artifacts from builder
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Run as non-root
USER nextjs

EXPOSE 3000

# Health check points to our health route
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

ENTRYPOINT ["dumb-init","--"]
CMD ["npm","start"]
