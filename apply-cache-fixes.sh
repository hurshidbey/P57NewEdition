#!/bin/bash
# Apply cache fixes to production

set -e

echo "🚀 Applying cache fixes to production..."

# SSH details
SSH_KEY="$HOME/.ssh/protokol57_ed25519"
SERVER="root@69.62.126.73"

# Step 1: Apply nginx configuration update
echo "📝 Updating nginx configuration..."
./scripts/update-nginx-cache.sh

# Step 2: Deploy the HTML changes with cache meta tags
echo "🔄 Deploying updated HTML with cache control tags..."
./deploy-production.sh

echo "✅ Cache fixes applied successfully!"
echo ""
echo "What this does:"
echo "1. HTML files are no longer cached (users get fresh version)"
echo "2. JS/CSS files with hashes remain cached efficiently"
echo "3. Meta tags prevent browser caching of HTML"
echo ""
echo "Users should now automatically see the latest updates!"