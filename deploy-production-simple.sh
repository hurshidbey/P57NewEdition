#!/bin/bash

# Simple Production Deployment Script for Protokol57
# Use this until the git large file issue is resolved

echo "🚀 Starting production deployment..."

# Configuration
SERVER="root@69.62.126.73"
SSH_KEY="~/.ssh/protokol57_ed25519"
PROJECT_DIR="/opt/protokol57"

# Step 1: Connect to server and fix issues
echo "📦 Connecting to server and fixing known issues..."
ssh -i $SSH_KEY $SERVER << 'EOF'
cd /opt/protokol57

# Remove docker-compose.override.yml if exists
rm -f docker-compose.override.yml

# Fix vite.config.ts
sed -i "s/'react-router-dom', //g" vite.config.ts

# Fix server/index.ts
sed -i 's/await registerRoutes(app)/await setupRoutes(app)/g' server/index.ts

# Pull latest code
git stash
git pull origin main
git stash pop

# Rebuild and restart
docker compose down
docker compose build --no-cache
docker compose up -d

# Wait for startup
sleep 10

# Restart Traefik to fix routing
docker restart root-traefik-1

echo "✅ Deployment complete!"
EOF

echo ""
echo "📊 Testing endpoints:"
echo -n "Site Status: "
curl -s -o /dev/null -w "%{http_code}" "https://p57.birfoiz.uz"
echo ""

echo "✅ Deployment finished!"
echo "🌐 Site: https://p57.birfoiz.uz"