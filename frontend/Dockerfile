# Stage 1: Build Vite React Application
FROM node:20-alpine AS builder

WORKDIR /app

# Build arguments for dynamic backend endpoints
ARG VITE_API_BASE_URL
ARG VITE_WS_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_WS_URL=$VITE_WS_URL

# Copy dependency definitions
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy source files and build production bundle
COPY . .
RUN npm run build

# Stage 2: Production Nginx Server
FROM nginx:alpine

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration with SPA routing & reverse proxy
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
