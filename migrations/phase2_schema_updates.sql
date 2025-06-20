-- Phase 2: Database Schema Updates for Authentication Overhaul
-- Add accessedProtocolsCount to userProgress table and create prompts table

-- Add accessedProtocolsCount field to user_progress table
ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS accessed_protocols_count INTEGER DEFAULT 0;

-- Create prompts table for Premium Prompts system
CREATE TABLE IF NOT EXISTS prompts (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    is_premium BOOLEAN NOT NULL DEFAULT false,
    is_public BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Set existing users without tier to 'free' (in case there are any)
UPDATE users SET tier = 'free' WHERE tier IS NULL OR tier = '';

-- Create index on prompts for efficient filtering
CREATE INDEX IF NOT EXISTS idx_prompts_premium ON prompts(is_premium);
CREATE INDEX IF NOT EXISTS idx_prompts_public ON prompts(is_public);
CREATE INDEX IF NOT EXISTS idx_prompts_category ON prompts(category);

-- Create index on user_progress for efficient counting
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);