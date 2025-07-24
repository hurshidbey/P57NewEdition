#!/bin/bash

# Verify OAuth Payment Fix Deployment

echo "=== OAuth Payment Fix Verification ==="
echo "Time: $(date)"
echo ""

# 1. Check system health
echo "1. System Health Check:"
curl -s https://app.p57.uz/api/diagnostics/health 2>/dev/null | jq -r '.status' || echo "API not accessible"

# 2. Check for OAuth users without metadata
echo -e "\n2. OAuth Users Status:"
ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 \
  "docker compose exec -T protokol57 psql \$DATABASE_URL -t -c \"
  SELECT COUNT(*) as users_missing_metadata
  FROM auth.users 
  WHERE raw_user_meta_data->>'tier' IS NULL 
     OR raw_user_meta_data->>'name' IS NULL;\"" 2>/dev/null

# 3. Check payment transactions table
echo -e "\n3. Payment Transactions Table:"
ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 \
  "docker compose exec -T protokol57 psql \$DATABASE_URL -t -c \"
  SELECT 'Table exists' FROM information_schema.tables 
  WHERE table_name = 'payment_transactions';\"" 2>/dev/null

# 4. Test Click.uz V2 endpoint
echo -e "\n4. Click.uz V2 Status:"
curl -s https://app.p57.uz/api/click/test 2>/dev/null | jq -r '.version' || echo "Click V2 not accessible"

# 5. Check recent errors
echo -e "\n5. Recent Error Count (last 5 minutes):"
ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 \
  "docker logs protokol57-protokol57-1 --since 5m 2>&1 | grep -c ERROR || echo 0"

echo -e "\n✅ Deployment verification complete!"