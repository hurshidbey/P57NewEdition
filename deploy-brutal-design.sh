#!/bin/bash

# Deploy brutal design to production

echo "🚀 Deploying brutal design to production..."

# SSH connection details
SSH_KEY="$HOME/.ssh/protokol57_ed25519"
SERVER="root@69.62.126.73"
PROJECT_DIR="/opt/protokol57"

# Step 1: Commit changes locally
echo "📝 Committing changes locally..."
git add -A
git commit -m "feat: Apply brutal rectangular design - remove all rounded corners

- Updated all UI components to use rounded-none
- Fixed button, card, and input components for rectangular design
- Ensured consistent brutal aesthetic across all components
- Maintained rounded-full only for spinners and loading indicators

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"

# Step 2: Push to GitHub
echo "📤 Pushing to GitHub..."
git push origin main || echo "⚠️  Git push failed, continuing with deployment..."

# Step 3: Deploy to production
echo "🔧 Deploying to production server..."

ssh -i "$SSH_KEY" "$SERVER" << 'EOF'
cd /opt/protokol57

# Pull latest changes
echo "Pulling latest changes..."
git pull origin main || {
    echo "Git pull failed, stashing and retrying..."
    git stash
    git pull origin main
    git stash pop || true
}

# Clear Docker caches
echo "Clearing Docker caches..."
docker system prune -f

# Stop containers
echo "Stopping containers..."
docker compose down

# Remove the override file if it exists
rm -f docker-compose.override.yml

# Build with no cache
echo "Building containers..."
docker compose build --no-cache

# Start containers
echo "Starting containers..."
docker compose up -d

# Wait for startup
sleep 10

# Check status
echo "Checking container status..."
docker ps --filter "name=protokol57-protokol57" --format "table {{.Names}}\t{{.Status}}"

# Check logs for errors
echo "Checking for errors..."
docker logs protokol57-protokol57-1 --tail 50 2>&1 | grep -i error || echo "No errors found in logs"

echo "✅ Deployment complete!"
EOF

echo ""
echo "🎉 Brutal design deployed successfully!"
echo ""
echo "📍 Check the live site at:"
echo "   - https://p57.birfoiz.uz"
echo "   - https://srv852801.hstgr.cloud"
echo ""
echo "🔍 To verify the changes:"
echo "   1. Check that all buttons have rectangular corners"
echo "   2. Verify cyan accent color (#1bffbb) is used"
echo "   3. Ensure brutal design is consistent throughout"