#!/bin/bash

# P57 Credential Rotation Schedule Checker
# Automated script to check rotation schedules and send reminders
# Can be run via cron for automated monitoring

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ROTATION_CONFIG="$PROJECT_ROOT/docs/credential-rotation-schedule.json"
LOG_FILE="$PROJECT_ROOT/logs/rotation-reminders.log"
NOTIFICATION_DAYS_BEFORE=14  # Send reminder 14 days before rotation

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Ensure directories exist
mkdir -p "$(dirname "$LOG_FILE")"

# Create rotation schedule if it doesn't exist
init_rotation_schedule() {
    if [ ! -f "$ROTATION_CONFIG" ]; then
        cat > "$ROTATION_CONFIG" << 'EOF'
{
  "rotation_policy": {
    "api_keys": 90,
    "session_secrets": 180,
    "database_passwords": 365,
    "admin_passwords": 90,
    "service_tokens": 180
  },
  "credentials": {
    "OPENAI_API_KEY": {
      "type": "api_keys",
      "last_rotated": "2025-01-20",
      "owner": "DevOps",
      "notify": ["devops@p57.uz"]
    },
    "SUPABASE_SERVICE_ROLE_KEY": {
      "type": "api_keys",
      "last_rotated": "2025-01-20",
      "owner": "DevOps",
      "notify": ["devops@p57.uz"]
    },
    "SUPABASE_ANON_KEY": {
      "type": "service_tokens",
      "last_rotated": "2025-01-20",
      "owner": "DevOps",
      "notify": ["devops@p57.uz"]
    },
    "SESSION_SECRET": {
      "type": "session_secrets",
      "last_rotated": "2025-01-20",
      "owner": "DevOps",
      "notify": ["devops@p57.uz"]
    },
    "ATMOS_CONSUMER_KEY": {
      "type": "api_keys",
      "last_rotated": "2025-01-20",
      "owner": "Finance",
      "notify": ["finance@p57.uz"]
    },
    "ATMOS_CONSUMER_SECRET": {
      "type": "api_keys",
      "last_rotated": "2025-01-20",
      "owner": "Finance",
      "notify": ["finance@p57.uz"]
    },
    "TELEGRAM_BOT_TOKEN": {
      "type": "service_tokens",
      "last_rotated": "2025-01-20",
      "owner": "DevOps",
      "notify": ["devops@p57.uz"]
    },
    "FALLBACK_ADMIN_PASSWORD": {
      "type": "admin_passwords",
      "last_rotated": "2025-01-20",
      "owner": "Security",
      "notify": ["security@p57.uz", "devops@p57.uz"]
    }
  }
}
EOF
        echo "Created rotation schedule at: $ROTATION_CONFIG"
    fi
}

# Calculate days until rotation
days_until_rotation() {
    local last_rotated=$1
    local rotation_interval=$2
    
    local last_rotated_epoch=$(date -d "$last_rotated" +%s 2>/dev/null || date -j -f "%Y-%m-%d" "$last_rotated" +%s)
    local current_epoch=$(date +%s)
    local days_since_rotation=$(( (current_epoch - last_rotated_epoch) / 86400 ))
    local days_until=$(( rotation_interval - days_since_rotation ))
    
    echo "$days_until"
}

# Send notification (can be extended to send actual emails/messages)
send_notification() {
    local credential=$1
    local days_until=$2
    local owner=$3
    local notify_list=$4
    
    local message="[$(date '+%Y-%m-%d %H:%M:%S')] REMINDER: $credential needs rotation in $days_until days (Owner: $owner)"
    echo "$message" >> "$LOG_FILE"
    
    # If Telegram bot is configured, send notification
    if [ -n "${TELEGRAM_BOT_TOKEN:-}" ] && [ -n "${TELEGRAM_CHAT_ID:-}" ]; then
        curl -s -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendMessage" \
            -d "chat_id=$TELEGRAM_CHAT_ID" \
            -d "text=🔑 Credential Rotation Reminder

Credential: $credential
Days until rotation: $days_until
Owner: $owner
Action required: Please rotate this credential soon

Use: ./scripts/rotate-credentials.sh --key $credential" \
            >/dev/null 2>&1 || true
    fi
    
    # Here you could add email notifications, Slack, etc.
    echo -e "${YELLOW}⚠️  Reminder sent:${NC} $credential needs rotation in $days_until days"
}

# Check all credentials
check_credentials() {
    local policy=$(jq -r '.rotation_policy' "$ROTATION_CONFIG")
    local credentials=$(jq -r '.credentials | to_entries[] | @base64' "$ROTATION_CONFIG")
    
    local needs_rotation=()
    local upcoming_rotation=()
    local healthy=()
    
    echo -e "${BLUE}Checking credential rotation schedule...${NC}\n"
    
    while IFS= read -r cred_base64; do
        local cred=$(echo "$cred_base64" | base64 -d)
        local name=$(echo "$cred" | jq -r '.key')
        local details=$(echo "$cred" | jq -r '.value')
        
        local type=$(echo "$details" | jq -r '.type')
        local last_rotated=$(echo "$details" | jq -r '.last_rotated')
        local owner=$(echo "$details" | jq -r '.owner')
        local notify_list=$(echo "$details" | jq -r '.notify[]' 2>/dev/null | tr '\n' ',')
        
        # Get rotation interval for this type
        local interval=$(echo "$policy" | jq -r ".$type // 90")
        local days_left=$(days_until_rotation "$last_rotated" "$interval")
        
        if [ "$days_left" -lt 0 ]; then
            needs_rotation+=("$name (${days_left#-} days overdue)")
            echo -e "${RED}⚠️  OVERDUE:${NC} $name - ${days_left#-} days overdue (Owner: $owner)"
            send_notification "$name" "$days_left" "$owner" "$notify_list"
        elif [ "$days_left" -le "$NOTIFICATION_DAYS_BEFORE" ]; then
            upcoming_rotation+=("$name ($days_left days)")
            echo -e "${YELLOW}📅 UPCOMING:${NC} $name - $days_left days until rotation (Owner: $owner)"
            send_notification "$name" "$days_left" "$owner" "$notify_list"
        else
            healthy+=("$name ($days_left days)")
            echo -e "${GREEN}✅ OK:${NC} $name - $days_left days until rotation"
        fi
    done <<< "$credentials"
    
    # Summary
    echo -e "\n${BLUE}═══════════════════════════════════════${NC}"
    echo -e "${BLUE}        Rotation Schedule Summary${NC}"
    echo -e "${BLUE}═══════════════════════════════════════${NC}"
    
    echo -e "\n${RED}Overdue (${#needs_rotation[@]}):${NC}"
    if [ ${#needs_rotation[@]} -gt 0 ]; then
        printf '%s\n' "${needs_rotation[@]}" | sed 's/^/  - /'
    else
        echo "  None"
    fi
    
    echo -e "\n${YELLOW}Upcoming (${#upcoming_rotation[@]}):${NC}"
    if [ ${#upcoming_rotation[@]} -gt 0 ]; then
        printf '%s\n' "${upcoming_rotation[@]}" | sed 's/^/  - /'
    else
        echo "  None"
    fi
    
    echo -e "\n${GREEN}Healthy (${#healthy[@]}):${NC}"
    if [ ${#healthy[@]} -gt 0 ]; then
        printf '%s\n' "${healthy[@]}" | sed 's/^/  - /'
    else
        echo "  None"
    fi
    
    # Return non-zero if any are overdue
    if [ ${#needs_rotation[@]} -gt 0 ]; then
        echo -e "\n${RED}Action Required: Please rotate overdue credentials immediately${NC}"
        return 1
    fi
}

# Update rotation date after successful rotation
update_rotation_date() {
    local credential=$1
    local new_date=$(date +%Y-%m-%d)
    
    # Update the JSON file
    local tmp_file=$(mktemp)
    jq ".credentials.\"$credential\".last_rotated = \"$new_date\"" "$ROTATION_CONFIG" > "$tmp_file"
    mv "$tmp_file" "$ROTATION_CONFIG"
    
    echo "Updated rotation date for $credential to $new_date"
}

# Generate markdown report
generate_report() {
    local report_file="$PROJECT_ROOT/docs/rotation-status-report.md"
    
    cat > "$report_file" << EOF
# Credential Rotation Status Report

Generated: $(date '+%Y-%m-%d %H:%M:%S')

## Overview

This report shows the current status of all credential rotations for P57.

## Rotation Schedule

| Credential | Type | Last Rotated | Next Rotation | Days Until | Status | Owner |
|------------|------|--------------|---------------|------------|--------|-------|
EOF

    local policy=$(jq -r '.rotation_policy' "$ROTATION_CONFIG")
    local credentials=$(jq -r '.credentials | to_entries[] | @base64' "$ROTATION_CONFIG")
    
    while IFS= read -r cred_base64; do
        local cred=$(echo "$cred_base64" | base64 -d)
        local name=$(echo "$cred" | jq -r '.key')
        local details=$(echo "$cred" | jq -r '.value')
        
        local type=$(echo "$details" | jq -r '.type')
        local last_rotated=$(echo "$details" | jq -r '.last_rotated')
        local owner=$(echo "$details" | jq -r '.owner')
        
        local interval=$(echo "$policy" | jq -r ".$type // 90")
        local days_left=$(days_until_rotation "$last_rotated" "$interval")
        local next_rotation=$(date -d "$last_rotated + $interval days" +%Y-%m-%d 2>/dev/null || date -v "+${interval}d" -j -f "%Y-%m-%d" "$last_rotated" +%Y-%m-%d)
        
        local status="✅ OK"
        if [ "$days_left" -lt 0 ]; then
            status="🔴 OVERDUE"
        elif [ "$days_left" -le "$NOTIFICATION_DAYS_BEFORE" ]; then
            status="🟡 UPCOMING"
        fi
        
        echo "| $name | $type | $last_rotated | $next_rotation | $days_left | $status | $owner |" >> "$report_file"
    done <<< "$credentials"
    
    cat >> "$report_file" << EOF

## Next Steps

1. Rotate any overdue credentials immediately using:
   \`\`\`bash
   ./scripts/rotate-credentials.sh --key CREDENTIAL_NAME
   \`\`\`

2. Schedule rotation for upcoming credentials

3. Update this tracking after each rotation:
   \`\`\`bash
   ./scripts/check-rotation-schedule.sh --update CREDENTIAL_NAME
   \`\`\`

## Automation

This report is generated automatically by the rotation schedule checker.
To set up automated checking, add to crontab:

\`\`\`
0 9 * * MON /opt/protokol57/scripts/check-rotation-schedule.sh
\`\`\`
EOF

    echo -e "\n${BLUE}Report generated:${NC} $report_file"
}

# Main execution
main() {
    case "${1:-check}" in
        check)
            init_rotation_schedule
            check_credentials
            generate_report
            ;;
        update)
            if [ -z "${2:-}" ]; then
                echo "Usage: $0 update CREDENTIAL_NAME"
                exit 1
            fi
            init_rotation_schedule
            update_rotation_date "$2"
            ;;
        init)
            init_rotation_schedule
            echo "Rotation schedule initialized"
            ;;
        report)
            init_rotation_schedule
            generate_report
            ;;
        *)
            cat << EOF
P57 Credential Rotation Schedule Checker

Usage:
    $0 [check]              Check rotation schedule (default)
    $0 update CREDENTIAL    Update rotation date for credential
    $0 init                 Initialize rotation schedule
    $0 report              Generate status report

Environment Variables:
    TELEGRAM_BOT_TOKEN     Telegram bot token for notifications
    TELEGRAM_CHAT_ID       Telegram chat ID for notifications

Cron Example:
    0 9 * * MON $0

EOF
            exit 1
            ;;
    esac
}

# Check for required tools
if ! command -v jq &> /dev/null; then
    echo -e "${RED}Error: jq is required but not installed${NC}"
    echo "Install with: apt-get install jq (Debian/Ubuntu) or brew install jq (macOS)"
    exit 1
fi

# Run main
main "$@"