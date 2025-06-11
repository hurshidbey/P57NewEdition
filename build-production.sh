#\!/bin/bash
set -e

echo "🔧 Building Protokol57 for production..."

# Load environment variables
echo "📋 Loading environment variables..."
if [ -f .env.production ]; then
    set -a
    source .env.production
    set +a
else
    echo "❌ .env.production file not found!"
    exit 1
fi

# Verify critical VITE_ variables
echo "🔍 Verifying frontend environment variables..."
if [ -z "$VITE_SUPABASE_URL" ]; then
    echo "❌ VITE_SUPABASE_URL is not set\!"
    exit 1
fi

if [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
    echo "❌ VITE_SUPABASE_ANON_KEY is not set\!"
    exit 1
fi

echo "✅ VITE_SUPABASE_URL: ${VITE_SUPABASE_URL:0:30}..."
echo "✅ VITE_SUPABASE_ANON_KEY: ${VITE_SUPABASE_ANON_KEY:0:30}..."

# Build with verified variables
echo "🏗️ Building application..."
export NODE_ENV=production
npm run build

echo "✅ Build complete with environment variables\!"
EOF < /dev/null