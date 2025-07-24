-- EMERGENCY FIX: Just drop the problematic view entirely
-- The view is not critical for Click.uz to work

DROP VIEW IF EXISTS public.payment_transactions_summary CASCADE;