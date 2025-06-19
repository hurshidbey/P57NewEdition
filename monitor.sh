#!/bin/bash

# Comprehensive Monitoring Script for Protokol57
# Provides health monitoring, alerting, and performance tracking

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
VPS_HOST="69.62.126.73"
VPS_USER="root"
SSH_KEY="~/.ssh/protokol57_ed25519"
APP_DIR="/opt/protokol57"
HEALTH_CHECK_URL="https://p57.birfoiz.uz/api/health"
BACKUP_URL="https://srv852801.hstgr.cloud/api/health"
LOG_FILE="/tmp/protokol57_monitor.log"
ALERT_FILE="/tmp/protokol57_alerts.log"

# Thresholds
MEMORY_THRESHOLD=85
CPU_THRESHOLD=80
DISK_THRESHOLD=85
RESPONSE_TIME_THRESHOLD=5000  # 5 seconds in milliseconds

# Function to print colored output
print_status() {
    local message="[$(date +'%Y-%m-%d %H:%M:%S')] $1"
    echo -e "${BLUE}$message${NC}"
    echo "$message" >> "$LOG_FILE"
}

print_success() {
    local message="[$(date +'%Y-%m-%d %H:%M:%S')] ✅ $1"
    echo -e "${GREEN}$message${NC}"
    echo "$message" >> "$LOG_FILE"
}

print_warning() {
    local message="[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️  $1"
    echo -e "${YELLOW}$message${NC}"
    echo "$message" >> "$LOG_FILE"
    echo "$message" >> "$ALERT_FILE"
}

print_error() {
    local message="[$(date +'%Y-%m-%d %H:%M:%S')] ❌ $1"
    echo -e "${RED}$message${NC}"
    echo "$message" >> "$LOG_FILE"
    echo "$message" >> "$ALERT_FILE"
}

print_info() {
    local message="[$(date +'%Y-%m-%d %H:%M:%S')] ℹ️  $1"
    echo -e "${CYAN}$message${NC}"
    echo "$message" >> "$LOG_FILE"
}

# Function to execute remote commands
execute_remote() {
    ssh -i "$SSH_KEY" "$VPS_USER@$VPS_HOST" "$1" 2>/dev/null
}

# Function to check HTTP response time
check_response_time() {
    local url="$1"
    local max_time="$2"
    
    local response_time=$(curl -o /dev/null -s -w '%{time_total}' --max-time "$max_time" "$url" 2>/dev/null || echo "timeout")
    
    if [ "$response_time" = "timeout" ]; then
        echo "-1"
    else
        # Convert to milliseconds
        echo "$(echo "$response_time * 1000" | bc -l | cut -d. -f1)"
    fi
}

# Function to get health data
get_health_data() {
    local url="$1"
    curl -s --max-time 10 "$url" 2>/dev/null || echo "{\"status\":\"error\",\"error\":\"Connection failed\"}"
}

# Function to check application health
check_application_health() {
    print_status "Checking application health..."
    
    # Check primary URL
    local primary_response_time=$(check_response_time "$HEALTH_CHECK_URL" 10)
    local primary_health=$(get_health_data "$HEALTH_CHECK_URL")
    
    # Check backup URL
    local backup_response_time=$(check_response_time "$BACKUP_URL" 10)
    local backup_health=$(get_health_data "$BACKUP_URL")
    
    # Parse health status
    local primary_status=$(echo "$primary_health" | jq -r '.status // "error"' 2>/dev/null || echo "error")
    local backup_status=$(echo "$backup_health" | jq -r '.status // "error"' 2>/dev/null || echo "error")
    
    # Report results
    echo ""
    echo -e "${PURPLE}🌍 APPLICATION HEALTH REPORT${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Primary endpoint
    if [ "$primary_status" = "ok" ]; then
        print_success "Primary endpoint (p57.birfoiz.uz): HEALTHY (${primary_response_time}ms)"
    elif [ "$primary_response_time" -eq -1 ]; then
        print_error "Primary endpoint (p57.birfoiz.uz): TIMEOUT"
    else
        print_warning "Primary endpoint (p57.birfoiz.uz): $primary_status (${primary_response_time}ms)"
    fi
    
    # Backup endpoint
    if [ "$backup_status" = "ok" ]; then
        print_success "Backup endpoint (srv852801.hstgr.cloud): HEALTHY (${backup_response_time}ms)"
    elif [ "$backup_response_time" -eq -1 ]; then
        print_warning "Backup endpoint (srv852801.hstgr.cloud): TIMEOUT"
    else
        print_warning "Backup endpoint (srv852801.hstgr.cloud): $backup_status (${backup_response_time}ms)"
    fi
    
    # Check response time thresholds
    if [ "$primary_response_time" -gt "$RESPONSE_TIME_THRESHOLD" ] && [ "$primary_response_time" -ne -1 ]; then
        print_warning "Primary endpoint response time (${primary_response_time}ms) exceeds threshold (${RESPONSE_TIME_THRESHOLD}ms)"
    fi
    
    # Show detailed health metrics if available
    if [ "$primary_status" = "ok" ]; then
        local memory_usage=$(echo "$primary_health" | jq -r '.memory.percentage // 0' 2>/dev/null || echo "0")
        local uptime=$(echo "$primary_health" | jq -r '.uptime.formatted // "unknown"' 2>/dev/null || echo "unknown")
        local storage_type=$(echo "$primary_health" | jq -r '.services.storage // "unknown"' 2>/dev/null || echo "unknown")
        
        print_info "Memory usage: ${memory_usage}% | Uptime: $uptime | Storage: $storage_type"
    fi
    
    echo ""
}

# Function to check VPS resources
check_vps_resources() {
    print_status "Checking VPS resources..."
    
    if ! execute_remote "echo 'Connected'" >/dev/null 2>&1; then
        print_error "Cannot connect to VPS"
        return 1
    fi
    
    # Get system metrics
    local memory_info=$(execute_remote "free | grep Mem")
    local disk_info=$(execute_remote "df -h / | tail -1")
    local cpu_info=$(execute_remote "top -bn1 | grep 'Cpu(s)' | sed 's/.*, *\([0-9.]*\)%* id.*/\1/' | awk '{print 100 - \$1}'")
    local load_avg=$(execute_remote "uptime | awk -F'load average:' '{print \$2}' | awk '{print \$1}' | sed 's/,//'")
    
    # Parse memory usage
    local mem_total=$(echo "$memory_info" | awk '{print $2}')
    local mem_used=$(echo "$memory_info" | awk '{print $3}')
    local mem_percentage=$(echo "scale=1; $mem_used * 100 / $mem_total" | bc -l 2>/dev/null || echo "0")
    
    # Parse disk usage
    local disk_usage=$(echo "$disk_info" | awk '{print $5}' | sed 's/%//')
    
    # Parse CPU usage
    local cpu_usage=$(echo "$cpu_info" | cut -d. -f1)
    
    echo ""
    echo -e "${PURPLE}🖥️  VPS RESOURCE REPORT${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Memory check
    if (( $(echo "$mem_percentage > $MEMORY_THRESHOLD" | bc -l) )); then
        print_error "Memory usage: ${mem_percentage}% (exceeds ${MEMORY_THRESHOLD}% threshold)"
    else
        print_success "Memory usage: ${mem_percentage}%"
    fi
    
    # Disk check
    if [ "$disk_usage" -gt "$DISK_THRESHOLD" ]; then
        print_error "Disk usage: ${disk_usage}% (exceeds ${DISK_THRESHOLD}% threshold)"
    else
        print_success "Disk usage: ${disk_usage}%"
    fi
    
    # CPU check
    if [ "$cpu_usage" -gt "$CPU_THRESHOLD" ]; then
        print_warning "CPU usage: ${cpu_usage}% (exceeds ${CPU_THRESHOLD}% threshold)"
    else
        print_success "CPU usage: ${cpu_usage}%"
    fi
    
    print_info "Load average: $load_avg"
    print_info "Memory: $(echo "scale=1; $mem_used / 1024 / 1024" | bc -l)GB / $(echo "scale=1; $mem_total / 1024 / 1024" | bc -l)GB"
    
    echo ""
}

# Function to check Docker containers
check_docker_containers() {
    print_status "Checking Docker containers..."
    
    local container_status=$(execute_remote "cd $APP_DIR && docker compose -f docker-compose.prod.yml ps --format 'json'" 2>/dev/null || echo "[]")
    
    echo ""
    echo -e "${PURPLE}🐳 DOCKER CONTAINER REPORT${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    if [ "$container_status" = "[]" ] || [ -z "$container_status" ]; then
        print_error "No containers found or unable to connect"
        return 1
    fi
    
    # Parse container info (simplified for shell compatibility)
    local container_count=$(execute_remote "cd $APP_DIR && docker compose -f docker-compose.prod.yml ps -q | wc -l" 2>/dev/null || echo "0")
    local running_count=$(execute_remote "cd $APP_DIR && docker compose -f docker-compose.prod.yml ps --filter 'status=running' -q | wc -l" 2>/dev/null || echo "0")
    
    if [ "$running_count" -eq "$container_count" ] && [ "$container_count" -gt 0 ]; then
        print_success "All containers running ($running_count/$container_count)"
    else
        print_error "Container issues detected ($running_count/$container_count running)"
    fi
    
    # Show container details
    local container_details=$(execute_remote "cd $APP_DIR && docker compose -f docker-compose.prod.yml ps --format 'table {{.Name}}\t{{.Status}}\t{{.Ports}}'" 2>/dev/null)
    if [ -n "$container_details" ]; then
        echo "$container_details"
    fi
    
    echo ""
}

# Function to check recent logs for errors
check_logs() {
    print_status "Checking recent logs for errors..."
    
    local error_count=$(execute_remote "cd $APP_DIR && docker compose -f docker-compose.prod.yml logs --since='5m' 2>/dev/null | grep -i 'error\|fatal\|exception' | wc -l" 2>/dev/null || echo "0")
    local warning_count=$(execute_remote "cd $APP_DIR && docker compose -f docker-compose.prod.yml logs --since='5m' 2>/dev/null | grep -i 'warn\|warning' | wc -l" 2>/dev/null || echo "0")
    
    echo ""
    echo -e "${PURPLE}📝 LOG ANALYSIS REPORT${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    if [ "$error_count" -eq 0 ]; then
        print_success "No errors in last 5 minutes"
    else
        print_warning "$error_count errors found in last 5 minutes"
    fi
    
    if [ "$warning_count" -eq 0 ]; then
        print_success "No warnings in last 5 minutes"
    else
        print_info "$warning_count warnings found in last 5 minutes"
    fi
    
    # Show recent critical errors
    if [ "$error_count" -gt 0 ]; then
        echo ""
        print_status "Recent errors:"
        execute_remote "cd $APP_DIR && docker compose -f docker-compose.prod.yml logs --since='5m' 2>/dev/null | grep -i 'error\|fatal\|exception' | tail -3" 2>/dev/null || echo "Unable to fetch error logs"
    fi
    
    echo ""
}

# Function to run full health check
run_full_check() {
    echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║                    PROTOKOL57 HEALTH CHECK                   ║${NC}"
    echo -e "${CYAN}║                  $(date +'%Y-%m-%d %H:%M:%S %Z')                    ║${NC}"
    echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    check_application_health
    check_vps_resources
    check_docker_containers
    check_logs
    
    echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║                      CHECK COMPLETE                          ║${NC}"
    echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    # Summary
    local alert_count=$(grep -c "$(date +'%Y-%m-%d')" "$ALERT_FILE" 2>/dev/null || echo "0")
    if [ "$alert_count" -eq 0 ]; then
        print_success "No alerts today"
    else
        print_warning "$alert_count alerts today (check $ALERT_FILE)"
    fi
}

# Function to start continuous monitoring
start_monitoring() {
    print_status "Starting continuous monitoring (press Ctrl+C to stop)..."
    echo "Logs: $LOG_FILE"
    echo "Alerts: $ALERT_FILE"
    echo ""
    
    while true; do
        run_full_check
        print_status "Waiting 5 minutes before next check..."
        sleep 300  # 5 minutes
    done
}

# Function to show alerts
show_alerts() {
    echo -e "${YELLOW}🚨 RECENT ALERTS${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    if [ -f "$ALERT_FILE" ]; then
        local today=$(date +'%Y-%m-%d')
        local alerts_today=$(grep "$today" "$ALERT_FILE" 2>/dev/null || echo "")
        
        if [ -n "$alerts_today" ]; then
            echo "$alerts_today"
        else
            print_success "No alerts today"
        fi
        
        echo ""
        echo "Last 5 alerts (all time):"
        tail -5 "$ALERT_FILE" 2>/dev/null || echo "No alerts found"
    else
        print_success "No alerts file found"
    fi
}

# Function to show help
show_help() {
    echo "Monitoring Script for Protokol57"
    echo ""
    echo "Usage: $0 {check|monitor|alerts|help}"
    echo ""
    echo "Commands:"
    echo "  check      Run one-time comprehensive health check"
    echo "  monitor    Start continuous monitoring (5-minute intervals)"
    echo "  alerts     Show recent alerts and warnings"
    echo "  help       Show this help message"
    echo ""
    echo "Files:"
    echo "  Logs:    $LOG_FILE"
    echo "  Alerts:  $ALERT_FILE"
    echo ""
    echo "Thresholds:"
    echo "  Memory:        ${MEMORY_THRESHOLD}%"
    echo "  CPU:           ${CPU_THRESHOLD}%"
    echo "  Disk:          ${DISK_THRESHOLD}%"
    echo "  Response time: ${RESPONSE_TIME_THRESHOLD}ms"
}

# Ensure log directory exists
mkdir -p "$(dirname "$LOG_FILE")"
mkdir -p "$(dirname "$ALERT_FILE")"

# Main script logic
case "${1:-check}" in
    "check")
        run_full_check
        ;;
    "monitor")
        start_monitoring
        ;;
    "alerts")
        show_alerts
        ;;
    "help"|*)
        show_help
        ;;
esac