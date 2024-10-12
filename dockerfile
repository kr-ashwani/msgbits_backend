# Final Optimized Dockerfile

FROM node:20.5.0-alpine AS builder

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source files
COPY . .

RUN rm -rf .env*

# Build the application
RUN npm run build

# Production stage
FROM node:20.5.0-alpine

WORKDIR /usr/src/app

# Copy built assets from builder stage
COPY --from=builder /usr/src/app/build ./build
COPY --from=builder /usr/src/app/build/config ./config
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package*.json ./

# Set environment variables
ENV NODE_ENV=production \
    REDIS_PORT=6379 \
    REDIS_HOST=redis

# Create a non-root user and switch to it
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /usr/src/app
USER nodejs

# Expose the port the app runs on
EXPOSE 8080

# Start the application
CMD ["npm", "start"]