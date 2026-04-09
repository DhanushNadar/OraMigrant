FROM node:22-alpine AS frontend-build

WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

FROM node:22-alpine AS production

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY src/ ./src/
COPY server.js ./
COPY --from=frontend-build /app/client/dist ./client/dist

ENV NODE_ENV=production
EXPOSE 5000

CMD ["node", "server.js"]
