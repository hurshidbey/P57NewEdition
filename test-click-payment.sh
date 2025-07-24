#!/bin/bash

echo "🧪 Testing Click.uz Payment Integration"
echo "======================================"
echo ""

# Get a real user from the database
echo "📋 Finding a test user..."
TEST_USER=$(ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 \
  'docker logs --tail 100 protokol57-protokol57-1 2>&1 | grep "Auth state changed" | tail -1 | grep -o "id:[^,]*" | cut -d: -f2 | tr -d " "')

if [ -z "$TEST_USER" ]; then
  echo "❌ No test user found in recent logs"
  echo "Using a known user ID instead..."
  TEST_USER="1c016038-39aa-4358-89d4-f87eb5444ce4"
fi

echo "Using user ID: $TEST_USER"
echo ""

# Test creating a Click.uz transaction
echo "🔄 Creating Click.uz transaction..."
RESPONSE=$(curl -s -X POST https://app.p57.uz/api/click/create-transaction \
  -H "Content-Type: application/json" \
  -d "{\"userId\":\"$TEST_USER\",\"amount\":497000}")

echo "Response: $RESPONSE"
echo ""

# Check if we got a payment URL
if echo "$RESPONSE" | grep -q "paymentUrl"; then
  echo "✅ SUCCESS! Click.uz integration is working!"
  echo ""
  echo "Payment URL generated:"
  echo "$RESPONSE" | jq -r '.paymentUrl'
else
  echo "❌ FAILED! Click.uz integration is still broken"
  echo ""
  echo "Checking server logs for errors..."
  ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 \
    'docker logs --tail 20 protokol57-protokol57-1 2>&1 | grep -E "(Error|Failed|500|coupon)"'
fi