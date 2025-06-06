-- Create user_progress table for tracking protocol completion
CREATE TABLE IF NOT EXISTS user_progress (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    protocol_id INTEGER NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    practice_count INTEGER DEFAULT 1,
    last_score INTEGER,
    UNIQUE(user_id, protocol_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_protocol_id ON user_progress(protocol_id);

-- Insert a test record
INSERT INTO user_progress (user_id, protocol_id, last_score, practice_count) 
VALUES ('test-user-123', 1, 75, 1)
ON CONFLICT (user_id, protocol_id) DO UPDATE SET
    practice_count = user_progress.practice_count + 1,
    last_score = EXCLUDED.last_score,
    completed_at = NOW();