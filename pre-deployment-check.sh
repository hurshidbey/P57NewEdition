#!/bin/bash

# Pre-Deployment Checklist Script
# Ensures all conditions are met before deploying to production

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0
WARNINGS=0

echo "🔍 Pre-Deployment Checklist"
echo "==========================="
echo ""

# Function to check a condition
check() {
    local description=$1
    local command=$2
    local critical=${3:-true}
    
    echo -n "Checking: $description... "
    
    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PASSED${NC}"
        ((PASSED++))
        return 0
    else
        if [ "$critical" = true ]; then
            echo -e "${RED}✗ FAILED${NC}"
            ((FAILED++))
            return 1
        else
            echo -e "${YELLOW}⚠ WARNING${NC}"
            ((WARNINGS++))
            return 0
        fi
    fi
}

# Function to check file exists
check_file() {
    local file=$1
    local description=$2
    check "$description" "[ -f '$file' ]"
}

# Function to check command exists
check_command() {
    local cmd=$1
    local description=$2
    check "$description" "command -v $cmd"
}

echo "=== Local Environment Checks ==="
echo ""

# Check required files
check_file "package.json" "package.json exists"
check_file "docker-compose.prod.yml" "Production docker-compose file exists"
check_file ".env.production" "Production environment file exists"
check_file "Dockerfile" "Dockerfile exists"

# Check required commands
check_command "docker" "Docker is installed"
check_command "docker-compose" "Docker Compose is installed"
check_command "git" "Git is installed"
check_command "ssh" "SSH is installed"
check_command "curl" "Curl is installed"

# Check Docker is running
check "Docker daemon is running" "docker info"

# Check git status
echo ""
echo "=== Git Repository Checks ==="
echo ""

check "Working directory is clean" "[ -z \"\$(git status --porcelain)\" ]" false
check "On main branch" "[ \"\$(git branch --show-current)\" = 'main' ]"
check "Up to date with remote" "git fetch && [ \"\$(git rev-parse HEAD)\" = \"\$(git rev-parse @{u})\" ]" false

# Check configuration
echo ""
echo "=== Configuration Checks ==="
echo ""

# Run the validation script
if [ -f "./validate-config.sh" ]; then
    check "Configuration validation passes" "./validate-config.sh"
fi

# Check environment variables
check "VITE_SUPABASE_URL is set" "grep -q 'VITE_SUPABASE_URL=' .env.production && grep 'VITE_SUPABASE_URL=' .env.production | grep -qv '=$'"
check "VITE_SUPABASE_ANON_KEY is set" "grep -q 'VITE_SUPABASE_ANON_KEY=' .env.production && grep 'VITE_SUPABASE_ANON_KEY=' .env.production | grep -qv '=$'"
check "OPENAI_API_KEY is set" "grep -q 'OPENAI_API_KEY=' .env.production && grep 'OPENAI_API_KEY=' .env.production | grep -qv '=$'"
check "DATABASE_URL is set" "grep -q 'DATABASE_URL=' .env.production && grep 'DATABASE_URL=' .env.production | grep -qv '=$'"

# Check TypeScript compilation
echo ""
echo "=== Code Quality Checks ==="
echo ""

check "TypeScript compiles without errors" "npm run check" false

# Check SSH key
echo ""
echo "=== Deployment Access Checks ==="
echo ""

check_file "$HOME/.ssh/protokol57_ed25519" "SSH key exists"
check "SSH key has correct permissions" "[ \"\$(stat -f '%OLp' $HOME/.ssh/protokol57_ed25519 2>/dev/null || stat -c '%a' $HOME/.ssh/protokol57_ed25519 2>/dev/null)\" = '600' ]"

# Test SSH connection
check "Can connect to production server" "ssh -o ConnectTimeout=5 -o BatchMode=yes -i $HOME/.ssh/protokol57_ed25519 root@69.62.126.73 'echo connected' 2>/dev/null"

# Check current production health
echo ""
echo "=== Production Health Checks ==="
echo ""

check "Production site is accessible" "curl -f -s -o /dev/null https://p57.birfoiz.uz"
check "Production API is responding" "curl -f -s https://p57.birfoiz.uz/api/protocols?limit=1 > /dev/null"
check "Production health endpoint is healthy" "curl -f -s https://p57.birfoiz.uz/health | grep -q 'healthy'"

# Check disk space on server
if ssh -o ConnectTimeout=5 -o BatchMode=yes -i $HOME/.ssh/protokol57_ed25519 root@69.62.126.73 'df -h /opt' 2>/dev/null | awk 'NR==2 {print $5}' | grep -q '^[0-8][0-9]%$\|^[0-9]%$'; then
    echo -e "Checking: Server disk space... ${GREEN}✓ PASSED${NC}"
    ((PASSED++))
else
    echo -e "Checking: Server disk space... ${YELLOW}⚠ WARNING${NC} (Low disk space)"
    ((WARNINGS++))
fi

# Summary
echo ""
echo "==========================="
echo "Pre-Deployment Summary:"
echo "  ✓ Passed: $PASSED"
echo "  ✗ Failed: $FAILED"
echo "  ⚠ Warnings: $WARNINGS"
echo ""

if [ $FAILED -eq 0 ]; then
    if [ $WARNINGS -eq 0 ]; then
        echo -e "${GREEN}✅ All checks passed! Ready to deploy.${NC}"
    else
        echo -e "${YELLOW}⚠️  Some warnings detected but deployment can proceed.${NC}"
    fi
    exit 0
else
    echo -e "${RED}❌ Critical checks failed! Please fix issues before deploying.${NC}"
    echo ""
    echo "Common fixes:"
    echo "- Commit or stash changes: git add . && git commit -m 'message'"
    echo "- Switch to main branch: git checkout main"
    echo "- Pull latest changes: git pull origin main"
    echo "- Fix TypeScript errors: npm run check"
    exit 1
fi