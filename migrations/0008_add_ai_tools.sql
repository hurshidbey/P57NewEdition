-- Add AI Tools tables
CREATE TABLE IF NOT EXISTS ai_tools (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  link TEXT NOT NULL,
  upvotes INTEGER NOT NULL DEFAULT 0,
  downvotes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_tool_votes (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  tool_id INTEGER NOT NULL REFERENCES ai_tools(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
  voted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, tool_id)
);

-- Create indexes for better performance
CREATE INDEX idx_ai_tool_votes_user_id ON ai_tool_votes(user_id);
CREATE INDEX idx_ai_tool_votes_tool_id ON ai_tool_votes(tool_id);
CREATE INDEX idx_ai_tools_upvotes ON ai_tools(upvotes DESC);
CREATE INDEX idx_ai_tools_downvotes ON ai_tools(downvotes DESC);