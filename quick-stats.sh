#!/bin/bash

# Quick stats checker - run this for instant metrics

echo "🔍 PROTOKOL57 QUICK STATS - $(date '+%H:%M:%S')"
echo "======================================="

# Get user count from last hour
echo -n "📊 New users (1hr): "
ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 "docker logs protokol57-protokol57-1 --since 1h 2>&1 | grep -c 'POST /api/auth/register'" 2>/dev/null || echo "0"

# Get payment attempts
echo -n "💳 Payment attempts (1hr): "
ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 "docker logs protokol57-protokol57-1 --since 1h 2>&1 | grep -c 'atmos-payment'" 2>/dev/null || echo "0"

# Get active sessions
echo -n "👥 Active sessions (5min): "
ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 "docker logs protokol57-protokol57-1 --since 5m 2>&1 | grep -oE '\[([0-9]{1,3}\.){3}[0-9]{1,3}\]' | sort -u | wc -l" 2>/dev/null || echo "0"

# Check for errors
echo -n "🚨 Errors (10min): "
ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 "docker logs protokol57-protokol57-1 --since 10m 2>&1 | grep -ciE '(error|failed|500)'" 2>/dev/null || echo "0"

# API performance
echo -n "⚡ API Response: "
curl -s -o /dev/null -w "%{time_total}s\n" "https://p57.birfoiz.uz/api/protocols?limit=1" 2>/dev/null || echo "FAILED"