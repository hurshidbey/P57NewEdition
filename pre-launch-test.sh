#!/bin/bash

# Protokol57 Pre-Launch Testing Script
# Run this before going live!

set -e

echo "🧪 Starting Protokol57 Pre-Launch Tests..."
echo "========================================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Base URLs
MAIN_URL="https://p57.birfoiz.uz"
API_URL="$MAIN_URL/api"
LANDING_URL="https://p57.uz"

# Test function
test_endpoint() {
    local url=$1
    local expected_code=$2
    local description=$3
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ "$response" -eq "$expected_code" ]; then
        echo -e "${GREEN}✓${NC} $description (HTTP $response)"
    else
        echo -e "${RED}✗${NC} $description (Expected $expected_code, got $response)"
        exit 1
    fi
}

# Test response time
test_performance() {
    local url=$1
    local max_time=$2
    local description=$3
    
    response_time=$(curl -s -o /dev/null -w "%{time_total}" "$url")
    
    if (( $(echo "$response_time < $max_time" | bc -l) )); then
        echo -e "${GREEN}✓${NC} $description (${response_time}s)"
    else
        echo -e "${RED}✗${NC} $description (${response_time}s > ${max_time}s max)"
    fi
}

echo ""
echo "1. Testing Landing Page..."
test_endpoint "$LANDING_URL" 200 "Landing page accessible"
test_performance "$LANDING_URL" 2.0 "Landing page loads fast"

echo ""
echo "2. Testing Main Application..."
test_endpoint "$MAIN_URL" 200 "Main app accessible"
test_performance "$MAIN_URL" 3.0 "Main app loads reasonably"

echo ""
echo "3. Testing API Endpoints..."
test_endpoint "$API_URL/protocols?page=1&limit=10" 200 "Protocols API"
test_endpoint "$API_URL/protocols/1" 200 "Single protocol API"
test_endpoint "$API_URL/prompts?tier=free" 200 "Prompts API"
test_endpoint "$API_URL/categories" 200 "Categories API"
test_endpoint "$API_URL/health" 200 "Health check"

echo ""
echo "4. Testing Error Handling..."
test_endpoint "$API_URL/protocols/99999" 404 "Non-existent protocol returns 404"
test_endpoint "$MAIN_URL/non-existent-page" 200 "Client-side 404 handling"

echo ""
echo "5. Testing Static Assets..."
# Get actual asset URLs from the HTML
ASSETS=$(curl -s "$MAIN_URL" | grep -o 'assets/[^"]*\.js' | head -3)
for asset in $ASSETS; do
    test_endpoint "$MAIN_URL/$asset" 200 "Asset: $asset"
done

echo ""
echo "6. Testing Security Headers..."
headers=$(curl -s -I "$MAIN_URL")
if echo "$headers" | grep -q "strict-transport-security"; then
    echo -e "${GREEN}✓${NC} HSTS header present"
else
    echo -e "${RED}✗${NC} HSTS header missing"
fi

if echo "$headers" | grep -q "x-content-type-options: nosniff"; then
    echo -e "${GREEN}✓${NC} X-Content-Type-Options header present"
else
    echo -e "${RED}✗${NC} X-Content-Type-Options header missing"
fi

echo ""
echo "7. Testing Rate Limiting..."
echo "Making 10 rapid requests..."
for i in {1..10}; do
    response=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/protocols")
    if [ "$response" -eq 429 ]; then
        echo -e "${GREEN}✓${NC} Rate limiting triggered at request $i"
        break
    fi
done

echo ""
echo "8. Testing Payment Integration..."
payment_response=$(curl -s -o /dev/null -w "%{http_code}" "$MAIN_URL/atmos-payment")
if [ "$payment_response" -eq 200 ]; then
    echo -e "${GREEN}✓${NC} Payment page accessible"
else
    echo -e "${RED}✗${NC} Payment page error (HTTP $payment_response)"
fi

echo ""
echo "9. Testing Database Connection..."
# This tests if the API can fetch data
protocols_count=$(curl -s "$API_URL/protocols?limit=1" | grep -o '"id":' | wc -l)
if [ "$protocols_count" -gt 0 ]; then
    echo -e "${GREEN}✓${NC} Database connection working"
else
    echo -e "${RED}✗${NC} Database connection issue"
fi

echo ""
echo "10. Checking SSL Certificate..."
ssl_info=$(echo | openssl s_client -servername p57.birfoiz.uz -connect p57.birfoiz.uz:443 2>/dev/null | openssl x509 -noout -dates 2>/dev/null)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} SSL certificate valid"
    echo "$ssl_info" | grep "notAfter"
else
    echo -e "${RED}✗${NC} SSL certificate issue"
fi

echo ""
echo "========================================="
echo "🎉 Pre-Launch Testing Complete!"
echo ""
echo "Next steps:"
echo "1. Test payment flow manually with test card"
echo "2. Create a test user and verify 3-protocol limit"
echo "3. Test on actual mobile devices"
echo "4. Monitor server resources during first hours"
echo ""