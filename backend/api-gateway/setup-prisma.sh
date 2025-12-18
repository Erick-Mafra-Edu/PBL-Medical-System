#!/bin/bash

# Prisma migration setup script for PBL Medical System
# This script initializes Prisma and creates the initial migration

set -e

echo "🔧 Setting up Prisma ORM..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "⚠️  DATABASE_URL not set. Using .env.example values..."
  export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pbl_system"
fi

echo "📦 Installing dependencies..."
npm install

echo "🗄️  Creating initial migration..."
npx prisma migrate dev --name init

echo "✅ Prisma setup complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Update .env with your actual database credentials"
echo "   2. Run 'npm run dev' to start the API Gateway"
echo "   3. Prisma will automatically sync your database schema"
