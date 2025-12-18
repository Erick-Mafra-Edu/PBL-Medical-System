# Docker Configuration for Prisma ORM

This document explains how to build and deploy the PBL Medical System with Prisma ORM using Docker and Docker Compose.

## Architecture Overview

```
┌─────────────────────────────────────────────┐
│         Docker Compose Network              │
├─────────────────────────────────────────────┤
│                                             │
│  ┌──────────────────────────────────────┐   │
│  │   API Gateway (Node.js + Prisma)     │   │
│  │   Port: 3000                          │   │
│  │   - Auto-runs Prisma migrations       │   │
│  │   - Generates Prisma Client           │   │
│  └────────┬─────────────────────────────┘   │
│           │                                 │
│           ├───────────────────────┐         │
│           │                       │         │
│  ┌────────▼────────┐  ┌──────────▼──────┐   │
│  │  PostgreSQL      │  │     Redis       │   │
│  │  Port: 5432      │  │   Port: 6379    │   │
│  │  (Prisma DB)     │  │   (Cache)       │   │
│  └──────────────────┘  └─────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

## Files Modified/Created

### 1. Dockerfile (api-gateway)
- ✅ Added PostgreSQL client tools for database checks
- ✅ Added Prisma CLI generation during build
- ✅ Added scripts directory with entrypoint and init scripts
- ✅ Changed CMD to use custom entrypoint for migrations

### 2. docker-compose.yml
- ✅ Added DATABASE_URL to api-gateway environment (Prisma format)
- ✅ Updated all service hostnames to Docker service names
- ✅ Changed Redis URLs from env vars to Docker service names
- ✅ Updated internal service URLs (obsidian-sync, flashcard-engine, ai-service)
- ✅ Added health checks for database

### 3. package.json (scripts section)
- ✅ Added `prisma:generate` - Generate Prisma Client
- ✅ Added `prisma:migrate` - Deploy migrations in production
- ✅ Added `prisma:migrate:dev` - Create/run migrations in development
- ✅ Added `prisma:studio` - Open Prisma data browser

### 4. Entry Point Scripts
- ✅ `scripts/entrypoint.sh` - Handles database migration on startup
- ✅ `scripts/init-db.sh` - Standalone database initialization

## Quick Start

### 1. Prerequisites
```bash
# Ensure Docker and Docker Compose are installed
docker --version
docker-compose --version

# Clone/navigate to project
cd PBL-Medical-System
```

### 2. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Review and update .env with your settings
# (Most defaults work for local development)
```

### 3. Build and Start
```bash
# Build all services
docker-compose build

# Start all services (includes automatic Prisma migrations)
docker-compose up -d

# View logs
docker-compose logs -f api-gateway
```

### 4. Verify Setup
```bash
# Check if API Gateway is healthy
curl http://localhost:3000/health

# Check all services
docker-compose ps
```

## Prisma with Docker

### How Migrations Work

1. **Docker Image Build** (`docker build`)
   - Installs npm dependencies
   - Generates Prisma Client (`npm run prisma:generate`)
   - Compiles TypeScript to JavaScript

2. **Container Start** (`docker-compose up`)
   - Runs `scripts/entrypoint.sh` before starting the app
   - Waits for PostgreSQL to be healthy
   - Generates Prisma Client again (safety)
   - Runs `npx prisma migrate deploy`
   - Starts the Node.js application

3. **Database Updated**
   - All migrations from `prisma/migrations/` are applied
   - Schema is up-to-date before app starts
   - Zero downtime migrations

### Key Environment Variables

```bash
# Required for Prisma
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/pbl_system

# Or alternatively (if DATABASE_URL not used):
DB_HOST=postgres
DB_PORT=5432
DB_NAME=pbl_system
DB_USER=postgres
DB_PASSWORD=postgres
```

## Managing Migrations in Docker

### Create a New Migration

```bash
# Create migration in development
docker-compose exec api-gateway npm run prisma:migrate:dev -- --name add_new_table

# This creates a new file in prisma/migrations/
# Commit the new migration to git
git add prisma/migrations/
git commit -m "Add new_table migration"
```

### View Database

```bash
# Open Prisma Studio
docker-compose exec api-gateway npx prisma studio

# Access at http://localhost:5555
```

### Reset Database (Development Only)

```bash
# ⚠️ WARNING: This deletes all data!
docker-compose exec api-gateway npx prisma migrate reset

# Confirms via prompt, then:
# 1. Drops database
# 2. Creates new database
# 3. Applies all migrations
# 4. (Optional) Runs seed script
```

## Docker-Specific Issues and Solutions

### Issue: "Waiting for PostgreSQL" Loop

**Symptoms:** Container keeps printing "Waiting for PostgreSQL..."

**Solution:**
```bash
# Check if postgres container is running
docker-compose ps postgres

# If not running, start it
docker-compose up -d postgres

# Check postgres logs
docker-compose logs postgres

# Verify connectivity
docker-compose exec postgres pg_isready
```

### Issue: "Prisma Client not found"

**Symptoms:** `Cannot find module '@prisma/client'`

**Solution:**
```bash
# Rebuild the image
docker-compose build --no-cache api-gateway

# Or manually regenerate
docker-compose exec api-gateway npm run prisma:generate
```

### Issue: Migrations Won't Apply

**Symptoms:** Migration deployment fails, but database exists

**Solution:**
```bash
# Check migration status
docker-compose exec api-gateway npx prisma migrate status

# Mark a migration as applied if it already ran
docker-compose exec api-gateway npx prisma migrate resolve --applied 0_init

# Or reset and reapply (development only)
docker-compose exec api-gateway npx prisma migrate reset
```

### Issue: "database does not exist"

**Symptoms:** Connection error, database not found

**Solution:**
```bash
# Recreate containers (keeps data volumes)
docker-compose down
docker-compose up -d postgres
docker-compose up -d api-gateway

# Or full reset (deletes all data)
docker-compose down -v
docker-compose up -d
```

## Production Deployment

### Before Deploying

1. **Test migrations locally**
   ```bash
   npm run prisma:migrate:dev -- --name feature_xyz
   # Test thoroughly
   git add prisma/migrations/
   git commit -m "Add feature_xyz migration"
   ```

2. **Review migration SQL**
   ```bash
   cat prisma/migrations/*/migration.sql
   ```

3. **Backup production database**
   ```bash
   pg_dump $PROD_DATABASE_URL > backup.sql
   ```

### Deployment Process

```bash
# Pull latest code with migrations
git pull

# Build images with new migrations
docker-compose build

# Run migrations (applied automatically on startup)
docker-compose up -d

# Verify success
docker-compose logs api-gateway
```

### Rollback Procedure

If migrations fail in production:

```bash
# View current migration status
docker-compose exec api-gateway npx prisma migrate status

# Restore from backup
psql < backup.sql

# Revert problematic migration
docker-compose exec api-gateway npx prisma migrate resolve --rolled-back <migration_name>

# Push code without the failed migration
git revert <commit_hash>
docker-compose up -d
```

## Monitoring and Debugging

### View Real-time Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api-gateway

# With timestamps
docker-compose logs -f --timestamps
```

### Check Service Health
```bash
# Health status
docker-compose ps

# API Gateway health
curl http://localhost:3000/health

# PostgreSQL health
docker-compose exec postgres pg_isready

# Redis health
docker-compose exec redis redis-cli ping
```

### Database Inspection
```bash
# Connect to PostgreSQL directly
docker-compose exec postgres psql -U postgres -d pbl_system

# List tables
\dt

# View schema
\d users

# Exit
\q
```

## Performance Optimization

### Connection Pooling

Prisma Client automatically handles connection pooling:

```env
# In .env
DATABASE_URL="postgresql://user:pass@postgres:5432/db?schema=public"
```

### Query Optimization

- Use `select` to only fetch needed fields
- Use `include` for relations (avoid N+1 queries)
- Leverage database indexes
- Monitor slow queries in logs

## Best Practices

### ✅ Do

- Commit `prisma/migrations/` to git
- Review generated migration SQL
- Test migrations locally first
- Use semantic migration names
- Document breaking changes
- Backup before production migration

### ❌ Don't

- Modify migration files after creation
- Hand-edit `schema.prisma` without running `migrate dev`
- Share raw `DATABASE_URL` in code
- Skip local testing
- Deploy migrations without testing
- Delete migration files

## Additional Resources

- [Prisma Docker Documentation](https://www.prisma.io/docs/guides/deployment/deployment-guides/docker)
- [Prisma Migrate Guide](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)

## Support

For issues:

1. Check logs: `docker-compose logs api-gateway`
2. Verify database: `docker-compose exec postgres pg_isready`
3. Test migrations: `docker-compose exec api-gateway npx prisma migrate status`
4. Review `.env` configuration
5. Check network: `docker network inspect pbl-network`
