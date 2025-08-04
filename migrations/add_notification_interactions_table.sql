-- Create notification_interactions table to track user engagement
CREATE TABLE IF NOT EXISTS notification_interactions (
  id SERIAL PRIMARY KEY,
  notification_id INTEGER NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE,
  dismissed_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Ensure one interaction record per user per notification
  UNIQUE(notification_id, user_id)
);

-- Add indexes for performance
CREATE INDEX idx_interactions_user ON notification_interactions(user_id);
CREATE INDEX idx_interactions_notification ON notification_interactions(notification_id);
CREATE INDEX idx_interactions_viewed ON notification_interactions(viewed_at);

-- Add comments for documentation
COMMENT ON TABLE notification_interactions IS 'Tracks how users interact with notifications';
COMMENT ON COLUMN notification_interactions.viewed_at IS 'When the user first saw the notification';
COMMENT ON COLUMN notification_interactions.dismissed_at IS 'When the user dismissed the notification';
COMMENT ON COLUMN notification_interactions.clicked_at IS 'When the user clicked the CTA button';