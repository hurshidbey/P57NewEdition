# Role-Based Access Control (RBAC) Design

## Overview
Transform the current simple email-based admin system into a comprehensive RBAC system with roles, permissions, and audit logging.

## Database Schema

### 1. Roles Table
```sql
CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  priority INTEGER NOT NULL DEFAULT 0, -- Higher number = higher priority
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 2. Permissions Table
```sql
CREATE TABLE permissions (
  id SERIAL PRIMARY KEY,
  resource TEXT NOT NULL, -- e.g., 'protocols', 'users', 'payments'
  action TEXT NOT NULL,   -- e.g., 'read', 'create', 'update', 'delete'
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(resource, action)
);
```

### 3. Role Permissions Junction Table
```sql
CREATE TABLE role_permissions (
  role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
  permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
  granted_at TIMESTAMP DEFAULT NOW(),
  granted_by TEXT,
  PRIMARY KEY (role_id, permission_id)
);
```

### 4. User Roles Junction Table
```sql
CREATE TABLE user_roles (
  user_id TEXT NOT NULL, -- Supabase user ID
  role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
  granted_at TIMESTAMP DEFAULT NOW(),
  granted_by TEXT,
  expires_at TIMESTAMP, -- Optional: for temporary roles
  PRIMARY KEY (user_id, role_id)
);
```

### 5. Audit Logs Table
```sql
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_email TEXT NOT NULL,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  resource_id TEXT,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  status TEXT NOT NULL, -- 'success', 'failed', 'denied'
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for fast queries
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource, resource_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
```

## Default Roles and Permissions

### 1. Super Admin
- **Description**: Full system access
- **Priority**: 100
- **Permissions**: ALL

### 2. Admin
- **Description**: General administrative access
- **Priority**: 50
- **Permissions**:
  - protocols:* (all actions)
  - prompts:* (all actions)
  - users:read
  - payments:read
  - coupons:* (all actions)

### 3. Content Manager
- **Description**: Manage content only
- **Priority**: 30
- **Permissions**:
  - protocols:read, protocols:create, protocols:update
  - prompts:read, prompts:create, prompts:update

### 4. Support
- **Description**: Customer support access
- **Priority**: 20
- **Permissions**:
  - users:read
  - payments:read
  - coupons:read

## Permission Structure

### Resources and Actions
1. **protocols**: read, create, update, delete, toggle_free
2. **prompts**: read, create, update, delete
3. **users**: read, update, delete, update_tier
4. **payments**: read, refund
5. **coupons**: read, create, update, delete, toggle
6. **audit_logs**: read
7. **roles**: read, create, update, delete, assign

## Implementation Plan

### Phase 1: Database Setup
1. Create all RBAC tables
2. Migrate existing admin emails to user_roles
3. Seed default roles and permissions

### Phase 2: Middleware Implementation
1. Create permission checking middleware
2. Replace `isSupabaseAdmin` with role-based checks
3. Add audit logging to all admin actions

### Phase 3: API Updates
1. Add role management endpoints
2. Add permission checking to all admin routes
3. Add audit log viewing endpoints

### Phase 4: UI Implementation
1. Create role management interface
2. Add audit log viewer
3. Update admin panel with role indicators

## Security Considerations

1. **Role Hierarchy**: Higher priority roles inherit lower priority permissions
2. **Least Privilege**: Users get minimum permissions needed
3. **Audit Everything**: All admin actions are logged
4. **Session Management**: Admin sessions expire after inactivity
5. **IP Restrictions**: Optional IP allowlist for admin access

## Migration Strategy

1. **Backward Compatibility**: Keep ADMIN_EMAILS working during transition
2. **Gradual Rollout**: Test with subset of admins first
3. **Rollback Plan**: Keep old system functional until fully migrated
4. **Data Migration**: Convert existing admins to new role system

## API Design

### Check Permissions
```typescript
// Middleware usage
app.get("/api/admin/protocols", 
  requireAuth,
  requirePermission('protocols', 'read'),
  async (req, res) => { ... }
);

// Multiple permissions
app.post("/api/admin/protocols", 
  requireAuth,
  requirePermission('protocols', 'create'),
  auditLog('protocols', 'create'),
  async (req, res) => { ... }
);
```

### Role Management
```typescript
// Assign role
POST /api/admin/roles/assign
{
  userId: "user-id",
  roleId: 2,
  expiresAt?: "2024-12-31"
}

// Remove role
DELETE /api/admin/roles/assign/:userId/:roleId

// List user roles
GET /api/admin/users/:userId/roles

// List role permissions
GET /api/admin/roles/:roleId/permissions
```

### Audit Logs
```typescript
// Query audit logs
GET /api/admin/audit-logs?
  userId=xxx&
  resource=protocols&
  action=delete&
  from=2024-01-01&
  to=2024-12-31&
  status=success
```

## Benefits

1. **Granular Control**: Precise permission management
2. **Scalability**: Easy to add new roles and permissions
3. **Compliance**: Full audit trail for all actions
4. **Security**: Reduced risk of privilege escalation
5. **Flexibility**: Temporary roles, custom permissions
6. **Transparency**: Clear who can do what