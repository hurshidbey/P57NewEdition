#!/bin/bash

# Protokol57 Monitoring Script
# Monitors application health and sends alerts

set -e

# Configuration
VPS_HOST="69.62.126.73"
VPS_USER="root"
VPS_KEY="~/.ssh/protokol57_ed25519"
APP_URL="https://p57.birfoiz.uz"
HEALTH_ENDPOINT="$APP_URL/api/health"
LOG_FILE="/tmp/protokol57_monitor.log"
ALERT_FILE="/tmp/protokol57_alerts.log"

# Monitoring thresholds
MAX_RESPONSE_TIME=10  # seconds
MIN_UPTIME=60         # seconds
MAX_MEMORY_MB=400     # MB

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging
log() {
    local message="[$(date +'%Y-%m-%d %H:%M:%S')] $1"
    echo -e "${BLUE}$message${NC}"
    echo "$message" >> "$LOG_FILE"
}

alert() {
    local message="[ALERT] [$(date +'%Y-%m-%d %H:%M:%S')] $1"
    echo -e "${RED}$message${NC}"
    echo "$message" >> "$ALERT_FILE"
}

success() {
    local message="[OK] [$(date +'%Y-%m-%d %H:%M:%S')] $1"
    echo -e "${GREEN}$message${NC}"
    echo "$message" >> "$LOG_FILE"
}

warning() {
    local message="[WARNING] [$(date +'%Y-%m-%d %H:%M:%S')] $1"
    echo -e "${YELLOW}$message${NC}"
    echo "$message" >> "$LOG_FILE"
}

# Function to check application health
check_health() {
    log "Checking application health..."
    
    # Check if site is reachable
    local start_time=$(date +%s)
    local http_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time $MAX_RESPONSE_TIME "$HEALTH_ENDPOINT" || echo "000")
    local end_time=$(date +%s)
    local response_time=$((end_time - start_time))
    
    if [ "$http_code" = "200" ]; then
        success "HTTP health check passed (${response_time}s, HTTP $http_code)"
        
        # Get detailed health info
        local health_json=$(curl -s --max-time $MAX_RESPONSE_TIME "$HEALTH_ENDPOINT" 2>/dev/null || echo '{}')
        
        # Parse health data
        local status=$(echo "$health_json" | jq -r '.status // "unknown"')
        local uptime=$(echo "$health_json" | jq -r '.uptime // 0')
        local memory_used=$(echo "$health_json" | jq -r '.memory.used // 0')
        local db_connected=$(echo "$health_json" | jq -r '.database.connected // false')
        
        log "Status: $status, Uptime: ${uptime}s, Memory: ${memory_used}MB, DB: $db_connected"
        
        # Check thresholds
        if [ "$response_time" -gt "$MAX_RESPONSE_TIME" ]; then
            warning "Response time (${response_time}s) exceeded threshold (${MAX_RESPONSE_TIME}s)"
        fi
        
        if [ "$(echo "$uptime < $MIN_UPTIME" | bc -l)" = "1" ]; then
            warning "Application uptime (${uptime}s) is below threshold (${MIN_UPTIME}s) - possible recent restart"
        fi
        
        if [ "$(echo "$memory_used > $MAX_MEMORY_MB" | bc -l)" = "1" ]; then
            warning "Memory usage (${memory_used}MB) exceeded threshold (${MAX_MEMORY_MB}MB)"
        fi
        
        if [ "$db_connected" = "false" ]; then
            alert "Database is not connected! Application running on memory storage."
        fi
        
        return 0
    else
        alert "HTTP health check failed (${response_time}s, HTTP $http_code)"
        return 1
    fi
}

# Function to check VPS resources
check_vps_resources() {
    log "Checking VPS resources..."
    
    # SSH command with timeout
    local ssh_cmd="ssh -i $VPS_KEY -o ConnectTimeout=10 -o StrictHostKeyChecking=no $VPS_USER@$VPS_HOST"
    
    # Check if VPS is reachable
    if ! $ssh_cmd "echo 'VPS connection test'" >/dev/null 2>&1; then
        alert "Cannot connect to VPS at $VPS_HOST"
        return 1
    fi
    
    # Get system info
    local cpu_usage=$($ssh_cmd "top -bn1 | grep 'Cpu(s)' | awk '{print \$2}' | cut -d'%' -f1" 2>/dev/null || echo "0")
    local memory_info=$($ssh_cmd "free -m | grep '^Mem:'" 2>/dev/null || echo "Mem: 0 0 0")
    local disk_usage=$($ssh_cmd "df -h / | tail -1 | awk '{print \$5}' | cut -d'%' -f1" 2>/dev/null || echo "0")
    
    # Parse memory info
    local total_mem=$(echo "$memory_info" | awk '{print $2}')
    local used_mem=$(echo "$memory_info" | awk '{print $3}')
    local free_mem=$(echo "$memory_info" | awk '{print $4}')
    
    log "VPS Resources - CPU: ${cpu_usage}%, Memory: ${used_mem}MB/${total_mem}MB, Disk: ${disk_usage}%"
    
    # Check thresholds
    if [ "$(echo "$cpu_usage > 80" | bc -l)" = "1" ]; then
        warning "CPU usage (${cpu_usage}%) is high"
    fi
    
    if [ "$(echo "$used_mem * 100 / $total_mem > 85" | bc -l)" = "1" ]; then
        warning "Memory usage (${used_mem}MB/${total_mem}MB) is high"
    fi
    
    if [ "$disk_usage" -gt 85 ]; then
        warning "Disk usage (${disk_usage}%) is high"
    fi
    
    return 0
}

# Function to check Docker containers
check_docker_status() {
    log "Checking Docker container status..."
    
    local ssh_cmd="ssh -i $VPS_KEY -o ConnectTimeout=10 $VPS_USER@$VPS_HOST"
    
    # Check container status
    local container_status=$($ssh_cmd "cd /opt/protokol57 && docker-compose ps --format json 2>/dev/null" || echo "[]")
    
    if [ "$container_status" = "[]" ] || [ -z "$container_status" ]; then
        alert "No containers found or Docker is not running"
        return 1
    fi
    
    # Parse container info
    local container_name=$(echo "$container_status" | jq -r '.[0].Name // "unknown"')
    local container_state=$(echo "$container_status" | jq -r '.[0].State // "unknown"')
    local container_health=$(echo "$container_status" | jq -r '.[0].Health // "unknown"')
    
    log "Container: $container_name, State: $container_state, Health: $container_health"
    
    if [ "$container_state" != "running" ]; then
        alert "Container $container_name is not running (state: $container_state)"
        return 1
    fi
    
    if [ "$container_health" = "unhealthy" ]; then
        alert "Container $container_name is unhealthy"
        return 1
    fi
    
    return 0
}

# Function to run full monitoring check
run_full_check() {
    log "Starting full monitoring check..."
    
    local overall_status=0
    
    # Check application health
    if ! check_health; then
        overall_status=1
    fi
    
    # Check VPS resources
    if ! check_vps_resources; then
        overall_status=1
    fi
    
    # Check Docker status
    if ! check_docker_status; then
        overall_status=1
    fi
    
    if [ $overall_status -eq 0 ]; then
        success "All monitoring checks passed"
    else
        alert "Some monitoring checks failed - review logs for details"
    fi
    
    return $overall_status
}

# Function to show recent alerts
show_alerts() {
    if [ -f "$ALERT_FILE" ]; then
        echo -e "${YELLOW}Recent alerts (last 24 hours):${NC}"
        find "$ALERT_FILE" -mtime -1 -exec cat {} \; 2>/dev/null | tail -20
    else
        echo "No recent alerts found"
    fi
}

# Function to show logs
show_logs() {
    if [ -f "$LOG_FILE" ]; then
        echo -e "${BLUE}Recent monitoring logs:${NC}"
        tail -50 "$LOG_FILE"
    else
        echo "No monitoring logs found"
    fi
}

# Function to continuously monitor
continuous_monitor() {
    log "Starting continuous monitoring (check every 60 seconds)..."
    log "Press Ctrl+C to stop"
    
    while true; do
        run_full_check
        echo ""
        sleep 60
    done
}

# Parse command line arguments
case "${1:-check}" in
    "check")
        run_full_check
        ;;
    "health")
        check_health
        ;;
    "resources")
        check_vps_resources
        ;;
    "docker")
        check_docker_status
        ;;
    "monitor")
        continuous_monitor
        ;;
    "alerts")
        show_alerts
        ;;
    "logs")
        show_logs
        ;;
    *)
        echo "Usage: $0 {check|health|resources|docker|monitor|alerts|logs}"
        echo ""
        echo "Commands:"
        echo "  check     - Run full monitoring check (default)"
        echo "  health    - Check application health only"
        echo "  resources - Check VPS resources only"
        echo "  docker    - Check Docker container status only"
        echo "  monitor   - Continuous monitoring"
        echo "  alerts    - Show recent alerts"
        echo "  logs      - Show monitoring logs"
        exit 1
        ;;
esac