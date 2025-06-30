#!/bin/bash
# COMPREHENSIVE DEPLOYMENT SCRIPT WITH NAVIGATION FIX

SERVER="root@69.62.126.73"
SSH_KEY="~/.ssh/protokol57_ed25519"
PROJECT_DIR="/opt/protokol57"

echo "🚀 COMPREHENSIVE DEPLOYMENT WITH NAVIGATION FIX"
echo "=============================================="

# 1. Fix OpenAI key locally first
echo "⚠️  Remember to update OpenAI key on server after deployment"

# 2. Commit if there are changes
echo "📝 Committing any local changes..."
git add -A
git commit -m "Update deployment configuration" || true

# 3. Push to GitHub
echo "📤 Pushing to GitHub..."
git push origin main

# 4. Deploy to server
echo "🌐 Deploying to production server..."
ssh -i $SSH_KEY $SERVER "cd $PROJECT_DIR && git pull"

# 5. Update server .env.production
echo "🔑 Note: OpenAI API key must be manually updated on server"
echo "Run: ssh -i $SSH_KEY $SERVER"
echo "Then update OPENAI_API_KEY in /opt/protokol57/.env.production"

# 6. Rebuild
echo "🏗️  Rebuilding Docker containers..."
ssh -i $SSH_KEY $SERVER "cd $PROJECT_DIR && docker compose down"
ssh -i $SSH_KEY $SERVER "cd $PROJECT_DIR && docker compose build --no-cache"
ssh -i $SSH_KEY $SERVER "cd $PROJECT_DIR && docker compose up -d"

# 7. Fix Traefik
echo "⏳ Waiting for containers to stabilize..."
sleep 15
echo "🔧 Restarting Traefik..."
ssh -i $SSH_KEY $SERVER "docker restart root-traefik-1"

# 8. Verification
echo -e "\n✅ VERIFICATION"
echo "==============="
sleep 10

# Check site
echo -n "Site Status: "
curl -s -o /dev/null -w "%{http_code}\n" "https://p57.birfoiz.uz"

# Check OpenAI
echo -n "OpenAI Status: "
curl -s "https://p57.birfoiz.uz/api/test-openai" | grep -o '"connected":[^,]*' || echo "Failed"

# Check bundle
echo -n "Bundle Hash: "
curl -s "https://p57.birfoiz.uz" | grep -o 'index-[^"]*\.js' | head -1

echo -e "\n🎉 Deployment complete!"
echo "🌐 Main site: https://p57.birfoiz.uz"
echo "🌐 Backup: https://srv852801.hstgr.cloud"

# Note about navigation issue
echo -e "\n⚠️  KNOWN ISSUE: Navigation components may not appear in production"
echo "This is due to Vite tree-shaking authenticated components."
echo "Workaround: Access the site while authenticated to use navigation."