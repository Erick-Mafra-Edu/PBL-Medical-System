# Prisma Migration: Initial Schema

This is the initial migration that creates all tables from the schema.prisma file.

## Changes

- Created `users` table with preferences JSONB
- Created `courses` table with stats tracking
- Created `notes` table with source tracking and tags
- Created `flashcards` table with SM2 and FSRS algorithm fields
- Created `flashcard_reviews` table for review history
- Created `study_sessions` table for tracking study sessions
- Created `files` table for document storage
- Added UUID extension to PostgreSQL
- Created indexes for optimized queries
- Added enums for Difficulty, SourceType, FlashcardState

## Rollback

To rollback this migration, run:
```bash
npx prisma migrate resolve --rolled-back 0_init
```

However, this will only work if the migration hasn't been deployed to production.
In production, create a new migration to drop tables if needed.
