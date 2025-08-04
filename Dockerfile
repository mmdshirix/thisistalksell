FROM node:18-alpine

# Install dependencies needed for native modules
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package.json and package-lock.json (if exists)
COPY package.json ./
RUN if [ -f package-lock.json ]; then COPY package-lock.json ./; fi

# Install dependencies
RUN npm install

# Copy all project files
COPY . .

# Build the Next.js application
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
