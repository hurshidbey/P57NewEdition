-- Add payment_sessions table for tracking payment flow
CREATE TABLE IF NOT EXISTS payment_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_email TEXT NOT NULL,
  amount INTEGER NOT NULL,
  original_amount INTEGER,
  discount_amount INTEGER,
  coupon_id INTEGER REFERENCES coupons(id) ON DELETE SET NULL,
  merchant_trans_id TEXT NOT NULL UNIQUE,
  payment_method TEXT NOT NULL,
  idempotency_key TEXT NOT NULL UNIQUE,
  metadata JSONB,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_payment_sessions_merchant_trans_id ON payment_sessions(merchant_trans_id);
CREATE INDEX IF NOT EXISTS idx_payment_sessions_expires_at ON payment_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_payment_sessions_user_id ON payment_sessions(user_id);

-- Add comment
COMMENT ON TABLE payment_sessions IS 'Temporary storage for payment session data including coupon information';

-- Add cleanup function for expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_payment_sessions() 
RETURNS void AS $$
BEGIN
  DELETE FROM payment_sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup (Note: This requires pg_cron extension or manual scheduling)
-- Example: SELECT cron.schedule('cleanup-payment-sessions', '0 * * * *', 'SELECT cleanup_expired_payment_sessions();');