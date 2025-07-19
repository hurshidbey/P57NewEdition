#!/bin/bash

# Protokol57 Quick Stats Check
# Fast snapshot of current system status

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'
BOLD='\033[1m'

# Configuration
SERVER_IP="69.62.126.73"
SSH_KEY="$HOME/.ssh/protokol57_ed25519"
API_URL="https://p57.birfoiz.uz/api"

echo -e "${BOLD}🚀 PROTOKOL57 QUICK STATS - $(date '+%Y-%m-%d %H:%M:%S')${NC}"
echo "================================================"

# Container status
echo -e "\n${BLUE}Container Status:${NC}"
CONTAINER_INFO=$(ssh -i "$SSH_KEY" root@$SERVER_IP "docker ps --filter name=protokol57 --format 'Status: {{.Status}}\nCreated: {{.CreatedAt}}' | head -2")
echo "$CONTAINER_INFO"

# Resource usage
echo -e "\n${BLUE}Resource Usage:${NC}"
STATS=$(ssh -i "$SSH_KEY" root@$SERVER_IP "docker stats protokol57-protokol57-1 --no-stream --format 'CPU: {{.CPUPerc}}\nMemory: {{.MemUsage}} ({{.MemPerc}})\nNetwork: {{.NetIO}}'")
echo "$STATS"

# Disk usage
DISK=$(ssh -i "$SSH_KEY" root@$SERVER_IP "df -h / | awk 'NR==2 {print \"Disk: \" \$3 \" / \" \$2 \" (\" \$5 \")\"}'")
echo "$DISK"

# Quick health check
echo -e "\n${BLUE}Service Health:${NC}"
HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://p57.birfoiz.uz/health")
if [ "$HEALTH_STATUS" = "200" ]; then
    echo -e "${GREEN}✓ API Health: OK${NC}"
else
    echo -e "${RED}✗ API Health: Error (HTTP $HEALTH_STATUS)${NC}"
fi

# Database check
DB_STATUS=$(curl -s "$API_URL/protocols?limit=1" | grep -c "id" || echo "0")
if [ "$DB_STATUS" -gt 0 ]; then
    echo -e "${GREEN}✓ Database: Connected${NC}"
else
    echo -e "${RED}✗ Database: Connection Issue${NC}"
fi

# Recent activity (last hour)
echo -e "\n${BLUE}Activity (Last Hour):${NC}"
LOGS_HOUR=$(ssh -i "$SSH_KEY" root@$SERVER_IP "docker logs protokol57-protokol57-1 --since 60m 2>&1")

UNIQUE_USERS=$(echo "$LOGS_HOUR" | grep -oE '\[([0-9]{1,3}\.){3}[0-9]{1,3}\]' | sort -u | wc -l | tr -d ' ')
TOTAL_REQUESTS=$(echo "$LOGS_HOUR" | grep -c "GET\|POST" || echo "0")
NEW_REGISTRATIONS=$(echo "$LOGS_HOUR" | grep -c "POST /api/auth/register" || echo "0")
PAYMENTS=$(echo "$LOGS_HOUR" | grep -c "payment" || echo "0")
ERRORS=$(echo "$LOGS_HOUR" | grep -ciE "(error|failed|exception|500|502|503|504)" || echo "0")
ERRORS=$(echo "$ERRORS" | tr -d ' ')

echo "Unique Visitors: $UNIQUE_USERS"
echo "Total Requests: $TOTAL_REQUESTS"
echo "New Users: $NEW_REGISTRATIONS"
echo "Payment Attempts: $PAYMENTS"

if [ "$ERRORS" -eq 0 ]; then
    echo -e "${GREEN}Errors: 0${NC}"
else
    echo -e "${RED}Errors: $ERRORS${NC}"
fi

# Current active users (last 5 min)
echo -e "\n${BLUE}Active Now (Last 5 min):${NC}"
ACTIVE_IPS=$(ssh -i "$SSH_KEY" root@$SERVER_IP "docker logs protokol57-protokol57-1 --since 5m 2>&1 | grep -oE '\[([0-9]{1,3}\.){3}[0-9]{1,3}\]' | sort -u | wc -l")
RECENT_PAGES=$(ssh -i "$SSH_KEY" root@$SERVER_IP "docker logs protokol57-protokol57-1 --since 5m 2>&1 | grep 'GET /' | wc -l")

echo "Active IPs: $ACTIVE_IPS"
echo "Page Views: $RECENT_PAGES"

# Top endpoints
echo -e "\n${BLUE}Top Endpoints (Last 5 min):${NC}"
ssh -i "$SSH_KEY" root@$SERVER_IP "docker logs protokol57-protokol57-1 --since 5m 2>&1" | \
    grep -E "GET|POST" | \
    awk '{print $6 " " $7}' | \
    grep -v "/assets/" | \
    sort | uniq -c | sort -rn | head -5

echo -e "\n${YELLOW}For continuous monitoring, run: ./monitor-dashboard.sh${NC}"