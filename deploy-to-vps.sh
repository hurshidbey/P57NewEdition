#!/bin/bash
set -e

echo "🚀 Deploying Protokol57 to VPS..."

# First, ensure we're on main branch and up to date
echo "📤 Pushing to GitHub..."
git add .
git commit -m "Deploy: $(date '+%Y-%m-%d %H:%M:%S')" || echo "No changes to commit"
git push origin main

# Deploy to VPS
echo "🌐 Deploying to VPS..."
ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 'cd /opt/protokol57 && ./deploy.sh'

echo "✅ Deployment complete!"
echo "🌐 Website: https://srv852801.hstgr.cloud/"
echo "💳 Payme endpoint: https://srv852801.hstgr.cloud/api/payme"