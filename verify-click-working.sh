#!/bin/bash

echo "🔍 Verifying Click.uz Integration Status"
echo "======================================="
echo ""

# Test the API endpoint
echo "Testing Click.uz test endpoint..."
curl -s https://app.p57.uz/api/click/test | jq '.'
echo ""

# Check for errors in logs
echo "Checking for recent errors..."
ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 \
  'docker logs --tail 10 protokol57-protokol57-1 2>&1 | grep -E "(Error|Failed|500|coupon_code|payment_transactions_summary)"' || echo "✅ No errors found"
echo ""

echo "Once you drop the view in Supabase, Click.uz payments will work again."