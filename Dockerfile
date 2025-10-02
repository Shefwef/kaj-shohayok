# 🚀 Kaj Shohayok - Multi-stage Docker Build
# Production-ready containerization with security and optimization

# ================================================================
# 📦 Base Image - Alpine Linux for Security & Size
# ================================================================
FROM node:18-alpine AS base

# Install system dependencies and security updates
RUN apk add --no-cache \
    libc6-compat \
    ca-certificates \
    tzdata && \
    apk upgrade --no-cache

# Set timezone to UTC
ENV TZ=UTC

# Create app directory with proper permissions
WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# ================================================================
# 📋 Dependencies Stage - Install and Cache Dependencies  
# ================================================================
FROM base AS deps

# Copy package files
COPY package*.json ./

# Install dependencies with npm ci for production builds
RUN npm ci --only=production && npm cache clean --force

# Install dev dependencies for build stage
RUN npm ci

# ================================================================
# 🏗️ Builder Stage - Build Next.js Application
# ================================================================
FROM base AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source code
COPY . .

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Generate Prisma client
RUN npx prisma generate

# Build the application with optimizations
RUN npm run build

# ================================================================
# 🚀 Production Stage - Minimal Runtime Image
# ================================================================
FROM base AS production

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copy built application from builder stage
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Copy Prisma files for runtime
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

# Create necessary directories
RUN mkdir -p /app/.next/cache && \
    chown -R nextjs:nodejs /app/.next/cache

# Switch to non-root user
USER nextjs

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Expose application port
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]

# ================================================================
# 🛠️ Development Stage - Hot Reload & Development Tools
# ================================================================
FROM base AS development

WORKDIR /app

# Install all dependencies including dev dependencies
COPY package*.json ./
RUN npm install

# Copy application source
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Switch to non-root user
USER nextjs

# Expose development port
EXPOSE 3000

# Start development server with hot reload
CMD ["npm", "run", "dev"]

# ================================================================
# 📊 Metadata & Labels
# ================================================================
LABEL maintainer="Kaj Shohayok Team"
LABEL version="1.0.0"
LABEL description="Advanced Task Management System with RBAC"
LABEL org.opencontainers.image.title="Kaj Shohayok"
LABEL org.opencontainers.image.description="Enterprise task management with Next.js and RBAC"
LABEL org.opencontainers.image.version="1.0.0"
LABEL org.opencontainers.image.vendor="Kaj Shohayok"
LABEL org.opencontainers.image.licenses="MIT"

# ================================================================
# 🔧 Build Arguments (Override at build time)
# ================================================================
ARG NODE_ENV=production
ARG NEXT_TELEMETRY_DISABLED=1
ARG DATABASE_URL
ARG MONGODB_URI
ARG CLERK_SECRET_KEY
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY