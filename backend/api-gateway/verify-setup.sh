#!/bin/bash

# Prisma setup verification script
# Run this to check if everything is configured correctly

set -e

echo "🔍 Prisma ORM Setup Verification"
echo "=================================="
echo ""

# Check Node.js
echo "✓ Checking Node.js..."
node_version=$(node -v)
echo "  Node.js: $node_version"

# Check npm
echo ""
echo "✓ Checking npm..."
npm_version=$(npm -v)
echo "  npm: $npm_version"

# Check .env file
echo ""
echo "✓ Checking environment configuration..."
if [ -f ".env" ]; then
  echo "  .env file found ✓"
  if grep -q "DATABASE_URL" .env; then
    echo "  DATABASE_URL configured ✓"
  else
    echo "  ⚠️  DATABASE_URL not configured"
    echo "  Please copy .env.example to .env and update values"
  fi
else
  echo "  ⚠️  .env file not found"
  echo "  Run: cp .env.example .env"
fi

# Check prisma directory
echo ""
echo "✓ Checking Prisma files..."
if [ -f "prisma/schema.prisma" ]; then
  echo "  schema.prisma found ✓"
else
  echo "  ⚠️  schema.prisma not found"
fi

# Check package.json dependencies
echo ""
echo "✓ Checking dependencies..."
if grep -q "@prisma/client" package.json; then
  echo "  @prisma/client in package.json ✓"
else
  echo "  ⚠️  @prisma/client not in package.json"
fi

if grep -q '"prisma"' package.json; then
  echo "  prisma (dev) in package.json ✓"
else
  echo "  ⚠️  prisma dev dependency not in package.json"
fi

# Check node_modules
echo ""
echo "✓ Checking node_modules..."
if [ -d "node_modules/@prisma" ]; then
  echo "  @prisma installed ✓"
else
  echo "  ⚠️  @prisma not installed"
  echo "  Run: npm install"
fi

# Check Prisma Client generated
echo ""
echo "✓ Checking Prisma Client generation..."
if [ -d "node_modules/.prisma/client" ]; then
  echo "  Prisma Client generated ✓"
else
  echo "  ⚠️  Prisma Client not generated"
  echo "  Run: npx prisma generate"
fi

# Check auth.ts refactored
echo ""
echo "✓ Checking refactored code..."
if grep -q "import prisma from" src/routes/auth.ts; then
  echo "  auth.ts uses Prisma ✓"
else
  echo "  ⚠️  auth.ts not refactored to use Prisma"
fi

# Check Prisma config
echo ""
echo "✓ Checking Prisma configuration..."
if [ -f "src/config/prisma.ts" ]; then
  echo "  Prisma singleton created ✓"
else
  echo "  ⚠️  Prisma singleton not found"
fi

echo ""
echo "=================================="
echo "✅ Setup verification complete!"
echo ""
echo "📝 Next steps:"
echo "1. Update .env with correct DATABASE_URL if needed"
echo "2. Run: npm install"
echo "3. Run: npx prisma migrate dev --name init"
echo "4. Run: npm run dev"
echo ""
