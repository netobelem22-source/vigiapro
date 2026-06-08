FROM node:18-alpine
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
RUN npm install --omit=dev
COPY . .
EXPOSE 8080
CMD ["sh", "-c", "npx prisma migrate deploy && node src/server.js"]
