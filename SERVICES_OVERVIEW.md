# 🔧 Services Overview

## Running Services (when started with docker-compose)

### Infrastructure Services

| Service | Port | Purpose | Health Check |
|---------|------|---------|-------------|
| **PostgreSQL** | 5432 | Primary database | `pg_isready` |
| **Redis** | 6379 | Caching & sessions | `redis-cli ping` |
| **MinIO** | 9000, 9001 | Object storage | `/minio/health/live` |

### Backend Services

| Service | Port | Technology | Purpose |
|---------|------|-----------|---------|
| **API Gateway** | 3000 | Node.js/Express | Main API, authentication, routing |
| **Flashcard Engine** | 3002 | Node.js/Express | Spaced repetition algorithms |
| **Obsidian Sync** | 3001 | Node.js/Express | Markdown sync & parsing |
| **AI Service** | 8000 | Python/FastAPI | AI generation & RAG |

### Frontend Service

| Service | Port | Technology | Purpose |
|---------|------|-----------|---------|
| **Frontend** | 3010 | Next.js 14 | Web interface |

---

## Service Dependencies

```
Frontend (3010)
    ↓
API Gateway (3000)
    ↓
    ├─→ Flashcard Engine (3002) ─→ PostgreSQL + Redis
    ├─→ Obsidian Sync (3001) ─────→ PostgreSQL
    ├─→ AI Service (8000) ─────────→ PostgreSQL
    └─→ MinIO (9000)

All services connect to:
- PostgreSQL (5432)
- Redis (6379)
```

---

## Accessing Services

### Web Interfaces
- **Application**: http://localhost:3010
- **MinIO Console**: http://localhost:9001 (minioadmin/minioadmin)

### API Endpoints
- **API Gateway**: http://localhost:3000/health
- **Flashcard Engine**: http://localhost:3002/health
- **Obsidian Sync**: http://localhost:3001/health
- **AI Service**: http://localhost:8000/health

### Database
```bash
# PostgreSQL
docker-compose exec postgres psql -U postgres -d pbl_system

# Redis
docker-compose exec redis redis-cli
```

---

## Service Management

### Start All Services
```bash
./start.sh
# or
docker-compose up -d
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api-gateway
docker-compose logs -f ai-service
```

### Restart Service
```bash
docker-compose restart api-gateway
```

### Stop All Services
```bash
docker-compose down
```

### Rebuild After Code Changes
```bash
docker-compose up -d --build
```

---

## Resource Requirements

### Minimum Requirements
- **CPU**: 2 cores
- **RAM**: 4 GB
- **Disk**: 10 GB

### Recommended
- **CPU**: 4 cores
- **RAM**: 8 GB
- **Disk**: 20 GB

---

## Environment Variables

Each service requires specific environment variables. See `.env.example` for full configuration.

### Critical Variables
- `OPENAI_API_KEY` - Required for AI features
- `JWT_SECRET` - Must be changed from default
- `DB_PASSWORD` - Database password

### Optional Variables
- `GEMINI_API_KEY` - For Google Gemini AI
- `OBSIDIAN_VAULT_PATH` - Path to Obsidian vault
- `DEFAULT_ALGORITHM` - SM2 or FSRS (default: sm2)

---

## Troubleshooting

### Service Won't Start
1. Check logs: `docker-compose logs [service-name]`
2. Verify port not in use: `lsof -i :[port]`
3. Check environment variables are set

### Database Connection Failed
1. Wait for PostgreSQL to be healthy
2. Verify connection string in logs
3. Check PostgreSQL is running: `docker-compose ps postgres`

### API Returns 500 Error
1. Check service logs
2. Verify API keys are set (for AI service)
3. Ensure database is initialized

---

## Monitoring

### Check All Services Status
```bash
docker-compose ps
```

### Check Resource Usage
```bash
docker stats
```

### View Service Health
```bash
curl http://localhost:3000/health
curl http://localhost:3002/health
curl http://localhost:3001/health
curl http://localhost:8000/health
```

---

**Last Updated**: 2024-01-20  
**Version**: 1.0.0
