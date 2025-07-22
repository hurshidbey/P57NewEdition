#!/bin/bash
# EMERGENCY DEPLOYMENT SCRIPT - RUN WHEN SERVER IS BACK ONLINE
# Created by Senior Sysadmin for Click.uz Integration Deployment

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🚨 EMERGENCY DEPLOYMENT SCRIPT${NC}"
echo "================================"
echo "This script will deploy Click.uz integration once server is accessible"
echo ""

# Server details
SERVER_IP="69.62.126.73"
SERVER_HOST="srv852801.hstgr.cloud"
SSH_KEY="~/.ssh/protokol57_ed25519"

# Function to check server availability
check_server() {
    echo -n "Checking server availability... "
    if ssh -o ConnectTimeout=5 -o BatchMode=yes -i $SSH_KEY root@$SERVER_IP "echo 'OK'" &>/dev/null; then
        echo -e "${GREEN}✓ Server is UP!${NC}"
        return 0
    else
        echo -e "${RED}✗ Server is still DOWN${NC}"
        return 1
    fi
}

# Wait for server to come online
echo "Waiting for server to come online..."
while ! check_server; do
    echo "Retrying in 30 seconds... (Press Ctrl+C to cancel)"
    sleep 30
done

echo -e "\n${GREEN}SERVER IS BACK ONLINE! Starting deployment...${NC}\n"

# 1. Copy environment file
echo "📦 Copying .env.production to server..."
scp -i $SSH_KEY .env.production root@$SERVER_IP:/opt/protokol57/.env.production

# 2. SSH to server and deploy
echo "🚀 Deploying on server..."
ssh -i $SSH_KEY root@$SERVER_IP << 'ENDSSH'
cd /opt/protokol57

# Pull latest changes
echo "📥 Pulling latest code..."
git pull origin main

# Clear all Docker caches
echo "🧹 Clearing Docker caches..."
docker system prune -af
docker volume prune -f

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker compose down

# Build with no cache
echo "🔨 Building fresh containers..."
docker compose build --no-cache

# Start services
echo "✨ Starting services..."
docker compose up -d

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 10

# Check container status
echo "📊 Container status:"
docker ps

# Test health endpoint
echo "🏥 Testing health endpoint..."
curl -f http://localhost:5001/health || echo "Health check failed"

# Show logs
echo "📋 Recent logs:"
docker logs protokol57-protokol57-1 --tail 50

echo "✅ Deployment complete!"
ENDSSH

# 3. Test Click.uz integration
echo -e "\n${YELLOW}Testing Click.uz Integration...${NC}"
sleep 5

# Test endpoints
echo "🧪 Testing Click.uz endpoints..."
curl -s https://app.p57.uz/api/click/test | jq . || echo "Click test endpoint failed"

echo -e "\n${GREEN}✅ DEPLOYMENT COMPLETE!${NC}"
echo "================================"
echo "Next steps:"
echo "1. Test payment flow at https://app.p57.uz/payment"
echo "2. Verify Click.uz webhooks in merchant cabinet"
echo "3. Monitor logs: ssh -i $SSH_KEY root@$SERVER_IP 'docker logs -f protokol57-protokol57-1'"