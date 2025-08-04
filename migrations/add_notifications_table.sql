-- Create notifications table for admin announcements
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  target_audience TEXT NOT NULL CHECK (target_audience IN ('all', 'free', 'paid')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  show_as_popup BOOLEAN NOT NULL DEFAULT false,
  priority INTEGER NOT NULL DEFAULT 0 CHECK (priority >= 0 AND priority <= 100),
  cta_text TEXT,
  cta_url TEXT,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Add indexes for better query performance
CREATE INDEX idx_notifications_active ON notifications(is_active);
CREATE INDEX idx_notifications_target ON notifications(target_audience);
CREATE INDEX idx_notifications_expires ON notifications(expires_at);
CREATE INDEX idx_notifications_priority ON notifications(priority DESC);

-- Add comment for documentation
COMMENT ON TABLE notifications IS 'Stores admin-created announcements and deals for users';
COMMENT ON COLUMN notifications.target_audience IS 'Who can see this notification: all users, free tier only, or paid tier only';
COMMENT ON COLUMN notifications.show_as_popup IS 'Whether to show as a popup when user logs in';
COMMENT ON COLUMN notifications.priority IS 'Higher priority notifications show first (0-100)';
COMMENT ON COLUMN notifications.cta_text IS 'Optional call-to-action button text';
COMMENT ON COLUMN notifications.cta_url IS 'Optional URL for the CTA button';