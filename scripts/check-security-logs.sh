#!/bin/bash

# Security Log Monitor for P57
# Checks for privilege escalation attempts in Docker logs

echo "🔍 P57 Security Log Monitor"
echo "=========================="
echo ""

# SSH to server and check logs
echo "📊 Checking server logs for security events..."
echo ""

ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 << 'EOF'
echo "🔍 Checking for privilege escalation attempts in the last 24 hours..."
echo ""

# Check Docker logs for security-related entries
docker logs protokol57-protokol57-1 --since=24h 2>&1 | grep -E "\[SECURITY\]|\[CRITICAL\]|privilege|escalation|unauthorized|tier.*manipulation" | tail -20

echo ""
echo "📊 Summary of tier access patterns:"
docker logs protokol57-protokol57-1 --since=24h 2>&1 | grep "accessing prompts with tier" | awk '{print $NF}' | sort | uniq -c

echo ""
echo "🔍 Checking for suspicious API requests:"
docker logs protokol57-protokol57-1 --since=24h 2>&1 | grep -E "tier=paid|tier='paid'|tier=\"paid\"" | tail -10

echo ""
echo "✅ Security log check completed"
EOF

echo ""
echo "✅ Security monitoring completed"