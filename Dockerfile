FROM node:18-alpine

RUN apk add --no-cache libc6-compat

WORKDIR /app

# اضافه کردن متغیر محیطی برای زمان build
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

COPY package.json ./
COPY package-lock.json* ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
