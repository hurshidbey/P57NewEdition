#!/bin/bash

# Simple site health checker
# Run this locally to check if your site is working

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🏥 Checking Protokol57 Health..."
echo "================================"

# Check main site
echo -n "Main site (p57.birfoiz.uz): "
if curl -f -s --max-time 10 https://p57.birfoiz.uz > /dev/null; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ FAILED${NC}"
fi

# Check backup site
echo -n "Backup site (srv852801.hstgr.cloud): "
if curl -f -s --max-time 10 https://srv852801.hstgr.cloud > /dev/null; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${YELLOW}⚠️ WARNING${NC}"
fi

# Check API
echo -n "API endpoint: "
if curl -f -s --max-time 10 https://p57.birfoiz.uz/api/protocols | jq . > /dev/null 2>&1; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ FAILED${NC}"
fi

echo ""
echo "💡 If any checks fail, run: ./deploy-production.sh status"