# Protokol57

AI prompting protocols learning platform in Uzbek language.

## 🚀 Quick Start

### Development
```bash
# Start with development configuration (includes volume mounts)
docker-compose -f docker-compose.dev.yml up

# Or use the standard compose for development
docker-compose up
```

### Production
```bash
# IMPORTANT: Use production compose file (NO volume mounts!)
docker-compose -f docker-compose.prod.yml up -d

# Or use deployment script
./deploy-production.sh
```

## ⚠️ Common Pitfalls & Known Issues

### 1. **Volume Mounts Breaking Production** (Most Common!)
**Problem:** Adding volume mounts to docker-compose.yml causes ESM module loading failures.

```yaml
# ❌ NEVER do this in production:
volumes:
  - .:/app
  - /app/node_modules
```

**Solution:** Use `docker-compose.prod.yml` for production which has NO volume mounts.

**Why it happens:** Volume mounts override the built production code in `/app/dist` with development files, breaking ESM module resolution.

### 2. **Empty Log Function**
**Problem:** Removing console.log from `server/vite.ts` prevents server from starting.

**Solution:** Always keep console.log in the log function:
```javascript
export function log(message: string, source = "express") {
  console.log(`[${formattedTime}] [${source}] ${message}`);
}
```

### 3. **Wrong Health Check Endpoint**
**Problem:** Docker health check fails because it's checking `/api/health` instead of `/health`.

**Solution:** Health endpoint is at `/health` (not `/api/health`).

### 4. **Missing Environment Variables**
**Problem:** Features like AI evaluation don't work.

**Solution:** Ensure `.env.production` contains all required variables, especially:
- `OPENAI_API_KEY=sk-proj-...`
- `DATABASE_URL`
- `SESSION_SECRET`

## 📋 Deployment Checklist

Before deploying, always run:
```bash
./validate-config.sh
```

This script checks for:
- Volume mounts in production files
- Log function implementation
- ESM configuration
- Health endpoint configuration
- Environment variables

## 🛠️ Project Structure

```
.
├── client/                 # React frontend
├── server/                 # Express backend
├── shared/                 # Shared types (Drizzle ORM)
├── docker-compose.yml      # Development config
├── docker-compose.prod.yml # Production config (NO volumes!)
├── docker-compose.dev.yml  # Explicit dev config
├── Dockerfile             # Production build
├── validate-config.sh     # Configuration validator
└── DEPLOYMENT.md          # Detailed deployment guide
```

## 🔧 Tech Stack

- **Frontend:** React 18 + Vite + TypeScript + TailwindCSS
- **Backend:** Express + TypeScript + Drizzle ORM
- **Database:** PostgreSQL (Supabase)
- **Container:** Docker + Docker Compose
- **Deployment:** VPS with Traefik reverse proxy

## 📝 Important Files

- `DEPLOYMENT.md` - Comprehensive deployment guide with troubleshooting
- `validate-config.sh` - Automated configuration checker
- `deploy-production.sh` - Production deployment script
- `.git/hooks/pre-commit` - Git hook to prevent bad commits

## 🚨 If Things Break

1. **Check logs:** `docker logs protokol57-protokol57-1`
2. **Run validator:** `./validate-config.sh`
3. **Check for volume mounts** in docker-compose files
4. **Verify log function** has console.log
5. **Test health endpoint:** `curl http://localhost:5000/health`

## 📚 Documentation

- [Deployment Guide](./DEPLOYMENT.md) - Detailed deployment instructions
- [Claude.md](./CLAUDE.md) - AI assistant instructions

## 🔗 Links

- Production: https://p57.birfoiz.uz
- Backup: https://srv852801.hstgr.cloud
- Landing: https://p57.uz

---

**Remember:** The #1 cause of deployment failures is volume mounts in production docker-compose files!