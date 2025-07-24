#!/bin/bash

# Emergency fix for payment_transactions table

DATABASE_URL="postgresql://postgres:20031000a@db.bazptglwzqstppwlvmvb.supabase.co:5432/postgres"

echo "Applying emergency fix to payment_transactions table..."

# Apply the fix using psql
psql "$DATABASE_URL" << 'EOF'
-- Check if payment_transactions table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'payment_transactions'
) as table_exists;

-- If table doesn't exist, create it
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables 
                   WHERE table_schema = 'public' 
                   AND table_name = 'payment_transactions') THEN
        -- Create the full table
        CREATE TABLE public.payment_transactions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL,
          user_email TEXT NOT NULL,
          merchant_trans_id TEXT UNIQUE NOT NULL,
          external_trans_id TEXT,
          payment_method TEXT NOT NULL CHECK (payment_method IN ('click', 'atmos')),
          original_amount DECIMAL(10, 2) NOT NULL,
          discount_amount DECIMAL(10, 2) DEFAULT 0,
          final_amount DECIMAL(10, 2) NOT NULL,
          currency TEXT DEFAULT 'UZS',
          coupon_id INTEGER,
          coupon_code TEXT,
          status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded')),
          metadata JSONB DEFAULT '{}',
          error_message TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          completed_at TIMESTAMP WITH TIME ZONE
        );
    ELSE
        -- Table exists, add missing columns
        -- Add coupon_code if missing
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_schema = 'public' 
                       AND table_name = 'payment_transactions' 
                       AND column_name = 'coupon_code') THEN
            ALTER TABLE public.payment_transactions ADD COLUMN coupon_code TEXT;
        END IF;

        -- Add user_email if missing
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_schema = 'public' 
                       AND table_name = 'payment_transactions' 
                       AND column_name = 'user_email') THEN
            ALTER TABLE public.payment_transactions ADD COLUMN user_email TEXT NOT NULL DEFAULT 'unknown@email.com';
        END IF;
    END IF;
END $$;

-- Show final table structure
\d payment_transactions
EOF

echo "Fix applied!"