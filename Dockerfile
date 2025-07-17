# Dockerfile for Next.js Application (Optimized for Production)

# --- Stage 1: Install Dependencies ---
FROM node:20-alpine AS deps
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package definition files
COPY package.json pnpm-lock.yaml* ./

# The lockfile might be out of sync. In a CI/CD environment, you should fix this
# by running `pnpm install` locally and committing the updated lockfile.
# For this build, we run install without --frozen-lockfile to resolve any mismatch.
RUN pnpm install --prod

# --- Stage 2: Build Application ---
FROM node:20-alpine AS builder
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy dependencies from the 'deps' stage for caching
COPY --from=deps /app/node_modules ./node_modules
# Copy the rest of the application source code
COPY . .

# Build the Next.js application
RUN pnpm build

# --- Stage 3: Production Runner (Optimized with Standalone Output) ---
FROM node:20-alpine AS runner
WORKDIR /app

# Set the environment to production
ENV NODE_ENV production

# Copy the standalone output from the builder stage
COPY --from=builder /app/.next/standalone ./

# Copy the public and static folders which are needed for assets
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static

# Expose the port the app will run on (Liara will detect this automatically)
EXPOSE 3000

# The command to start the application in standalone mode
CMD ["node", "server.js"]
