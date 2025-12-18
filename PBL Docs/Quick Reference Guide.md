---
tags:
  - quick-reference
  - cheatsheet
  - developers
  - commands
created: 2025-12-18
type: documentation
---

# ⚡ Quick Reference Guide

> [!TIP]
> Fast lookup for common commands, configurations, and patterns

---

## 🚀 Quick Start Commands

### Development Environment

```bash
# Clone and setup
git clone https://github.com/yourusername/PBL-Medical-System.git
cd PBL-Medical-System

# Install dependencies
npm install --prefix frontend
npm install --prefix backend/api-gateway
npm install --prefix backend/flashcard-engine
npm install --prefix backend/obsidian-sync
pip install -r backend/ai-service/requirements.txt

# Start development
docker-compose up -d
npm run dev --prefix frontend

# Database setup
npm run migrate
npm run seed
```

### Running Tests

```bash
# Unit tests
npm run test --prefix frontend
npm run test --prefix backend/api-gateway
npm run test --prefix backend/flashcard-engine
pytest backend/ai-service/

# Integration tests
docker-compose -f docker-compose-test.yml up
npm run test:integration

# Coverage report
npm run test:coverage
```

### Docker Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f api-gateway
docker-compose logs -f ai-service

# Stop services
docker-compose down

# Rebuild images
docker-compose build --no-cache
```

---

## 🗄️ Database Commands

### Migrations

```bash
# Create new migration
npx prisma migrate dev --name add_feature

# Apply migrations
npx prisma migrate deploy

# Reset database (dev only)
npx prisma migrate reset

# View schema
npx prisma db push
```

### Database Queries

```bash
# Connect to database
psql postgresql://user:password@localhost:5432/pbl_medical

# Common queries
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM flashcards WHERE next_review <= NOW();
SELECT * FROM courses WHERE user_id = 'user-id';

# Backup
pg_dump pbl_medical > backup.sql

# Restore
psql pbl_medical < backup.sql
```

---

## 🔐 Authentication

### JWT Token

```bash
# Header format
Authorization: Bearer <token>

# Example
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Token payload
{
  "sub": "user-id",
  "email": "user@example.com",
  "iat": 1234567890,
  "exp": 1234571490
}
```

### Login API

```bash
# Request
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'

# Response
{
  "success": true,
  "token": "eyJ...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

---

## 📚 Common API Endpoints

### Courses
```bash
# List courses
GET /api/courses?page=1&limit=10

# Create course
POST /api/courses
Body: { title, description, color, icon }

# Get course
GET /api/courses/:courseId

# Update course
PUT /api/courses/:courseId
Body: { title, description, color, icon }

# Delete course
DELETE /api/courses/:courseId
```

### Flashcards
```bash
# List flashcards
GET /api/flashcards?courseId=uuid&status=due

# Create flashcard
POST /api/flashcards
Body: { courseId, front, back, difficulty }

# Review flashcard
POST /api/flashcards/:cardId/review
Body: { quality: 0-5 }

# Update flashcard
PUT /api/flashcards/:cardId
Body: { front, back, difficulty }

# Delete flashcard
DELETE /api/flashcards/:cardId
```

### Storage
```bash
# Upload file
POST /api/storage/upload
Content-Type: multipart/form-data
File: <binary>

# Generate download URL
GET /api/storage/download-url/:fileId

# List files
GET /api/storage/files?courseId=uuid

# Delete file
DELETE /api/storage/:fileId
```

---

## 🛠️ Environment Variables

### Frontend
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
LOG_LEVEL=debug
```

### Backend
```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/pbl_medical
REDIS_URL=redis://localhost:6379
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
OPENAI_API_KEY=your-api-key
LOG_LEVEL=info
```

---

## 🧪 Testing Patterns

### Jest (TypeScript)

```typescript
// Unit test template
describe('MyComponent', () => {
  it('should render correctly', () => {
    const component = render(<MyComponent />);
    expect(component).toBeInTheDocument();
  });

  it('should handle click', async () => {
    const { getByRole } = render(<MyComponent />);
    const button = getByRole('button');
    fireEvent.click(button);
    expect(mockFn).toHaveBeenCalled();
  });
});
```

### Pytest (Python)

```python
# Unit test template
def test_parse_markdown():
    content = "# Heading\nContent here"
    result = parse_markdown(content)
    assert result['title'] == 'Heading'
    assert len(result['paragraphs']) > 0

@pytest.mark.asyncio
async def test_async_function():
    result = await async_function()
    assert result is not None
```

---

## 🔍 Debugging Tips

### Frontend
```bash
# Chrome DevTools
- F12 to open DevTools
- Console tab for errors
- Network tab for API calls
- Storage tab for localStorage

# VS Code debugging
- Set breakpoint (click line number)
- Run "Debug" configuration
- Step through code (F10/F11)
```

### Backend
```bash
# Logging
logger.info('Message')
logger.warn('Warning')
logger.error('Error')

# Database debugging
console.log(query) // Before executing
console.time('query'); // Performance
console.timeEnd('query');

# API testing
curl -X GET http://localhost:3001/api/courses
-H "Authorization: Bearer token"
```

### Docker
```bash
# View container logs
docker logs <container-id>

# Access container shell
docker exec -it <container-id> /bin/bash

# Check container status
docker ps -a

# Inspect container
docker inspect <container-id>
```

---

## 📊 Performance Optimization

### Frontend
```typescript
// Code splitting
const Component = dynamic(() => import('./Component'), {
  loading: () => <LoadingSpinner />
});

// Memoization
const MemoizedComponent = React.memo(Component);

// useCallback
const memoizedCallback = useCallback(() => {
  doSomething();
}, [dependency]);
```

### Backend
```typescript
// Caching
const cached = await redis.get('key');
if (!cached) {
  const data = await db.query();
  await redis.set('key', JSON.stringify(data), 'EX', 3600);
}

// Indexing
// See Database Schema for index creation

// Query optimization
const result = db.courses
  .select(['id', 'title'])  // Only select needed fields
  .where({ userId })
  .limit(10);
```

---

## 🔄 Git Workflow

### Branch Management
```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "feat: implement new feature"

# Push to remote
git push origin feature/new-feature

# Create pull request
# (via GitHub web interface)

# Merge to main
git checkout main
git pull origin main
git merge feature/new-feature
git push origin main
```

### Conventional Commits
```
feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Code style changes
refactor: Refactor code
test: Add tests
chore: Update dependencies
ci: CI/CD changes
perf: Performance improvements
```

---

## 🔗 Useful Links

### Documentation
- [[Architecture Overview]] - System design
- [[API Design]] - API reference
- [[Database Schema]] - Data models
- [[Testing Guide]] - Test procedures
- [[Deployment Guide]] - Production deployment

### External Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js Guide](https://expressjs.com)
- [Prisma Docs](https://www.prisma.io/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs)
- [Docker Documentation](https://docs.docker.com)

---

## ⚠️ Common Issues & Solutions

### Database Connection Error
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Check connection string
echo $DATABASE_URL

# Reset migrations
npx prisma migrate reset

# Clear Prisma cache
rm -rf node_modules/.prisma
```

### Port Already in Use
```bash
# Find process using port
lsof -i :3000
lsof -i :3001

# Kill process
kill -9 <PID>

# Or change port in .env
PORT=3010
```

### Authentication Failed
```bash
# Check JWT token
echo $NEXTAUTH_SECRET

# Verify token format
# Should be: "Bearer <token>"

# Check expiration
jwt.verify(token, secret)
```

### Docker Issues
```bash
# Clean up Docker
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache

# View container logs
docker-compose logs -f <service>
```

---

## 🎯 Key Metrics to Monitor

### Backend Metrics
- Response time (target: <200ms)
- Error rate (target: <1%)
- Database query time (target: <50ms)
- API throughput (requests/sec)

### Frontend Metrics
- Page load time (target: <3s)
- Core Web Vitals (LCP, FID, CLS)
- Time to Interactive (TTI)
- Bundle size (target: <300KB)

### System Metrics
- CPU usage (target: <70%)
- Memory usage (target: <80%)
- Disk usage (target: <85%)
- Network latency (target: <100ms)

---

## 📋 Deployment Checklist

- [ ] All tests passing
- [ ] Code review approved
- [ ] Documentation updated
- [ ] Environment variables configured
- [ ] Database backups created
- [ ] Security scan passed
- [ ] Performance benchmarks met
- [ ] Staging deployment verified
- [ ] Production configuration ready
- [ ] Rollback plan prepared

---

## 🔗 Related Documentation

- [[Project Complete Summary]] - Project overview
- [[Implementation Summary]] - Feature details
- [[Testing Guide]] - Test procedures
- [[Deployment Guide]] - Production setup

---

**Last Updated**: 2025-12-18  
**Status**: ✅ Active  
**Usage**: Bookmark for quick reference

