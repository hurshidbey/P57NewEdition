-- Fix payment_transactions_summary view to handle missing coupon_code column
-- This view was using pt.* which includes the non-existent coupon_code column

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

-- Grant read access to the view
GRANT SELECT ON public.payment_transactions_summary TO service_role;