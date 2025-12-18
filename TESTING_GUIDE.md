# 🧪 Testing Guide - PBL Medical System

## Overview

This guide provides comprehensive testing instructions for the PBL Medical System project, including unit tests, integration tests, and end-to-end testing with Docker Compose.

---

## 📋 Quick Start

### Using Docker Compose (Recommended)

```bash
# Make the test script executable
chmod +x docker-test.sh

# Run the complete test suite
./docker-test.sh
```

The script will:
1. ✅ Build all Docker images
2. ✅ Start all services (PostgreSQL, Redis, MinIO, all microservices)
3. ✅ Run tests for each service
4. ✅ Display service URLs and health status

---

## 🧬 Unit Tests

### Frontend Tests

```bash
cd frontend

# Install dependencies
npm install

# Run tests
npm run test

# Run tests with coverage
npm run test -- --coverage

# Run specific test file
npm run test -- flashcard.test.tsx
```

**Test Files Location**: `frontend/__tests__/`

**Coverage Target**: 80%+

---

### API Gateway Tests

```bash
cd backend/api-gateway

# Install dependencies
npm install

# Run tests
npm run test

# Run with coverage
npm run test -- --coverage

# Run specific test suite
npm run test -- auth.test.ts
```

**Test Files Location**: `backend/api-gateway/__tests__/` (if exists, can be created)

---

### Flashcard Engine Tests

```bash
cd backend/flashcard-engine

# Install dependencies
npm install

# Run tests
npm run test

# Run with coverage
npm run test -- --coverage
```

**Test Files Location**: `backend/flashcard-engine/__tests__/`

---

### Obsidian Sync Tests

```bash
cd backend/obsidian-sync

# Install dependencies
npm install

# Run tests
npm run test

# Test parser utility
npm run test -- parser.test.ts

# Test tagger utility
npm run test -- tagger.test.ts
```

**Test Files Location**: `backend/obsidian-sync/__tests__/`

---

### AI Service Tests

```bash
cd backend/ai-service

# Install dependencies
pip install -r requirements.txt

# Run tests
pytest . -v

# Run with coverage
pytest . --cov=services --cov-report=html

# Run specific test
pytest tests/test_web_scraper.py -v
```

**Test Files Location**: `backend/ai-service/tests/`

**Coverage Target**: 80%+

---

## 🔄 Integration Tests

### Using GitHub Actions Locally

Install `act` to run GitHub Actions workflows locally:

```bash
# Install act (macOS with Homebrew)
brew install act

# Install act (other platforms)
# See: https://github.com/nektos/act

# Run CI workflow
act -j frontend-lint-test

# Run integration tests workflow
act -j integration-tests

# Run docker build workflow
act -j build-frontend
```

---

### Manual Integration Testing

#### 1. Start the Full Stack

```bash
# Start all services with test configuration
docker-compose -f docker-compose-test.yml up -d

# Wait for services to be ready
sleep 15
```

#### 2. Test API Gateway

```bash
# Health check
curl http://localhost:3001/health

# Test authentication endpoint
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!"
  }'
```

#### 3. Test Flashcard Engine

```bash
# Create a flashcard
curl -X POST http://localhost:3002/api/flashcards \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "question": "What is anatomy?",
    "answer": "Study of body structure",
    "courseId": "course-id"
  }'

# Review flashcard
curl http://localhost:3002/api/flashcards/review \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 4. Test Obsidian Sync

```bash
# Sync notes
curl -X POST http://localhost:3003/api/sync \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "vaultPath": "/path/to/vault"
  }'
```

#### 5. Test AI Service

```bash
# Generate text
curl -X POST http://localhost:8001/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Explain the cardiovascular system",
    "provider": "openai"
  }'

# Generate flashcards
curl -X POST http://localhost:8001/api/flashcards/generate \
  -H "Content-Type: application/json" \
  -d '{
    "content": "The heart is a muscular organ...",
    "count": 5
  }'
```

#### 6. Test MinIO Storage

```bash
# Access MinIO Console
# Open: http://localhost:9003
# Username: minioadmin
# Password: minioadmin

# Upload file via API
curl -X POST http://localhost:3001/api/storage/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@document.pdf"
```

---

## 📊 Test Coverage

### Current Coverage Status

| Service | Coverage | Target | Status |
|---------|----------|--------|--------|
| Frontend | TBD | 80% | ⚠️ To be configured |
| API Gateway | TBD | 80% | ⚠️ To be configured |
| Flashcard Engine | TBD | 80% | ⚠️ To be configured |
| Obsidian Sync | TBD | 80% | ⚠️ To be configured |
| AI Service | TBD | 80% | ⚠️ To be configured |

### Running Coverage Reports

```bash
# Frontend
cd frontend && npm run test -- --coverage

# TypeScript Services
cd backend/api-gateway && npm run test -- --coverage

# Python Services
cd backend/ai-service && pytest . --cov=services --cov-report=html
```

---

## 🐛 Debugging Tests

### Enable Debug Logging

```bash
# For Node.js services
DEBUG=* npm run test

# For Python services
PYTHONVERBOSE=1 pytest . -v -s
```

### Run Single Test File

```bash
# TypeScript
npm run test -- parser.test.ts

# Python
pytest tests/test_web_scraper.py -v
```

### Run with Detailed Output

```bash
# Jest (TypeScript)
npm run test -- --verbose --no-coverage

# Pytest (Python)
pytest . -v -s --tb=long
```

---

## 🚀 CI/CD Pipeline Testing

### GitHub Actions Workflows

Three workflows are configured:

1. **`ci.yml`** - Runs on every push/PR
   - Lints all services
   - Runs unit tests
   - Builds Docker images

2. **`docker-build.yml`** - Builds and pushes Docker images
   - Creates Docker images for all services
   - Pushes to GitHub Container Registry (GHCR)
   - Runs on tagged releases

3. **`integration-tests.yml`** - Full integration testing
   - Starts PostgreSQL, Redis services
   - Runs all microservices
   - Executes comprehensive tests
   - Uploads coverage reports

### View Workflow Results

```bash
# In GitHub repository:
# Settings → Actions → Workflows

# Or use GitHub CLI:
gh workflow list
gh workflow run ci.yml
gh run view <run-id>
```

---

## ✅ Test Checklist

Before deployment, verify:

- [ ] All unit tests pass locally
- [ ] Integration tests pass with docker-compose-test.yml
- [ ] Code coverage is above 80%
- [ ] No linting errors
- [ ] Docker images build successfully
- [ ] All services start without errors
- [ ] API endpoints respond correctly
- [ ] Database migrations run successfully
- [ ] File storage (MinIO) works correctly
- [ ] Authentication/Authorization works

---

## 🔧 Troubleshooting

### Tests Fail with "Module not found"

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# For Python
pip install --force-reinstall -r requirements.txt
```

### Docker Services Won't Start

```bash
# Check Docker is running
docker ps

# View service logs
docker-compose -f docker-compose-test.yml logs -f [service-name]

# Restart services
docker-compose -f docker-compose-test.yml restart
```

### Port Conflicts

If ports are already in use:

```bash
# Find process using port
lsof -i :3001

# Kill process (Linux/Mac)
kill -9 <PID>

# Or use different ports in .env
PORT=3011  # Use 3011 instead of 3001
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

### Load Testing API Gateway

```bash
# Using Apache Bench
ab -n 1000 -c 100 http://localhost:3001/api/courses

# Using wrk
brew install wrk
wrk -t12 -c400 -d30s http://localhost:3001/api/courses
```

### Database Query Performance

```bash
# Connect to PostgreSQL
docker-compose -f docker-compose-test.yml exec postgres-test psql -U postgres -d pbl_test

# Run EXPLAIN on queries
EXPLAIN ANALYZE SELECT * FROM courses;
```

---

## 📚 Additional Resources

- [Jest Testing Framework](https://jestjs.io/)
- [Pytest Documentation](https://docs.pytest.org/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Compose Testing](https://docs.docker.com/compose/gettingstarted/)

---

## 📞 Support

For testing issues:
1. Check logs: `docker-compose logs -f [service-name]`
2. Review GitHub Actions workflow runs
3. Check individual service README files
4. Consult project documentation in `/docs`

---

**Last Updated**: December 18, 2025  
**Tested With**: Docker 24.0+, Docker Compose 2.20+, Node.js 18+, Python 3.10+
