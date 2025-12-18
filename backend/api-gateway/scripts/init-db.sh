#!/bin/bash

# Database initialization and migration script for Prisma
# This script ensures the database is ready and migrations are applied

set -e

echo "🗄️  Initializing database with Prisma migrations..."

# Wait for database to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
max_attempts=30
attempt=1

until pg_isready -h postgres -p 5432 -U "${DB_USER}" || [ $attempt -ge $max_attempts ]; do
  echo "  Attempt $attempt/$max_attempts: PostgreSQL not ready yet..."
  sleep 1
  attempt=$((attempt + 1))
done

if [ $attempt -ge $max_attempts ]; then
  echo "❌ PostgreSQL failed to become ready after $max_attempts attempts"
  exit 1
fi

echo "✓ PostgreSQL is ready"

# Run Prisma migrations
echo ""
echo "🔄 Running Prisma migrations..."
if npx prisma migrate deploy; then
  echo "✓ Migrations applied successfully"
else
  echo "⚠️  Migration deploy failed, attempting migrate dev..."
  npx prisma migrate dev --name init
fi

# Generate Prisma Client
echo ""
echo "📦 Generating Prisma Client..."
npx prisma generate

echo ""
echo "✅ Database initialization complete!"
