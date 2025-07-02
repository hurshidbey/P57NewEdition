#!/bin/bash

echo "🚀 Syncing brutal design files directly to production..."

SSH_KEY="$HOME/.ssh/protokol57_ed25519"
SERVER="root@69.62.126.73"
PROJECT_DIR="/opt/protokol57"

# Files to sync
echo "📦 Syncing modified UI components..."

# Create a tar archive of the modified files
tar -czf brutal-design-files.tar.gz \
  client/src/components/ui/button.tsx \
  client/src/components/ui/card.tsx \
  client/src/components/ui/*.tsx \
  client/src/components/*.tsx \
  client/src/index.css \
  tailwind.config.ts

# Copy to server
echo "📤 Copying files to server..."
scp -i "$SSH_KEY" brutal-design-files.tar.gz "$SERVER:/tmp/"

# Extract on server and rebuild
ssh -i "$SSH_KEY" "$SERVER" << 'EOF'
cd /opt/protokol57

echo "📥 Extracting files..."
tar -xzf /tmp/brutal-design-files.tar.gz

echo "🔧 Rebuilding Docker container..."
docker compose down
docker compose build --no-cache
docker compose up -d

echo "⏳ Waiting for container to start..."
sleep 15

echo "✅ Deployment complete!"
docker ps --filter "name=protokol57" --format "table {{.Names}}\t{{.Status}}"
EOF

# Cleanup
rm brutal-design-files.tar.gz

echo ""
echo "🎯 Files synced and deployed!"