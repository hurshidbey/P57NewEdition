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

## 🚀 Landing Page Management (`/landing_page/`)

**CRITICAL: Landing page is separate from main application and has different deployment process!**

### Landing Page Architecture
- **Location**: `/landing_page/` directory (standalone HTML/CSS)
- **Live URLs**: 
  - https://p57.uz (primary landing page)
  - https://srv852801.hstgr.cloud (backup domain)
- **Technology**: Pure HTML5 + CSS3 + Vanilla JavaScript (NO React/Vite)
- **Container**: Separate nginx container (`landing_page-p57-landing-1`)

### Landing Page Deployment (FAST Method)

**✅ CORRECT Deployment Process:**
```bash
# 1. Copy files to server temp directory
scp -i ~/.ssh/protokol57_ed25519 /Users/xb21/P57/landing_page/index.html root@69.62.126.73:/tmp/index_new.html
scp -i ~/.ssh/protokol57_ed25519 /Users/xb21/P57/landing_page/style.css root@69.62.126.73:/tmp/style_new.css

# 2. Copy files directly into nginx container
ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 "docker cp /tmp/index_new.html landing_page-p57-landing-1:/usr/share/nginx/html/index.html && docker cp /tmp/style_new.css landing_page-p57-landing-1:/usr/share/nginx/html/style.css"

# 3. Changes are LIVE immediately (no restart needed)
```

### Landing Page Cache Management

**CSS Cache Busting** (when updating styles):
```html
<!-- Update version number in index.html -->
<link rel="stylesheet" href="style.css?v=12&FIXED=1734648200">
```

**Force Cache Clear** (if browser caching issues):
```bash
# Add timestamp to CSS URL
<link rel="stylesheet" href="style.css?v=13&t=$(date +%s)">
```

### Landing Page Design System

**Professional Typography Standards:**
- **Hero Title**: `clamp(var(--font-2xl), 4vw, 2.75rem)` (44px max on desktop)
- **Body Text**: `clamp(var(--font-base), 1.5vw, var(--font-lg))` (18px max)
- **Reading Width**: Max 24ch for headlines, 45ch for body text
- **Line Height**: 1.2 for headlines, 1.5-1.75 for body

**Spacing Standards (8pt Grid):**
- **Header Padding**: `var(--space-3)` (12px)
- **Section Padding**: `var(--space-8)` (48px)
- **Hero Section**: `var(--space-8) 0` (48px top/bottom)
- **Content Gaps**: `var(--space-6)` to `var(--space-8)` (32px-48px)

### Landing Page Responsive Breakpoints

```css
/* Desktop Large (1440px+) */
@media (min-width: 1440px) { /* Enhanced spacing and larger containers */ }

/* Desktop Standard (1024px-1439px) */
@media (min-width: 1024px) and (max-width: 1439px) { /* Standard desktop */ }

/* Tablet (769px-1023px) */
@media (min-width: 769px) and (max-width: 1023px) { /* Tablet layouts */ }

/* Mobile (≤768px) */
@media (max-width: 768px) { /* Mobile-first base styles */ }
```

### Landing Page Troubleshooting

#### ❌ "Changes not showing on live site"
**Root Cause**: CSS cache or missing file deployment

**Solution**:
```bash
# 1. Check what's actually live
curl -s "https://p57.uz/style.css?v=X" | head -20

# 2. Update cache buster version
# Edit index.html: style.css?v=X to style.css?v=X+1

# 3. Deploy with new filenames
scp files -> copy to container -> verify live
```

#### ❌ "404 Error or broken symlinks"
**Root Cause**: Wrong Docker cp command (never use stdin pipes!)

**Solution**:
```bash
# NEVER do this: docker cp /dev/stdin container:/path
# ALWAYS do this:
scp file server:/tmp/filename
docker cp /tmp/filename container:/path
```

#### ❌ "Desktop typography too large"
**Root Cause**: Conflicting media query rules overriding base styles

**Solution**: Check ALL media queries for font-size overrides:
```bash
# Find conflicting rules
curl -s "https://p57.uz/style.css" | grep -A 5 -B 5 "hero-content h1"
```

#### ❌ "Main platform (p57.birfoiz.uz) down after landing page work"
**Root Cause**: Accidentally stopped wrong Docker container

**Solution**:
```bash
# Restart main platform container
ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 "cd /opt/protokol57 && docker compose up -d"
```

### Landing Page vs Main Platform

**CRITICAL DISTINCTION:**
- **Landing Page**: `p57.uz` → nginx container → `/landing_page/` files
- **Main Platform**: `p57.birfoiz.uz` → protokol57 container → React app

**Never confuse these two!** They are completely separate systems.

## Development Tools

- **Containerization**: Docker + docker-compose for all environments
- **Build System**: Vite for frontend, esbuild for backend
- **Process Management**: Docker containers (not PM2)
```

**Memories**:
- **WHY THE FUCK YOU SHUOLD SAY SOMETHING LIVE WHEN IT IS NOT!**