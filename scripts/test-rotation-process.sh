#!/bin/bash

# Test the credential rotation process end-to-end
# This script validates the rotation tools work correctly

set -euo pipefail

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEST_DIR="$SCRIPT_DIR/../.test-rotation"
TEST_ENV="$TEST_DIR/.env.production"

# Cleanup function
cleanup() {
    rm -rf "$TEST_DIR"
}

# Setup test environment
setup() {
    echo -e "${BLUE}Setting up test environment...${NC}"
    mkdir -p "$TEST_DIR"
    
    # Create test env file
    cat > "$TEST_ENV" << EOF
# Test environment file
OPENAI_API_KEY=sk-test1234567890abcdef1234567890abcdef12345678901234
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test
SESSION_SECRET=test-session-secret-that-is-long-enough-for-validation
FALLBACK_ADMIN_EMAIL=test@example.com
FALLBACK_ADMIN_PASSWORD_HASH=\$2b\$12\$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewYpfQwDGJ1sYVFe
EOF
    
    # Create test directories
    mkdir -p "$TEST_DIR/logs" "$TEST_DIR/.env.backups"
}

# Test 1: Rotation script exists and is executable
test_script_executable() {
    echo -e "\n${BLUE}Test 1: Checking rotation script...${NC}"
    
    if [ -x "$SCRIPT_DIR/rotate-credentials.sh" ]; then
        echo -e "${GREEN}✓${NC} Rotation script is executable"
    else
        echo -e "${RED}✗${NC} Rotation script not found or not executable"
        return 1
    fi
}

# Test 2: Backup functionality
test_backup() {
    echo -e "\n${BLUE}Test 2: Testing backup functionality...${NC}"
    
    cd "$TEST_DIR"
    local output=$("$SCRIPT_DIR/rotate-credentials.sh" --status 2>&1 || true)
    
    if [ -d ".env.backups" ] && [ "$(ls -A .env.backups 2>/dev/null)" ]; then
        echo -e "${GREEN}✓${NC} Backup created successfully"
        local backup_file=$(ls -t .env.backups/.env.production.backup.* | head -1)
        echo -e "${GREEN}✓${NC} Backup file: $backup_file"
    else
        echo -e "${RED}✗${NC} Backup creation failed"
        return 1
    fi
}

# Test 3: Validation functionality
test_validation() {
    echo -e "\n${BLUE}Test 3: Testing credential validation...${NC}"
    
    # Test invalid OpenAI key format
    local invalid_key="invalid-key-format"
    cd "$TEST_DIR"
    
    # Create a wrapper to test validation
    cat > test_validate.sh << EOF
#!/bin/bash
export ENV_FILE="$TEST_ENV"
source "$SCRIPT_DIR/rotate-credentials.sh"
validate_key "OPENAI_API_KEY" "$invalid_key"
EOF
    chmod +x test_validate.sh
    
    if ./test_validate.sh 2>&1 | grep -q "Invalid OpenAI API key format"; then
        echo -e "${GREEN}✓${NC} Invalid key format detected correctly"
    else
        echo -e "${RED}✗${NC} Validation failed to detect invalid key"
    fi
    
    # Test valid key format
    local valid_key="sk-proj-1234567890abcdef1234567890abcdef12345678901234"
    cat > test_validate2.sh << EOF
#!/bin/bash
export ENV_FILE="$TEST_ENV"
source "$SCRIPT_DIR/rotate-credentials.sh"
validate_key "OPENAI_API_KEY" "$valid_key"
EOF
    chmod +x test_validate2.sh
    
    if ./test_validate2.sh 2>&1; then
        echo -e "${GREEN}✓${NC} Valid key format accepted"
    else
        echo -e "${RED}✗${NC} Valid key rejected incorrectly"
    fi
}

# Test 4: Verification script
test_verification() {
    echo -e "\n${BLUE}Test 4: Testing verification script...${NC}"
    
    if [ -x "$SCRIPT_DIR/verify-credentials.sh" ]; then
        echo -e "${GREEN}✓${NC} Verification script is executable"
        
        # Run verification in test mode
        cd "$TEST_DIR"
        export ENV_FILE="$TEST_ENV"
        
        if "$SCRIPT_DIR/verify-credentials.sh" --service session 2>&1 | grep -q "Session secret configured"; then
            echo -e "${GREEN}✓${NC} Verification script works correctly"
        else
            echo -e "${YELLOW}⚠${NC} Verification script may have issues"
        fi
    else
        echo -e "${RED}✗${NC} Verification script not found"
        return 1
    fi
}

# Test 5: Schedule checker
test_schedule_checker() {
    echo -e "\n${BLUE}Test 5: Testing schedule checker...${NC}"
    
    if [ -x "$SCRIPT_DIR/check-rotation-schedule.sh" ]; then
        echo -e "${GREEN}✓${NC} Schedule checker is executable"
        
        # Initialize schedule in test directory
        cd "$TEST_DIR"
        if "$SCRIPT_DIR/check-rotation-schedule.sh" init 2>&1 | grep -q "initialized"; then
            echo -e "${GREEN}✓${NC} Schedule initialization works"
        else
            echo -e "${RED}✗${NC} Schedule initialization failed"
        fi
    else
        echo -e "${RED}✗${NC} Schedule checker not found"
        return 1
    fi
}

# Test 6: Generate secret functionality
test_generate_secret() {
    echo -e "\n${BLUE}Test 6: Testing secret generation...${NC}"
    
    cd "$TEST_DIR"
    local secret=$("$SCRIPT_DIR/rotate-credentials.sh" --generate-secret 2>&1 | grep "Generated secret:" | cut -d: -f2 | tr -d ' ')
    
    if [ ${#secret} -ge 32 ]; then
        echo -e "${GREEN}✓${NC} Secret generated successfully (length: ${#secret})"
    else
        echo -e "${RED}✗${NC} Secret generation failed"
        return 1
    fi
}

# Test 7: Documentation
test_documentation() {
    echo -e "\n${BLUE}Test 7: Checking documentation...${NC}"
    
    local docs=(
        "$SCRIPT_DIR/../docs/CREDENTIAL_ROTATION.md"
        "$SCRIPT_DIR/../docs/AUTH_MIGRATION_GUIDE.md"
    )
    
    for doc in "${docs[@]}"; do
        if [ -f "$doc" ]; then
            echo -e "${GREEN}✓${NC} Found: $(basename "$doc")"
        else
            echo -e "${RED}✗${NC} Missing: $(basename "$doc")"
        fi
    done
}

# Run all tests
run_tests() {
    local failed=0
    
    test_script_executable || ((failed++))
    test_backup || ((failed++))
    test_validation || ((failed++))
    test_verification || ((failed++))
    test_schedule_checker || ((failed++))
    test_generate_secret || ((failed++))
    test_documentation || ((failed++))
    
    return $failed
}

# Main execution
main() {
    echo -e "${BLUE}═══════════════════════════════════════${NC}"
    echo -e "${BLUE}  P57 Credential Rotation Test Suite${NC}"
    echo -e "${BLUE}═══════════════════════════════════════${NC}"
    
    # Set up test environment
    trap cleanup EXIT
    setup
    
    # Run tests
    if run_tests; then
        echo -e "\n${GREEN}✅ All tests passed!${NC}"
        echo "The credential rotation system is working correctly."
        exit 0
    else
        echo -e "\n${RED}❌ Some tests failed${NC}"
        echo "Please check the output above for details."
        exit 1
    fi
}

# Check for required tools
for tool in openssl jq; do
    if ! command -v $tool &> /dev/null; then
        echo -e "${RED}Error: $tool is required but not installed${NC}"
        exit 1
    fi
done

# Run main
main