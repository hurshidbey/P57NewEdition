# Manual Migration Instructions for Payment Sessions Table

Since automated migration is not working due to Supabase API limitations, please follow these manual steps:

## Step 1: Open Supabase SQL Editor

1. Go to: https://app.supabase.com/project/bazptglwzqstppwlvmvb/sql/new
2. You should see the SQL editor interface

## Step 2: Copy and Run the Migration

Copy the entire content from `/migrations/add_payment_sessions_table.sql` and paste it into the SQL editor, then click "Run".

Or copy this SQL directly:

```sql
-- Create payment_sessions table for better payment tracking
-- This addresses the security audit findings about fragile user ID extraction

CREATE TABLE IF NOT EXISTS payment_sessions (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL,
  user_email TEXT NOT NULL,
  amount INTEGER NOT NULL,
  original_amount INTEGER,
  discount_amount INTEGER DEFAULT 0,
  coupon_id INTEGER REFERENCES coupons(id),
  merchant_trans_id TEXT UNIQUE NOT NULL,
  click_trans_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT NOT NULL,
  idempotency_key TEXT UNIQUE NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  CONSTRAINT payment_sessions_status_check CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'expired'))
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_payment_sessions_user_id ON payment_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_sessions_status ON payment_sessions(status);
CREATE INDEX IF NOT EXISTS idx_payment_sessions_merchant_trans_id ON payment_sessions(merchant_trans_id);
CREATE INDEX IF NOT EXISTS idx_payment_sessions_click_trans_id ON payment_sessions(click_trans_id);
CREATE INDEX IF NOT EXISTS idx_payment_sessions_idempotency_key ON payment_sessions(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_payment_sessions_expires_at ON payment_sessions(expires_at);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_payment_sessions_updated_at ON payment_sessions;
CREATE TRIGGER update_payment_sessions_updated_at 
  BEFORE UPDATE ON payment_sessions 
  FOR EACH ROW 
  EXECUTE PROCEDURE update_updated_at_column();

-- Add comment explaining the table
COMMENT ON TABLE payment_sessions IS 'Tracks payment sessions to securely map payment callbacks to users without exposing user IDs in transaction IDs';
COMMENT ON COLUMN payment_sessions.idempotency_key IS 'Prevents duplicate payment creation for the same request';
COMMENT ON COLUMN payment_sessions.merchant_trans_id IS 'The transaction ID we send to payment provider (no user data)';
COMMENT ON COLUMN payment_sessions.expires_at IS 'When this payment session expires (typically 30 minutes after creation)';
```

## Step 3: Verify the Table Was Created

After running the migration, run this query to verify:

```sql
SELECT * FROM payment_sessions LIMIT 1;
```

You should see an empty result with all the columns properly defined.

## Step 4: Check Indexes

Run this query to verify all indexes were created:

```sql
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'payment_sessions';
```

You should see 6 indexes plus the primary key.

## Alternative: Use Supabase Dashboard Table Editor

If the SQL editor approach doesn't work:

1. Go to: https://app.supabase.com/project/bazptglwzqstppwlvmvb/editor
2. Click "New Table"
3. Create the table with these columns:
   - id (text, primary key)
   - user_id (uuid, not null)
   - user_email (text, not null)
   - amount (int8, not null)
   - original_amount (int8, nullable)
   - discount_amount (int8, default 0)
   - coupon_id (int8, nullable, foreign key to coupons.id)
   - merchant_trans_id (text, unique, not null)
   - click_trans_id (text, nullable)
   - status (text, not null, default 'pending')
   - payment_method (text, not null)
   - idempotency_key (text, unique, not null)
   - metadata (jsonb, nullable)
   - created_at (timestamptz, default now())
   - updated_at (timestamptz, default now())
   - expires_at (timestamptz, not null)

4. Add the check constraint for status field
5. Create the indexes manually