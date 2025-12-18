#!/bin/bash

# Quick start script for Docker deployment with Prisma
# This automates the entire Docker setup process

set -e

echo "🐳 PBL Medical System - Docker + Prisma Quick Start"
echo "===================================================="
echo ""

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

# Step 1: Check prerequisites
echo "📋 Step 1: Checking prerequisites..."
if ! command -v docker &> /dev/null; then
  echo "❌ Docker not found. Please install Docker Desktop."
  exit 1
fi
echo "✓ Docker found: $(docker --version)"

if ! command -v docker-compose &> /dev/null; then
  echo "❌ Docker Compose not found. Please install Docker Compose."
  exit 1
fi
echo "✓ Docker Compose found: $(docker-compose --version)"

# Step 2: Setup environment
echo ""
echo "📋 Step 2: Setting up environment..."
if [ ! -f ".env" ]; then
  if [ -f ".env.example" ]; then
    cp .env.example .env
    echo "✓ Created .env from .env.example"
    echo "  You can customize .env if needed"
  else
    echo "⚠️  .env.example not found, using defaults"
  fi
else
  echo "✓ .env already exists"
fi

# Step 3: Verify docker files exist
echo ""
echo "📋 Step 3: Verifying Docker configuration..."
if [ ! -f "docker-compose.yml" ]; then
  echo "❌ docker-compose.yml not found"
  exit 1
fi
echo "✓ docker-compose.yml found"

if [ ! -f "backend/api-gateway/Dockerfile" ]; then
  echo "❌ backend/api-gateway/Dockerfile not found"
  exit 1
fi
echo "✓ Dockerfile found"

if [ ! -f "backend/api-gateway/prisma/schema.prisma" ]; then
  echo "❌ Prisma schema not found"
  exit 1
fi
echo "✓ Prisma schema found"

# Step 4: Cleanup old containers (optional)
echo ""
echo "📋 Step 4: Cleaning up previous containers..."
if docker-compose ps | grep -q "Up\|Exit"; then
  echo "⚠️  Found running/stopped containers"
  read -p "Do you want to stop and remove them? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker-compose down --remove-orphans
    echo "✓ Cleaned up containers"
  fi
fi

# Step 5: Build images
echo ""
echo "📋 Step 5: Building Docker images..."
echo "This may take a few minutes on first run..."
if docker-compose build; then
  echo "✓ Images built successfully"
else
  echo "❌ Failed to build images"
  exit 1
fi

# Step 6: Start services
echo ""
echo "📋 Step 6: Starting services..."
echo "Starting: PostgreSQL, Redis, MinIO, API Gateway..."
if docker-compose up -d; then
  echo "✓ Services started"
else
  echo "❌ Failed to start services"
  docker-compose logs
  exit 1
fi

# Step 7: Wait for services to be healthy
echo ""
echo "📋 Step 7: Waiting for services to be ready..."
max_attempts=60
attempt=0

while [ $attempt -lt $max_attempts ]; do
  if docker-compose ps postgres | grep -q "healthy"; then
    echo "✓ PostgreSQL is healthy"
    break
  fi
  
  attempt=$((attempt + 1))
  if [ $((attempt % 10)) -eq 0 ]; then
    echo "  Waiting... (attempt $attempt/$max_attempts)"
  fi
  sleep 1
done

if [ $attempt -ge $max_attempts ]; then
  echo "⚠️  PostgreSQL took longer than expected"
  echo "Check logs: docker-compose logs postgres"
fi

# Step 8: Verify API Gateway is healthy
echo ""
echo "📋 Step 8: Verifying API Gateway..."
max_attempts=30
attempt=0

while [ $attempt -lt $max_attempts ]; do
  if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo "✓ API Gateway is healthy"
    break
  fi
  
  attempt=$((attempt + 1))
  if [ $attempt -eq 1 ] || [ $((attempt % 5)) -eq 0 ]; then
    echo "  Waiting for API Gateway... (attempt $attempt/$max_attempts)"
  fi
  sleep 1
done

if [ $attempt -ge $max_attempts ]; then
  echo "⚠️  API Gateway didn't become healthy"
  echo "Check logs: docker-compose logs api-gateway"
fi

# Step 9: Success summary
echo ""
echo "===================================================="
echo "✅ PBL Medical System is ready!"
echo ""
echo "📊 Services Running:"
docker-compose ps

echo ""
echo "📝 Access Points:"
echo "  • API Gateway: http://localhost:3000"
echo "  • Health Check: http://localhost:3000/health"
echo "  • PostgreSQL: localhost:5432"
echo "  • Redis: localhost:6379"
echo "  • MinIO Console: http://localhost:9001"
echo ""
echo "📚 Useful Commands:"
echo "  • View logs: docker-compose logs -f api-gateway"
echo "  • Prisma Studio: docker-compose exec api-gateway npx prisma studio"
echo "  • Database shell: docker-compose exec postgres psql -U postgres -d pbl_system"
echo "  • Stop services: docker-compose down"
echo "  • Restart: docker-compose up -d"
echo ""
echo "📖 Documentation:"
echo "  • See DOCKER_PRISMA_SETUP.md for detailed information"
echo ""
echo "🎯 Next Steps:"
echo "  1. Test API endpoints (see QUICKSTART.md)"
echo "  2. Review logs if any service failed"
echo "  3. Create your first course and flashcards"
echo ""
