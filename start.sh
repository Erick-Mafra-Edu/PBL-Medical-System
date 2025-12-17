#!/bin/bash

# PBL Medical System - Startup Script
# This script helps you get started quickly

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║        PBL Medical System - Quick Start Script            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker is installed${NC}"
echo -e "${GREEN}✓ Docker Compose is installed${NC}"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠ .env file not found. Creating from .env.example...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✓ Created .env file${NC}"
    echo ""
    echo -e "${YELLOW}⚠ IMPORTANT: Please edit .env and add your API keys:${NC}"
    echo -e "   - OPENAI_API_KEY (required for AI features)"
    echo -e "   - JWT_SECRET (change to a random string)"
    echo ""
    read -p "Press Enter to continue after editing .env, or Ctrl+C to exit..."
else
    echo -e "${GREEN}✓ .env file exists${NC}"
fi

# Check if required API keys are set
if ! grep -q "OPENAI_API_KEY=sk-" .env; then
    echo -e "${YELLOW}⚠ Warning: OPENAI_API_KEY not set in .env${NC}"
    echo -e "   AI features will not work without it."
fi

echo ""
echo -e "${BLUE}Starting PBL Medical System...${NC}"
echo ""

# Stop any running containers
echo -e "${YELLOW}Stopping any running containers...${NC}"
docker-compose down 2>/dev/null || true

# Start services
echo -e "${BLUE}Starting all services with Docker Compose...${NC}"
docker-compose up -d

echo ""
echo -e "${GREEN}✓ Services started successfully!${NC}"
echo ""

# Wait for services to be healthy
echo -e "${BLUE}Waiting for services to be ready...${NC}"
sleep 10

# Check service health
echo ""
echo -e "${BLUE}Checking service health...${NC}"

check_service() {
    local name=$1
    local url=$2
    
    if curl -s -f "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ $name is healthy${NC}"
        return 0
    else
        echo -e "${RED}✗ $name is not responding${NC}"
        return 1
    fi
}

check_service "API Gateway" "http://localhost:3000/health"
check_service "Flashcard Engine" "http://localhost:3002/health"
check_service "Obsidian Sync" "http://localhost:3001/health"
check_service "AI Service" "http://localhost:8000/health"

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║              🎉 Setup Complete!                            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}Your PBL Medical System is now running!${NC}"
echo ""
echo -e "${BLUE}Access the application:${NC}"
echo -e "  🌐 Frontend:        ${GREEN}http://localhost:3010${NC}"
echo -e "  🔌 API Gateway:     ${GREEN}http://localhost:3000${NC}"
echo -e "  🤖 AI Service:      ${GREEN}http://localhost:8000${NC}"
echo -e "  📦 MinIO Console:   ${GREEN}http://localhost:9001${NC} (minioadmin/minioadmin)"
echo ""
echo -e "${BLUE}Useful commands:${NC}"
echo -e "  View logs:          ${YELLOW}docker-compose logs -f${NC}"
echo -e "  Stop services:      ${YELLOW}docker-compose down${NC}"
echo -e "  Restart services:   ${YELLOW}docker-compose restart${NC}"
echo -e "  View status:        ${YELLOW}docker-compose ps${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo -e "  1. Visit ${GREEN}http://localhost:3010${NC}"
echo -e "  2. Create an account"
echo -e "  3. Create your first course"
echo -e "  4. Generate flashcards with AI"
echo ""
echo -e "${YELLOW}Need help? Check the documentation in the docs/ folder${NC}"
echo ""
