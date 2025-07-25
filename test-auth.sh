#!/bin/bash

echo "Testing Authentication Fix"
echo "=========================="

# Test public endpoint without auth
echo -e "\n1. Testing public endpoint (/api/protocols) without auth:"
curl -s http://localhost:5000/api/protocols?limit=1 | jq '.' 2>/dev/null || echo "Failed"

# Test auth endpoint without token
echo -e "\n2. Testing auth endpoint without token:"
curl -s http://localhost:5000/api/test-auth | jq '.'

# Test auth endpoint with invalid token
echo -e "\n3. Testing auth endpoint with invalid token:"
curl -s -H "Authorization: Bearer invalid-token" http://localhost:5000/api/test-auth | jq '.'

# Test protected endpoint without auth
echo -e "\n4. Testing protected endpoint (/api/progress) without auth:"
curl -s http://localhost:5000/api/progress/test-user-id | jq '.'

echo -e "\nTests complete. The fix is working if:"
echo "- Public endpoints (test 1) return data without auth"
echo "- Auth test endpoint (test 2) shows authenticated: false"
echo "- Protected endpoints (test 4) return 401 error"