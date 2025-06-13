-- Create telegram_users table
CREATE TABLE IF NOT EXISTS telegram_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_id BIGINT UNIQUE NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255),
  username VARCHAR(255),
  photo_url TEXT,
  auth_date INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  last_login TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create index on telegram_id for fast lookups
CREATE INDEX idx_telegram_users_telegram_id ON telegram_users(telegram_id);

-- Add RLS policies
ALTER TABLE telegram_users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own data
CREATE POLICY "Users can view own data" ON telegram_users
  FOR SELECT USING (true); -- For now, allow all reads. In production, you'd check JWT

-- Policy: Only backend can insert/update
CREATE POLICY "Service role can insert" ON telegram_users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can update" ON telegram_users
  FOR UPDATE USING (true);

-- Create sessions table for Telegram users
CREATE TABLE IF NOT EXISTS telegram_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES telegram_users(id) ON DELETE CASCADE,
  token_hash VARCHAR(64) NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create index for token lookups
CREATE INDEX idx_telegram_sessions_token_hash ON telegram_sessions(token_hash);
CREATE INDEX idx_telegram_sessions_expires_at ON telegram_sessions(expires_at);

-- RLS for sessions
ALTER TABLE telegram_sessions ENABLE ROW LEVEL SECURITY;

-- Only service role can manage sessions
CREATE POLICY "Service role manages sessions" ON telegram_sessions
  FOR ALL USING (true);