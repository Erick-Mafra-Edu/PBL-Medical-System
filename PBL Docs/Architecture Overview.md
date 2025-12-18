---
tags:
  - architecture
  - system-design
  - microservices
created: 2025-12-18
type: documentation
---

# 🏗️ Architecture Overview

> [!INFO]
> High-level system architecture and design patterns

## 🎯 System Architecture

```
┌─────────────────────────────────────────────────────┐
│              FRONTEND (Next.js/React)               │
│  ┌──────────────────────────────────────────────┐  │
│  │  Dashboard │ Courses │ Flashcards │ Library  │  │
│  └──────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────┘
                       │ HTTPS/REST
           ┌───────────┴──────────────┐
           ▼                          ▼
    ┌─────────────────┐      ┌────────────────┐
    │  API Gateway    │      │   Next.js      │
    │  (Auth, Route)  │      │   Middleware   │
    └────────┬────────┘      └────────────────┘
             │
    ┌────────┴──────────────────────────┬──────────────┐
    ▼                                   ▼              ▼
┌────────────────┐  ┌────────────────┐ ┌────────────────┐
│  Obsidian Sync │  │  Flashcard     │ │   AI Service   │
│   (TypeScript) │  │  Engine (TS)   │ │   (Python)     │
└────────────────┘  └────────────────┘ └────────────────┘
    ▼                   ▼                   ▼
┌──────────────────────────────────────────────────────┐
│        PostgreSQL Database (PostgreSQL)              │
├──────────────────────────────────────────────────────┤
│  Users │ Courses │ Flashcards │ Notes │ Sync Data   │
└──────────────────────────────────────────────────────┘
         ▲                          ▲
         │        ┌────────────┬────┘
         │        ▼            ▼
    ┌──────────┐  ┌──────────────┐
    │  Redis   │  │  MinIO/S3    │
    │ (Cache)  │  │  (Storage)   │
    └──────────┘  └──────────────┘
```

---

## 🔧 Core Components

### Frontend Layer
**Framework**: Next.js 14 + React + TypeScript  
**Styling**: Tailwind CSS  
**State Management**: TanStack Query  
**Authentication**: NextAuth.js

**Key Pages**:
- Dashboard - Overview and statistics
- Courses - Course management (CRUD)
- Flashcards - Spaced repetition review
- Library - Document storage and search

---

### API Gateway
**Framework**: Node.js + Express + TypeScript  
**Features**:
- Request routing and load balancing
- Authentication and authorization
- Error handling and logging
- CORS and security headers
- Rate limiting

**Key Routes**:
- `/api/auth/*` - Authentication
- `/api/courses/*` - Course management
- `/api/flashcards/*` - Flashcard operations
- `/api/storage/*` - File operations
- `/api/sync/*` - Obsidian sync

---

### Microservices

#### 1. Obsidian Sync
**Purpose**: Synchronize Obsidian vault with system  
**Language**: TypeScript  
**Key Features**:
- Note parsing and extraction
- Automatic tagging and categorization
- Sync scheduling
- Conflict resolution

**Utilities**: [[Obsidian Sync Utilities]]

#### 2. Flashcard Engine
**Purpose**: Spaced repetition algorithm implementation  
**Language**: TypeScript  
**Algorithms**:
- SM2 (SuperMemo 2)
- FSRS (Free Spaced Repetition Schedule)
- Leitner System

**Features**:
- Card scheduling
- Performance tracking
- Difficulty adjustment

#### 3. AI Service
**Purpose**: AI-powered content generation and processing  
**Language**: Python (FastAPI)  
**Features**:
- Text generation (multiple providers)
- Flashcard generation
- Content summarization
- RAG (Retrieval-Augmented Generation)
- Web scraping

**Providers**:
- OpenAI (GPT-3.5/GPT-4)
- Google Gemini
- Perplexity (optional)

**Web Scraping**: [[Web Scraper Implementation]]

---

## 💾 Data Layer

### PostgreSQL Database
**Purpose**: Primary data store  
**Key Tables**:
- `users` - User accounts
- `courses` - Course definitions
- `flashcards` - Flashcard data
- `notes` - Obsidian notes
- `sync_metadata` - Sync tracking

**Schema**: [[Database Schema]]

---

### Redis Cache
**Purpose**: Session management and caching  
**Uses**:
- User session storage
- Temporary data caching
- Rate limit tracking
- Job queue management

---

### MinIO/S3 Storage
**Purpose**: Document and file storage  
**Buckets**:
- `pbl-medical-system` - Main bucket
- `uploads` - User uploads
- `backups` - System backups

**Implementation**: [[Storage Service]]

---

## 🔐 Security Architecture

### Authentication Flow
```
User → Login/Register → NextAuth → JWT Token → API Gateway
                              ↓
                        Database Verification
                              ↓
                        Token in Cookie/Header
```

**Implementation**: [[JWT Security Implementation]]

### Authorization
- Role-based access control (RBAC)
- Course ownership verification
- User data isolation

---

## 🚀 Deployment Architecture

### Containerization
**Tool**: Docker + Docker Compose  
**Services**: 5 containers + Infrastructure

```yaml
Services:
  - frontend (Next.js)
  - api-gateway (Node.js/Express)
  - flashcard-engine (Node.js/Express)
  - obsidian-sync (Node.js/Express)
  - ai-service (Python/FastAPI)

Infrastructure:
  - PostgreSQL (Database)
  - Redis (Cache)
  - MinIO (Object Storage)
```

### CI/CD Pipeline
**Platform**: GitHub Actions  
**Workflows**: [[CI-CD Pipeline]]

---

## 📊 Data Flow

### Course Creation Flow
```
Frontend (Create Form)
       ↓
API Gateway (/api/courses - POST)
       ↓
Database (Insert Course)
       ↓
Storage Service (Optional File)
       ↓
Response to Frontend
```

---

### Flashcard Review Flow
```
Frontend (Fetch Cards)
       ↓
API Gateway (/api/flashcards/review)
       ↓
Flashcard Engine (Algorithm)
       ↓
Get due cards from Database
       ↓
Calculate next review date
       ↓
Update Database & Response
```

---

### Obsidian Sync Flow
```
Obsidian Vault
       ↓
Sync Service (Fetch Notes)
       ↓
Parser (Extract Metadata)
       ↓
Tagger (Categorize Content)
       ↓
Store in Database
       ↓
Update sync metadata
```

---

## 🔄 Integration Points

### Frontend → Backend
- REST API calls
- JWT authentication
- Error handling

### Backend Services
- Database queries (shared PostgreSQL)
- Redis caching
- Event-driven communication

### External Services
- OpenAI API (LLM)
- Google Gemini API (LLM)
- Obsidian Sync API (optional)

---

## 🎯 Design Patterns Used

### Microservices Pattern
- Independent services per domain
- Database per service (where applicable)
- API gateway for routing

### Repository Pattern
- Data access abstraction
- Easier testing and maintenance

### Factory Pattern
- Algorithm selection (SM2, FSRS, etc.)
- AI provider selection (OpenAI, Gemini, etc.)

### Strategy Pattern
- Multiple spaced repetition algorithms
- Multiple LLM providers
- Multiple sync adapters

---

## 📈 Scalability Considerations

### Horizontal Scaling
- Containerized microservices
- Load balancing ready
- Stateless API design

### Vertical Scaling
- Database indexing optimization
- Caching strategies
- Query optimization

### Performance Optimization
- Redis caching layer
- Database connection pooling
- API response compression
- Static file CDN ready

---

## 🔗 Related Documentation

- [[Database Schema]] - Data model
- [[API Design]] - REST endpoints
- [[Storage Service]] - File storage
- [[CI-CD Pipeline]] - Deployment

---

**Last Updated**: 2025-12-18  
**Status**: ✅ Complete
