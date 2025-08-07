# Use Node.js 20 Alpine for smaller image size and better security
FROM node:20-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    libc6-compat \
    postgresql-client \
    curl \
    dumb-init

# Set working directory
WORKDIR /app

# Create non-root user early
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Dependencies stage
FROM base AS deps

# Copy package files first for better caching
COPY package.json ./
COPY package-lock.json* ./

# Check if package-lock.json exists, if not create it
RUN if [ ! -f package-lock.json ]; then \
        echo "package-lock.json not found, generating..."; \
        npm install --package-lock-only; \
    fi

# Install dependencies with npm ci for faster, reliable builds
RUN npm ci --omit=dev && npm cache clean --force

# Builder stage
FROM base AS builder

# Copy package files
COPY package.json ./
COPY package-lock.json* ./

# Generate package-lock.json if it doesn't exist
RUN if [ ! -f package-lock.json ]; then \
        echo "package-lock.json not found, generating..."; \
        npm install --package-lock-only; \
    fi

# Install all dependencies (including dev dependencies)
RUN npm ci

# Copy source code
COPY . .

# Set build-time environment variables with fallbacks
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL=${DATABASE_URL:-"postgresql://mock:mock@localhost:5432/mock"}

# Generate Prisma client (with mock DATABASE_URL if needed)
RUN npx prisma generate || echo "Prisma generate failed, continuing..."

# Build the application
RUN npm run build

# Production stage
FROM base AS runner

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copy built application from builder stage
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Copy Prisma files if they exist
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma 2>/dev/null || true
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma 2>/dev/null || true

# Set correct permissions
RUN chown -R nextjs:nodejs /app && \
    chmod -R 755 /app

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "server.js"]
