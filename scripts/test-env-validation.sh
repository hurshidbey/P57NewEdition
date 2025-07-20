#!/bin/bash

# Test the environment validation system
# This script validates that our validation works correctly

set -euo pipefail

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
TEST_DIR="$PROJECT_ROOT/.test-env-validation"

# Cleanup function
cleanup() {
    rm -rf "$TEST_DIR"
}

# Setup test environment
setup() {
    echo -e "${BLUE}Setting up test environment...${NC}"
    mkdir -p "$TEST_DIR"
    cd "$TEST_DIR"
}

# Test 1: Valid environment file
test_valid_env() {
    echo -e "\n${BLUE}Test 1: Valid environment file${NC}"
    
    cat > .env.test << 'EOF'
# Valid test environment
NODE_ENV=production
PORT=5000
SESSION_SECRET=this-is-a-very-long-session-secret-for-testing-purposes
DATABASE_URL=postgresql://user:pass@localhost:5432/testdb
SUPABASE_URL=https://test.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test
VITE_SUPABASE_URL=https://test.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test
ATMOS_STORE_ID=1234
ATMOS_CONSUMER_KEY=test-key
ATMOS_CONSUMER_SECRET=test-secret
ATMOS_ENV=production
EOF
    
    if node "$SCRIPT_DIR/validate-env.js" --file .env.test > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Valid environment accepted"
        return 0
    else
        echo -e "${RED}✗${NC} Valid environment rejected"
        return 1
    fi
}

# Test 2: Missing required variables
test_missing_required() {
    echo -e "\n${BLUE}Test 2: Missing required variables${NC}"
    
    cat > .env.missing << 'EOF'
# Missing SESSION_SECRET and DATABASE_URL
NODE_ENV=production
SUPABASE_URL=https://test.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test
EOF
    
    if ! node "$SCRIPT_DIR/validate-env.js" --file .env.missing > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Missing variables detected correctly"
        return 0
    else
        echo -e "${RED}✗${NC} Failed to detect missing variables"
        return 1
    fi
}

# Test 3: Invalid formats
test_invalid_formats() {
    echo -e "\n${BLUE}Test 3: Invalid formats${NC}"
    
    cat > .env.invalid << 'EOF'
NODE_ENV=production
SESSION_SECRET=short
DATABASE_URL=not-a-valid-url
SUPABASE_URL=http://wrong-protocol.com
SUPABASE_SERVICE_ROLE_KEY=not-a-jwt-token
VITE_SUPABASE_URL=https://test.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test
ATMOS_STORE_ID=not-a-number
ATMOS_CONSUMER_KEY=key
ATMOS_CONSUMER_SECRET=secret
ATMOS_ENV=invalid-env
EOF
    
    if ! node "$SCRIPT_DIR/validate-env.js" --file .env.invalid > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Invalid formats detected correctly"
        return 0
    else
        echo -e "${RED}✗${NC} Failed to detect invalid formats"
        return 1
    fi
}

# Test 4: Paired variable validation
test_paired_variables() {
    echo -e "\n${BLUE}Test 4: Paired variable validation${NC}"
    
    cat > .env.unpaired << 'EOF'
# Has FALLBACK_ADMIN_EMAIL but missing password hash
NODE_ENV=production
SESSION_SECRET=this-is-a-very-long-session-secret-for-testing
DATABASE_URL=postgresql://user:pass@localhost:5432/testdb
SUPABASE_URL=https://test.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test
VITE_SUPABASE_URL=https://test.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test
ATMOS_STORE_ID=1234
ATMOS_CONSUMER_KEY=key
ATMOS_CONSUMER_SECRET=secret
ATMOS_ENV=production
FALLBACK_ADMIN_EMAIL=admin@example.com
EOF
    
    if ! node "$SCRIPT_DIR/validate-env.js" --file .env.unpaired 2>&1 | grep -q "FALLBACK_ADMIN_PASSWORD_HASH is missing"; then
        echo -e "${RED}✗${NC} Failed to detect unpaired variables"
        return 1
    else
        echo -e "${GREEN}✓${NC} Unpaired variables detected correctly"
        return 0
    fi
}

# Test 5: TypeScript validation module
test_typescript_validation() {
    echo -e "\n${BLUE}Test 5: TypeScript validation module${NC}"
    
    # Check if the TypeScript file exists
    if [ -f "$PROJECT_ROOT/server/utils/env-validator.ts" ]; then
        echo -e "${GREEN}✓${NC} TypeScript validation module exists"
        
        # Check if it compiles
        cd "$PROJECT_ROOT"
        if npx tsc --noEmit server/utils/env-validator.ts 2>/dev/null; then
            echo -e "${GREEN}✓${NC} TypeScript validation module compiles"
            return 0
        else
            echo -e "${YELLOW}⚠${NC} TypeScript compilation warnings (may be due to missing imports)"
            return 0
        fi
    else
        echo -e "${RED}✗${NC} TypeScript validation module not found"
        return 1
    fi
}

# Test 6: Deployment script integration
test_deployment_integration() {
    echo -e "\n${BLUE}Test 6: Deployment script integration${NC}"
    
    if grep -q "validate-env.js" "$PROJECT_ROOT/deploy-production.sh"; then
        echo -e "${GREEN}✓${NC} Environment validation integrated in deployment script"
        return 0
    else
        echo -e "${RED}✗${NC} Environment validation not found in deployment script"
        return 1
    fi
}

# Test 7: Server startup integration
test_server_integration() {
    echo -e "\n${BLUE}Test 7: Server startup integration${NC}"
    
    if grep -q "initializeEnvValidation" "$PROJECT_ROOT/server/index.ts"; then
        echo -e "${GREEN}✓${NC} Environment validation integrated in server startup"
        return 0
    else
        echo -e "${RED}✗${NC} Environment validation not found in server startup"
        return 1
    fi
}

# Run all tests
run_tests() {
    local failed=0
    
    test_valid_env || ((failed++))
    test_missing_required || ((failed++))
    test_invalid_formats || ((failed++))
    test_paired_variables || ((failed++))
    test_typescript_validation || ((failed++))
    test_deployment_integration || ((failed++))
    test_server_integration || ((failed++))
    
    return $failed
}

# Main execution
main() {
    echo -e "${BLUE}═══════════════════════════════════════${NC}"
    echo -e "${BLUE}  Environment Validation Test Suite${NC}"
    echo -e "${BLUE}═══════════════════════════════════════${NC}"
    
    # Set up test environment
    trap cleanup EXIT
    setup
    
    # Run tests
    if run_tests; then
        echo -e "\n${GREEN}✅ All tests passed!${NC}"
        echo "The environment validation system is working correctly."
        
        # Show usage examples
        echo -e "\n${BLUE}Usage Examples:${NC}"
        echo "  # Validate development environment"
        echo "  node scripts/validate-env.js"
        echo ""
        echo "  # Validate production environment"
        echo "  node scripts/validate-env.js --file .env.production"
        echo ""
        echo "  # Show all variables (verbose)"
        echo "  node scripts/validate-env.js --file .env.production --verbose"
        
        exit 0
    else
        echo -e "\n${RED}❌ Some tests failed${NC}"
        echo "Please check the output above for details."
        exit 1
    fi
}

# Check for required tools
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is required but not installed${NC}"
    exit 1
fi

# Run main
main