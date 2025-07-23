# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Standard Workflow
1. First think through the problem, read the codebase for relevant files, and write a plan to tasks/todo.md.
2. The plan should have a list of todo items that you can check off as you complete them
3. Before you begin working, check in with me and I will verify the plan.
4. Then, begin working on the todo items, marking them as complete as you go.
5. Please every step of the way just give me a high level explanation of what changes you made
6. Make every task and code change you do as simple as possible. We want to avoid making any massive or complex changes. Every change should impact as little code as possible. Everything is about simplicity.
7. Finally, add a review section to the todo.md file with a summary of the changes you made and any other relevant information.

## SECURITY CHECK

Please check through all the code after you just wrote it. And make sure it follows security best practices. Make sure no sensitive information is in the front end and there are no vulnerabilities people can exploit.

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
OPENAI_API_KEY=sk-proj-YOUR_ACTUAL_KEY_HERE  # CRITICAL: Must be set for AI evaluation to work
```

### Client-side (Build-time):
```bash
VITE_SUPABASE_URL=https://bazptglwzqstppwlvmvb.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Deployment Workflow

### Live Deployment to VPS:

**Quick Deployment**: Use the automated script:
```bash
./deploy-production.sh
```

**Manual Deployment**:
1. **SSH to VPS**: `ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73`
2. **Navigate**: `cd /opt/protokol57`  
3. **Deploy**: `docker compose -f docker-compose.prod.yml down && docker compose -f docker-compose.prod.yml build --no-cache && docker compose -f docker-compose.prod.yml up -d`
4. **Verify**: 
   - Main platform: https://app.p57.uz
   - Landing page: https://p57.uz
   - Backup URL: https://srv852801.hstgr.cloud

### Local Development:
1. **Start**: `docker-compose up`
2. **Access**: http://localhost:5001
3. **Stop**: `docker-compose down`

### ✅ FIXED: Gateway Timeout Issues

**Previous Problem**: Site returned 504 Gateway Timeout errors

**Root Cause**: Application had Traefik configuration but server uses NGINX

**Solution Applied**: 
1. Removed all Traefik labels from docker-compose files
2. Created optimized NGINX configuration with proper timeouts
3. Implemented graceful shutdown handling
4. Added hierarchical timeout system
5. Increased memory limits to 1GB

**Current Architecture**:
- NGINX reverse proxy with connection pooling
- Single Docker network (protokol-network)
- Unified health checks at `/health`
- Zero-downtime deployment support

**For deployment issues, see**: [DEVOPS-DEPLOYMENT-GUIDE.md](./DEVOPS-DEPLOYMENT-GUIDE.md)

### ⚠️ CRITICAL FIX: Docker Using Old Environment Variables

**Problem**: Docker keeps using old environment variables even after updating .env.production

**Root Cause**: Dockerfile was copying .env.development instead of using .env.production

**Solution Applied**:
1. Removed `COPY .env.development .env` from Dockerfile (line 30)
2. Docker Compose already configured to use `.env.production` via `env_file` directive

**Correct Deployment Process**:
```bash
# 1. Update .env.production on your local machine
# 2. Copy updated .env.production to server
scp -i ~/.ssh/protokol57_ed25519 /Users/xb21/P57/.env.production root@69.62.126.73:/opt/protokol57/.env.production

# 3. SSH to server and rebuild with fresh environment
ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 "cd /opt/protokol57 && git pull && docker compose down && docker compose build --no-cache && docker compose up -d"

# 4. Verify environment variables are loaded correctly
ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 "docker exec protokol57-protokol57-1 printenv | grep OPENAI"
```

### ⚠️ CRITICAL FIX: OpenAI API Key Not Loading in Production

**Problem**: OpenAI API key environment variable not being picked up by Docker container, causing evaluation feature to fail

**Root Cause**: Multiple potential issues with environment variable loading in Docker

**✅ CORRECT Fix Process**:

1. **Update .env.production on both local and server**:
```bash
# Local: Edit /Users/xb21/P57/.env.production
OPENAI_API_KEY=YOUR_ACTUAL_OPENAI_API_KEY_HERE

# Server: Update directly on production
ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 "cd /opt/protokol57 && sed -i 's/OPENAI_API_KEY=.*/OPENAI_API_KEY=YOUR_ACTUAL_OPENAI_API_KEY_HERE/' .env.production"
```

2. **Restart Docker containers** (environment variables only load at container startup):
```bash
ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 "cd /opt/protokol57 && docker compose down && docker compose up -d"
```

3. **Verify environment variable is loaded**:
```bash
ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 "docker exec protokol57-protokol57-1 printenv | grep OPENAI"
# Should output: OPENAI_API_KEY=sk-proj-1-pgPwLC...
```

**Why This Happens**:
- Docker Compose loads `.env.production` via `env_file` directive  
- Environment variables are only read at container startup, not runtime
- Container must be restarted (not just rebuilt) to pick up new env vars
- Wrong API key was previously set during development

**Prevention**:
- Always verify API key after deployment: `docker exec protokol57-protokol57-1 printenv | grep OPENAI`
- Test OpenAI integration immediately after deployment  
- Keep .env.production in sync between local and server

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
curl -s https://app.p57.uz | grep -o 'index-[^"]*\.js'
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

#### ❌ "Main platform (app.p57.uz) down after landing page work"
**Root Cause**: Accidentally stopped wrong Docker container

**Solution**:
```bash
# Restart main platform container
ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 "cd /opt/protokol57 && docker compose up -d"
```

### Landing Page vs Main Platform

**CRITICAL DISTINCTION:**
- **Landing Page**: `p57.uz` → nginx (host) → `/opt/protokol57/landing_page/` files
- **Main Platform**: `app.p57.uz` → protokol57 container → React app (port 5001)

**Never confuse these two!** They are completely separate systems.

### Domain & SSL Configuration
- **Server IP**: `69.62.126.73`
- **SSL Certificates**: Managed by Let's Encrypt (auto-renewal enabled)
- **NGINX Config**: `/etc/nginx/sites-available/landing`
- For SSL management details, see [NGINX-SSL.md](./NGINX-SSL.md)

## Development Tools

- **Containerization**: Docker + docker-compose for all environments
- **Build System**: Vite for frontend, esbuild for backend
- **Process Management**: Docker containers (not PM2)

## OpenAI Integration Setup

The application uses OpenAI's GPT-4 model for AI-powered prompt evaluation. Here's how to set it up:

### Getting Your OpenAI API Key

1. Create an account at https://platform.openai.com/
2. Go to https://platform.openai.com/api-keys
3. Create a new API key
4. Copy the key (starts with `sk-proj-`)

### Setting Up the API Key

**IMPORTANT**: Never commit your actual API key to Git!

1. **For Local Development**:
   ```bash
   # Edit .env.production
   OPENAI_API_KEY=sk-proj-YOUR_ACTUAL_KEY_HERE
   ```

2. **For Production Deployment**:
   ```bash
   # Copy .env.production to server
   scp -i ~/.ssh/protokol57_ed25519 .env.production root@69.62.126.73:/opt/protokol57/.env.production
   
   # Rebuild and restart container
   ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 "cd /opt/protokol57 && docker compose down && docker compose build --no-cache && docker compose up -d"
   ```

3. **Verify It's Working**:
   ```bash
   # Test locally
   curl http://localhost:5001/api/test-openai
   
   # Test production
   curl https://app.p57.uz/api/test-openai
   ```

### ⚠️ CRITICAL: Deployment Script (USE THIS!)

**ALWAYS use the deployment script for production deployments:**
```bash
./deploy-production.sh
```

This script automatically:
1. Updates OpenAI API key BEFORE building
2. Clears ALL Docker caches to prevent stale builds
3. Fixes Traefik routing issues
4. Verifies all endpoints are working
5. Checks that navigation components are in the bundle

### Troubleshooting OpenAI Integration

#### ❌ "OpenAI connection failed"
**Root Cause**: Missing or invalid API key

**Solution**:
```bash
# Check if key is set in container
docker exec p57-protokol57-1 printenv | grep OPENAI

# If missing or wrong, update .env.production and rebuild
```

#### ❌ "Evaluation not working"
**Root Cause**: API key may have expired or hit rate limits

**Solution**:
1. Check API key status at https://platform.openai.com/usage
2. Generate new key if needed
3. Update .env.production and redeploy
```

## 🎟️ Discount/Promo Code System

The platform includes a comprehensive coupon system that allows administrators to create and manage discount codes for the premium payment flow.

### Coupon Features

1. **Flexible Discount Types**:
   - **Percentage Discounts**: Apply a percentage off the original price (e.g., 20% off)
   - **Fixed Amount Discounts**: Deduct a fixed amount from the price (e.g., 100,000 UZS off)

2. **Usage Controls**:
   - **Usage Limits**: Set maximum number of times a coupon can be used
   - **Time Restrictions**: Set valid from/until dates for time-limited promotions
   - **Active/Inactive Status**: Enable or disable coupons without deletion

3. **Admin Management**:
   - Create, edit, and delete coupons from the admin panel
   - View usage statistics and track redemptions
   - See which users have used each coupon

### Database Schema

The coupon system uses two main tables:

```sql
-- Coupons table
coupons:
  - id: number (auto-increment)
  - code: string (unique, uppercase)
  - description: string
  - discountType: 'percentage' | 'fixed'
  - discountValue: number (percentage 0-100 or fixed amount)
  - validFrom: timestamp (optional)
  - validUntil: timestamp (optional)
  - maxUses: number (optional, null = unlimited)
  - usedCount: number (default 0)
  - isActive: boolean (default true)
  - createdBy: string (user email)
  - createdAt: timestamp

-- Coupon usage tracking
couponUsage:
  - id: number (auto-increment)
  - couponId: number (references coupons.id)
  - userId: string
  - userEmail: string
  - paymentId: string
  - originalAmount: number
  - discountAmount: number
  - finalAmount: number
  - usedAt: timestamp
```

### Implementation Details

#### Admin Panel (`/admin/coupons`)
- List all coupons with search and filtering
- Create new coupons with validation
- Edit existing coupons
- View usage statistics
- Delete coupons (soft delete recommended)

#### Payment Flow Integration
1. **Coupon Validation** (`/api/coupons/validate`):
   - Validates coupon code exists and is active
   - Checks date validity (validFrom/validUntil)
   - Verifies usage limits haven't been exceeded
   - Calculates discount amount based on type

2. **Payment Processing**:
   - Coupon code is applied during transaction creation
   - Original amount, discount, and final amount are tracked
   - Coupon usage is recorded after successful payment
   - Usage count is incremented atomically

3. **User Experience**:
   - Coupon input field on payment page
   - Real-time validation and discount preview
   - Clear error messages for invalid/expired coupons
   - Shows applied discount in payment summary

### API Endpoints

```typescript
// Validate a coupon code
POST /api/coupons/validate
Body: { code: string, amount: number }
Response: { 
  valid: boolean, 
  message?: string,
  coupon?: {
    id: number,
    code: string,
    originalAmount: number,
    discountAmount: number,
    finalAmount: number,
    discountPercent: number
  }
}

// Admin endpoints (protected)
GET /api/admin/coupons         // List all coupons
POST /api/admin/coupons        // Create new coupon
PUT /api/admin/coupons/:id     // Update coupon
DELETE /api/admin/coupons/:id  // Delete coupon
GET /api/admin/coupons/:id/usage // Get usage statistics
```

### Testing Coupons

1. **Create Test Coupon** (Admin Panel):
   - Code: `TEST20` (20% discount)
   - Type: Percentage
   - Value: 20
   - Active: Yes

2. **Test Payment Flow**:
   - Go to payment page
   - Enter coupon code
   - Verify discount is applied
   - Complete payment
   - Check usage count increased

### Security Considerations

1. **Validation**: All coupon codes are validated server-side
2. **Case Insensitive**: Codes are converted to uppercase for consistency
3. **Rate Limiting**: Coupon validation endpoint has rate limiting
4. **Audit Trail**: All coupon creation and usage is logged
5. **Admin Only**: Coupon management requires admin authentication

**Memories**:
- **WHY THE FUCK YOU SHUOLD SAY SOMETHING LIVE WHEN IT IS NOT!**