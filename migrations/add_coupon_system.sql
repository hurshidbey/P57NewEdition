-- Add coupon system tables and update payments table
-- Migration date: 2025-01-17

-- Update payments table to add coupon fields
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS coupon_id INTEGER,
ADD COLUMN IF NOT EXISTS original_amount INTEGER,
ADD COLUMN IF NOT EXISTS discount_amount INTEGER;

-- Create coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value INTEGER NOT NULL,
  original_price INTEGER NOT NULL DEFAULT 1425000,
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  valid_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  valid_until TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_by TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on coupon code for fast lookups
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(UPPER(code));
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(is_active) WHERE is_active = true;

-- Create coupon_usages table for tracking
CREATE TABLE IF NOT EXISTS coupon_usages (
  id SERIAL PRIMARY KEY,
  coupon_id INTEGER NOT NULL REFERENCES coupons(id),
  user_id TEXT,
  user_email TEXT,
  payment_id TEXT,
  original_amount INTEGER,
  discount_amount INTEGER,
  final_amount INTEGER,
  used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for coupon usage tracking
CREATE INDEX IF NOT EXISTS idx_coupon_usages_coupon_id ON coupon_usages(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usages_user_id ON coupon_usages(user_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usages_payment_id ON coupon_usages(payment_id);

-- Add foreign key constraint to payments table
ALTER TABLE payments 
ADD CONSTRAINT fk_payments_coupon_id 
FOREIGN KEY (coupon_id) 
REFERENCES coupons(id) 
ON DELETE SET NULL;

-- Insert example coupon codes
INSERT INTO coupons (code, description, discount_type, discount_value, max_uses, is_active, created_by) 
VALUES 
  ('LAUNCH60', 'Launch special - 60% off', 'percentage', 60, NULL, true, 'system'),
  ('STUDENT50', 'Student discount - 50% off', 'percentage', 50, NULL, true, 'system'),
  ('EARLY500K', 'Early bird - 500,000 UZS off', 'fixed', 500000, 100, true, 'system'),
  ('TEAM20', 'Team purchases - 20% off', 'percentage', 20, NULL, true, 'system')
ON CONFLICT (code) DO NOTHING;

-- Add comments for documentation
COMMENT ON TABLE coupons IS 'Stores discount coupon codes for promotional pricing';
COMMENT ON TABLE coupon_usages IS 'Tracks usage history of coupons for analytics and abuse prevention';
COMMENT ON COLUMN coupons.discount_type IS 'Type of discount: percentage (e.g., 60 for 60%) or fixed (e.g., 100000 for 100k UZS)';
COMMENT ON COLUMN coupons.max_uses IS 'Maximum number of times this coupon can be used. NULL means unlimited';