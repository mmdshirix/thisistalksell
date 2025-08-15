# Multi-stage Dockerfile for Next.js (standalone output), optimized for Liara.
# - Prefers npm ci with a valid lockfile; falls back to npm install if missing/incompatible.
# - Installs devDependencies only in the builder stage for PostCSS/Tailwind build.
# - Ships minimal standalone runtime.

FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat curl dumb-init python3 make g++ postgresql-dev
WORKDIR /app
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

# 1) Production deps layer (optional cache layer for prod-only deps)
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then \
      echo "Using npm ci --omit=dev --frozen-lockfile"; \
      npm ci --omit=dev --frozen-lockfile; \
    else \
      echo "No lockfile. Running npm install --omit=dev to generate one..."; \
      npm install --omit=dev; \
    fi && npm cache clean --force

# 2) Builder: install full deps (incl dev), build Next.js app
FROM base AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then \
      echo "Installing build deps with npm ci (includes devDependencies)..."; \
      npm ci; \
    else \
      echo "No lockfile. Running npm install (includes devDependencies)..."; \
      npm install; \
    fi
COPY . .
RUN npm run build

# 3) Runner: minimal runtime with standalone output
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Use the prod node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
# Copy built assets and minimal app files required for next start
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.mjs ./next.config.mjs

# If your app uses these at runtime, keep them; harmless if not used
COPY --from=builder /app/app ./app
COPY --from=builder /app/components ./components
COPY --from=builder /app/lib ./lib
COPY --from=builder /app/styles ./styles

USER nextjs
EXPOSE 3000
CMD ["dumb-init", "node", "node_modules/next/dist/bin/next", "start", "-p", "3000"]
