#!/bin/bash

# Protokol57 Enhanced Monitoring Dashboard
# Real-time monitoring with improved metrics and visualization

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
WHITE='\033[1;37m'
NC='\033[0m'
BOLD='\033[1m'

# Configuration
SERVER_IP="69.62.126.73"
SSH_KEY="$HOME/.ssh/protokol57_ed25519"
API_URL="https://p57.birfoiz.uz/api"
MAIN_URL="https://p57.birfoiz.uz"
LANDING_URL="https://p57.uz"

# Create log directory
LOG_DIR="monitoring_logs"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/monitor-$(date +%Y%m%d-%H%M%S).log"

# Terminal setup
tput civis  # Hide cursor
trap 'tput cnorm; exit' EXIT INT TERM  # Show cursor on exit

# Helper functions
draw_box() {
    local title="$1"
    local width=${2:-50}
    echo -e "${BOLD}┌─ ${title} $(printf '─%.0s' $(seq 1 $((width - ${#title} - 5))))┐${NC}"
}

draw_box_bottom() {
    local width=${1:-50}
    echo -e "${BOLD}└$(printf '─%.0s' $(seq 1 $((width - 2))))┘${NC}"
}

format_bytes() {
    local bytes=$1
    if [ $bytes -lt 1024 ]; then
        echo "${bytes}B"
    elif [ $bytes -lt 1048576 ]; then
        echo "$((bytes / 1024))KB"
    elif [ $bytes -lt 1073741824 ]; then
        echo "$((bytes / 1048576))MB"
    else
        echo "$((bytes / 1073741824))GB"
    fi
}

# Progress bar function
progress_bar() {
    local current=$1
    local total=$2
    local width=20
    local percentage=$((current * 100 / total))
    local filled=$((current * width / total))
    local empty=$((width - filled))
    
    printf "["
    printf "%${filled}s" | tr ' ' '█'
    printf "%${empty}s" | tr ' ' '░'
    printf "] %3d%%" "$percentage"
}

# Main monitoring loop
while true; do
    clear
    
    # Header
    echo -e "${CYAN}${BOLD}"
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║           🚀 PROTOKOL57 MONITORING DASHBOARD 🚀               ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo -e "${WHITE}📅 $(date '+%Y-%m-%d %H:%M:%S')${NC}"
    echo ""
    
    # Collect all data first
    CONTAINER_STATS=$(ssh -i "$SSH_KEY" root@$SERVER_IP "docker stats protokol57-protokol57-1 --no-stream --format '{{.CPUPerc}}|{{.MemUsage}}|{{.MemPerc}}|{{.NetIO}}'" 2>/dev/null || echo "0%|0/0|0%|0/0")
    CONTAINER_STATUS=$(ssh -i "$SSH_KEY" root@$SERVER_IP "docker ps --filter name=protokol57 --format '{{.Status}}'" 2>/dev/null || echo "Unknown")
    DISK_USAGE=$(ssh -i "$SSH_KEY" root@$SERVER_IP "df -h / | awk 'NR==2 {print \$5}' | tr -d '%'" 2>/dev/null || echo "0")
    RECENT_LOGS=$(ssh -i "$SSH_KEY" root@$SERVER_IP "docker logs protokol57-protokol57-1 --since 5m 2>&1" 2>/dev/null || echo "")
    
    # Parse container stats
    IFS='|' read -r CPU_USAGE MEM_USAGE MEM_PERCENT NET_IO <<< "$CONTAINER_STATS"
    CPU_NUM=$(echo "$CPU_USAGE" | tr -d '%' | cut -d'.' -f1)
    MEM_NUM=$(echo "$MEM_PERCENT" | tr -d '%' | cut -d'.' -f1)
    
    # 1. System Resources
    draw_box "SYSTEM RESOURCES" 65
    
    # CPU Usage with color coding
    echo -n "  CPU Usage:  "
    if [ "$CPU_NUM" -gt 80 ]; then
        echo -e "${RED}"
    elif [ "$CPU_NUM" -gt 50 ]; then
        echo -e "${YELLOW}"
    else
        echo -e "${GREEN}"
    fi
    progress_bar "$CPU_NUM" 100
    echo -e " $CPU_USAGE${NC}"
    
    # Memory Usage with color coding
    echo -n "  Memory:     "
    if [ "$MEM_NUM" -gt 90 ]; then
        echo -e "${RED}"
    elif [ "$MEM_NUM" -gt 70 ]; then
        echo -e "${YELLOW}"
    else
        echo -e "${GREEN}"
    fi
    progress_bar "$MEM_NUM" 100
    echo -e " $MEM_USAGE${NC}"
    
    # Disk Usage
    echo -n "  Disk Usage: "
    if [ "$DISK_USAGE" -gt 85 ]; then
        echo -e "${RED}"
    elif [ "$DISK_USAGE" -gt 70 ]; then
        echo -e "${YELLOW}"
    else
        echo -e "${GREEN}"
    fi
    progress_bar "$DISK_USAGE" 100
    echo -e " ${DISK_USAGE}%${NC}"
    
    echo "  Network I/O: $NET_IO"
    draw_box_bottom 65
    echo ""
    
    # 2. Container Health
    draw_box "CONTAINER STATUS" 65
    if [[ $CONTAINER_STATUS == *"healthy"* ]]; then
        echo -e "  ${GREEN}✓ Status: $CONTAINER_STATUS${NC}"
    elif [[ $CONTAINER_STATUS == *"starting"* ]]; then
        echo -e "  ${YELLOW}⟳ Status: $CONTAINER_STATUS${NC}"
    else
        echo -e "  ${RED}✗ Status: $CONTAINER_STATUS${NC}"
    fi
    
    # Uptime calculation
    UPTIME=$(echo "$CONTAINER_STATUS" | grep -oE "Up [^(]+" || echo "Unknown")
    echo "  ⏱  Uptime: $UPTIME"
    draw_box_bottom 65
    echo ""
    
    # 3. API Performance
    draw_box "API PERFORMANCE" 65
    
    # Test endpoints with timeout
    echo -n "  Protocols API:  "
    PROTOCOLS_TIME=$(timeout 5 curl -s -o /dev/null -w "%{time_total}" "$API_URL/protocols?limit=10" 2>/dev/null || echo "TIMEOUT")
    if [[ "$PROTOCOLS_TIME" == "TIMEOUT" ]]; then
        echo -e "${RED}✗ Timeout (>5s)${NC}"
    elif (( $(echo "$PROTOCOLS_TIME < 1" | bc -l) )); then
        echo -e "${GREEN}✓ ${PROTOCOLS_TIME}s${NC}"
    elif (( $(echo "$PROTOCOLS_TIME < 3" | bc -l) )); then
        echo -e "${YELLOW}⚠ ${PROTOCOLS_TIME}s${NC}"
    else
        echo -e "${RED}✗ ${PROTOCOLS_TIME}s${NC}"
    fi
    
    echo -n "  Health Check:   "
    HEALTH_TIME=$(timeout 5 curl -s -o /dev/null -w "%{time_total}" "$MAIN_URL/health" 2>/dev/null || echo "TIMEOUT")
    if [[ "$HEALTH_TIME" == "TIMEOUT" ]]; then
        echo -e "${RED}✗ Timeout (>5s)${NC}"
    elif (( $(echo "$HEALTH_TIME < 0.5" | bc -l) )); then
        echo -e "${GREEN}✓ ${HEALTH_TIME}s${NC}"
    else
        echo -e "${YELLOW}⚠ ${HEALTH_TIME}s${NC}"
    fi
    
    echo -n "  Landing Page:   "
    LANDING_TIME=$(timeout 5 curl -s -o /dev/null -w "%{time_total}" "$LANDING_URL" 2>/dev/null || echo "TIMEOUT")
    if [[ "$LANDING_TIME" == "TIMEOUT" ]]; then
        echo -e "${RED}✗ Timeout (>5s)${NC}"
    elif (( $(echo "$LANDING_TIME < 1" | bc -l) )); then
        echo -e "${GREEN}✓ ${LANDING_TIME}s${NC}"
    else
        echo -e "${YELLOW}⚠ ${LANDING_TIME}s${NC}"
    fi
    
    draw_box_bottom 65
    echo ""
    
    # 4. Traffic Analysis
    draw_box "TRAFFIC ANALYSIS (Last 5 min)" 65
    
    # Count metrics
    UNIQUE_IPS=$(echo "$RECENT_LOGS" | grep -oE '\[([0-9]{1,3}\.){3}[0-9]{1,3}\]' | sort -u | wc -l)
    API_REQUESTS=$(echo "$RECENT_LOGS" | grep -c "GET /api/" || echo "0")
    PROTOCOL_VIEWS=$(echo "$RECENT_LOGS" | grep -c "GET /api/protocols/" || echo "0")
    NEW_USERS=$(echo "$RECENT_LOGS" | grep -c "POST /api/auth/register" || echo "0")
    LOGIN_ATTEMPTS=$(echo "$RECENT_LOGS" | grep -c "POST /api/auth/login" || echo "0")
    PAYMENT_ATTEMPTS=$(echo "$RECENT_LOGS" | grep -c "payment" || echo "0")
    PREMIUM_VIEWS=$(echo "$RECENT_LOGS" | grep -c "/premium" || echo "0")
    KB_VIEWS=$(echo "$RECENT_LOGS" | grep -c "/knowledge-base" || echo "0")
    
    echo "  👥 Unique Visitors:    $UNIQUE_IPS"
    echo "  📊 API Requests:       $API_REQUESTS"
    echo "  📖 Protocol Views:     $PROTOCOL_VIEWS"
    echo "  📚 Knowledge Base:     $KB_VIEWS"
    echo "  💎 Premium Page Views: $PREMIUM_VIEWS"
    
    if [ "$NEW_USERS" -gt 0 ]; then
        echo -e "  ${GREEN}✨ New Registrations:  $NEW_USERS${NC}"
    else
        echo "  📝 New Registrations:  $NEW_USERS"
    fi
    
    echo "  🔐 Login Attempts:     $LOGIN_ATTEMPTS"
    
    if [ "$PAYMENT_ATTEMPTS" -gt 0 ]; then
        echo -e "  ${GREEN}💳 Payment Attempts:   $PAYMENT_ATTEMPTS${NC}"
    else
        echo "  💳 Payment Attempts:   $PAYMENT_ATTEMPTS"
    fi
    
    draw_box_bottom 65
    echo ""
    
    # 5. Error Detection
    draw_box "ERROR MONITORING" 65
    
    ERROR_COUNT=$(echo "$RECENT_LOGS" | grep -ciE "(error|failed|exception|500|502|503|504)" || echo "0")
    RATE_LIMIT_COUNT=$(echo "$RECENT_LOGS" | grep -c "429" || echo "0")
    TIMEOUT_COUNT=$(echo "$RECENT_LOGS" | grep -ciE "(timeout|timed out)" || echo "0")
    DB_ERROR_COUNT=$(echo "$RECENT_LOGS" | grep -ciE "(database|supabase|connection)" | grep -i error || echo "0")
    
    if [ "$ERROR_COUNT" -eq 0 ]; then
        echo -e "  ${GREEN}✓ No errors detected${NC}"
    else
        echo -e "  ${RED}⚠️  Total Errors: $ERROR_COUNT${NC}"
        [ "$DB_ERROR_COUNT" -gt 0 ] && echo -e "    ${RED}• Database Errors: $DB_ERROR_COUNT${NC}"
        [ "$TIMEOUT_COUNT" -gt 0 ] && echo -e "    ${YELLOW}• Timeouts: $TIMEOUT_COUNT${NC}"
        [ "$RATE_LIMIT_COUNT" -gt 0 ] && echo -e "    ${YELLOW}• Rate Limits: $RATE_LIMIT_COUNT${NC}"
        
        # Show last 3 error messages
        if [ "$ERROR_COUNT" -gt 0 ]; then
            echo -e "  ${CYAN}Recent errors:${NC}"
            echo "$RECENT_LOGS" | grep -iE "(error|failed|exception)" | tail -3 | while read -r line; do
                echo "    • ${line:0:60}..."
            done
        fi
    fi
    
    draw_box_bottom 65
    echo ""
    
    # 6. Top Pages
    draw_box "TOP PAGES (Last 5 min)" 65
    echo "$RECENT_LOGS" | grep "GET /" | grep -v "/api/" | grep -v "/assets/" | grep -v ".js" | grep -v ".css" | awk '{print $7}' | sort | uniq -c | sort -rn | head -5 | while read -r count page; do
        printf "  %-30s %s\n" "$page" "$count requests"
    done
    draw_box_bottom 65
    echo ""
    
    # 7. Real-time Activity Feed
    draw_box "LIVE ACTIVITY (Last 10 events)" 65
    echo "$RECENT_LOGS" | grep -E "(register|login|payment|premium)" | tail -10 | while read -r line; do
        if [[ $line == *"register"* ]]; then
            echo -e "  ${GREEN}✨ New user registration${NC}"
        elif [[ $line == *"login"* ]]; then
            echo -e "  ${BLUE}🔐 User login${NC}"
        elif [[ $line == *"payment"* ]]; then
            echo -e "  ${YELLOW}💳 Payment activity${NC}"
        elif [[ $line == *"premium"* ]]; then
            echo -e "  ${MAGENTA}💎 Premium access${NC}"
        fi
    done
    draw_box_bottom 65
    
    # Log summary data
    {
        echo "$(date '+%Y-%m-%d %H:%M:%S')|$CPU_USAGE|$MEM_USAGE|$DISK_USAGE%|$UNIQUE_IPS|$API_REQUESTS|$NEW_USERS|$ERROR_COUNT|$PAYMENT_ATTEMPTS"
    } >> "$LOG_FILE"
    
    # Footer
    echo ""
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${WHITE}↻ Refreshing in 30s${NC} | ${CYAN}Ctrl+C to exit${NC} | ${WHITE}Log: $LOG_FILE${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    sleep 30
done