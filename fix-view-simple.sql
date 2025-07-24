-- Simple fix: Just select from payment_transactions without the problematic coupon_code
DROP VIEW IF EXISTS public.payment_transactions_summary CASCADE;

-- First, let's check what columns actually exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'payment_transactions'
ORDER BY ordinal_position;