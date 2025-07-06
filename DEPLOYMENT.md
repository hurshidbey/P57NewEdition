# Protokol57 Deployment Guide

## ⚠️ CRITICAL: Common Issues That Break Production

### 1. **Volume Mounts in Docker Compose** ❌
**THE MOST COMMON ISSUE:** Volume mounts override production build with development files!

```yaml
# ❌ NEVER DO THIS IN PRODUCTION:
volumes:
  - .:/app
  - /app/node_modules

# ✅ PRODUCTION SHOULD HAVE NO VOLUMES
```

**Why this breaks:** 
- Docker builds your app into `/app/dist`
- Volume mounts replace this with your local files
- ESM module loading fails because it's looking at source files instead of built files

### 2. **Removing Console.log from Log Functions** ❌
**DO NOT** remove console.log from `server/vite.ts` log function:
```javascript
// ✅ CORRECT
export function log(message: string, source = "express") {
  console.log(`[${formattedTime}] [${source}] ${message}`);
}

// ❌ WRONG - This breaks server startup
export function log(message: string, source = "express") {
  // Empty function
}
```

### 3. **ESM Configuration Consistency** 
Keep `"type": "module"` in package.json and use `--format=esm` in build:
```json
{
  "type": "module",
  "scripts": {
    "build": "... --format=esm ..."
  }
}
```

## 📋 Deployment Checklist

### Local Development
```bash
# Use development compose file with volumes
docker-compose -f docker-compose.dev.yml up
```

### Production Deployment
```bash
# 1. Validate configuration
./validate-config.sh

# 2. Build with production compose (NO VOLUMES!)
docker-compose -f docker-compose.prod.yml build --no-cache

# 3. Deploy
docker-compose -f docker-compose.prod.yml up -d

# 4. Verify health
docker logs protokol57-protokol57-1 | grep "serving on port"
curl http://localhost:5000/health
```

### Remote Server Deployment
```bash
# Use the deployment script
./deploy-production.sh

# Or manually:
ssh root@69.62.126.73 "cd /opt/protokol57 && \
  docker compose -f docker-compose.prod.yml down && \
  docker compose -f docker-compose.prod.yml build --no-cache && \
  docker compose -f docker-compose.prod.yml up -d"
```

## 🚨 DO's and DON'Ts

### DO ✅
- Use `docker-compose.prod.yml` for production
- Keep volume mounts only in development files
- Run `validate-config.sh` before deployment
- Check container logs after deployment
- Keep ESM configuration consistent
- Test health endpoint after deployment

### DON'T ❌
- Add volume mounts to production compose files
- Remove console.log from critical functions
- Mix development and production configurations
- Deploy without checking health endpoint
- Change module type without updating build config
- Use `docker-compose.yml` for production

## 🔍 Troubleshooting

### Container keeps restarting
1. Check logs: `docker logs protokol57-protokol57-1`
2. Look for "serving on port 5000" message
3. If missing, check for volume mounts in compose file

### "Cannot find module" errors
1. Ensure NO volume mounts in production
2. Check that build completed successfully
3. Verify `dist/index.js` exists in container

### Port not responding
1. Check log function has console.log
2. Verify server actually started
3. Check health endpoint: `/health` not `/api/health`

## 📝 Post-Deployment Verification

Run these commands to verify deployment:

```bash
# 1. Check container is running
docker ps | grep protokol57

# 2. Check logs show server started
docker logs protokol57-protokol57-1 | grep "serving on port"

# 3. Test health endpoint
curl http://localhost:5000/health

# 4. Test API
curl http://localhost:5000/api/protocols

# 5. Check for errors
docker logs protokol57-protokol57-1 2>&1 | grep -i error
```

## 🔐 Environment Variables

Ensure `.env.production` includes:
- `OPENAI_API_KEY` - Required for AI features
- `DATABASE_URL` - PostgreSQL connection
- `SESSION_SECRET` - Unique secret for sessions
- All other required environment variables

## 📊 Monitoring

After deployment:
1. Monitor container health: `docker ps`
2. Check logs regularly: `docker logs -f protokol57-protokol57-1`
3. Verify Traefik routing if using reverse proxy
4. Test all critical endpoints

## 🆘 Emergency Rollback

If deployment fails:
```bash
# 1. Stop broken container
docker-compose -f docker-compose.prod.yml down

# 2. Restore from backup (if available)
cd /opt && rm -rf protokol57 && mv protokol57_backup protokol57

# 3. Restart with known good configuration
cd protokol57 && docker-compose -f docker-compose.prod.yml up -d
```

---

**Remember:** The #1 cause of deployment failures is volume mounts in production. Always double-check!