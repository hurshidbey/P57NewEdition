-- Add 'coupon' as a valid payment method for 100% discount scenarios
-- This allows us to track when users upgrade via 100% discount coupons without going through payment gateways

-- Drop the existing constraint
ALTER TABLE public.payment_transactions 
DROP CONSTRAINT payment_transactions_payment_method_check;

-- Add the new constraint that includes 'coupon' as a valid payment method
ALTER TABLE public.payment_transactions 
ADD CONSTRAINT payment_transactions_payment_method_check 
CHECK (payment_method IN ('click', 'atmos', 'coupon'));

-- Add comment to document this change
COMMENT ON COLUMN public.payment_transactions.payment_method IS 
'Payment method used: click (Click.uz), atmos (Atmosfera), coupon (100% discount coupon - no payment gateway)';