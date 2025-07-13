# Dockerfile for Next.js App Deployment on Liara

# --- STAGE 1: Builder ---
# In this stage, we install dependencies and build the application.
FROM node:20-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and lock file to leverage Docker cache
COPY package.json ./
# If you use pnpm or yarn, you should copy pnpm-lock.yaml or yarn.lock as well
# COPY package-lock.json* pnpm-lock.yaml* yarn.lock* ./

# Install dependencies using npm
RUN npm install

# Copy the rest of the application source code
COPY . .

# Set a dummy DATABASE_URL for build time to prevent build errors
# The real DATABASE_URL will be provided at runtime
ENV DATABASE_URL="postgresql://dummy:dummy@dummy:5432/dummy"

# Build the Next.js application for production
# The `next.config.mjs` is already configured with `output: 'standalone'`
# which is perfect for Docker.
RUN npm run build


# --- STAGE 2: Runner ---
# This is the final stage, creating a minimal image to run the app.
FROM node:20-alpine AS runner

# Set the working directory
WORKDIR /app

# Set environment to production for performance
ENV NODE_ENV=production
# Disable Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the standalone output from the builder stage.
# This includes the minimal server and necessary node_modules.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# Copy the public and static assets
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

# Expose the port the app will run on
EXPOSE 3000

# The command to start the application
CMD ["node", "server.js"]
