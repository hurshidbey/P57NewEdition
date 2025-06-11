# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ⚠️ CRITICAL: Docker-First Development

**ALWAYS USE DOCKER FOR ALL DEVELOPMENT AND DEPLOYMENT**

### Essential Commands

```bash
# Development & Local Testing
docker-compose up                    # Start development environment
docker-compose down                  # Stop all containers
docker-compose build --no-cache     # Force rebuild (after dependency changes)

# Production Deployment (VPS)
ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 "cd /opt/protokol57 && \
  docker compose down && \
  docker compose build --no-cache && \
  docker compose up -d"

# Emergency: Clear Docker cache if build issues
docker system prune -f              # Clear all build cache

# Type Checking (run inside container or locally)
npm run check                        # Run TypeScript type checking

# Database
npm run db:push                      # Push Drizzle schema changes to database
```

## 🚨 CRITICAL: VITE Environment Variables

**Environment variables for client-side (VITE_*) MUST be set at Docker BUILD TIME, not runtime!**

### Correct Docker Configuration:

**docker-compose.yml:**
```yaml
services:
  protokol57:
    build: 
      context: .
      dockerfile: Dockerfile
      args:
        VITE_SUPABASE_URL: https://bazptglwzqstppwlvmvb.supabase.co
        VITE_SUPABASE_ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
    # NO volume mounts for dist/ - they override built assets!
```

**Dockerfile:**
```dockerfile
# Accept VITE vars as build args
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

# Set as ENV for build process
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

# Build with embedded variables
RUN npm run build
```

### Why This Matters:
- **VITE variables are embedded at BUILD TIME into JavaScript bundle**
- **Runtime environment variables DON'T work for client-side code**
- **Volume mounts override built assets with development files**

## Architecture Overview

This is a full-stack TypeScript application for browsing and learning from 57 AI prompting protocols in Uzbek.

### Tech Stack
- **Frontend**: React 18 + Vite + TypeScript + TailwindCSS + shadcn/ui
- **Backend**: Express + TypeScript + Drizzle ORM + PostgreSQL/Supabase
- **Routing**: Wouter (lightweight React router)
- **State Management**: React Query (TanStack Query)
- **Search**: Fuse.js for fuzzy search

### Key Architectural Decisions

1. **Hybrid Storage System**: The backend (server/storage.ts) implements a fallback mechanism - if database connection fails, it uses in-memory storage with the seeded data.

2. **Shared Types**: All types are defined in `shared/schema.ts` using Drizzle ORM, ensuring type safety across frontend and backend.

3. **API Structure**:
   - `GET /api/protocols` - Paginated list with search/filter support
   - `GET /api/protocols/:id` - Single protocol details
   - `GET /api/categories` - All categories
   - `POST /api/auth/login` - Basic authentication

4. **Design System**: 
   - Colors: Black (#000), White (#FFF), Accent (#FF4F30)
   - Font: Inter Black 900 for headers
   - Components: Using shadcn/ui component library

## Database Schema

Three main tables defined in `shared/schema.ts`:
- `protocols`: Main content (id, number, title, description, examples, etc.)
- `categories`: 6 protocol categories
- `users`: Basic user authentication

## Important Implementation Details

- Protocols data is loaded from `/attached_assets/prtocols.txt`
- The app runs on port 5000 by default (exposed as 5001 via Docker)
- Client-side search uses Fuse.js for fuzzy matching
- Pagination: 20 items per page
- Mobile-first responsive design

## Environment Variables

### Server-side (Runtime):
```bash
SUPABASE_URL=https://bazptglwzqstppwlvmvb.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://postgres:password@db.supabase.co:5432/postgres
ATMOS_STORE_ID=1981
ATMOS_CONSUMER_KEY=UhGzIAQ10FhOZiZ9KTHH_3NhTZ8a
ATMOS_CONSUMER_SECRET=JCuvoGpaV6VHf3migqRy7r6qtiMa
ATMOS_ENV=production
SESSION_SECRET=protokol57-production-secret
```

### Client-side (Build-time):
```bash
VITE_SUPABASE_URL=https://bazptglwzqstppwlvmvb.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Deployment Workflow

### Live Deployment to VPS:
1. **SSH to VPS**: `ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73`
2. **Navigate**: `cd /opt/protokol57`  
3. **Deploy**: `docker compose down && docker compose build --no-cache && docker compose up -d`
4. **Verify**: Check https://p57.birfoiz.uz and https://srv852801.hstgr.cloud

### Local Development:
1. **Start**: `docker-compose up`
2. **Access**: http://localhost:5001
3. **Stop**: `docker-compose down`

### Troubleshooting:

#### ❌ "Uncaught Error: supabaseUrl is required"
**Root Cause**: VITE environment variables not embedded in JavaScript bundle

**Solution**:
```bash
# 1. Clear Docker cache completely
docker system prune -f

# 2. Remove old dist directory (if exists)
rm -rf dist/

# 3. Force rebuild with build args
docker compose down
docker compose build --no-cache  
docker compose up -d

# 4. Verify fix - check for new JavaScript bundle name
curl -s https://p57.birfoiz.uz | grep -o 'index-[^"]*\.js'
```

#### ❌ Stale assets being served
**Root Cause**: Volume mounts override built assets with development files

**Solution**: Ensure docker-compose.yml has NO volume mounts for `/app/dist`

#### ❌ Port conflicts
**Root Cause**: Port 5001 already in use locally

**Solution**: 
```bash
# Check what's using the port
lsof -i :5001

# Kill process or change port in docker-compose.yml
```

#### ❌ Build timeouts
**Root Cause**: Large Docker build context or slow VPS

**Solution**:
```bash
# Add to .dockerignore to reduce build context:
echo "node_modules" >> .dockerignore
echo "dist" >> .dockerignore
echo ".git" >> .dockerignore
```

## Development Tools

- **Containerization**: Docker + docker-compose for all environments
- **Build System**: Vite for frontend, esbuild for backend
- **Process Management**: Docker containers (not PM2)