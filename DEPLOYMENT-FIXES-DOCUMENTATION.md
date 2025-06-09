# DEPLOYMENT FIXES DOCUMENTATION

## Critical Production Issues & Solutions

This document contains the EXACT fixes for recurring deployment issues that have broken the production site multiple times.

---

## 🔴 ISSUE 1: Traefik Domain Routing Broken (404 Errors)

### Problem:
- Both domains (p57.birfoiz.uz and srv852801.hstgr.cloud) return 404 errors
- Traefik cannot route properly when labels are on the Traefik container itself
- Docker network connectivity issues between Traefik and the application

### Root Cause:
Putting Traefik routing labels directly on the Traefik service causes Docker network routing conflicts.

### ✅ WORKING SOLUTION:

**Use file-based Traefik configuration instead of Docker labels:**

1. **Docker Compose Configuration** (`/root/docker-compose.yml`):
```yaml
version: "3.7"

services:
  traefik:
    image: "traefik"
    restart: always
    command:
      - "--api=true"
      - "--api.insecure=true"
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.web.http.redirections.entryPoint.to=websecure"
      - "--entrypoints.web.http.redirections.entrypoint.scheme=https"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.mytlschallenge.acme.tlschallenge=true"
      - "--certificatesresolvers.mytlschallenge.acme.email=hurshidbey@gmail.com"
      - "--certificatesresolvers.mytlschallenge.acme.storage=/letsencrypt/acme.json"
      - "--providers.file.directory=/etc/traefik/dynamic"
      - "--providers.file.watch=true"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - traefik_data:/letsencrypt
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - /root/dynamic.yml:/etc/traefik/dynamic/dynamic.yml:ro
    extra_hosts:
      - "host.docker.internal:host-gateway"

  n8n:
    image: docker.n8n.io/n8nio/n8n
    restart: always
    ports:
      - "127.0.0.1:5678:5678"
    labels:
      - traefik.enable=true
      - traefik.http.routers.n8n.rule=Host(`n8n.srv852801.hstgr.cloud`)
      - traefik.http.routers.n8n.tls=true
      - traefik.http.routers.n8n.entrypoints=web,websecure
      - traefik.http.routers.n8n.tls.certresolver=mytlschallenge
    environment:
      - N8N_HOST=n8n.srv852801.hstgr.cloud
      - N8N_PORT=5678
      - N8N_PROTOCOL=https
      - NODE_ENV=production
      - WEBHOOK_URL=https://n8n.srv852801.hstgr.cloud/
      - GENERIC_TIMEZONE=Asia/Tashkent
    volumes:
      - n8n_data:/home/node/.n8n

volumes:
  traefik_data:
    external: true
  n8n_data:
    external: true
```

2. **Dynamic Configuration File** (`/root/dynamic.yml`):
```yaml
http:
  routers:
    protokol57:
      rule: "Host(`p57.birfoiz.uz`) || Host(`srv852801.hstgr.cloud`)"
      entryPoints:
        - "web"
        - "websecure"
      service: protokol57
      tls:
        certResolver: mytlschallenge

  services:
    protokol57:
      loadBalancer:
        servers:
          - url: "http://172.17.0.1:5000"
```

### Deploy Commands:
```bash
cd /root
docker compose down
docker compose up -d
```

---

## 🔴 ISSUE 2: "Uncaught Error: supabaseUrl is required"

### Problem:
- Client application shows JavaScript error: "supabaseUrl is required"
- Supabase client cannot initialize
- Environment variables not included in Vite build

### Root Cause:
Vite environment variables (VITE_*) are not being loaded during the build process.

### ✅ WORKING SOLUTION:

1. **Ensure Environment Variables Exist** (`/opt/protokol57/.env`):
```bash
DATABASE_URL=postgresql://postgres:20031000a@db.bazptglwzqstppwlvmvb.supabase.co:5432/postgres
SUPABASE_URL=https://bazptglwzqstppwlvmvb.supabase.co
SUPABASE_ACCESS_TOKEN=sbp_c65b8d74d47c759e74a0b4463f0e0e6d48f4d3fd
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhenB0Z2x3enFzdHBwd2x2bXZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwMTc1OTAsImV4cCI6MjA2NDU5MzU5MH0.xRh0LCDWP6YD3F4mDGrIK3krwwZw-DRx0iXy7MmIPY8
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhenB0Z2x3enFzdHBwd2x2bXZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTAxNzU5MCwiZXhwIjoyMDY0NTkzNTkwfQ.GdDEVx5CRy1NC_2e5QbtCKcXZmoEL1z2RU7SlHA_-oQ

# CRITICAL: VITE environment variables for client build
VITE_SUPABASE_URL=https://bazptglwzqstppwlvmvb.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhenB0Z2x3enFzdHBwd2x2bXZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwMTc1OTAsImV4cCI6MjA2NDU5MzU5MH0.xRh0LCDWP6YD3F4mDGrIK3krwwZw-DRx0iXy7MmIPY8

# ATMOS Payment Gateway
ATMOS_STORE_ID=1981
ATMOS_CONSUMER_KEY=UhGzIAQ10FhOZiZ9KTHH_3NhTZ8a
ATMOS_CONSUMER_SECRET=JCuvoGpaV6VHf3migqRy7r6qtiMa
ATMOS_ENV=production
```

2. **Build with Environment Variables Explicitly Set**:
```bash
cd /opt/protokol57

# CRITICAL: Set VITE variables during build
VITE_SUPABASE_URL=https://bazptglwzqstppwlvmvb.supabase.co \
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhenB0Z2x3enFzdHBwd2x2bXZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwMTc1OTAsImV4cCI6MjA2NDU5MzU5MH0.xRh0LCDWP6YD3F4mDGrIK3krwwZw-DRx0iXy7MmIPY8 \
npm run build

pm2 restart protokol57
```

### Verification:
Check the built JavaScript bundle includes the environment variables:
```bash
grep -o "https://bazptglwzqstppwlvmvb.supabase.co" /opt/protokol57/dist/public/assets/*.js
```

---

## 🔴 ISSUE 3: ATMOS Credentials Not Configured

### Problem:
- Server crashes with "ATMOS credentials not configured"
- Payment system fails to initialize
- Environment variables missing from production

### Root Cause:
ATMOS environment variables are not present in the production `.env` file.

### ✅ WORKING SOLUTION:

1. **Add ATMOS Variables to Production** (`/opt/protokol57/.env`):
```bash
# ATMOS Payment Gateway (CRITICAL - DO NOT REMOVE)
ATMOS_STORE_ID=1981
ATMOS_CONSUMER_KEY=UhGzIAQ10FhOZiZ9KTHH_3NhTZ8a
ATMOS_CONSUMER_SECRET=JCuvoGpaV6VHf3migqRy7r6qtiMa
ATMOS_ENV=production
```

2. **Restart Application**:
```bash
cd /opt/protokol57
pm2 restart protokol57 --update-env
```

### Verification:
Check server logs for ATMOS initialization:
```bash
pm2 logs protokol57 | grep -i atmos
```

---

## 🚨 DEPLOYMENT CHECKLIST

**Before any deployment, ALWAYS verify these are working:**

1. **Environment Variables Check**:
```bash
cd /opt/protokol57
grep -E "VITE_SUPABASE|ATMOS_" .env
```

2. **Application Status Check**:
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:5000
# Should return: 200
```

3. **Domain Routing Check**:
```bash
curl -s -o /dev/null -w "%{http_code}" https://srv852801.hstgr.cloud
curl -s -o /dev/null -w "%{http_code}" https://p57.birfoiz.uz
# Both should return: 200
```

4. **Traefik Status Check**:
```bash
docker ps | grep traefik
# Should show: root-traefik-1 ... Up
```

---

## 🔧 EMERGENCY RECOVERY SCRIPT

If the site is broken, run this script to restore working state:

```bash
#!/bin/bash
echo "🚨 EMERGENCY RECOVERY: Restoring working state..."

# 1. Restore environment variables
cd /opt/protokol57
cat > .env << 'EOF'
DATABASE_URL=postgresql://postgres:20031000a@db.bazptglwzqstppwlvmvb.supabase.co:5432/postgres
SUPABASE_URL=https://bazptglwzqstppwlvmvb.supabase.co
SUPABASE_ACCESS_TOKEN=sbp_c65b8d74d47c759e74a0b4463f0e0e6d48f4d3fd
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhenB0Z2x3enFzdHBwd2x2bXZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwMTc1OTAsImV4cCI6MjA2NDU5MzU5MH0.xRh0LCDWP6YD3F4mDGrIK3krwwZw-DRx0iXy7MmIPY8
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhenB0Z2x3enFzdHBwd2x2bXZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTAxNzU5MCwiZXhwIjoyMDY0NTkzNTkwfQ.GdDEVx5CRy1NC_2e5QbtCKcXZmoEL1z2RU7SlHA_-oQ
VITE_SUPABASE_URL=https://bazptglwzqstppwlvmvb.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhenB0Z2x3enFzdHBwd2x2bXZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwMTc1OTAsImV4cCI6MjA2NDU5MzU5MH0.xRh0LCDWP6YD3F4mDGrIK3krwwZw-DRx0iXy7MmIPY8
ATMOS_STORE_ID=1981
ATMOS_CONSUMER_KEY=UhGzIAQ10FhOZiZ9KTHH_3NhTZ8a
ATMOS_CONSUMER_SECRET=JCuvoGpaV6VHf3migqRy7r6qtiMa
ATMOS_ENV=production
EOF

# 2. Rebuild application
VITE_SUPABASE_URL=https://bazptglwzqstppwlvmvb.supabase.co \
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhenB0Z2x3enFzdHBwd2x2bXZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwMTc1OTAsImV4cCI6MjA2NDU5MzU5MH0.xRh0LCDWP6YD3F4mDGrIK3krwwZw-DRx0iXy7MmIPY8 \
npm run build

# 3. Restart application
pm2 restart protokol57

# 4. Restore Traefik configuration
cd /root
cat > dynamic.yml << 'EOF'
http:
  routers:
    protokol57:
      rule: "Host(`p57.birfoiz.uz`) || Host(`srv852801.hstgr.cloud`)"
      entryPoints:
        - "web"
        - "websecure"
      service: protokol57
      tls:
        certResolver: mytlschallenge

  services:
    protokol57:
      loadBalancer:
        servers:
          - url: "http://172.17.0.1:5000"
EOF

# 5. Restart Docker services
docker compose down
docker compose up -d

echo "✅ Recovery complete. Test: https://srv852801.hstgr.cloud"
```

---

## ⚠️ NEVER DO THESE:

1. **DON'T** put Traefik routing labels on the Traefik container itself
2. **DON'T** build without VITE environment variables set
3. **DON'T** deploy without checking all three verification steps
4. **DON'T** remove ATMOS credentials from the environment
5. **DON'T** modify Docker configuration without backing up the working version

---

**Last Updated**: June 9, 2025  
**Status**: ✅ Both domains working  
**Verified**: https://srv852801.hstgr.cloud + https://p57.birfoiz.uz