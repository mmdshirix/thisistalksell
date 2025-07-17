# Dockerfile for Next.js Application (Fixed for Build Issues)

# --- Stage 1: Install Dependencies ---
FROM node:20-alpine AS deps
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package definition files
COPY package.json pnpm-lock.yaml* ./

# Install ALL dependencies (including devDependencies) for building
RUN pnpm install

# --- Stage 2: Build Application ---
FROM node:20-alpine AS builder
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy dependencies from the 'deps' stage for caching
COPY --from=deps /app/node_modules ./node_modules
# Copy the rest of the application source code
COPY . .

# Set NODE_ENV to production for optimized build
ENV NODE_ENV=production

# Build the Next.js application
RUN pnpm build

# --- Stage 3: Production Runner (Optimized with Standalone Output) ---
FROM node:20-alpine AS runner
WORKDIR /app

# Set the environment to production
ENV NODE_ENV=production

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the standalone output from the builder stage
COPY --from=builder /app/.next/standalone ./
# Copy the public and static folders which are needed for assets
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static

# Change ownership to the nextjs user
RUN chown -R nextjs:nodejs /app

# Switch to the nextjs user
USER nextjs

# Expose the port the app will run on (Liara will detect this automatically)
EXPOSE 3000

# The command to start the application in standalone mode
CMD ["node", "server.js"]
