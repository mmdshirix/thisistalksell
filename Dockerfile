# Dockerfile for Next.js Application

# --- Stage 1: Install Dependencies ---
# Use a specific Node.js version for consistency
FROM node:20-alpine AS deps
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package definition files
COPY package.json pnpm-lock.yaml ./

# Install dependencies using pnpm
# --frozen-lockfile ensures we use the exact versions from the lock file
RUN pnpm install --frozen-lockfile

# --- Stage 2: Build Application ---
FROM node:20-alpine AS builder
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy dependencies from the 'deps' stage for caching
COPY --from=deps /app/node_modules ./node_modules
# Copy the rest of the application source code
COPY . .

# Set build-time environment variables if needed
# ARG NEXT_PUBLIC_...
# ENV NEXT_PUBLIC_...

# Build the Next.js application
RUN pnpm build

# --- Stage 3: Production Runner ---
FROM node:20-alpine AS runner
WORKDIR /app

# Set the environment to production
ENV NODE_ENV production

# Copy only the necessary files from the builder stage
# This reduces the final image size significantly
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Expose the port the app will run on
EXPOSE 3000

# The command to start the application
CMD ["pnpm", "start"]
