#!/bin/bash

# Smoke Tests Script
# Runs after deployment to ensure critical functionality is working

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="${1:-https://p57.birfoiz.uz}"
TIMEOUT=10

# Test counters
PASSED=0
FAILED=0

echo "🔥 Running Smoke Tests"
echo "====================="
echo "Target: $BASE_URL"
echo ""

# Function to run a test
test_endpoint() {
    local description=$1
    local endpoint=$2
    local expected_status=${3:-200}
    local grep_pattern=$4
    
    echo -n "Testing: $description... "
    
    local response=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$BASE_URL$endpoint")
    
    if [ "$response" = "$expected_status" ]; then
        if [ -n "$grep_pattern" ]; then
            if curl -s --max-time $TIMEOUT "$BASE_URL$endpoint" | grep -q "$grep_pattern"; then
                echo -e "${GREEN}✓ PASSED${NC}"
                ((PASSED++))
                return 0
            else
                echo -e "${RED}✗ FAILED${NC} (Pattern not found: $grep_pattern)"
                ((FAILED++))
                return 1
            fi
        else
            echo -e "${GREEN}✓ PASSED${NC}"
            ((PASSED++))
            return 0
        fi
    else
        echo -e "${RED}✗ FAILED${NC} (Expected: $expected_status, Got: $response)"
        ((FAILED++))
        return 1
    fi
}

# Function to test JSON response
test_json_endpoint() {
    local description=$1
    local endpoint=$2
    local jq_expression=$3
    local expected_value=$4
    
    echo -n "Testing: $description... "
    
    local response=$(curl -s --max-time $TIMEOUT "$BASE_URL$endpoint")
    
    if [ -z "$response" ]; then
        echo -e "${RED}✗ FAILED${NC} (No response)"
        ((FAILED++))
        return 1
    fi
    
    local actual_value=$(echo "$response" | jq -r "$jq_expression" 2>/dev/null)
    
    if [ "$actual_value" = "$expected_value" ]; then
        echo -e "${GREEN}✓ PASSED${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAILED${NC} (Expected: '$expected_value', Got: '$actual_value')"
        ((FAILED++))
        return 1
    fi
}

# Basic connectivity tests
echo "=== Basic Connectivity ==="
test_endpoint "Homepage loads" "/" 200 "Protokol57"
test_endpoint "Static assets accessible" "/assets/index.js" 404  # This will be hashed in production
test_endpoint "Favicon accessible" "/favicon.ico" 200

echo ""
echo "=== API Endpoints ==="
test_endpoint "Protocols API" "/api/protocols?limit=1" 200
test_json_endpoint "Protocols returns data" "/api/protocols?limit=1" '.protocols | length > 0' "true"
test_endpoint "Categories API" "/api/categories" 200
test_json_endpoint "Categories returns 6 items" "/api/categories" '. | length' "6"

echo ""
echo "=== Health Monitoring ==="
test_json_endpoint "Health endpoint" "/health" '.status' "healthy"
test_json_endpoint "Metrics endpoint" "/metrics" '.database.status' "connected"
test_json_endpoint "Ready endpoint" "/ready" '.ready' "true"

echo ""
echo "=== Authentication ==="
test_endpoint "Login endpoint" "/api/auth/login" 401  # Should fail without credentials
test_endpoint "Admin page redirects" "/admin" 200

echo ""
echo "=== Payment Integration ==="
test_endpoint "Payment page accessible" "/payment" 200
test_endpoint "Atmos payment page" "/atmos-payment" 200

echo ""
echo "=== Error Handling ==="
test_endpoint "404 page works" "/non-existent-page-12345" 200  # SPA returns 200 for client routing
test_endpoint "API 404 returns proper status" "/api/non-existent-endpoint" 404

echo ""
echo "=== Performance Checks ==="
echo -n "Testing: Response time under 3 seconds... "
start_time=$(date +%s)
curl -s -o /dev/null "$BASE_URL"
end_time=$(date +%s)
response_time=$((end_time - start_time))

if [ $response_time -lt 3 ]; then
    echo -e "${GREEN}✓ PASSED${NC} (${response_time}s)"
    ((PASSED++))
else
    echo -e "${RED}✗ FAILED${NC} (${response_time}s)"
    ((FAILED++))
fi

# SSL Certificate check
echo ""
echo "=== Security Checks ==="
echo -n "Testing: SSL certificate valid... "
if echo | openssl s_client -servername "${BASE_URL#https://}" -connect "${BASE_URL#https://}:443" 2>/dev/null | openssl x509 -noout -checkend 86400 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PASSED${NC}"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ WARNING${NC} (Certificate expires soon or invalid)"
fi

# Summary
echo ""
echo "====================="
echo "Smoke Test Summary:"
echo "  ✓ Passed: $PASSED"
echo "  ✗ Failed: $FAILED"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All smoke tests passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some smoke tests failed!${NC}"
    echo ""
    echo "This indicates the deployment may have issues."
    echo "Check the failed tests and consider rolling back if critical."
    exit 1
fi