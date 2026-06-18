# StarTorque AI OS - Production Dockerfile
# Multi-stage build for optimal image size and security

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production && \
    npm ci --only=dev

# Copy source
COPY tsconfig.json ./
COPY src ./src

# Build TypeScript
RUN npm run build && \
    npm run clean && \
    rm -rf src tsconfig.json

# Stage 2: Runtime
FROM node:20-alpine

WORKDIR /app

# Security: Set non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy only production dependencies and built code
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./package.json

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 3000) + '/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})" || exit 1

# Expose port
EXPOSE 3000

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

# Run as non-root
USER nodejs

# Start application
CMD ["node", "dist/index.js"]
