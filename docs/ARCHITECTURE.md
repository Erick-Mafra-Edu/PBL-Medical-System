# 🏗️ PBL Medical System - Architecture Documentation

## 📖 Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Technology Stack](#technology-stack)
4. [Microservices](#microservices)
5. [Data Flow](#data-flow)
6. [Design Patterns](#design-patterns)
7. [Security](#security)
8. [Scalability](#scalability)

---

## 🎯 System Overview

The PBL Medical System is a microservices-based application designed to help medical students manage their Problem-Based Learning (PBL) studies. It integrates:

- **Obsidian/Notion sync** for note management
- **AI-powered content generation** (flashcards, summaries)
- **Spaced repetition algorithms** (SM2, FSRS, Leitner)
- **Digital library** for PDFs and study materials
- **RAG (Retrieval Augmented Generation)** for context-aware Q&A

---

## 🏛️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Web)                            │
│        Next.js 14 + React + TypeScript                       │
│        Port: 3010                                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    API GATEWAY                               │
│        Node.js/Express + TypeScript                          │
│        Port: 3000                                            │
│        - Authentication (JWT)                                │
│        - Request routing                                     │
│        - Rate limiting                                       │
└─────────────────────────────────────────────────────────────┘
           │              │              │
    ┌──────┴──────┬───────┴───────┬──────┴─────────┐
    ▼             ▼               ▼                 ▼
┌─────────┐  ┌──────────┐  ┌──────────┐   ┌──────────────┐
│Obsidian │  │Flashcard │  │AI Service│   │   MinIO/S3   │
│  Sync   │  │  Engine  │  │ (Python) │   │   Storage    │
│Port 3001│  │Port 3002 │  │Port 8000 │   │  Port 9000   │
└─────────┘  └──────────┘  └──────────┘   └──────────────┘
    │             │              │                 │
    └─────────────┴──────────────┴─────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              PostgreSQL + Redis (Cache)                      │
│              Port: 5432 / 6379                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 💻 Technology Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **TailwindCSS** - Utility-first CSS
- **TanStack Query** - Data fetching and caching

### Backend Services

#### API Gateway (Node.js)
- **Express** - Web framework
- **JWT** - Authentication
- **Zod** - Schema validation
- **Winston** - Logging

#### Flashcard Engine (Node.js)
- **Express** - Web framework
- **SM2 Algorithm** - SuperMemo 2
- **FSRS Algorithm** - Free Spaced Repetition Scheduler

#### AI Service (Python)
- **FastAPI** - Modern Python web framework
- **OpenAI** - GPT-4 Turbo for text generation
- **Google Gemini** - Alternative AI provider
- **LangChain** - RAG framework
- **ChromaDB** - Vector database for embeddings

#### Obsidian Sync (Node.js)
- **Chokidar** - File system watcher
- **Gray-matter** - Markdown frontmatter parser
- **Marked** - Markdown parser

### Infrastructure
- **PostgreSQL 15** - Primary database
- **Redis 7** - Caching and sessions
- **MinIO** - S3-compatible object storage
- **Docker Compose** - Container orchestration

---

## 🔧 Microservices

### 1. API Gateway

**Responsibilities:**
- Authentication and authorization
- Request routing to microservices
- Rate limiting
- Error handling
- CORS management

**Endpoints:**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/courses` - List courses
- `POST /api/flashcards/generate` - Generate flashcards with AI

### 2. Flashcard Engine

**Responsibilities:**
- Flashcard CRUD operations
- Spaced repetition calculations
- Review scheduling
- Statistics tracking

**Algorithms:**
- **SM2** (SuperMemo 2) - Classic spaced repetition
- **FSRS** - Modern probabilistic algorithm
- **Leitner** - Box-based system

**Endpoints:**
- `POST /api/flashcards` - Create flashcard
- `GET /api/flashcards?dueOnly=true` - Get due flashcards
- `POST /api/flashcards/:id/review` - Review a flashcard

### 3. AI Service

**Responsibilities:**
- Generate flashcards from content
- Answer questions with context
- Summarize long texts
- RAG (Retrieval Augmented Generation)

**Providers:**
- OpenAI (GPT-4 Turbo)
- Google Gemini
- Perplexity (future)

**Endpoints:**
- `POST /api/generate-flashcards` - Generate flashcards
- `POST /api/answer-question` - Answer with RAG
- `POST /api/summarize` - Summarize content

### 4. Obsidian Sync

**Responsibilities:**
- Sync Obsidian vault to database
- Parse markdown with frontmatter
- Watch for file changes
- Extract tags and metadata

**Endpoints:**
- `POST /api/sync/vault` - Sync entire vault
- `POST /api/sync/watch/start` - Start watching

---

## 🔄 Data Flow

### Flashcard Generation Flow

```
1. User uploads note → Frontend
2. Frontend → API Gateway (POST /api/flashcards/generate)
3. API Gateway → AI Service (POST /api/generate-flashcards)
4. AI Service processes with GPT-4 → Returns JSON flashcards
5. API Gateway → Flashcard Engine (POST /api/flashcards) for each card
6. Flashcard Engine → PostgreSQL (save)
7. Response → User with generated flashcards
```

### Flashcard Review Flow

```
1. User requests due cards → Frontend
2. Frontend → API Gateway → Flashcard Engine
3. Flashcard Engine queries PostgreSQL (WHERE next_review <= NOW())
4. Returns flashcards → Frontend displays
5. User reviews card (quality 0-5) → Frontend
6. Frontend → Flashcard Engine (POST /:id/review)
7. Flashcard Engine calculates next interval (SM2 algorithm)
8. Updates PostgreSQL (interval, repetition, next_review)
```

---

## 🎨 Design Patterns

### 1. Microservices Pattern
- Each service is independent
- Communicates via HTTP REST APIs
- Can be scaled independently

### 2. Factory Pattern
- Used for algorithm selection (SM2, FSRS, Leitner)
- Used for AI provider selection (OpenAI, Gemini)

```typescript
class AlgorithmFactory {
  static create(type: 'sm2' | 'fsrs' | 'leitner') {
    switch(type) {
      case 'sm2': return new SM2Algorithm();
      case 'fsrs': return new FSRSAlgorithm();
      case 'leitner': return new LeitnerAlgorithm();
    }
  }
}
```

### 3. Repository Pattern
- Abstracts database access
- Makes testing easier
- Separates business logic from data access

```typescript
class FlashcardRepository {
  async findById(id: string): Promise<Flashcard>
  async create(data: CreateFlashcardDTO): Promise<Flashcard>
  async update(id: string, data: UpdateDTO): Promise<Flashcard>
}
```

### 4. Middleware Pattern
- Authentication middleware
- Error handling middleware
- Logging middleware

---

## 🔒 Security

### Authentication
- **JWT (JSON Web Tokens)** for stateless authentication
- Tokens expire after 7 days (configurable)
- Passwords hashed with **bcrypt** (10 rounds)

### Authorization
- User can only access their own data
- Middleware checks `userId` from JWT matches resource owner

### API Security
- **CORS** configured for frontend origin
- **Rate limiting** (future implementation)
- **Input validation** with Zod schemas
- **SQL injection prevention** with parameterized queries

### Environment Variables
- All secrets stored in `.env` (not committed)
- API keys for OpenAI, Gemini, etc.
- Database credentials

---

## 📈 Scalability

### Horizontal Scaling
- Each microservice can scale independently
- Load balancer distributes requests
- Stateless services (JWT, not sessions)

### Caching Strategy
- **Redis** for session cache
- **Redis** for flashcard due counts
- **HTTP caching** headers for static assets

### Database Optimization
- **Indexes** on frequently queried columns
  - `user_id`, `course_id`, `next_review`
- **Connection pooling** (max 20 connections per service)
- **Triggers** for `updated_at` timestamps

### Future Improvements
- **Message Queue** (RabbitMQ/Redis) for async tasks
- **CDN** for static assets
- **Database read replicas** for read-heavy operations
- **Kubernetes** for production orchestration

---

## 📊 Monitoring & Observability

### Logging
- **Winston** for structured logging
- Logs stored in files (`error.log`, `combined.log`)
- Log levels: `error`, `warn`, `info`, `debug`

### Health Checks
- Each service exposes `/health` endpoint
- Docker Compose health checks configured

### Future Monitoring
- **Prometheus** for metrics
- **Grafana** for dashboards
- **Sentry** for error tracking
- **OpenTelemetry** for distributed tracing

---

## 🚀 Deployment

### Development
```bash
docker-compose up -d
```

### Production
- Use `docker-compose.prod.yml` (future)
- Environment-specific configs
- SSL certificates (Let's Encrypt)
- Reverse proxy (Nginx)

---

**Version:** 1.0.0  
**Last Updated:** 2024-01-20
