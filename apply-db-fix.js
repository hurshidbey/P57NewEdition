// Apply database fix for payment_transactions_summary view
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load production environment
dotenv.config({ path: '.env.production' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const fixQuery = `
-- Fix payment_transactions_summary view to exclude coupon_code column
DROP VIEW IF EXISTS public.payment_transactions_summary CASCADE;

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
`;

console.log('🔧 Applying database fix for payment_transactions_summary view...');

// Execute directly using Supabase's postgres connection
async function applyFix() {
  try {
    // Use raw SQL execution through Supabase
    const { data, error } = await supabase.from('payment_transactions').select('id').limit(1);
    
    if (error && error.message.includes('coupon_code')) {
      console.log('❌ Confirmed: coupon_code column issue exists');
    }

    // Apply the fix by running raw SQL
    console.log('📦 Creating fixed view...');
    
    // Since we can't run raw DDL through Supabase client, we need to use a different approach
    console.log(`
⚠️  MANUAL FIX REQUIRED:

Please run the following SQL in your Supabase dashboard SQL editor:

${fixQuery}

1. Go to https://supabase.com/dashboard/project/bazptglwzqstppwlvmvb/sql/new
2. Paste the SQL above
3. Click "Run" to execute
4. The view will be recreated without the missing column

This will fix the Click.uz payment integration immediately.
`);

  } catch (err) {
    console.error('Error:', err);
  }
}

applyFix();