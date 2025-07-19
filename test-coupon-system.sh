#!/bin/bash

# Test script for coupon system validation
# This script tests various scenarios for the coupon system

echo "🧪 Testing Coupon System..."
echo "=========================="

BASE_URL="http://localhost:5001"

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Function to test coupon validation
test_coupon() {
    local code=$1
    local expected_status=$2
    local description=$3
    
    echo -e "\n🔍 Testing: $description"
    echo "   Code: $code"
    
    response=$(curl -s -X POST "$BASE_URL/api/coupons/validate" \
        -H "Content-Type: application/json" \
        -d "{\"code\": \"$code\", \"amount\": 1425000}" \
        -w "\n%{http_code}")
    
    http_code=$(echo "$response" | tail -n 1)
    body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" -eq "$expected_status" ]; then
        echo -e "   ${GREEN}✓ Status: $http_code (Expected: $expected_status)${NC}"
        echo "   Response: $body"
    else
        echo -e "   ${RED}✗ Status: $http_code (Expected: $expected_status)${NC}"
        echo "   Response: $body"
    fi
}

# Test 1: Valid coupon codes
echo -e "\n${YELLOW}=== Test 1: Valid Coupon Codes ===${NC}"
test_coupon "LAUNCH60" 200 "Valid percentage discount (60%)"
test_coupon "student50" 200 "Case-insensitive code (lowercase)"
test_coupon "EARLY500K" 200 "Fixed amount discount"

# Test 2: Invalid coupon codes
echo -e "\n${YELLOW}=== Test 2: Invalid Coupon Codes ===${NC}"
test_coupon "INVALID123" 404 "Non-existent coupon"
test_coupon "" 400 "Empty coupon code"
test_coupon "   " 400 "Whitespace-only coupon"

# Test 3: Calculate discounts
echo -e "\n${YELLOW}=== Test 3: Discount Calculations ===${NC}"
echo -e "\n📊 Validating LAUNCH60 (60% off):"
response=$(curl -s -X POST "$BASE_URL/api/coupons/validate" \
    -H "Content-Type: application/json" \
    -d '{"code": "LAUNCH60", "amount": 1425000}')

if echo "$response" | jq -e '.valid == true' > /dev/null 2>&1; then
    original=$(echo "$response" | jq -r '.coupon.originalAmount')
    discount=$(echo "$response" | jq -r '.coupon.discountAmount')
    final=$(echo "$response" | jq -r '.coupon.finalAmount')
    percent=$(echo "$response" | jq -r '.coupon.discountPercent')
    
    echo -e "   ${GREEN}✓ Valid coupon${NC}"
    echo "   Original: $original UZS"
    echo "   Discount: -$discount UZS ($percent%)"
    echo "   Final: $final UZS"
    
    # Verify calculation
    expected_discount=$((1425000 * 60 / 100))
    expected_final=$((1425000 - expected_discount))
    
    if [ "$final" -eq "$expected_final" ]; then
        echo -e "   ${GREEN}✓ Calculation correct${NC}"
    else
        echo -e "   ${RED}✗ Calculation error: Expected $expected_final, got $final${NC}"
    fi
else
    echo -e "   ${RED}✗ Failed to validate coupon${NC}"
fi

# Test 4: Admin functionality (requires auth token)
echo -e "\n${YELLOW}=== Test 4: Admin Functionality ===${NC}"
echo "   ⚠️  Note: Admin tests require authentication token"
echo "   To test admin functionality:"
echo "   1. Login to admin panel at $BASE_URL/admin"
echo "   2. Open browser developer tools"
echo "   3. Check Network tab for Authorization header"
echo "   4. Use the token to test admin endpoints"

# Test 5: Payment flow simulation
echo -e "\n${YELLOW}=== Test 5: Payment Flow Checklist ===${NC}"
echo "   [ ] Go to payment page: $BASE_URL/atmos-payment"
echo "   [ ] Enter coupon code: LAUNCH60"
echo "   [ ] Verify price changes from 1,425,000 to 570,000 UZS"
echo "   [ ] Complete payment with test card"
echo "   [ ] Check admin panel for usage count increase"
echo "   [ ] Verify user tier upgraded to 'paid'"

echo -e "\n${YELLOW}=== Test Summary ===${NC}"
echo "   - Test coupon validation endpoints"
echo "   - Verify case-insensitive matching"
echo "   - Check discount calculations"
echo "   - Manual testing required for:"
echo "     • Admin CRUD operations"
echo "     • Payment flow integration"
echo "     • Usage tracking"

echo -e "\n✅ Basic tests completed!"