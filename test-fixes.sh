#\!/bin/bash

# Test script to verify all fixes are in place

echo "Testing fixes before deployment..."
echo ""

# Check vite.config.ts
echo "1. Checking vite.config.ts for react-router-dom..."
if grep -q "react-router-dom" /Users/xb21/P57/vite.config.ts; then
    echo "   ✗ FAIL: react-router-dom still present in vite.config.ts"
else
    echo "   ✓ PASS: react-router-dom removed from vite.config.ts"
fi

# Check server/index.ts
echo "2. Checking server/index.ts for setupRoutes..."
if grep -q "setupRoutes" /Users/xb21/P57/server/index.ts; then
    echo "   ✓ PASS: server/index.ts uses setupRoutes"
else
    echo "   ✗ FAIL: server/index.ts not using setupRoutes"
fi

# Check for docker-compose.override.yml
echo "3. Checking for docker-compose.override.yml..."
if [ -f /Users/xb21/P57/docker-compose.override.yml ]; then
    echo "   ✗ FAIL: docker-compose.override.yml exists"
else
    echo "   ✓ PASS: docker-compose.override.yml not found"
fi

# Check brutal design files
echo "4. Checking brutal design files..."
if [ -f /Users/xb21/P57/client/public/critical-fix.css ]; then
    echo "   ✓ PASS: critical-fix.css exists"
else
    echo "   ✗ FAIL: critical-fix.css missing"
fi

if [ -f /Users/xb21/P57/client/public/fix-invisible-text.js ]; then
    echo "   ✓ PASS: fix-invisible-text.js exists"
else
    echo "   ✗ FAIL: fix-invisible-text.js missing"
fi

# Check deployment script
echo "5. Checking deployment script..."
if [ -x /Users/xb21/P57/deploy-production.sh ]; then
    echo "   ✓ PASS: deploy-production.sh is executable"
else
    echo "   ✗ FAIL: deploy-production.sh not executable"
fi

echo ""
echo "All tests completed\!"
