#!/bin/bash

echo "🧹 Cleaning up all processes and starting fresh..."

# Kill all node processes related to this project
echo "Killing existing processes..."
pkill -f "tsx.*server" 2>/dev/null || true
pkill -f "node.*dist" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true

# Wait a moment
sleep 2

# Clear any port that might be in use
echo "Checking ports..."
for port in 3333 5000 5757 3001; do
    lsof -ti:$port | xargs kill -9 2>/dev/null || true
done

# Clear browser cache instruction
echo ""
echo "🚨 IMPORTANT: Open your browser and:"
echo "1. Go to http://localhost:3333"
echo "2. Open Developer Tools (F12)"
echo "3. Right-click refresh button → 'Empty Cache and Hard Reload'"
echo ""

# Start development server  
echo "🚀 Starting development server on port 3333..."
cd /Users/xb21/P57
NODE_ENV=development npm run dev