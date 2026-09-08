# Production Multi-Stage Dockerfile for PlayPortal
FROM node:20-alpine AS builder

WORKDIR /app

# Build frontend
COPY client/package*.json ./client/
RUN cd client && npm ci

COPY client/ ./client/
RUN cd client && npm run build

# Setup backend
COPY server/package*.json ./server/
RUN cd server && npm ci --only=production

COPY server/ ./server/
COPY package.json ./

# Final runtime stage
FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000

COPY --from=builder /app/package.json ./
COPY --from=builder /app/server ./server
COPY --from=builder /app/client/dist ./client/dist

EXPOSE 5000

CMD ["node", "server/src/server.js"]
