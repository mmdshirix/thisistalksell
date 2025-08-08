# Multi-stage Dockerfile optimized for Liara and other Docker platforms.
# - Prefers npm ci with a lockfile; falls back to npm install when the lockfile is missing/incompatible.
# - Installs devDependencies during the build stage (Tailwind/PostCSS/TypeScript).
# - Prunes devDependencies for a lean runtime.
# - No UI/structure changes.

FROM node:20-alpine AS base

# Minimal packages to keep image small and stable.
RUN apk add --no-cache libc6-compat curl dumb-init

WORKDIR /app

# Non-root user for security.
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

# ---------------------------
# deps stage: install prod deps for cache speed
# ---------------------------
FROM base AS deps
WORKDIR /app

# Copy just the package manifests for better layer caching
COPY package.json package-lock.json* ./

# Prefer reproducible install with lockfile, otherwise generate one
RUN if [ -f package-lock.json ]; then \
      echo "Using npm ci --omit=dev --frozen-lockfile"; \
      npm ci --omit=dev --frozen-lockfile || (echo "npm ci failed. Rebuilding lockfile with npm install --omit=dev..." && rm -f package-lock.json && npm install --omit=dev); \
    else \
      echo "No lockfile. Running npm install --omit=dev to generate one..."; \
      npm install --omit=dev; \
    fi && npm cache clean --force

# ---------------------------
# builder stage: install ALL deps (including dev) and build
# ---------------------------
FROM base AS builder
WORKDIR /app

# IMPORTANT: Do NOT set NODE_ENV=production before installing dev deps,
# otherwise npm will omit devDependencies (autoprefixer, tailwind, types).
ENV NEXT_TELEMETRY_DISABLED=1

# Copy package files
COPY package.json package-lock.json* ./

# Install ALL dependencies (dev deps included), even if lockfile is missing/broken
RUN if [ -f package-lock.json ]; then \
      echo "Installing build deps with npm ci (includes devDependencies)..."; \
      npm ci || (echo "npm ci failed. Rebuilding lockfile with npm install..." && rm -f package-lock.json && npm install); \
    else \
      echo "No lockfile. Running npm install (includes devDependencies)..."; \
      npm install; \
    fi

# Copy the rest of the source
COPY . .

# Build the Next.js app (Next sets NODE_ENV=production during build)
RUN npm run build

# Prune dev deps to keep runtime slim
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

# Copy runtime artifacts from builder
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Run as non-root
USER nextjs

EXPOSE 3000

# Health check (expects /api/health to exist)
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

ENTRYPOINT ["dumb-init","--"]
CMD ["npm","start"]
