#!/bin/bash

# Quick script to fix admin access issues by assigning admin role to known admin users

echo "🔧 Fixing admin access for P57 platform..."
echo "This script will assign admin role to known admin users"
echo ""

# Known admin emails from CLAUDE.md
ADMIN_EMAILS=(
  "hurshidbey@gmail.com"
  "mustafaabdurahmonov7777@gmail.com"
)

echo "📧 Admin users to be configured:"
for email in "${ADMIN_EMAILS[@]}"; do
  echo "  - $email"
done
echo ""

# Check if we have the necessary environment
if [ ! -f ".env.production" ]; then
  echo "❌ Error: .env.production file not found"
  echo "Please ensure you're running this from the project root directory"
  exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# Run the assign-admin script
echo "🚀 Assigning admin roles..."
npm run assign-admin -- "${ADMIN_EMAILS[@]}"

echo ""
echo "✅ Admin access fix completed!"
echo ""
echo "Next steps:"
echo "1. Test admin access at: https://app.p57.uz/admin"
echo "2. If you still have issues, check the logs"
echo "3. To add more admins, run: npm run assign-admin -- new-admin@email.com"
echo ""
echo "For more details, see: docs/RBAC_MANAGEMENT.md"