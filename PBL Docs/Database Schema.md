---
tags:
  - database
  - schema
  - postgresql
  - prisma
created: 2025-12-18
type: documentation
---

# 🗄️ Database Schema

> [!INFO]
> Complete PostgreSQL database schema with Prisma ORM models

---

## 📍 Location

**Directory**: `backend/api-gateway/prisma/`  
**File**: `schema.prisma`  
**Database**: PostgreSQL 15  
**ORM**: Prisma

---

## 🎯 Overview

The database schema defines the complete data model for the PBL Medical System, including users, courses, flashcards, notes, and synchronization metadata.

### Core Tables

- **users** - User accounts and profiles
- **courses** - Course definitions
- **flashcards** - Study cards
- **notes** - Obsidian notes
- **reviews** - Flashcard review history
- **sync_metadata** - Obsidian sync tracking
- **files** - Uploaded file metadata

---

## 👥 Users Table

### Schema

```prisma
model User {
  id            String      @id @default(cuid())
  email         String      @unique
  password      String      // Hashed
  name          String
  avatar        String?
  bio           String?
  role          Role        @default(STUDENT)
  status        UserStatus  @default(ACTIVE)
  
  // Timestamps
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  lastLogin     DateTime?
  
  // Relations
  courses       Course[]
  flashcards    Flashcard[]
  reviews       Review[]
  files         File[]
  syncMetadata  SyncMetadata?
  
  @@index([email])
  @@index([role])
  @@index([status])
}

enum Role {
  STUDENT
  INSTRUCTOR
  ADMIN
}

enum UserStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
}
```

### Key Fields

| Field | Type | Notes |
|-------|------|-------|
| `id` | String | CUID, primary key |
| `email` | String | Unique, required |
| `password` | String | Hashed with bcrypt |
| `name` | String | Full name |
| `role` | Enum | STUDENT, INSTRUCTOR, ADMIN |
| `createdAt` | DateTime | Auto-generated |
| `lastLogin` | DateTime | Nullable |

### Indexes

- `email` - Fast authentication lookups
- `role` - Filter by user role
- `status` - Active user queries

---

## 📚 Courses Table

### Schema

```prisma
model Course {
  id            String      @id @default(cuid())
  title         String      @unique
  description   String?
  
  // Appearance
  color         String      @default("#FF6B6B")   // Medical color
  icon          String      @default("📚")         // Emoji
  
  // Metadata
  cardCount     Int         @default(0)
  difficulty    Difficulty  @default(INTERMEDIATE)
  status        String      @default("active")
  
  // Timestamps
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  
  // Relations
  userId        String
  user          User        @relation(fields: [userId], references: [id])
  flashcards    Flashcard[]
  files         File[]
  
  @@unique([userId, title])
  @@index([userId])
  @@index([difficulty])
}

enum Difficulty {
  BEGINNER
  INTERMEDIATE
  ADVANCED
}
```

### Key Fields

| Field | Type | Constraints |
|-------|------|-----------|
| `id` | String | CUID, PK |
| `title` | String | Unique per user |
| `color` | String | 6-digit hex |
| `icon` | String | Single emoji |
| `userId` | String | Foreign key |
| `difficulty` | Enum | BEGINNER, INTERMEDIATE, ADVANCED |

### Color System

```typescript
// Medical colors
const COLORS = [
  "#FF6B6B",  // Anatomy (Red)
  "#4ECDC4",  // Physiology (Teal)
  "#FFE66D",  // Pharmacology (Yellow)
  "#95E1D3",  // Biochemistry (Mint)
  "#C7CEEA",  // Pathology (Lavender)
  "#B5EAD7"   // Other (Sage)
];
```

---

## 🎴 Flashcards Table

### Schema

```prisma
model Flashcard {
  id            String      @id @default(cuid())
  
  // Content
  front         String      // Question/Prompt
  back          String      // Answer
  
  // Algorithm Data (SM2)
  interval      Int         @default(0)        // Days until next review
  ease          Float       @default(2.5)      // Difficulty factor
  repetitions   Int         @default(0)        // Times reviewed
  
  // Status
  difficulty    Difficulty  @default(INTERMEDIATE)
  status        CardStatus  @default(NEW)
  
  // Timestamps
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  nextReview    DateTime    @default(now())
  lastReview    DateTime?
  
  // Relations
  courseId      String
  course        Course      @relation(fields: [courseId], references: [id], onDelete: Cascade)
  userId        String
  user          User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  reviews       Review[]
  
  @@index([courseId])
  @@index([userId])
  @@index([nextReview])
  @@index([status])
}

enum CardStatus {
  NEW
  LEARNING
  REVIEW
  SUSPENDED
  BURIED
}
```

### Algorithm Fields

| Field | Purpose | Formula |
|-------|---------|---------|
| `interval` | Days to next review | Based on SM2/FSRS |
| `ease` | Card difficulty factor | 1.3 - 2.5 |
| `repetitions` | Total times reviewed | Increments on success |

### SM2 Algorithm

```
IF quality < 3:
  repetitions = 0
  interval = 1
ELSE:
  IF repetitions = 0:
    interval = 1
  IF repetitions = 1:
    interval = 3
  ELSE:
    interval = interval * ease

ease = ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
```

---

## 📝 Reviews Table

### Schema

```prisma
model Review {
  id            String      @id @default(cuid())
  
  // Review Data
  quality       Int         // 0-5 rating
  elapsedDays   Int?        // Days since last review
  
  // Timestamps
  createdAt     DateTime    @default(now())
  reviewedAt    DateTime    @default(now())
  
  // Relations
  cardId        String
  card          Flashcard   @relation(fields: [cardId], references: [id], onDelete: Cascade)
  userId        String
  user          User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([cardId])
  @@index([userId])
  @@index([createdAt])
}
```

### Quality Scale

| Score | Meaning | Action |
|-------|---------|--------|
| 0 | Complete blackout | Reset interval to 0 |
| 1 | Incorrect response | Reset interval to 0 |
| 2 | Correct with difficulty | Reset interval to 0 |
| 3 | Correct with much effort | Normal progression |
| 4 | Correct with little effort | Normal progression |
| 5 | Perfect response | Normal progression |

---

## 📄 Notes Table

### Schema

```prisma
model Note {
  id            String      @id @default(cuid())
  
  // Content
  title         String
  content       String      // Markdown
  
  // Obsidian Data
  filepath      String?     // Original Obsidian path
  frontmatter   Json?       // YAML metadata
  
  // Classification
  tags          String[]    @default([])
  categories    String[]    @default([])
  difficulty    Difficulty  @default(INTERMEDIATE)
  
  // Statistics
  wordCount     Int         @default(0)
  headingCount  Int         @default(0)
  
  // Timestamps
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  syncedAt      DateTime?
  
  // Relations
  userId        String
  user          User        @relation(fields: [userId], references: [id])
  
  @@index([userId])
  @@index([tags])
  @@index([categories])
  @@fulltext([title, content])  // Full-text search
}
```

### Tags Examples

```typescript
tags: [
  "cardiology",
  "physiology",
  "cardiac-cycle",
  "systole",
  "diastole"
]
```

---

## 🔄 SyncMetadata Table

### Schema

```prisma
model SyncMetadata {
  id            String      @id @default(cuid())
  
  // Sync Configuration
  enabled       Boolean     @default(true)
  syncPath      String?     // Obsidian vault path
  
  // Sync Status
  lastSync      DateTime?
  nextSync      DateTime?
  status        SyncStatus  @default(IDLE)
  
  // Statistics
  totalNotes    Int         @default(0)
  syncedNotes   Int         @default(0)
  failedNotes   Int         @default(0)
  
  // Timestamps
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  
  // Relations
  userId        String      @unique
  user          User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([status])
}

enum SyncStatus {
  IDLE
  SYNCING
  COMPLETED
  FAILED
  PAUSED
}
```

---

## 📁 Files Table

### Schema

```prisma
model File {
  id            String      @id @default(cuid())
  
  // File Information
  filename      String
  originalName  String
  mimeType      String
  size          Int         // Bytes
  
  // Storage
  bucketName    String      @default("pbl-medical-system")
  s3Path        String      @unique // MinIO path
  url           String?
  
  // Tags
  tags          String[]    @default([])
  
  // Timestamps
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  expiresAt     DateTime?
  
  // Relations
  userId        String
  user          User        @relation(fields: [userId], references: [id])
  courseId      String?
  course        Course?     @relation(fields: [courseId], references: [id])
  
  @@index([userId])
  @@index([courseId])
  @@index([s3Path])
  @@index([createdAt])
}
```

---

## 🔑 Relationships

### Entity Relationship Diagram

```
┌─────────┐
│  User   │
├─────────┤
│ id (PK) │
└────┬────┘
     │
     ├──1:N──→ ┌─────────────┐
     │         │   Course    │
     │         ├─────────────┤
     │         │ id (PK)     │
     │         │ userId (FK) │
     │         └────┬────────┘
     │              │
     │              ├──1:N──→ ┌─────────────┐
     │              │         │ Flashcard   │
     │              │         ├─────────────┤
     │              │         │ id (PK)     │
     │              │         │ courseId(FK)│
     │              │         │ userId (FK) │
     │              │         └────┬────────┘
     │              │              │
     │              │              ├──1:N──→ ┌─────────┐
     │              │              │         │ Review  │
     │              │              │         └─────────┘
     │              │              │
     │              └──1:N──→ ┌────┴────┐
     │                        │  File   │
     │                        └─────────┘
     │
     ├──1:1──→ ┌──────────────┐
     │         │ SyncMetadata │
     │         └──────────────┘
     │
     └──1:N──→ ┌──────────────┐
              │   Note       │
              └──────────────┘
```

---

## 🔍 Indexes & Optimization

### Database Indexes

```sql
-- Performance indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_courses_userid ON courses(user_id);
CREATE INDEX idx_flashcards_courseid ON flashcards(course_id);
CREATE INDEX idx_flashcards_nextreview ON flashcards(next_review);
CREATE INDEX idx_reviews_cardid ON reviews(card_id);
CREATE INDEX idx_notes_userid ON notes(user_id);
CREATE INDEX idx_files_userid ON files(user_id);

-- Full-text search indexes
CREATE INDEX idx_notes_content_fts ON notes USING gin(to_tsvector('english', content));
CREATE INDEX idx_notes_title_fts ON notes USING gin(to_tsvector('english', title));
```

### Query Optimization

```sql
-- Due cards for review (frequently used)
CREATE INDEX idx_flashcards_status_nextreview 
  ON flashcards(status, next_review) 
  WHERE status != 'SUSPENDED';

-- Recent reviews
CREATE INDEX idx_reviews_created_desc 
  ON reviews(created_at DESC) 
  INCLUDE (quality);
```

---

## 📊 Data Retention

### Archival Policy

| Table | Retention | Action |
|-------|-----------|--------|
| Reviews | 2 years | Archive |
| Syncs | 6 months | Delete |
| Files | By policy | Delete or archive |
| Notes | Indefinite | Keep |
| Users | Until deletion | Delete on request |

---

## 🔐 Security

### Data Protection

```sql
-- Encrypt sensitive fields
ALTER TABLE users ALTER COLUMN password SET STORAGE EXTERNAL;

-- Row-level security
CREATE POLICY user_isolation ON courses
  USING (user_id = current_user_id());

-- Audit logging
CREATE TABLE audit_log (
  id SERIAL PRIMARY KEY,
  table_name VARCHAR,
  record_id VARCHAR,
  action VARCHAR,
  old_value JSONB,
  new_value JSONB,
  created_at TIMESTAMP DEFAULT now()
);
```

---

## 📈 Statistics & Monitoring

### Database Size

```sql
-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Performance Monitoring

```sql
-- Index usage
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

---

## 🧹 Maintenance

### Regular Maintenance Tasks

```sql
-- Vacuum & analyze
VACUUM ANALYZE;

-- Reindex (if needed)
REINDEX DATABASE pbl_medical_system;

-- Check table bloat
ANALYZE;
```

---

## 🔗 Related Documentation

- [[API Design]] - REST endpoints
- [[Architecture Overview]] - System design
- [[Prisma Migrations]] - Schema versioning

---

**Last Updated**: 2025-12-18  
**Version**: 1.0  
**Status**: ✅ Production Ready  
**Tables**: 7  
**Indexes**: 15+
