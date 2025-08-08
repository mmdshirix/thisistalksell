# Use Node.js 20 Alpine for smaller image size and better security
FROM node:20-alpine AS base

# Minimal system deps; keep image small and secure
RUN apk add --no-cache libc6-compat curl dumb-init

# Set working directory
WORKDIR /app

# Create non-root user early
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

# Dependencies stage
FROM base AS deps
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Prefer npm ci when lockfile exists; otherwise generate it with npm install
RUN if [ -f package-lock.json ]; then \
        echo "Using npm ci with existing package-lock.json"; \
        npm ci --omit=dev; \
      else \
        echo "No package-lock.json found, running npm install to generate one..."; \
        npm install --omit=dev; \
      fi && npm cache clean --force

# Builder stage
FROM base AS builder
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies)
RUN if [ -f package-lock.json ]; then \
        npm ci; \
      else \
        npm install; \
      fi

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOST=0.0.0.0
ENV HOSTNAME=0.0.0.0

# Copy built application from builder stage
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init","--"]

# Start the application
CMD ["node","server.js"]
