#!/bin/bash
set -e

echo "🛡️ Getting SSL certificates for new domains..."

SERVER="root@69.62.126.73"
SSH_KEY="~/.ssh/protokol57_ed25519"

ssh -i $SSH_KEY $SERVER << 'ENDSSH'
# Stop Docker containers to free up port 80
echo "Stopping Docker containers temporarily..."
cd /opt/protokol57
docker compose down

# Get certificates
echo "Getting SSL certificate for app.p57.uz..."
certbot certonly --standalone -d app.p57.uz --non-interactive --agree-tos --email hurshidbey@gmail.com

echo "Getting SSL certificate for api.p57.uz..."
certbot certonly --standalone -d api.p57.uz --non-interactive --agree-tos --email hurshidbey@gmail.com

# Restart Docker containers
echo "Restarting Docker containers..."
docker compose up -d

echo "✅ SSL certificates obtained successfully!"
ENDSSH