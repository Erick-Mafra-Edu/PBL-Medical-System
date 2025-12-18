#!/bin/sh

# Entrypoint script for API Gateway
# Handles database migrations before starting the server

set -e

echo "🚀 PBL API Gateway - Docker Entrypoint"
echo "======================================"

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL environment variable not set"
  echo "Please set DATABASE_URL in docker-compose or .env"
  exit 1
fi

echo "📝 Environment: $NODE_ENV"

# Wait for database
echo ""
echo "⏳ Waiting for PostgreSQL..."
max_retries=30
retry_count=0

while [ $retry_count -lt $max_retries ]; do
  if npx prisma db execute --stdin --file /dev/null 2>/dev/null || \
     node -e "require('pg').connect(process.env.DATABASE_URL, (err) => process.exit(err ? 1 : 0))" 2>/dev/null; then
    echo "✓ PostgreSQL is ready"
    break
  fi
  
  retry_count=$((retry_count + 1))
  echo "  Attempt $retry_count/$max_retries: Waiting for database..."
  sleep 2
done

if [ $retry_count -ge $max_retries ]; then
  echo "❌ PostgreSQL failed to become ready after $max_retries attempts"
  exit 1
fi

# Generate Prisma Client
echo ""
echo "📦 Generating Prisma Client..."
npx prisma generate

# Run migrations
echo ""
echo "🔄 Running Prisma migrations..."
if npx prisma migrate deploy; then
  echo "✓ All migrations applied successfully"
else
  MIGRATE_EXIT_CODE=$?
  if [ $MIGRATE_EXIT_CODE -eq 0 ]; then
    echo "✓ No pending migrations"
  else
    echo "⚠️  Migration check returned exit code $MIGRATE_EXIT_CODE"
    # Don't exit, let the app start and handle it
  fi
fi

# Seed database if needed (optional)
if [ "$NODE_ENV" = "development" ] && [ -f "prisma/seed.ts" ]; then
  echo ""
  echo "🌱 Seeding database..."
  npx prisma db seed || echo "⚠️  Seeding failed or seed not implemented"
fi

echo ""
echo "✅ Database ready!"
echo ""
echo "🎯 Starting API Gateway..."
echo "======================================"
echo ""

# Start the application
exec "$@"
