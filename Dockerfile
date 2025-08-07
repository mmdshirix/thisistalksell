# Use Node.js 20 Alpine for better compatibility
FROM node:20-alpine

# Install system dependencies
RUN apk add --no-cache \
    libc6-compat \
    postgresql-client \
    curl

# Set working directory
WORKDIR /app

# Set environment variables for build
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies with npm ci for faster, reliable builds
RUN npm ci --only=production --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Remove development dependencies and clean cache
RUN npm prune --production && \
    npm cache clean --force && \
    rm -rf .next/cache

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Set correct ownership and permissions
RUN chown -R nextjs:nodejs /app && \
    chmod -R 755 /app

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Start the application
CMD ["npm", "start"]
