FROM node:20-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init postgresql-client

# Copy package files
COPY package*.json ./

# Install dependencies (including devDependencies for Prisma CLI)
RUN npm ci 

# Copy Prisma schema
COPY prisma ./prisma

# Generate Prisma Client
RUN npm run prisma:generate

# Copy scripts
COPY scripts ./scripts
RUN chmod +x ./scripts/entrypoint.sh ./scripts/init-db.sh

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Install production dependencies only
RUN npm ci --only=production && npm cache clean --force

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
USER nodejs

# Expose port
EXPOSE 3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["/sbin/dumb-init", "--"]
# Run entrypoint script which handles migrations
CMD ["/app/scripts/entrypoint.sh", "npm", "start"]