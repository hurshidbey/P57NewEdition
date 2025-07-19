#!/bin/bash

# Deployment script for coupon system
# This script handles the deployment of the coupon system to production

echo "🚀 Coupon System Deployment Checklist"
echo "===================================="

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m'

# Server details
SERVER_USER="root"
SERVER_IP="69.62.126.73"
SSH_KEY="~/.ssh/protokol57_ed25519"
PROJECT_PATH="/opt/protokol57"

echo -e "\n${YELLOW}📋 Pre-deployment Checklist:${NC}"
echo "[ ] 1. Have you tested the coupon system locally?"
echo "[ ] 2. Are all database migrations ready?"
echo "[ ] 3. Have you committed all changes to git?"
echo "[ ] 4. Is the .env.production file updated with correct values?"
echo ""
read -p "Continue with deployment? (y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}Deployment cancelled.${NC}"
    exit 1
fi

echo -e "\n${YELLOW}🔄 Step 1: Running database migrations${NC}"
echo "Connecting to production database to apply migrations..."

# Copy migration file to server
echo "Copying migration file to server..."
scp -i $SSH_KEY migrations/add_coupon_system.sql $SERVER_USER@$SERVER_IP:/tmp/

# Execute migration on server
echo "Executing migration..."
ssh -i $SSH_KEY $SERVER_USER@$SERVER_IP << 'EOF'
cd /opt/protokol57
docker exec protokol57-protokol57-1 psql $DATABASE_URL -f /tmp/add_coupon_system.sql
EOF

echo -e "${GREEN}✅ Database migrations completed${NC}"

echo -e "\n${YELLOW}🔄 Step 2: Deploying code changes${NC}"
echo "Pulling latest code and rebuilding..."

ssh -i $SSH_KEY $SERVER_USER@$SERVER_IP << 'EOF'
cd /opt/protokol57
echo "Pulling latest changes..."
git pull

echo "Rebuilding Docker containers..."
docker compose down
docker compose build --no-cache
docker compose up -d

echo "Waiting for services to start..."
sleep 10

# Check if container is running
if docker ps | grep protokol57-protokol57-1 > /dev/null; then
    echo "✅ Container is running"
else
    echo "❌ Container failed to start!"
    exit 1
fi
EOF

echo -e "${GREEN}✅ Code deployment completed${NC}"

echo -e "\n${YELLOW}🔄 Step 3: Verifying deployment${NC}"

# Test coupon validation endpoint
echo "Testing coupon validation endpoint..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST https://p57.birfoiz.uz/api/coupons/validate \
    -H "Content-Type: application/json" \
    -d '{"code": "LAUNCH60", "amount": 1425000}')

if [ "$RESPONSE" -eq "200" ]; then
    echo -e "${GREEN}✅ Coupon validation endpoint is working${NC}"
else
    echo -e "${RED}❌ Coupon validation endpoint returned status: $RESPONSE${NC}"
fi

# Test admin endpoint (will return 401 without auth, which is expected)
echo "Testing admin coupon endpoint..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://p57.birfoiz.uz/api/admin/coupons)

if [ "$RESPONSE" -eq "401" ]; then
    echo -e "${GREEN}✅ Admin endpoint is protected (401 expected)${NC}"
else
    echo -e "${YELLOW}⚠️  Admin endpoint returned unexpected status: $RESPONSE${NC}"
fi

echo -e "\n${YELLOW}📋 Post-deployment Checklist:${NC}"
echo "[ ] 1. Login to admin panel: https://p57.birfoiz.uz/admin"
echo "[ ] 2. Go to 'Kuponlar' tab"
echo "[ ] 3. Verify example coupons are loaded:"
echo "      - LAUNCH60 (60% off)"
echo "      - STUDENT50 (50% off)"
echo "      - EARLY500K (500,000 UZS off)"
echo "      - TEAM20 (20% off)"
echo "[ ] 4. Test creating a new coupon"
echo "[ ] 5. Go to payment page: https://p57.birfoiz.uz/atmos-payment"
echo "[ ] 6. Test applying a coupon code"
echo "[ ] 7. Monitor error logs for any issues"

echo -e "\n${YELLOW}🔍 Monitoring Commands:${NC}"
echo "View container logs:"
echo "  ssh -i $SSH_KEY $SERVER_USER@$SERVER_IP 'docker logs -f protokol57-protokol57-1'"
echo ""
echo "Check database for coupons:"
echo "  ssh -i $SSH_KEY $SERVER_USER@$SERVER_IP 'docker exec protokol57-protokol57-1 psql \$DATABASE_URL -c \"SELECT code, discount_type, discount_value, used_count FROM coupons;\"'"

echo -e "\n${GREEN}✅ Deployment script completed!${NC}"
echo "Please complete the post-deployment checklist manually."