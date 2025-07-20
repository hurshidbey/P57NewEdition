#!/bin/bash
# Script to update nginx configuration with cache fixes

set -e

echo "🔧 Updating Nginx configuration for cache fixes..."

# SSH connection details
SSH_KEY="$HOME/.ssh/protokol57_ed25519"
SERVER="root@69.62.126.73"

# Backup current configuration
echo "📦 Backing up current nginx configuration..."
ssh -i $SSH_KEY $SERVER "cp /etc/nginx/sites-available/protokol57 /etc/nginx/sites-available/protokol57.backup-$(date +%Y%m%d-%H%M%S)"

# Copy new configuration
echo "📤 Uploading new nginx configuration..."
scp -i $SSH_KEY nginx-cache-fix.conf $SERVER:/tmp/protokol57-new

# Move to proper location
echo "📥 Installing new configuration..."
ssh -i $SSH_KEY $SERVER "mv /tmp/protokol57-new /etc/nginx/sites-available/protokol57"

# Test nginx configuration
echo "🧪 Testing nginx configuration..."
if ssh -i $SSH_KEY $SERVER "nginx -t"; then
    echo "✅ Nginx configuration is valid"
else
    echo "❌ Nginx configuration test failed! Rolling back..."
    ssh -i $SSH_KEY $SERVER "cp /etc/nginx/sites-available/protokol57.backup-$(date +%Y%m%d-%H%M%S) /etc/nginx/sites-available/protokol57"
    exit 1
fi

# Reload nginx
echo "🔄 Reloading nginx..."
ssh -i $SSH_KEY $SERVER "systemctl reload nginx"

echo "✅ Nginx cache configuration updated successfully!"
echo ""
echo "Cache behavior:"
echo "- HTML files: No cache (always fresh)"
echo "- JS/CSS with hash: Cached for 1 year (immutable)"
echo "- Images/fonts: Cached for 30 days"
echo "- API endpoints: No cache"
echo ""
echo "Users will now automatically get the latest version!"