-- Create user_progress table to track protocol completion and practice
CREATE TABLE user_progress (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  protocol_id INTEGER NOT NULL,
  completed_at TIMESTAMP DEFAULT NOW(),
  practice_count INTEGER DEFAULT 1,
  last_score INTEGER,
  UNIQUE(user_id, protocol_id)
);

-- Create index for faster queries
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_protocol_id ON user_progress(protocol_id);