#!/bin/bash
# Server Monitoring Script - Run this to check server status

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🔍 P57 Server Status Monitor${NC}"
echo "============================"
date

# Check all endpoints
declare -A endpoints=(
    ["Main Server IP"]="69.62.126.73:22"
    ["app.p57.uz HTTPS"]="app.p57.uz:443"
    ["p57.birfoiz.uz HTTPS"]="p57.birfoiz.uz:443"
    ["srv852801.hstgr.cloud"]="srv852801.hstgr.cloud:443"
)

for name in "${!endpoints[@]}"; do
    endpoint="${endpoints[$name]}"
    echo -n "Checking $name ($endpoint)... "
    
    if timeout 5 bash -c "echo >/dev/tcp/${endpoint%:*}/${endpoint#*:}" 2>/dev/null; then
        echo -e "${GREEN}✓ UP${NC}"
    else
        echo -e "${RED}✗ DOWN${NC}"
    fi
done

echo -e "\n${YELLOW}Detailed Network Diagnostics:${NC}"
echo "DNS Resolution:"
nslookup app.p57.uz | grep -A1 "Name:"

echo -e "\nPing Test (3 packets):"
ping -c 3 -W 2 69.62.126.73 2>&1 | grep -E "(packet loss|round-trip)"

echo -e "\n============================"
echo "Run './emergency-deploy.sh' when server is back online"