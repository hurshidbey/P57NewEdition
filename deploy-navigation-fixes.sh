#!/bin/bash
# Deployment script for navigation and mobile fixes

SERVER="root@69.62.126.73"
SSH_KEY="~/.ssh/protokol57_ed25519"
PROJECT_DIR="/opt/protokol57"

echo "🚀 Deploying Navigation & Mobile Fixes"
echo "======================================"

# 1. Connect to server and checkout the branch
echo "📦 Checking out navigation-mobile-fixes-clean branch..."
ssh -i $SSH_KEY $SERVER "cd $PROJECT_DIR && git fetch origin && git checkout navigation-mobile-fixes-clean && git pull origin navigation-mobile-fixes-clean"

# 2. Rebuild Docker containers
echo "🏗️  Rebuilding Docker containers..."
ssh -i $SSH_KEY $SERVER "cd $PROJECT_DIR && docker compose down"
ssh -i $SSH_KEY $SERVER "cd $PROJECT_DIR && docker compose build --no-cache"
ssh -i $SSH_KEY $SERVER "cd $PROJECT_DIR && docker compose up -d"

# 3. Wait for containers
echo "⏳ Waiting for containers to start..."
sleep 15

# 4. Restart Traefik
echo "🔧 Restarting Traefik..."
ssh -i $SSH_KEY $SERVER "docker restart root-traefik-1"

# 5. Verification
echo -e "\n✅ VERIFICATION"
echo "==============="
sleep 10

# Check site
echo -n "Site Status: "
curl -s -o /dev/null -w "%{http_code}\n" "https://p57.birfoiz.uz"

# Check bundle
echo -n "JavaScript Bundle: "
BUNDLE=$(ssh -i $SSH_KEY $SERVER "docker exec protokol57-protokol57-1 ls /app/dist/public/assets/ | grep 'index-.*\.js' | head -1")
echo $BUNDLE

# Check if navigation is in bundle
echo -n "Navigation Components: "
ssh -i $SSH_KEY $SERVER "docker exec protokol57-protokol57-1 grep -c 'ProtocolNavigation' /app/dist/public/assets/$BUNDLE" || echo "0"

echo -e "\n🎉 Deployment complete!"
echo "🌐 Main site: https://p57.birfoiz.uz"

echo -e "\n⚠️  IMPORTANT: Remember to manually update the OpenAI API key in /opt/protokol57/.env.production on the server!"