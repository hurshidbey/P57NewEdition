# Protokol57 Deployment Fixes

This document summarizes all the fixes that have been implemented to resolve recurring deployment issues.

## Fixed Issues

### 1. ✅ React Router DOM Removal
**Problem**: `react-router-dom` was included in vite.config.ts vendor chunk but not actually used, causing build errors.
**Fix**: Removed `'react-router-dom'` from the vendor chunk in vite.config.ts

### 2. ✅ Server Routes Function Name
**Problem**: server/index.ts was calling `registerRoutes()` but the function is named `setupRoutes()`
**Fix**: Changed `await registerRoutes(app)` to `await setupRoutes(app)` in server/index.ts

### 3. ✅ Docker Compose Override
**Problem**: docker-compose.override.yml was interfering with production settings
**Fix**: Removed docker-compose.override.yml from both local and production

### 4. ✅ Brutal Design Files
**Problem**: Critical CSS/JS files for brutal design were missing
**Fix**: Ensured critical-fix.css and fix-invisible-text.js are present in client/public/

## Deployment Scripts

### Full Deployment Script: `deploy-production.sh`
A comprehensive script that:
- Creates backups before deployment
- Fixes all known issues automatically
- Performs health checks
- Provides rollback instructions
- Handles OpenAI API key verification

### Quick Deployment Script: `deploy-production-simple.sh`
A simpler version for quick deployments that:
- Fixes the core issues
- Rebuilds and restarts containers
- Tests the endpoints

## Usage

### For Full Deployment (Recommended):
```bash
./deploy-production.sh
```

### For Quick Deployment:
```bash
./deploy-production-simple.sh
```

### Manual Deployment Steps:
If scripts fail, use these manual commands:

```bash
# SSH to server
ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73

# Navigate to project
cd /opt/protokol57

# Fix known issues
rm -f docker-compose.override.yml
sed -i "s/'react-router-dom', //g" vite.config.ts
sed -i 's/await registerRoutes(app)/await setupRoutes(app)/g' server/index.ts

# Update code
git pull origin main

# Rebuild and deploy
docker compose down
docker compose build --no-cache
docker compose up -d

# Fix Traefik routing
docker restart root-traefik-1
```

## Testing Deployment

After deployment, test these endpoints:
- Main site: https://p57.birfoiz.uz
- Backup: https://srv852801.hstgr.cloud
- API: https://p57.birfoiz.uz/api/protocols
- OpenAI: https://p57.birfoiz.uz/api/test-openai

## Important Notes

1. **OpenAI API Key**: Must be set in .env.production for AI features to work
2. **Docker Caches**: Clear with `docker system prune -f` if builds are stale
3. **Traefik**: May need restart after deployment to fix routing
4. **Backups**: Always created at `/opt/protokol57_backup_[timestamp]`

## Troubleshooting

### Site Returns 504 Gateway Timeout
- Restart Traefik: `docker restart root-traefik-1`
- Check container is running: `docker ps`

### OpenAI Not Working
- Check key in container: `docker exec protokol57-protokol57-1 printenv | grep OPENAI`
- Update .env.production and restart container

### Stale JavaScript Bundle
- Clear Docker build cache: `docker system prune -af`
- Force rebuild: `docker compose build --no-cache --pull`