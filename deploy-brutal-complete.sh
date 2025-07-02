#!/bin/bash

echo "🚀 Complete Brutal Design Deployment to Production"
echo "================================================="

SSH_KEY="$HOME/.ssh/protokol57_ed25519"
SERVER="root@69.62.126.73"
PROJECT_DIR="/opt/protokol57"

# Create a comprehensive tar archive with all fixed files
echo "📦 Creating comprehensive archive of all brutal design files..."
tar -czf brutal-complete.tar.gz \
  client/src/components/ui/*.tsx \
  client/src/components/*.tsx \
  client/src/pages/*.tsx \
  client/src/content/knowledge-base/categories/*.tsx \
  client/src/test/components/*.tsx \
  client/src/index.css \
  tailwind.config.ts \
  fix-all-rounded-classes.sh

# Copy to server
echo "📤 Copying archive to server..."
scp -i "$SSH_KEY" brutal-complete.tar.gz "$SERVER:/tmp/"

# Deploy on server
echo "🔧 Deploying on server..."
ssh -i "$SSH_KEY" "$SERVER" << 'EOF'
cd /opt/protokol57

echo "📥 Extracting files..."
tar -xzf /tmp/brutal-complete.tar.gz

echo "🔍 Running rounded classes fix script on server..."
chmod +x fix-all-rounded-classes.sh
./fix-all-rounded-classes.sh

echo "🧹 Clearing ALL Docker caches..."
docker system prune -af --volumes || true

echo "🛑 Stopping containers..."
docker compose down

echo "🔨 Building with fresh state..."
docker compose build --no-cache --pull

echo "🚀 Starting containers..."
docker compose up -d

echo "⏳ Waiting for container to fully start..."
sleep 20

echo "📊 Container status:"
docker ps --filter "name=protokol57" --format "table {{.Names}}\t{{.Status}}"

echo ""
echo "🔍 Verifying brutal design in built assets..."
echo "Checking for rounded-none in JavaScript bundle:"
docker exec protokol57-protokol57-1 sh -c 'find /app/dist -name "*.js" | xargs grep -c "rounded-none" | head -1' || echo "0"

echo ""
echo "Checking for unwanted rounded classes:"
docker exec protokol57-protokol57-1 sh -c 'find /app/dist -name "*.js" | xargs grep -o "rounded-[a-z]*" | grep -v "rounded-none" | grep -v "rounded-full" | sort | uniq -c' || echo "None found"

echo ""
echo "✅ Complete deployment finished!"
EOF

# Cleanup
rm brutal-complete.tar.gz

echo ""
echo "🎯 Deployment complete! Please verify:"
echo "   1. Visit https://p57.birfoiz.uz"
echo "   2. Check that ALL buttons are rectangular (no rounded corners)"
echo "   3. Verify cyan accent color (#1bffbb)"
echo "   4. Clear browser cache if needed (Ctrl+Shift+R)"
echo ""
echo "💡 Tip: Open DevTools Network tab and disable cache to ensure fresh assets"