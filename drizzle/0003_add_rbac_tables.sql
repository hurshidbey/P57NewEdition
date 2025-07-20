-- Add RBAC (Role-Based Access Control) tables

-- Roles table - defines different access levels
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  priority INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Permissions table - defines what actions can be performed
CREATE TABLE IF NOT EXISTS permissions (
  id SERIAL PRIMARY KEY,
  resource TEXT NOT NULL,
  action TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(resource, action)
);

-- Role-Permission junction table
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id INTEGER NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  granted_at TIMESTAMP DEFAULT NOW(),
  granted_by TEXT,
  PRIMARY KEY (role_id, permission_id)
);

-- User-Role junction table
CREATE TABLE IF NOT EXISTS user_roles (
  user_id TEXT NOT NULL,
  role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  granted_at TIMESTAMP DEFAULT NOW(),
  granted_by TEXT,
  expires_at TIMESTAMP,
  PRIMARY KEY (user_id, role_id)
);

-- Audit logs table - tracks all admin actions
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_email TEXT NOT NULL,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  resource_id TEXT,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  status TEXT NOT NULL,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Insert default roles
INSERT INTO roles (name, description, priority) VALUES
  ('super_admin', 'Full system access', 100),
  ('admin', 'General administrative access', 50),
  ('content_manager', 'Manage content only', 30),
  ('support', 'Customer support access', 20)
ON CONFLICT (name) DO NOTHING;

-- Insert default permissions
INSERT INTO permissions (resource, action, description) VALUES
  -- Protocol permissions
  ('protocols', 'read', 'View protocols'),
  ('protocols', 'create', 'Create new protocols'),
  ('protocols', 'update', 'Update existing protocols'),
  ('protocols', 'delete', 'Delete protocols'),
  ('protocols', 'toggle_free', 'Toggle free access for protocols'),
  
  -- Prompt permissions
  ('prompts', 'read', 'View prompts'),
  ('prompts', 'create', 'Create new prompts'),
  ('prompts', 'update', 'Update existing prompts'),
  ('prompts', 'delete', 'Delete prompts'),
  
  -- User permissions
  ('users', 'read', 'View user information'),
  ('users', 'update', 'Update user information'),
  ('users', 'delete', 'Delete users'),
  ('users', 'update_tier', 'Change user subscription tier'),
  
  -- Payment permissions
  ('payments', 'read', 'View payment information'),
  ('payments', 'refund', 'Process refunds'),
  
  -- Coupon permissions
  ('coupons', 'read', 'View coupons'),
  ('coupons', 'create', 'Create new coupons'),
  ('coupons', 'update', 'Update existing coupons'),
  ('coupons', 'delete', 'Delete coupons'),
  ('coupons', 'toggle', 'Enable/disable coupons'),
  
  -- Audit log permissions
  ('audit_logs', 'read', 'View audit logs'),
  
  -- Role permissions
  ('roles', 'read', 'View roles and permissions'),
  ('roles', 'create', 'Create new roles'),
  ('roles', 'update', 'Update roles and permissions'),
  ('roles', 'delete', 'Delete roles'),
  ('roles', 'assign', 'Assign roles to users')
ON CONFLICT (resource, action) DO NOTHING;

-- Grant permissions to roles
-- Super Admin gets everything
INSERT INTO role_permissions (role_id, permission_id, granted_by)
SELECT r.id, p.id, 'system'
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'super_admin'
ON CONFLICT DO NOTHING;

-- Admin gets most permissions except role management
INSERT INTO role_permissions (role_id, permission_id, granted_by)
SELECT r.id, p.id, 'system'
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'admin'
  AND NOT (p.resource = 'roles' AND p.action != 'read')
ON CONFLICT DO NOTHING;

-- Content Manager gets content permissions
INSERT INTO role_permissions (role_id, permission_id, granted_by)
SELECT r.id, p.id, 'system'
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'content_manager'
  AND p.resource IN ('protocols', 'prompts')
  AND p.action IN ('read', 'create', 'update')
ON CONFLICT DO NOTHING;

-- Support gets read-only access
INSERT INTO role_permissions (role_id, permission_id, granted_by)
SELECT r.id, p.id, 'system'
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'support'
  AND p.action = 'read'
  AND p.resource IN ('users', 'payments', 'coupons')
ON CONFLICT DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for roles table
DROP TRIGGER IF EXISTS update_roles_updated_at ON roles;
CREATE TRIGGER update_roles_updated_at
BEFORE UPDATE ON roles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();