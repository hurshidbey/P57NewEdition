#!/bin/bash

# Script to apply payment_sessions migration to Supabase
# This creates the secure payment session tracking table

echo "🔄 Applying payment_sessions migration to Supabase..."

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "❌ Error: .env.production file not found"
    echo "Please ensure you have the production environment file"
    exit 1
fi

# Load environment variables
source .env.production

# Check required variables
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Error: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set"
    exit 1
fi

# Extract project ID from Supabase URL
PROJECT_ID=$(echo $SUPABASE_URL | sed -n 's/https:\/\/\([^.]*\)\.supabase\.co/\1/p')

if [ -z "$PROJECT_ID" ]; then
    echo "❌ Error: Could not extract project ID from SUPABASE_URL"
    exit 1
fi

echo "📦 Project ID: $PROJECT_ID"

# Apply migration using Supabase Management API
echo "🚀 Applying migration..."

# Read the migration file
MIGRATION_SQL=$(cat migrations/add_payment_sessions_table.sql)

# Execute the migration via Supabase SQL editor API
curl -X POST \
  "https://${PROJECT_ID}.supabase.co/rest/v1/rpc/exec_sql" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"query\": $(echo "$MIGRATION_SQL" | jq -Rs .)}"

# Alternative: Use the Supabase CLI if installed
if command -v supabase &> /dev/null; then
    echo "🔧 Supabase CLI detected, applying migration via CLI..."
    supabase db push --db-url "$DATABASE_URL" < migrations/add_payment_sessions_table.sql
else
    echo "💡 Tip: Install Supabase CLI for easier migration management"
    echo "   npm install -g supabase"
fi

echo "✅ Migration application complete!"
echo ""
echo "🔍 Next steps:"
echo "1. Verify the payment_sessions table exists in Supabase Studio"
echo "2. Check that all indexes were created successfully"
echo "3. Test the payment flow end-to-end"
echo ""
echo "📝 To verify the table was created:"
echo "   - Go to: https://app.supabase.com/project/${PROJECT_ID}/editor"
echo "   - Run: SELECT * FROM payment_sessions LIMIT 1;"

# Make script executable
chmod +x apply-payment-sessions-migration.sh