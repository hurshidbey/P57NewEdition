#!/bin/bash

# Fix OpenAI API key on production server
# This script updates the production environment with the proper OpenAI API key

echo "🔧 Fixing OpenAI API key on production server..."

# SSH into server and update the environment variable
ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 << 'EOF'
cd /opt/protokol57

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found in production!"
    exit 1
fi

# Check current OpenAI configuration
echo "📋 Current OpenAI configuration:"
grep OPENAI_API_KEY .env || echo "OPENAI_API_KEY not found"

# Instructions for manual update
echo ""
echo "⚠️  IMPORTANT: You need to manually add your OpenAI API key!"
echo ""
echo "1. Get your OpenAI API key from: https://platform.openai.com/api-keys"
echo "2. Run this command on the server:"
echo "   nano /opt/protokol57/.env"
echo "3. Find the line: OPENAI_API_KEY=your_openai_api_key_here"
echo "4. Replace 'your_openai_api_key_here' with your actual API key"
echo "5. Save the file (Ctrl+X, then Y, then Enter)"
echo "6. Restart the application:"
echo "   pm2 restart protokol57"
echo ""
echo "Alternatively, run this command with your actual API key:"
echo "sed -i 's/OPENAI_API_KEY=.*/OPENAI_API_KEY=sk-your-actual-key-here/' /opt/protokol57/.env"
echo ""

# Test if OpenAI is configured
if grep -q "OPENAI_API_KEY=your_openai_api_key_here" .env; then
    echo "❗ OpenAI API key is still using placeholder value!"
    echo "❗ AI evaluation will not work until you add a real API key!"
else
    echo "✅ OpenAI API key appears to be configured (not placeholder)"
fi

EOF

echo ""
echo "📝 Next steps:"
echo "1. SSH into the server: ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73"
echo "2. Add your OpenAI API key to /opt/protokol57/.env"
echo "3. Restart the app: pm2 restart protokol57"
echo ""
echo "Need an OpenAI API key? Get one at: https://platform.openai.com/api-keys"