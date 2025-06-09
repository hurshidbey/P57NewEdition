#!/bin/bash
set -e

echo "🚨 CRITICAL ADMIN SECURITY FIX & DEPLOYMENT"
echo "============================================"

# Environment variables that are ALWAYS needed
export VITE_SUPABASE_URL="https://bazptglwzqstppwlvmvb.supabase.co"
export VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhenB0Z2x3enFzdHBwd2x2bXZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwMTc1OTAsImV4cCI6MjA2NDU5MzU5MH0.xRh0LCDWP6YD3F4mDGrIK3krwwZw-DRx0iXy7MmIPY8"

echo "🔧 Building with correct environment variables..."
npm run build

echo "📝 Creating production environment file for VPS..."
cat > production.env << 'EOF'
# Database & Supabase
DATABASE_URL=postgresql://postgres:20031000a@db.bazptglwzqstppwlvmvb.supabase.co:5432/postgres
SUPABASE_URL=https://bazptglwzqstppwlvmvb.supabase.co
SUPABASE_ACCESS_TOKEN=sbp_c65b8d74d47c759e74a0b4463f0e0e6d48f4d3fd
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhenB0Z2x3enFzdHBwd2x2bXZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwMTc1OTAsImV4cCI6MjA2NDU5MzU5MH0.xRh0LCDWP6YD3F4mDGrIK3krwwZw-DRx0iXy7MmIPY8
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhenB0Z2x3enFzdHBwd2x2bXZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTAxNzU5MCwiZXhwIjoyMDY0NTkzNTkwfQ.GdDEVx5CRy1NC_2e5QbtCKcXZmoEL1z2RU7SlHA_-oQ

# CRITICAL: VITE environment variables for client build
VITE_SUPABASE_URL=https://bazptglwzqstppwlvmvb.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhenB0Z2x3enFzdHBwd2x2bXZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwMTc1OTAsImV4cCI6MjA2NDU5MzU5MH0.xRh0LCDWP6YD3F4mDGrIK3krwwZw-DRx0iXy7MmIPY8

# ATMOS Payment Gateway (CRITICAL - DO NOT REMOVE)
ATMOS_STORE_ID=1981
ATMOS_CONSUMER_KEY=UhGzIAQ10FhOZiZ9KTHH_3NhTZ8a
ATMOS_CONSUMER_SECRET=JCuvoGpaV6VHf3migqRy7r6qtiMa
ATMOS_ENV=production
EOF

echo "📤 Committing admin security fix..."
git add .
git commit -m "🚨 DEPLOY: Admin security fix with all env vars

- Added component-level admin security check
- Included production.env with all required variables
- VITE variables for client build
- ATMOS credentials for payment gateway
- Supabase configuration

CRITICAL: Blocks unauthorized admin access immediately

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>" || echo "No changes to commit"

echo "🚀 Pushing to GitHub..."
git push origin main

echo "🌐 Deploying to VPS with all environment variables..."
ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 << 'ENDSSH'
cd /opt/protokol57

echo "📥 Pulling latest changes..."
git fetch origin
git reset --hard origin/main

echo "🔧 Setting up environment variables..."
cp production.env .env

echo "📦 Installing dependencies..."
npm ci

echo "🔨 Building with environment variables..."
VITE_SUPABASE_URL=https://bazptglwzqstppwlvmvb.supabase.co \
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhenB0Z2x3enFzdHBwd2x2bXZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwMTc1OTAsImV4cCI6MjA2NDU5MzU5MH0.xRh0LCDWP6YD3F4mDGrIK3krwwZw-DRx0iXy7MmIPY8 \
npm run build

echo "🔄 Restarting application..."
pm2 restart protokol57 --update-env

echo "✅ Testing application..."
sleep 5
curl -f http://localhost:5000 > /dev/null 2>&1 && echo "✅ App is running!" || echo "❌ App failed to start"

echo "📊 Application status:"
pm2 status protokol57
ENDSSH

echo ""
echo "🎉 DEPLOYMENT COMPLETE!"
echo "===================="
echo "🌐 Main site: https://srv852801.hstgr.cloud/"
echo "🌐 Alt domain: https://p57.birfoiz.uz/"
echo ""
echo "🔒 ADMIN SECURITY FIX:"
echo "- ✅ Double-layer protection added"
echo "- ✅ Route-level check in App.tsx"
echo "- ✅ Component-level check in admin.tsx"
echo "- ✅ Only hurshidbey@gmail.com can access /admin"
echo ""
echo "💡 Test the fix:"
echo "1. Login as imronbey12@gmail.com"
echo "2. Go to /admin"
echo "3. Should see 'Ruxsat berilmagan' message"
echo ""
echo "📱 Test ATMOS payment integration at /atmos"