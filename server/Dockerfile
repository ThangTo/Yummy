# Node.js Backend Dockerfile
# Multi-stage build để tối ưu kích thước image

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (bao gồm devDependencies để build)
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ONLY production dependencies
RUN npm ci --only=production

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist

# Note: Thư mục uploads sẽ được mount từ volume trong docker-compose.yml
# Không cần copy vào image

# Expose port
EXPOSE 5000

# Start server
CMD ["npm", "start"]

