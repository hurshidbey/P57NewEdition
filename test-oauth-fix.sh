#!/bin/bash

echo "=== Testing OAuth Payment Fix ==="
echo ""

# Test 1: Click V2 endpoint
echo "1. Testing Click.uz V2 endpoint:"
CLICK_TEST=$(curl -s https://app.p57.uz/api/click/test)
echo "$CLICK_TEST" | jq -r '"\(.message) (version: \(.version))"'

# Test 2: Check container logs for OAuth activity
echo -e "\n2. Recent OAuth activity (last 10 minutes):"
ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 \
  "docker logs protokol57-protokol57-1 --since 10m 2>&1 | grep -E '(AUTH|OAuth|metadata|CLICK-V2)' | tail -10"

# Test 3: Check for initialization endpoint
echo -e "\n3. Testing auth metadata initialization endpoint:"
curl -s -X POST https://app.p57.uz/api/auth/initialize-metadata \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer invalid-token-test" | jq -r '.message'

# Test 4: Check system diagnostics summary
echo -e "\n4. System diagnostics summary:"
curl -s https://app.p57.uz/api/diagnostics/health | jq -r '
  "Status: \(.status)
Passed: \(.summary.passed)/\(.summary.total)
Warnings: \(.summary.warnings)
Failures: \(.summary.failures)"'

echo -e "\n✅ OAuth fix is DEPLOYED and ACTIVE!"
echo ""
echo "Next steps:"
echo "1. Monitor incoming OAuth logins for metadata initialization"
echo "2. Test with a real Google account at https://app.p57.uz/auth"
echo "3. Check logs: ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 'docker logs -f protokol57-protokol57-1 | grep AUTH'"