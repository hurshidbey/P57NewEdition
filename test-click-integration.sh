#!/bin/bash

# Click.uz Integration Test Script
# Run this after deployment to test the integration

echo "🧪 Click.uz Integration Test Suite"
echo "=================================="

# Configuration
BASE_URL="${1:-https://app.p57.uz}"
API_BASE="$BASE_URL/api"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Check Click endpoint availability
echo -e "\n${YELLOW}Test 1: Check Click.uz endpoint availability${NC}"
response=$(curl -s -o /dev/null -w "%{http_code}" "$API_BASE/click/test")
if [ "$response" = "200" ]; then
    echo -e "${GREEN}✓ Click.uz test endpoint is accessible${NC}"
    curl -s "$API_BASE/click/test" | jq .
else
    echo -e "${RED}✗ Click.uz test endpoint returned: $response${NC}"
fi

# Test 2: Create payment session
echo -e "\n${YELLOW}Test 2: Create Click.uz payment session${NC}"
payment_response=$(curl -s -X POST "$API_BASE/click/create-payment" \
    -H "Content-Type: application/json" \
    -d '{
        "amount": 1425000,
        "userId": "test-user-123",
        "userEmail": "test@example.com"
    }')

echo "$payment_response" | jq .

if echo "$payment_response" | jq -e '.success' > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Payment session created successfully${NC}"
    payment_url=$(echo "$payment_response" | jq -r '.paymentUrl')
    order_id=$(echo "$payment_response" | jq -r '.orderId')
    echo "Payment URL: $payment_url"
    echo "Order ID: $order_id"
else
    echo -e "${RED}✗ Failed to create payment session${NC}"
fi

# Test 3: Simulate Click.uz prepare callback
echo -e "\n${YELLOW}Test 3: Simulate Click.uz prepare callback${NC}"
prepare_response=$(curl -s -X POST "$API_BASE/click/pay" \
    -H "Content-Type: application/json" \
    -d '{
        "click_trans_id": "test-'$(date +%s)'",
        "service_id": 75582,
        "click_paydoc_id": "123456",
        "merchant_trans_id": "'${order_id:-test-order}'",
        "amount": 1425000,
        "action": 0,
        "error": 0,
        "error_note": "",
        "sign_time": "'$(date +%Y%m%d%H%M%S)'",
        "sign_string": "test-signature"
    }')

echo "$prepare_response" | jq .

# Test 4: Check payment status
echo -e "\n${YELLOW}Test 4: Check payment status${NC}"
status_response=$(curl -s "$API_BASE/click/status/${order_id:-test-order}")
echo "$status_response" | jq .

# Test 5: Test payment page
echo -e "\n${YELLOW}Test 5: Check payment page accessibility${NC}"
payment_page_response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/payment")
if [ "$payment_page_response" = "200" ]; then
    echo -e "${GREEN}✓ Payment page is accessible${NC}"
else
    echo -e "${RED}✗ Payment page returned: $payment_page_response${NC}"
fi

echo -e "\n=================================="
echo "Test suite completed!"