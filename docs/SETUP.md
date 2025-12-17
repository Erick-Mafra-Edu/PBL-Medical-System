# 🚀 PBL Medical System - Setup Guide

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Docker** (version 20.x or higher)
- **Docker Compose** (version 2.x or higher)
- **Git**
- **Node.js 20.x** (for local development)
- **Python 3.11+** (for local development)

---

## 🛠️ Quick Start (Docker)

### 1. Clone the Repository

```bash
git clone https://github.com/Erick-Mafra-Edu/PBL-Medical-System.git
cd PBL-Medical-System
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and configure:

```bash
# Required: OpenAI API Key (for AI features)
OPENAI_API_KEY=sk-your-actual-api-key-here

# Optional: Google Gemini API Key
GEMINI_API_KEY=your-gemini-key

# Database (default values work for Docker)
DB_PASSWORD=choose-a-secure-password

# JWT Secret (change this!)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
```

### 3. Start All Services

```bash
docker-compose up -d
```

This will start:
- PostgreSQL (port 5432)
- Redis (port 6379)
- MinIO (port 9000, console 9001)
- API Gateway (port 3000)
- Flashcard Engine (port 3002)
- Obsidian Sync (port 3001)
- AI Service (port 8000)
- Frontend (port 3010)

### 4. Check Service Health

```bash
# Check all services are running
docker-compose ps

# Check API Gateway health
curl http://localhost:3000/health

# Check AI Service health
curl http://localhost:8000/health
```

### 5. Access the Application

- **Frontend:** http://localhost:3010
- **API Gateway:** http://localhost:3000
- **MinIO Console:** http://localhost:9001 (credentials: minioadmin/minioadmin)

---

## 💻 Local Development Setup

### Backend Services

#### API Gateway

```bash
cd backend/api-gateway
npm install
cp .env.example .env
npm run dev
```

Runs on: http://localhost:3000

#### Flashcard Engine

```bash
cd backend/flashcard-engine
npm install
npm run dev
```

Runs on: http://localhost:3002

#### Obsidian Sync

```bash
cd backend/obsidian-sync
npm install
npm run dev
```

Runs on: http://localhost:3001

#### AI Service

```bash
cd backend/ai-service
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload --port 8000
```

Runs on: http://localhost:8000

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on: http://localhost:3010

---

## 🗄️ Database Setup

### Initialize Database

The database schema is automatically applied when you start PostgreSQL with Docker Compose (via `docker-entrypoint-initdb.d`).

If you need to manually run it:

```bash
docker-compose exec postgres psql -U postgres -d pbl_system -f /docker-entrypoint-initdb.d/init.sql
```

### Access Database

```bash
docker-compose exec postgres psql -U postgres -d pbl_system
```

### View Tables

```sql
\dt  -- List all tables
\d users  -- Describe users table
SELECT * FROM users;  -- Query users
```

---

## 📦 Service Configuration

### API Gateway

**Environment Variables:**
```bash
PORT=3000
NODE_ENV=development
DB_HOST=postgres
DB_PORT=5432
DB_NAME=pbl_system
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=your-secret-key
```

### AI Service

**Required API Keys:**
```bash
OPENAI_API_KEY=sk-...  # Required for flashcard generation
GEMINI_API_KEY=...     # Optional alternative
```

**Get API Keys:**
- OpenAI: https://platform.openai.com/api-keys
- Gemini: https://makersuite.google.com/app/apikey

### Obsidian Sync

**Configuration:**
```bash
OBSIDIAN_VAULT_PATH=/path/to/your/obsidian/vault
```

Point this to your local Obsidian vault directory.

---

## 🧪 Testing

### Run Unit Tests

```bash
# API Gateway
cd backend/api-gateway
npm test

# Flashcard Engine
cd backend/flashcard-engine
npm test

# AI Service
cd backend/ai-service
pytest
```

---

## 🐛 Troubleshooting

### Services Won't Start

```bash
# Check logs
docker-compose logs api-gateway
docker-compose logs ai-service

# Restart specific service
docker-compose restart api-gateway
```

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Check PostgreSQL logs
docker-compose logs postgres

# Verify connection
docker-compose exec postgres pg_isready -U postgres
```

### Port Already in Use

If ports are already in use, edit `docker-compose.yml` or `.env`:

```bash
# Change ports in .env
API_GATEWAY_PORT=3001
FRONTEND_PORT=3011
```

### OpenAI API Errors

```bash
# Verify API key is set
docker-compose exec ai-service env | grep OPENAI_API_KEY

# Test API key directly
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

---

## 🔄 Common Tasks

### Reset Database

```bash
# Stop services
docker-compose down

# Remove volumes (⚠️ This deletes all data!)
docker-compose down -v

# Start fresh
docker-compose up -d
```

### View Logs in Real-Time

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api-gateway
```

### Rebuild After Code Changes

```bash
# Rebuild all services
docker-compose up -d --build

# Rebuild specific service
docker-compose up -d --build api-gateway
```

### Stop All Services

```bash
docker-compose down
```

---

## 📝 Next Steps

After setup:

1. **Create an Account:** Visit http://localhost:3010 and register
2. **Create a Course:** Navigate to `/courses` and create your first course
3. **Generate Flashcards:** Upload some content and let AI generate flashcards
4. **Sync Obsidian:** Configure your vault path and sync notes
5. **Start Reviewing:** Begin your spaced repetition journey!

---

## 🆘 Getting Help

- **Documentation:** Check `/docs` folder
- **Issues:** https://github.com/Erick-Mafra-Edu/PBL-Medical-System/issues
- **Discussions:** https://github.com/Erick-Mafra-Edu/PBL-Medical-System/discussions

---

**Version:** 1.0.0  
**Last Updated:** 2024-01-20
