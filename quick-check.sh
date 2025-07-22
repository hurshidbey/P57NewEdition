#!/bin/bash
# Quick server check after reboot

echo "🔍 Quick Server Status Check"
echo "=========================="
echo -n "Server SSH: "
timeout 5 ssh -o BatchMode=yes -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 "echo 'ONLINE'" 2>/dev/null || echo "OFFLINE"

echo -n "Web Service: "
curl -s -o /dev/null -w "%{http_code}" -m 5 https://app.p57.uz 2>/dev/null || echo "DOWN"

echo "=========================="