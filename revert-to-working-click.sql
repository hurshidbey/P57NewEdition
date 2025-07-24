-- EMERGENCY FIX: Drop all the broken stuff I added

-- 1. Drop the problematic view
DROP VIEW IF EXISTS public.payment_transactions_summary CASCADE;

-- 2. Drop the broken complete_payment_transaction function  
DROP FUNCTION IF EXISTS public.complete_payment_transaction(UUID, TEXT);

-- 3. Drop the update trigger function
DROP FUNCTION IF EXISTS public.update_payment_transaction_updated_at();

-- That's it! The original Click.uz should work without these