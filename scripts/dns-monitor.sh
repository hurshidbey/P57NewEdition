#!/bin/bash

# DNS Monitoring Script for P57
# This script monitors DNS health and sends alerts when issues are detected
# Can be run as a cron job: */5 * * * * /path/to/dns-monitor.sh

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
LOG_DIR="/var/log/p57-dns-monitor"
STATE_FILE="$LOG_DIR/dns-monitor.state"
ALERT_LOG="$LOG_DIR/alerts.log"

# Create log directory if it doesn't exist
mkdir -p "$LOG_DIR"

# Monitoring configuration
API_ENDPOINT="http://localhost:5001/api/dns-health"
WEBHOOK_URL="${DNS_ALERT_WEBHOOK:-}"  # Set via environment variable
EMAIL_TO="${DNS_ALERT_EMAIL:-}"       # Set via environment variable

# Thresholds
DEGRADED_THRESHOLD=2  # Number of degraded checks before alerting
UNHEALTHY_THRESHOLD=1 # Number of unhealthy checks before alerting

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Function to log messages
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_DIR/monitor.log"
}

# Function to send alert
send_alert() {
    local severity=$1
    local message=$2
    local details=$3
    
    # Log alert
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] [$severity] $message" >> "$ALERT_LOG"
    echo "$details" >> "$ALERT_LOG"
    echo "---" >> "$ALERT_LOG"
    
    # Send webhook if configured
    if [[ -n "$WEBHOOK_URL" ]]; then
        curl -s -X POST "$WEBHOOK_URL" \
            -H "Content-Type: application/json" \
            -d "{
                \"severity\": \"$severity\",
                \"message\": \"$message\",
                \"details\": \"$details\",
                \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
            }" || log "Failed to send webhook alert"
    fi
    
    # Send email if configured
    if [[ -n "$EMAIL_TO" ]] && command -v mail &> /dev/null; then
        echo -e "Subject: [P57 DNS Alert] $severity: $message\n\n$details" | \
            mail -s "[P57 DNS Alert] $severity: $message" "$EMAIL_TO" || \
            log "Failed to send email alert"
    fi
}

# Function to load previous state
load_state() {
    if [[ -f "$STATE_FILE" ]]; then
        source "$STATE_FILE"
    else
        PREVIOUS_STATUS="unknown"
        DEGRADED_COUNT=0
        UNHEALTHY_COUNT=0
        LAST_ALERT_TIME=0
    fi
}

# Function to save current state
save_state() {
    cat > "$STATE_FILE" <<EOF
PREVIOUS_STATUS="$1"
DEGRADED_COUNT=$2
UNHEALTHY_COUNT=$3
LAST_ALERT_TIME=$4
EOF
}

# Function to check if we should send alert (rate limiting)
should_send_alert() {
    local current_time=$(date +%s)
    local time_since_last=$((current_time - LAST_ALERT_TIME))
    
    # Rate limit: Don't send same alert more than once per hour
    if [[ $time_since_last -lt 3600 ]]; then
        return 1
    fi
    
    return 0
}

# Function to format JSON for human reading
format_json() {
    if command -v jq &> /dev/null; then
        echo "$1" | jq '.'
    else
        echo "$1"
    fi
}

# Main monitoring function
monitor_dns() {
    log "Starting DNS health check..."
    
    # Load previous state
    load_state
    
    # Perform health check
    local response
    local http_code
    
    response=$(curl -s -w "\n%{http_code}" "$API_ENDPOINT" 2>/dev/null || echo "000")
    http_code=$(echo "$response" | tail -n1)
    response=$(echo "$response" | head -n -1)
    
    if [[ "$http_code" != "200" ]]; then
        log "ERROR: Failed to reach monitoring endpoint (HTTP $http_code)"
        
        # Increment unhealthy count
        UNHEALTHY_COUNT=$((UNHEALTHY_COUNT + 1))
        
        if [[ $UNHEALTHY_COUNT -ge $UNHEALTHY_THRESHOLD ]] && should_send_alert; then
            send_alert "CRITICAL" \
                "DNS monitoring endpoint unreachable" \
                "HTTP Status: $http_code\nEndpoint: $API_ENDPOINT\nFailed attempts: $UNHEALTHY_COUNT"
            LAST_ALERT_TIME=$(date +%s)
        fi
        
        save_state "unreachable" 0 "$UNHEALTHY_COUNT" "$LAST_ALERT_TIME"
        return 1
    fi
    
    # Parse response
    local overall_status=$(echo "$response" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
    local healthy_count=$(echo "$response" | grep -o '"healthy":[0-9]*' | cut -d':' -f2)
    local degraded_count=$(echo "$response" | grep -o '"degraded":[0-9]*' | cut -d':' -f2)
    local unhealthy_count=$(echo "$response" | grep -o '"unhealthy":[0-9]*' | cut -d':' -f2)
    
    log "Status: $overall_status (Healthy: $healthy_count, Degraded: $degraded_count, Unhealthy: $unhealthy_count)"
    
    # Handle status changes
    case "$overall_status" in
        "healthy")
            if [[ "$PREVIOUS_STATUS" != "healthy" && "$PREVIOUS_STATUS" != "unknown" ]]; then
                send_alert "RESOLVED" \
                    "DNS health restored" \
                    "All domains are now healthy.\nPrevious status: $PREVIOUS_STATUS"
                LAST_ALERT_TIME=$(date +%s)
            fi
            DEGRADED_COUNT=0
            UNHEALTHY_COUNT=0
            ;;
            
        "degraded")
            DEGRADED_COUNT=$((DEGRADED_COUNT + 1))
            
            if [[ $DEGRADED_COUNT -ge $DEGRADED_THRESHOLD ]] && should_send_alert; then
                # Extract problematic domains
                local problem_domains=$(echo "$response" | grep -B2 '"status":"degraded"' | grep '"domain"' | cut -d'"' -f4 | tr '\n' ', ')
                
                send_alert "WARNING" \
                    "DNS health degraded" \
                    "Degraded domains: $problem_domains\nDegraded for $DEGRADED_COUNT checks\n\nFull response:\n$(format_json "$response")"
                LAST_ALERT_TIME=$(date +%s)
            fi
            ;;
            
        "unhealthy")
            UNHEALTHY_COUNT=$((UNHEALTHY_COUNT + 1))
            
            if [[ $UNHEALTHY_COUNT -ge $UNHEALTHY_THRESHOLD ]] && should_send_alert; then
                # Extract problematic domains
                local problem_domains=$(echo "$response" | grep -B2 '"status":"unhealthy"' | grep '"domain"' | cut -d'"' -f4 | tr '\n' ', ')
                
                send_alert "CRITICAL" \
                    "DNS health critical" \
                    "Unhealthy domains: $problem_domains\nUnhealthy for $UNHEALTHY_COUNT checks\n\nFull response:\n$(format_json "$response")"
                LAST_ALERT_TIME=$(date +%s)
            fi
            ;;
    esac
    
    # Save state
    save_state "$overall_status" "$DEGRADED_COUNT" "$UNHEALTHY_COUNT" "$LAST_ALERT_TIME"
    
    # Log detailed issues if any
    if [[ "$overall_status" != "healthy" ]]; then
        log "Checking for specific issues..."
        
        # Extract and log recommendations
        echo "$response" | grep -o '"recommendations":\[[^]]*\]' | \
            sed 's/"recommendations":\[//;s/\]//;s/","/\n/g;s/"//g' | \
            while IFS= read -r recommendation; do
                if [[ -n "$recommendation" ]]; then
                    log "  Recommendation: $recommendation"
                fi
            done
    fi
}

# Function to generate summary report
generate_report() {
    local report_file="$LOG_DIR/dns-report-$(date +%Y%m%d).txt"
    
    echo "=== P57 DNS Health Report ===" > "$report_file"
    echo "Generated: $(date)" >> "$report_file"
    echo "" >> "$report_file"
    
    # Get current status
    local response=$(curl -s "$API_ENDPOINT" 2>/dev/null || echo "{}")
    
    if [[ -n "$response" ]]; then
        echo "Current Status:" >> "$report_file"
        format_json "$response" >> "$report_file"
    fi
    
    echo "" >> "$report_file"
    echo "Recent Alerts:" >> "$report_file"
    tail -n 50 "$ALERT_LOG" 2>/dev/null >> "$report_file" || echo "No recent alerts" >> "$report_file"
    
    log "Report generated: $report_file"
}

# Main execution
case "${1:-monitor}" in
    "monitor")
        monitor_dns
        ;;
    "report")
        generate_report
        ;;
    "test-alert")
        send_alert "TEST" "DNS monitoring test alert" "This is a test alert to verify alerting configuration"
        ;;
    *)
        echo "Usage: $0 [monitor|report|test-alert]"
        echo "  monitor     - Run DNS health monitoring (default)"
        echo "  report      - Generate daily report"
        echo "  test-alert  - Send test alert"
        exit 1
        ;;
esac