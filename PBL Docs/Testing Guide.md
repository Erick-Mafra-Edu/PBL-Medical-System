---
tags:
  - testing
  - guide
  - ci-cd
created: 2025-12-18
type: documentation
---

# 🧪 Testing Guide

> [!INFO]
> Comprehensive testing instructions for PBL Medical System

## ⚡ Quick Start

### Option 1: Full Test Suite (Recommended)

```bash
chmod +x docker-test.sh
./docker-test.sh
```

### Option 2: Manual Testing

```bash
# Start test environment
docker-compose -f docker-compose-test.yml up -d

# Wait for services
sleep 15

# Run tests
npm run test        # Frontend/Node services
pytest . -v         # Python services
```

---

## 📋 Unit Tests

### Frontend Tests

```bash
cd frontend
npm install
npm run test                    # Run tests
npm run test -- --coverage     # With coverage
npm run test -- flashcard.test.tsx  # Specific file
```

**Location**: `frontend/__tests__/`  
**Target Coverage**: 80%+

---

### API Gateway Tests

```bash
cd backend/api-gateway
npm install
npm run test
npm run test -- --coverage
```

**Location**: `backend/api-gateway/__tests__/`

---

### Flashcard Engine Tests

```bash
cd backend/flashcard-engine
npm install
npm run test
npm run test -- --coverage
```

**Location**: `backend/flashcard-engine/__tests__/`

---

### Obsidian Sync Tests

```bash
cd backend/obsidian-sync
npm install
npm run test
npm run test -- parser.test.ts   # Specific suite
npm run test -- tagger.test.ts
```

**Location**: `backend/obsidian-sync/__tests__/`

---

### AI Service Tests

```bash
cd backend/ai-service
pip install -r requirements.txt
pytest . -v                           # All tests
pytest . --cov=services              # With coverage
pytest tests/test_web_scraper.py -v  # Specific file
```

**Location**: `backend/ai-service/tests/`  
**Target Coverage**: 80%+

---

## 🔄 Integration Tests

### Using GitHub Actions Locally

```bash
# Install act
brew install act  # macOS

# Run workflows locally
act -j frontend-lint-test
act -j integration-tests
act -j build-frontend
```

---

### Manual Integration Testing

```bash
# 1. Start services
docker-compose -f docker-compose-test.yml up -d
sleep 15

# 2. Test API Gateway
curl http://localhost:3001/health

# 3. Test Course Management
curl -X POST http://localhost:3001/api/courses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Test Course",
    "description": "Description",
    "color": "#3B82F6",
    "icon": "📚"
  }'

# 4. Test Storage
curl -X POST http://localhost:3001/api/storage/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@document.pdf"

# 5. Test AI Service
curl -X POST http://localhost:8001/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Explain anatomy",
    "provider": "openai"
  }'
```

---

## 📊 Test Coverage

> [!TIP]
> Maintain 80%+ coverage for production code

```bash
# Generate coverage reports
cd frontend && npm run test -- --coverage
cd backend/api-gateway && npm run test -- --coverage
cd backend/ai-service && pytest . --cov=services --cov-report=html
```

---

## 🐛 Debugging Tests

### Enable Debug Logging

```bash
# Node.js services
DEBUG=* npm run test

# Python services
PYTHONVERBOSE=1 pytest . -v -s
```

### Run Single Test

```bash
# TypeScript
npm run test -- parser.test.ts

# Python
pytest tests/test_web_scraper.py -v
```

### Detailed Output

```bash
# Jest
npm run test -- --verbose --no-coverage

# Pytest
pytest . -v -s --tb=long
```

---

## 🚀 CI/CD Pipeline Testing

### GitHub Actions Workflows

1. **ci.yml** - Runs on every push/PR
   - Lints all services
   - Runs unit tests
   - Builds Docker images

2. **docker-build.yml** - Docker image building
   - Creates images for all services
   - Pushes to GHCR
   - Runs on tagged releases

3. **integration-tests.yml** - Full integration
   - PostgreSQL, Redis services
   - All microservices
   - Coverage uploads

### View Results

```bash
# GitHub CLI
gh workflow list
gh workflow run ci.yml
gh run view <run-id>

# Or check GitHub UI:
# Settings → Actions → Workflows
```

---

## ✅ Pre-Deployment Checklist

- [ ] All unit tests pass locally
- [ ] Integration tests pass with docker-compose-test.yml
- [ ] Code coverage > 80%
- [ ] No linting errors
- [ ] Docker images build successfully
- [ ] All services start without errors
- [ ] API endpoints respond correctly
- [ ] Database migrations run successfully
- [ ] MinIO storage works correctly
- [ ] Authentication works

---

## 🔧 Troubleshooting

### Module Not Found

```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install

# For Python
pip install --force-reinstall -r requirements.txt
```

### Docker Issues

```bash
# Check Docker
docker ps

# View logs
docker-compose -f docker-compose-test.yml logs -f [service]

# Restart
docker-compose -f docker-compose-test.yml restart
```

### Port Conflicts

```bash
# Find process using port
lsof -i :3001

# Kill process
kill -9 <PID>

# Or change ports in .env
PORT=3011
```

### Database Migration Failures

```bash
# Reset database
docker-compose -f docker-compose-test.yml exec postgres-test dropdb pbl_test
docker-compose -f docker-compose-test.yml exec postgres-test createdb pbl_test

# Re-run migrations
docker-compose -f docker-compose-test.yml exec api-gateway-test npm run prisma -- migrate deploy
```

---

## 📈 Performance Testing

### Load Testing

```bash
# Apache Bench
ab -n 1000 -c 100 http://localhost:3001/api/courses

# wrk
brew install wrk
wrk -t12 -c400 -d30s http://localhost:3001/api/courses
```

### Database Performance

```bash
# Connect to PostgreSQL
docker-compose -f docker-compose-test.yml exec postgres-test psql -U postgres -d pbl_test

# Analyze queries
EXPLAIN ANALYZE SELECT * FROM courses;
```

---

## 📚 Related Documentation

- [[CI-CD Pipeline]] - Workflow details
- [[Docker Configuration]] - Docker setup
- [[Implementation Summary]] - Feature overview

---

**Last Updated**: 2025-12-18  
**Status**: ✅ Active
