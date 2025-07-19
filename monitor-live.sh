#!/bin/bash

# Protokol57 Live Monitoring Script
# Updates every 30 seconds with key metrics

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
SERVER_IP="69.62.126.73"
SSH_KEY="$HOME/.ssh/protokol57_ed25519"
API_URL="https://p57.birfoiz.uz/api"

# Create log file
LOG_FILE="monitoring-$(date +%Y%m%d).log"

clear

echo "🚀 PROTOKOL57 LIVE MONITORING"
echo "============================="
echo "Started at: $(date)"
echo ""

while true; do
    # Clear screen for fresh data
    clear
    
    echo "🏃 PROTOKOL57 LIVE MONITORING - $(date '+%Y-%m-%d %H:%M:%S')"
    echo "============================================="
    
    # 1. Server Resources
    echo -e "\n${BLUE}📊 SERVER RESOURCES${NC}"
    ssh -i "$SSH_KEY" root@$SERVER_IP "docker stats protokol57-protokol57-1 --no-stream --format 'CPU: {{.CPUPerc}} | Memory: {{.MemUsage}} ({{.MemPerc}})'" 2>/dev/null || echo "Failed to get stats"
    
    # Disk usage
    DISK_USAGE=$(ssh -i "$SSH_KEY" root@$SERVER_IP "df -h / | awk 'NR==2 {print $5}'")
    echo "Disk Usage: $DISK_USAGE"
    
    # 2. Container Health
    echo -e "\n${BLUE}🐳 CONTAINER STATUS${NC}"
    CONTAINER_STATUS=$(ssh -i "$SSH_KEY" root@$SERVER_IP "docker ps --filter name=protokol57 --format '{{.Status}}'")
    if [[ $CONTAINER_STATUS == *"healthy"* ]]; then
        echo -e "${GREEN}✓ Container: $CONTAINER_STATUS${NC}"
    else
        echo -e "${RED}✗ Container: $CONTAINER_STATUS${NC}"
    fi
    
    # 3. API Response Times
    echo -e "\n${BLUE}⚡ API PERFORMANCE${NC}"
    
    # Test main endpoints
    PROTOCOLS_TIME=$(curl -s -o /dev/null -w "%{time_total}" "$API_URL/protocols?limit=10" || echo "FAILED")
    echo "Protocols API: ${PROTOCOLS_TIME}s"
    
    HEALTH_TIME=$(curl -s -o /dev/null -w "%{time_total}" "https://p57.birfoiz.uz/health" || echo "FAILED")
    echo "Health Check: ${HEALTH_TIME}s"
    
    # 4. Active Users (from logs)
    echo -e "\n${BLUE}👥 RECENT ACTIVITY (Last 5 min)${NC}"
    RECENT_LOGS=$(ssh -i "$SSH_KEY" root@$SERVER_IP "docker logs protokol57-protokol57-1 --since 5m 2>&1" || echo "")
    
    # Count unique IPs
    UNIQUE_IPS=$(echo "$RECENT_LOGS" | grep -oE '\[([0-9]{1,3}\.){3}[0-9]{1,3}\]' | sort -u | wc -l)
    echo "Unique IPs: $UNIQUE_IPS"
    
    # Count API requests
    API_REQUESTS=$(echo "$RECENT_LOGS" | grep -c "GET /api/" || echo "0")
    echo "API Requests: $API_REQUESTS"
    
    # Count registrations
    NEW_USERS=$(echo "$RECENT_LOGS" | grep -c "POST /api/auth/register" || echo "0")
    if [ "$NEW_USERS" -gt 0 ]; then
        echo -e "${GREEN}✓ New Registrations: $NEW_USERS${NC}"
    else
        echo "New Registrations: $NEW_USERS"
    fi
    
    # Count payment attempts
    PAYMENT_ATTEMPTS=$(echo "$RECENT_LOGS" | grep -c "payment" || echo "0")
    if [ "$PAYMENT_ATTEMPTS" -gt 0 ]; then
        echo -e "${GREEN}✓ Payment Attempts: $PAYMENT_ATTEMPTS${NC}"
    else
        echo "Payment Attempts: $PAYMENT_ATTEMPTS"
    fi
    
    # 5. Error Detection
    echo -e "\n${BLUE}🚨 ERRORS (Last 5 min)${NC}"
    ERROR_COUNT=$(echo "$RECENT_LOGS" | grep -ciE "(error|failed|exception|500|502|503|504)" || echo "0")
    RATE_LIMIT_COUNT=$(echo "$RECENT_LOGS" | grep -c "429" || echo "0")
    
    if [ "$ERROR_COUNT" -gt 0 ]; then
        echo -e "${RED}✗ Errors Found: $ERROR_COUNT${NC}"
        echo "$RECENT_LOGS" | grep -iE "(error|failed|exception)" | tail -3
    else
        echo -e "${GREEN}✓ No errors detected${NC}"
    fi
    
    if [ "$RATE_LIMIT_COUNT" -gt 0 ]; then
        echo -e "${YELLOW}⚠ Rate Limits Hit: $RATE_LIMIT_COUNT${NC}"
    fi
    
    # 6. Database Status
    echo -e "\n${BLUE}🗄️ DATABASE STATUS${NC}"
    DB_CHECK=$(curl -s "$API_URL/protocols?limit=1" | grep -c "id" || echo "0")
    if [ "$DB_CHECK" -gt 0 ]; then
        echo -e "${GREEN}✓ Database: Connected${NC}"
    else
        echo -e "${RED}✗ Database: Connection Issue${NC}"
    fi
    
    # 7. Top Accessed Pages
    echo -e "\n${BLUE}📱 TOP PAGES (Last 5 min)${NC}"
    echo "$RECENT_LOGS" | grep "GET /" | grep -v "/api/" | grep -v "/assets/" | awk '{print $7}' | sort | uniq -c | sort -rn | head -5
    
    # Log to file
    {
        echo "=== $(date) ==="
        echo "Unique IPs: $UNIQUE_IPS"
        echo "API Requests: $API_REQUESTS"
        echo "New Users: $NEW_USERS"
        echo "Errors: $ERROR_COUNT"
        echo ""
    } >> "$LOG_FILE"
    
    echo -e "\n${YELLOW}Refreshing in 30 seconds... (Ctrl+C to stop)${NC}"
    echo "Log file: $LOG_FILE"
    
    sleep 30
done