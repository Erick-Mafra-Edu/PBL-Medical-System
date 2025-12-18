#!/bin/bash

# Quick start script for Prisma migration in PBL Medical System
# This script automates the entire setup process

set -e

echo "🚀 PBL Medical System - Prisma ORM Quick Start"
echo "=============================================="
echo ""

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

# Step 1: Check prerequisites
echo "📋 Step 1: Checking prerequisites..."
if ! command -v node &> /dev/null; then
  echo "❌ Node.js not found. Please install Node.js first."
  exit 1
fi
echo "✓ Node.js found: $(node -v)"

if ! command -v npm &> /dev/null; then
  echo "❌ npm not found. Please install npm first."
  exit 1
fi
echo "✓ npm found: $(npm -v)"

# Step 2: Setup environment
echo ""
echo "📋 Step 2: Setting up environment..."
if [ ! -f ".env" ]; then
  if [ -f ".env.example" ]; then
    cp .env.example .env
    echo "✓ Created .env from .env.example"
    echo "⚠️  Please review and update .env with your settings"
  else
    echo "❌ .env.example not found"
    exit 1
  fi
else
  echo "✓ .env already exists"
fi

# Step 3: Verify DATABASE_URL
echo ""
echo "📋 Step 3: Checking DATABASE_URL..."
if grep -q "^DATABASE_URL=" .env; then
  DB_URL=$(grep "^DATABASE_URL=" .env | cut -d '=' -f 2)
  echo "✓ DATABASE_URL configured: $DB_URL"
else
  echo "❌ DATABASE_URL not found in .env"
  echo "Please add DATABASE_URL=postgresql://... to .env"
  exit 1
fi

# Step 4: Install dependencies
echo ""
echo "📋 Step 4: Installing dependencies..."
npm install
echo "✓ Dependencies installed"

# Step 5: Generate Prisma Client
echo ""
echo "📋 Step 5: Generating Prisma Client..."
npx prisma generate
echo "✓ Prisma Client generated"

# Step 6: Run migrations
echo ""
echo "📋 Step 6: Running database migrations..."
echo "This will create all tables from schema.prisma"
npx prisma migrate dev --name init
echo "✓ Migrations applied"

# Step 7: Optional: Verify setup
echo ""
echo "📋 Step 7: Verifying setup..."
if [ -d "node_modules/.prisma/client" ]; then
  echo "✓ Prisma Client verified"
else
  echo "⚠️  Prisma Client not found. Run: npx prisma generate"
fi

# Step 8: Success message
echo ""
echo "=============================================="
echo "✅ Prisma ORM setup complete!"
echo ""
echo "📚 Available commands:"
echo "  npm run dev           - Start development server"
echo "  npx prisma studio    - Open Prisma data browser"
echo "  npx prisma migrate dev --name <name>  - Create new migration"
echo "  npx prisma migrate reset - Reset database (dev only)"
echo "  npx prisma generate  - Regenerate Prisma Client"
echo ""
echo "📖 Documentation:"
echo "  - See PRISMA_MIGRATION.md for detailed migration info"
echo "  - See .env.example for all available environment variables"
echo ""
echo "🎯 Next steps:"
echo "  1. Review .env and verify DATABASE_URL points to correct database"
echo "  2. Run 'npm run dev' to start the API Gateway"
echo "  3. Test auth endpoints at http://localhost:3000/api/auth"
echo ""
