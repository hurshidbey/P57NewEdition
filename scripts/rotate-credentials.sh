#!/bin/bash

# P57 Credential Rotation Tool
# A production-ready credential rotation system with validation and rollback
# Usage: ./scripts/rotate-credentials.sh [--all | --key KEY_NAME]

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$PROJECT_ROOT/.env.production"
BACKUP_DIR="$PROJECT_ROOT/.env.backups"
LOG_FILE="$PROJECT_ROOT/logs/credential-rotation.log"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Ensure directories exist
mkdir -p "$BACKUP_DIR" "$(dirname "$LOG_FILE")"

# Logging functions
log() {
    local level=$1
    shift
    local message="$@"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[${timestamp}] [${level}] ${message}" >> "$LOG_FILE"
    
    case $level in
        ERROR)   echo -e "${RED}[ERROR]${NC} ${message}" >&2 ;;
        WARN)    echo -e "${YELLOW}[WARN]${NC} ${message}" ;;
        INFO)    echo -e "${GREEN}[INFO]${NC} ${message}" ;;
        DEBUG)   [ "${DEBUG:-0}" = "1" ] && echo -e "${BLUE}[DEBUG]${NC} ${message}" ;;
    esac
}

# Check if running with proper permissions
check_permissions() {
    if [ ! -w "$ENV_FILE" ]; then
        log ERROR "No write permission for $ENV_FILE"
        exit 1
    fi
}

# Backup current environment file
backup_env() {
    local backup_file="$BACKUP_DIR/.env.production.backup.$TIMESTAMP"
    cp "$ENV_FILE" "$backup_file"
    chmod 600 "$backup_file"
    log INFO "Created backup: $backup_file"
    echo "$backup_file"
}

# Validate API key format
validate_key() {
    local key_name=$1
    local key_value=$2
    
    case $key_name in
        OPENAI_API_KEY)
            if [[ ! $key_value =~ ^sk-[a-zA-Z0-9]{48,}$ ]]; then
                log ERROR "Invalid OpenAI API key format"
                return 1
            fi
            ;;
        SUPABASE_SERVICE_ROLE_KEY|SUPABASE_ANON_KEY|VITE_SUPABASE_ANON_KEY)
            if [[ ! $key_value =~ ^eyJ[a-zA-Z0-9._-]+$ ]]; then
                log ERROR "Invalid Supabase key format (should be JWT)"
                return 1
            fi
            ;;
        SESSION_SECRET)
            if [ ${#key_value} -lt 32 ]; then
                log ERROR "Session secret must be at least 32 characters"
                return 1
            fi
            ;;
        TELEGRAM_BOT_TOKEN)
            if [[ ! $key_value =~ ^[0-9]+:[a-zA-Z0-9_-]+$ ]]; then
                log ERROR "Invalid Telegram bot token format"
                return 1
            fi
            ;;
        FALLBACK_ADMIN_PASSWORD_HASH)
            if [[ ! $key_value =~ ^\$2[aby]\$[0-9]{2}\$.{53}$ ]]; then
                log ERROR "Invalid bcrypt hash format"
                return 1
            fi
            ;;
    esac
    
    return 0
}

# Test API key validity
test_api_key() {
    local key_name=$1
    local key_value=$2
    
    case $key_name in
        OPENAI_API_KEY)
            log INFO "Testing OpenAI API key..."
            response=$(curl -s -o /dev/null -w "%{http_code}" \
                -H "Authorization: Bearer $key_value" \
                https://api.openai.com/v1/models 2>/dev/null || echo "000")
            
            if [ "$response" = "200" ]; then
                log INFO "OpenAI API key is valid"
                return 0
            else
                log ERROR "OpenAI API key test failed (HTTP $response)"
                return 1
            fi
            ;;
            
        SUPABASE_SERVICE_ROLE_KEY)
            log INFO "Testing Supabase service role key..."
            if [ -z "${SUPABASE_URL:-}" ]; then
                log WARN "SUPABASE_URL not set, skipping API test"
                return 0
            fi
            
            response=$(curl -s -o /dev/null -w "%{http_code}" \
                -H "apikey: $key_value" \
                -H "Authorization: Bearer $key_value" \
                "$SUPABASE_URL/rest/v1/" 2>/dev/null || echo "000")
            
            if [ "$response" = "200" ]; then
                log INFO "Supabase service role key is valid"
                return 0
            else
                log ERROR "Supabase key test failed (HTTP $response)"
                return 1
            fi
            ;;
    esac
    
    return 0
}

# Rotate a single credential
rotate_single_key() {
    local key_name=$1
    local current_value=$(grep "^${key_name}=" "$ENV_FILE" | cut -d'=' -f2- || echo "")
    
    if [ -z "$current_value" ]; then
        log WARN "$key_name not found in $ENV_FILE"
        read -p "Add $key_name to environment? (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            return 0
        fi
    fi
    
    echo -e "\n${BLUE}Rotating ${key_name}${NC}"
    echo "Current value: ${current_value:0:20}..."
    
    # Special handling for password hash
    if [ "$key_name" = "FALLBACK_ADMIN_PASSWORD_HASH" ]; then
        echo "Generate new password hash using: node scripts/generate-password-hash.js"
        read -p "Enter new hash (or press Enter to skip): " new_value
    else
        read -p "Enter new value for $key_name (or press Enter to skip): " new_value
    fi
    
    if [ -z "$new_value" ]; then
        log INFO "Skipping rotation for $key_name"
        return 0
    fi
    
    # Validate format
    if ! validate_key "$key_name" "$new_value"; then
        log ERROR "Validation failed for $key_name"
        return 1
    fi
    
    # Test API key if applicable
    if ! test_api_key "$key_name" "$new_value"; then
        read -p "API test failed. Continue anyway? (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            return 1
        fi
    fi
    
    # Update the environment file
    if [ -z "$current_value" ]; then
        echo "${key_name}=${new_value}" >> "$ENV_FILE"
    else
        # Use a temporary file for safe replacement
        local temp_file=$(mktemp)
        sed "s|^${key_name}=.*|${key_name}=${new_value}|" "$ENV_FILE" > "$temp_file"
        mv "$temp_file" "$ENV_FILE"
    fi
    
    log INFO "Successfully rotated $key_name"
    return 0
}

# Rotate all credentials
rotate_all_keys() {
    local keys=(
        "OPENAI_API_KEY"
        "SUPABASE_SERVICE_ROLE_KEY"
        "SUPABASE_ANON_KEY"
        "VITE_SUPABASE_ANON_KEY"
        "SESSION_SECRET"
        "ATMOS_CONSUMER_KEY"
        "ATMOS_CONSUMER_SECRET"
        "TELEGRAM_BOT_TOKEN"
        "MAILTRAP_API_TOKEN"
        "FALLBACK_ADMIN_PASSWORD_HASH"
    )
    
    echo "Rotating all configured credentials..."
    
    for key in "${keys[@]}"; do
        if grep -q "^${key}=" "$ENV_FILE"; then
            rotate_single_key "$key" || log WARN "Failed to rotate $key"
        fi
    done
}

# Generate secure random secret
generate_secret() {
    openssl rand -base64 32 | tr -d '\n'
}

# Show rotation status
show_status() {
    echo -e "\n${BLUE}Credential Rotation Status${NC}"
    echo "================================"
    
    local keys=(
        "OPENAI_API_KEY"
        "SUPABASE_SERVICE_ROLE_KEY"
        "SESSION_SECRET"
        "ATMOS_CONSUMER_KEY"
        "TELEGRAM_BOT_TOKEN"
        "FALLBACK_ADMIN_PASSWORD_HASH"
    )
    
    for key in "${keys[@]}"; do
        if grep -q "^${key}=" "$ENV_FILE"; then
            # Check if we have rotation history
            local last_rotation=$(grep "$key rotation completed" "$LOG_FILE" 2>/dev/null | tail -1 | cut -d' ' -f1-2 | tr -d '[]' || echo "Unknown")
            echo "$key: Last rotated $last_rotation"
        fi
    done
}

# Rollback to previous version
rollback() {
    local backup_file=$1
    
    if [ ! -f "$backup_file" ]; then
        log ERROR "Backup file not found: $backup_file"
        return 1
    fi
    
    log INFO "Rolling back to $backup_file"
    cp "$backup_file" "$ENV_FILE"
    log INFO "Rollback completed"
}

# Main execution
main() {
    log INFO "Starting credential rotation process"
    
    # Check permissions
    check_permissions
    
    # Create backup
    backup_file=$(backup_env)
    
    # Parse command line arguments
    case "${1:-}" in
        --all)
            rotate_all_keys
            ;;
        --key)
            if [ -z "${2:-}" ]; then
                log ERROR "Key name required for --key option"
                exit 1
            fi
            rotate_single_key "$2"
            ;;
        --status)
            show_status
            exit 0
            ;;
        --rollback)
            if [ -z "${2:-}" ]; then
                # Show available backups
                echo "Available backups:"
                ls -la "$BACKUP_DIR"/.env.production.backup.* 2>/dev/null || echo "No backups found"
                exit 0
            fi
            rollback "$2"
            exit $?
            ;;
        --generate-secret)
            echo "Generated secret: $(generate_secret)"
            exit 0
            ;;
        *)
            cat << EOF
P57 Credential Rotation Tool

Usage:
    $0 --all                    Rotate all credentials
    $0 --key KEY_NAME          Rotate specific credential
    $0 --status                Show rotation status
    $0 --rollback [FILE]       Rollback to backup (or list backups)
    $0 --generate-secret       Generate secure random secret

Examples:
    $0 --all
    $0 --key OPENAI_API_KEY
    $0 --rollback $BACKUP_DIR/.env.production.backup.20240120_143022

Available keys:
    OPENAI_API_KEY
    SUPABASE_SERVICE_ROLE_KEY
    SUPABASE_ANON_KEY
    SESSION_SECRET
    ATMOS_CONSUMER_KEY
    ATMOS_CONSUMER_SECRET
    TELEGRAM_BOT_TOKEN
    FALLBACK_ADMIN_PASSWORD_HASH

EOF
            exit 0
            ;;
    esac
    
    echo -e "\n${GREEN}✅ Credential rotation completed${NC}"
    echo "Backup saved to: $backup_file"
    echo ""
    echo "Next steps:"
    echo "1. Test locally with new credentials"
    echo "2. Deploy to production: ./deploy-production.sh"
    echo "3. Verify all services are working"
    echo "4. Delete old backup files after confirmation"
    
    log INFO "Credential rotation completed successfully"
}

# Run main function
main "$@"