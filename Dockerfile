FROM node:18-alpine

RUN apk add --no-cache libc6-compat postgresql-client

WORKDIR /app

# اضافه کردن متغیر محیطی برای زمان build
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL
ENV NODE_ENV=production

COPY package.json ./

# Install dependencies
RUN npm install --production --frozen-lockfile

COPY . .

# Build the application
RUN npm run build

# Remove dev dependencies and clean npm cache
RUN npm prune --production && npm cache clean --force

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Change ownership of the app directory
RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["npm", "start"]
