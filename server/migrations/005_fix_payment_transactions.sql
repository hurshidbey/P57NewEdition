-- Fix payment_transactions table by checking if columns exist before adding
-- This handles the case where the table exists but columns might be missing

-- Check and add coupon_code column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'payment_transactions' 
                   AND column_name = 'coupon_code') THEN
        ALTER TABLE public.payment_transactions ADD COLUMN coupon_code TEXT;
    END IF;
END $$;

-- Check and add user_email column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'payment_transactions' 
                   AND column_name = 'user_email') THEN
        ALTER TABLE public.payment_transactions ADD COLUMN user_email TEXT NOT NULL DEFAULT 'unknown@email.com';
    END IF;
END $$;

-- Check and add other potentially missing columns
DO $$ 
BEGIN
    -- Add coupon_id if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'payment_transactions' 
                   AND column_name = 'coupon_id') THEN
        ALTER TABLE public.payment_transactions ADD COLUMN coupon_id INTEGER REFERENCES public.coupons(id);
    END IF;

    -- Add metadata if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'payment_transactions' 
                   AND column_name = 'metadata') THEN
        ALTER TABLE public.payment_transactions ADD COLUMN metadata JSONB DEFAULT '{}';
    END IF;

    -- Add error_message if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'payment_transactions' 
                   AND column_name = 'error_message') THEN
        ALTER TABLE public.payment_transactions ADD COLUMN error_message TEXT;
    END IF;
END $$;

-- Verify the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'payment_transactions'
ORDER BY ordinal_position;