#!/bin/bash

echo "🚨 EMERGENCY FIX: Fixing Click.uz payment integration"
echo "=================================================="

# Apply database fix directly
echo "📦 Applying database fixes..."
ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 << 'EOF'
cd /opt/protokol57

# Apply the view fix using Docker exec with psql
docker exec protokol57-protokol57-1 node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const fixQuery = \`
-- Emergency fix for payment_transactions_summary view
DROP VIEW IF EXISTS public.payment_transactions_summary;

CREATE OR REPLACE VIEW public.payment_transactions_summary AS
SELECT 
  pt.id,
  pt.user_id,
  pt.user_email,
  pt.merchant_trans_id,
  pt.external_trans_id,
  pt.payment_method,
  pt.original_amount,
  pt.discount_amount,
  pt.final_amount,
  pt.currency,
  pt.coupon_id,
  pt.status,
  pt.metadata,
  pt.error_message,
  pt.created_at,
  pt.updated_at,
  pt.completed_at,
  u.email as auth_user_email,
  u.raw_user_meta_data->>'name' as user_name,
  u.raw_user_meta_data->>'tier' as user_tier,
  c.code as coupon_code_used,
  c.discount_type as coupon_type,
  c.discount_value as coupon_value
FROM public.payment_transactions pt
LEFT JOIN auth.users u ON pt.user_id = u.id
LEFT JOIN public.coupons c ON pt.coupon_id = c.id
ORDER BY pt.created_at DESC;

GRANT SELECT ON public.payment_transactions_summary TO service_role;
\`;

(async () => {
  try {
    const { data, error } = await supabase.rpc('exec_sql', { query: fixQuery });
    if (error) {
      console.error('Failed to apply fix:', error);
      process.exit(1);
    }
    console.log('✅ Database view fixed successfully');
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();
"
EOF

echo ""
echo "🔄 Deploying code fix..."

# Commit and push the fix
git add -A
git commit -m "fix: Critical fix for Click.uz payment integration

- Fix mapToTransaction to read coupon_code from metadata
- Fix payment_transactions_summary view to exclude missing column
- Resolves 500 error on payment creation

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

git push origin main

# Deploy using the production script
echo ""
echo "🚀 Running production deployment..."
./deploy-production.sh

echo ""
echo "✅ Emergency fix deployed!"