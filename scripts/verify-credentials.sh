#!/bin/bash

# P57 Credential Verification Script
# Tests all configured credentials and service connections
# Usage: ./scripts/verify-credentials.sh [--verbose] [--service SERVICE]

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$PROJECT_ROOT/.env.production"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Counters
PASSED=0
FAILED=0
SKIPPED=0

# Load environment variables
if [ -f "$ENV_FILE" ]; then
    set -a
    source "$ENV_FILE"
    set +a
else
    echo -e "${RED}Error: $ENV_FILE not found${NC}"
    exit 1
fi

# Verbose mode
VERBOSE=${VERBOSE:-false}
if [[ "${1:-}" == "--verbose" ]]; then
    VERBOSE=true
    shift
fi

# Service filter
SERVICE_FILTER="${2:-all}"

# Helper functions
log_test() {
    local service=$1
    local test_name=$2
    echo -e "\n${BLUE}Testing ${service}:${NC} ${test_name}"
}

log_success() {
    local message=$1
    echo -e "  ${GREEN}✓${NC} ${message}"
    ((PASSED++))
}

log_failure() {
    local message=$1
    echo -e "  ${RED}✗${NC} ${message}"
    ((FAILED++))
}

log_skip() {
    local message=$1
    echo -e "  ${YELLOW}⊖${NC} ${message} (skipped)"
    ((SKIPPED++))
}

log_info() {
    local message=$1
    if [ "$VERBOSE" = true ]; then
        echo -e "  ${BLUE}ℹ${NC} ${message}"
    fi
}

# Test OpenAI API
test_openai() {
    if [[ "$SERVICE_FILTER" != "all" && "$SERVICE_FILTER" != "openai" ]]; then
        return
    fi
    
    log_test "OpenAI" "API Key Validation"
    
    if [ -z "${OPENAI_API_KEY:-}" ]; then
        log_skip "OPENAI_API_KEY not configured"
        return
    fi
    
    # Test 1: Check key format
    if [[ ! $OPENAI_API_KEY =~ ^sk-[a-zA-Z0-9]{48,}$ ]]; then
        log_failure "Invalid API key format"
        return
    fi
    log_success "API key format valid"
    
    # Test 2: API connectivity
    response=$(curl -s -o /dev/null -w "%{http_code}" \
        -H "Authorization: Bearer $OPENAI_API_KEY" \
        https://api.openai.com/v1/models 2>/dev/null || echo "000")
    
    if [ "$response" = "200" ]; then
        log_success "API connection successful"
        
        # Test 3: Check quota (optional verbose check)
        if [ "$VERBOSE" = true ]; then
            usage=$(curl -s -H "Authorization: Bearer $OPENAI_API_KEY" \
                https://api.openai.com/v1/usage 2>/dev/null || echo "{}")
            log_info "API usage data retrieved"
        fi
    else
        log_failure "API connection failed (HTTP $response)"
    fi
}

# Test Supabase
test_supabase() {
    if [[ "$SERVICE_FILTER" != "all" && "$SERVICE_FILTER" != "supabase" ]]; then
        return
    fi
    
    log_test "Supabase" "Service Configuration"
    
    if [ -z "${SUPABASE_URL:-}" ]; then
        log_skip "SUPABASE_URL not configured"
        return
    fi
    
    # Test 1: URL format
    if [[ ! $SUPABASE_URL =~ ^https://[a-z0-9]+\.supabase\.co$ ]]; then
        log_failure "Invalid Supabase URL format"
    else
        log_success "Supabase URL format valid"
    fi
    
    # Test 2: Anon key
    if [ -z "${SUPABASE_ANON_KEY:-}" ]; then
        log_failure "SUPABASE_ANON_KEY not configured"
    elif [[ ! $SUPABASE_ANON_KEY =~ ^eyJ[a-zA-Z0-9._-]+$ ]]; then
        log_failure "Invalid anon key format"
    else
        log_success "Anon key format valid"
    fi
    
    # Test 3: Service role key
    if [ -z "${SUPABASE_SERVICE_ROLE_KEY:-}" ]; then
        log_failure "SUPABASE_SERVICE_ROLE_KEY not configured"
    elif [[ ! $SUPABASE_SERVICE_ROLE_KEY =~ ^eyJ[a-zA-Z0-9._-]+$ ]]; then
        log_failure "Invalid service role key format"
    else
        log_success "Service role key format valid"
        
        # Test 4: API connectivity
        response=$(curl -s -o /dev/null -w "%{http_code}" \
            -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
            -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
            "$SUPABASE_URL/rest/v1/" 2>/dev/null || echo "000")
        
        if [ "$response" = "200" ]; then
            log_success "API connection successful"
        else
            log_failure "API connection failed (HTTP $response)"
        fi
    fi
    
    # Test 5: Database URL
    if [ -z "${DATABASE_URL:-}" ]; then
        log_failure "DATABASE_URL not configured"
    elif [[ $DATABASE_URL =~ ^postgresql://.*@.*:5432/postgres$ ]]; then
        log_success "Database URL format valid"
        
        # Test actual connection if verbose
        if [ "$VERBOSE" = true ] && command -v psql &> /dev/null; then
            if psql "$DATABASE_URL" -c "SELECT 1" &>/dev/null; then
                log_info "Database connection successful"
            else
                log_info "Database connection failed"
            fi
        fi
    else
        log_failure "Invalid database URL format"
    fi
}

# Test ATMOS Payment Gateway
test_atmos() {
    if [[ "$SERVICE_FILTER" != "all" && "$SERVICE_FILTER" != "atmos" ]]; then
        return
    fi
    
    log_test "ATMOS" "Payment Gateway Configuration"
    
    # Test 1: Store ID
    if [ -z "${ATMOS_STORE_ID:-}" ]; then
        log_skip "ATMOS_STORE_ID not configured"
        return
    else
        log_success "Store ID configured: $ATMOS_STORE_ID"
    fi
    
    # Test 2: Consumer Key
    if [ -z "${ATMOS_CONSUMER_KEY:-}" ]; then
        log_failure "ATMOS_CONSUMER_KEY not configured"
    else
        log_success "Consumer key configured"
    fi
    
    # Test 3: Consumer Secret
    if [ -z "${ATMOS_CONSUMER_SECRET:-}" ]; then
        log_failure "ATMOS_CONSUMER_SECRET not configured"
    else
        log_success "Consumer secret configured"
    fi
    
    # Test 4: Environment
    if [ -z "${ATMOS_ENV:-}" ]; then
        log_failure "ATMOS_ENV not configured"
    elif [[ "$ATMOS_ENV" =~ ^(production|test)$ ]]; then
        log_success "Environment configured: $ATMOS_ENV"
    else
        log_failure "Invalid ATMOS_ENV value: $ATMOS_ENV"
    fi
}

# Test Session Configuration
test_session() {
    if [[ "$SERVICE_FILTER" != "all" && "$SERVICE_FILTER" != "session" ]]; then
        return
    fi
    
    log_test "Session" "Security Configuration"
    
    # Test 1: Session secret
    if [ -z "${SESSION_SECRET:-}" ]; then
        log_failure "SESSION_SECRET not configured"
    elif [ ${#SESSION_SECRET} -lt 32 ]; then
        log_failure "SESSION_SECRET too short (minimum 32 characters)"
    else
        log_success "Session secret configured (${#SESSION_SECRET} characters)"
    fi
    
    # Test 2: Admin emails
    if [ -z "${ADMIN_EMAILS:-}" ]; then
        log_skip "ADMIN_EMAILS not configured"
    else
        email_count=$(echo "$ADMIN_EMAILS" | tr ',' '\n' | wc -l)
        log_success "Admin emails configured ($email_count emails)"
    fi
    
    # Test 3: Fallback admin
    if [ -n "${FALLBACK_ADMIN_EMAIL:-}" ]; then
        if [ -z "${FALLBACK_ADMIN_PASSWORD_HASH:-}" ]; then
            log_failure "FALLBACK_ADMIN_EMAIL set but password hash missing"
        elif [[ $FALLBACK_ADMIN_PASSWORD_HASH =~ ^\$2[aby]\$[0-9]{2}\$.{53}$ ]]; then
            log_success "Fallback admin configured with valid bcrypt hash"
        else
            log_failure "Invalid bcrypt hash format for fallback admin"
        fi
    else
        log_skip "Fallback admin not configured"
    fi
}

# Test Telegram Bot
test_telegram() {
    if [[ "$SERVICE_FILTER" != "all" && "$SERVICE_FILTER" != "telegram" ]]; then
        return
    fi
    
    log_test "Telegram" "Bot Configuration"
    
    if [ -z "${TELEGRAM_BOT_TOKEN:-}" ]; then
        log_skip "TELEGRAM_BOT_TOKEN not configured"
        return
    fi
    
    # Test 1: Token format
    if [[ ! $TELEGRAM_BOT_TOKEN =~ ^[0-9]+:[a-zA-Z0-9_-]+$ ]]; then
        log_failure "Invalid bot token format"
        return
    fi
    log_success "Bot token format valid"
    
    # Test 2: Bot API connectivity
    response=$(curl -s "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getMe" 2>/dev/null || echo '{"ok":false}')
    
    if [[ $(echo "$response" | grep -o '"ok":true') ]]; then
        bot_username=$(echo "$response" | grep -o '"username":"[^"]*"' | cut -d'"' -f4)
        log_success "Bot connected: @$bot_username"
    else
        log_failure "Bot connection failed"
    fi
}

# Test client-side environment variables
test_client_env() {
    if [[ "$SERVICE_FILTER" != "all" && "$SERVICE_FILTER" != "client" ]]; then
        return
    fi
    
    log_test "Client" "Frontend Environment Variables"
    
    # Test VITE variables
    if [ -z "${VITE_SUPABASE_URL:-}" ]; then
        log_failure "VITE_SUPABASE_URL not configured"
    else
        log_success "VITE_SUPABASE_URL configured"
    fi
    
    if [ -z "${VITE_SUPABASE_ANON_KEY:-}" ]; then
        log_failure "VITE_SUPABASE_ANON_KEY not configured"
    else
        log_success "VITE_SUPABASE_ANON_KEY configured"
    fi
    
    if [ -n "${VITE_TELEGRAM_BOT_USERNAME:-}" ]; then
        log_success "VITE_TELEGRAM_BOT_USERNAME configured: $VITE_TELEGRAM_BOT_USERNAME"
    else
        log_skip "VITE_TELEGRAM_BOT_USERNAME not configured"
    fi
}

# Test application endpoints
test_application() {
    if [[ "$SERVICE_FILTER" != "all" && "$SERVICE_FILTER" != "app" ]]; then
        return
    fi
    
    log_test "Application" "Local Endpoints"
    
    # Check if app is running locally
    health_response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/health 2>/dev/null || echo "000")
    
    if [ "$health_response" != "200" ]; then
        log_skip "Application not running locally (port 5000)"
        return
    fi
    
    log_success "Health endpoint responding"
    
    # Test other endpoints
    endpoints=(
        "/api/protocols?page=1&limit=1|Protocols API"
        "/api/categories|Categories API"
        "/metrics|Metrics endpoint"
        "/ready|Readiness probe"
    )
    
    for endpoint_info in "${endpoints[@]}"; do
        IFS='|' read -r endpoint name <<< "$endpoint_info"
        response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:5000$endpoint" 2>/dev/null || echo "000")
        
        if [[ "$response" =~ ^2[0-9][0-9]$ ]]; then
            log_success "$name responding (HTTP $response)"
        else
            log_failure "$name failed (HTTP $response)"
        fi
    done
}

# Generate summary report
generate_report() {
    echo -e "\n${BLUE}═══════════════════════════════════════${NC}"
    echo -e "${BLUE}        Credential Verification Report${NC}"
    echo -e "${BLUE}═══════════════════════════════════════${NC}"
    
    local total=$((PASSED + FAILED + SKIPPED))
    local pass_rate=0
    if [ $total -gt 0 ]; then
        pass_rate=$(( (PASSED * 100) / total ))
    fi
    
    echo -e "\nResults:"
    echo -e "  ${GREEN}Passed:${NC}  $PASSED"
    echo -e "  ${RED}Failed:${NC}  $FAILED"
    echo -e "  ${YELLOW}Skipped:${NC} $SKIPPED"
    echo -e "  Total:    $total"
    echo -e "  Pass Rate: ${pass_rate}%"
    
    if [ $FAILED -gt 0 ]; then
        echo -e "\n${RED}⚠️  Some credentials failed verification${NC}"
        echo "Please check the failed items above and update credentials as needed."
        echo "Run with --verbose for more detailed information."
        exit 1
    elif [ $PASSED -eq 0 ]; then
        echo -e "\n${YELLOW}⚠️  No credentials were tested${NC}"
        echo "Configure credentials in $ENV_FILE"
        exit 1
    else
        echo -e "\n${GREEN}✅ All configured credentials verified successfully${NC}"
    fi
}

# Main execution
main() {
    echo -e "${BLUE}P57 Credential Verification${NC}"
    echo -e "${BLUE}══════════════════════════${NC}"
    echo "Environment: ${NODE_ENV:-development}"
    echo "Config file: $ENV_FILE"
    
    # Run tests based on filter
    case "$SERVICE_FILTER" in
        all)
            test_openai
            test_supabase
            test_atmos
            test_session
            test_telegram
            test_client_env
            test_application
            ;;
        openai|supabase|atmos|session|telegram|client|app)
            test_$SERVICE_FILTER
            ;;
        *)
            echo -e "\n${RED}Unknown service: $SERVICE_FILTER${NC}"
            echo "Available services: openai, supabase, atmos, session, telegram, client, app"
            exit 1
            ;;
    esac
    
    # Generate report
    generate_report
}

# Help text
if [[ "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
    cat << EOF
P57 Credential Verification Script

Usage:
    $0 [--verbose] [--service SERVICE]

Options:
    --verbose          Show detailed test information
    --service SERVICE  Test only specific service
    --help, -h         Show this help message

Available services:
    all       Test all services (default)
    openai    Test OpenAI API
    supabase  Test Supabase configuration
    atmos     Test ATMOS payment gateway
    session   Test session configuration
    telegram  Test Telegram bot
    client    Test client environment variables
    app       Test application endpoints

Examples:
    $0                    # Test all services
    $0 --verbose          # Test all with detailed output
    $0 --service openai   # Test only OpenAI
    $0 --verbose --service supabase

EOF
    exit 0
fi

# Run main
main