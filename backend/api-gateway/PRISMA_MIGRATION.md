# Prisma ORM Migration - Phase 1

This directory contains the Prisma configuration and migrations for the PBL Medical System API Gateway.

## What Changed

### From: Raw PostgreSQL (`pg` client with raw SQL queries)
```typescript
// Old way
const result = await db.query(
  'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING ...',
  [email, passwordHash, name]
);
```

### To: Prisma Client (type-safe ORM)
```typescript
// New way
const user = await prisma.user.create({
  data: { email, passwordHash, name },
  select: { id: true, email: true, name: true, createdAt: true }
});
```

## Files Added/Modified

### New Files
- `prisma/schema.prisma` - Database schema definition with all models
- `prisma/migrations/0_init/migration.sql` - Initial migration SQL
- `src/config/prisma.ts` - Prisma Client singleton with event logging
- `.env.example` - Environment variables template with DATABASE_URL
- `setup-prisma.sh` - Setup script to initialize Prisma

### Modified Files
- `package.json` - Added `@prisma/client` and `prisma` dev dependency
- `src/routes/auth.ts` - Refactored all queries to use Prisma
  - `POST /api/auth/register` - Uses `prisma.user.create()`
  - `POST /api/auth/login` - Uses `prisma.user.findUnique()`
  - `PUT /api/auth/profile` - Uses `prisma.user.update()` (NEW)
  - `GET /api/auth/profile` - Uses `prisma.user.findUnique()` (NEW)

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend/api-gateway
npm install
```

### 2. Configure Environment
```bash
# Copy .env.example to .env
cp .env.example .env

# Update DATABASE_URL if needed (default points to docker postgres)
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pbl_system"
```

### 3. Initialize Prisma Migrations
```bash
# Create and run initial migration
npx prisma migrate dev --name init

# Or use the setup script
bash setup-prisma.sh
```

### 4. Generate Prisma Client
```bash
# This runs automatically after migrate dev, but you can run it manually:
npx prisma generate
```

### 5. (Optional) View Database in Prisma Studio
```bash
# Opens a GUI to browse and edit database
npx prisma studio
```

## Key Features of This Implementation

### ✅ Type Safety
- Full TypeScript types generated from schema
- Autocompletion in IDE
- Compile-time error checking

### ✅ Query Safety
- Parameterized queries (prevents SQL injection)
- Relation loading with `include` and `select`
- Atomic transactions support

### ✅ Migration Management
- Version control for schema changes
- Reversible migrations
- Conflict detection

### ✅ Developer Experience
- Event logging for queries (development)
- Query performance insights
- Prisma Studio for data inspection

### ✅ Production Ready
- Connection pooling
- Graceful shutdown
- Error handling

## Database Schema Changes

The existing database schema remains the same. Prisma simply provides a type-safe interface:

| Feature | Before (pg) | After (Prisma) |
|---------|------------|-----------------|
| Query syntax | Raw SQL strings | Type-safe methods |
| Type checking | None | Full TypeScript |
| Relation loading | Manual JOIN queries | Automatic with `include` |
| Migrations | SQL files | Prisma migrations |
| IDE Support | Limited | Full autocompletion |
| Validation | Manual | Built-in |

## Next Steps

### Phase 2: Refactor Remaining Routes
- Migrate `courses.ts` routes to use Prisma
- Migrate `flashcards.ts` routes to use Prisma
- Add cursor-based pagination for flashcard lists

### Phase 3: Service Integration
- Update Flashcard Engine to use Prisma (via API Gateway)
- Update Obsidian Sync to use Prisma (via API Gateway)

### Phase 4: Optimization
- Add N+1 query detection
- Implement query result caching
- Set up Prisma query logging for production

## Troubleshooting

### Error: `DATABASE_URL not set`
```bash
# Make sure .env file exists and has DATABASE_URL
cat .env | grep DATABASE_URL
```

### Error: `Can't reach database server`
```bash
# Make sure PostgreSQL is running
docker-compose up -d postgres

# Verify connection
psql $DATABASE_URL
```

### Error: `Migration already applied`
```bash
# Mark migration as applied in database
npx prisma migrate resolve --applied 0_init
```

### Need to reset database (development only)
```bash
# WARNING: This deletes all data!
npx prisma migrate reset
```

## Documentation

- [Prisma Documentation](https://www.prisma.io/docs/)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Prisma Client API](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)
- [Prisma Migrations](https://www.prisma.io/docs/concepts/components/prisma-migrate)

## Performance Notes

- Prisma Client is NOT slower than raw SQL (benchmarks show similar performance)
- Connection pooling is handled by Prisma
- Query optimization is the same as raw SQL
- Always use `select` to only fetch needed fields
- Use `include` for relations instead of multiple queries
- Leverage indexes in database schema

## Security

- All queries are parameterized (SQL injection safe)
- Password hashing still uses bcrypt
- JWT tokens still use secure algorithm
- CORS middleware still in place
- Rate limiting should be added at middleware level

---

**Status**: Phase 1 Complete ✅ - Prisma foundation set up, auth routes refactored
**Next**: Phase 2 - Refactor courses and flashcard routes
