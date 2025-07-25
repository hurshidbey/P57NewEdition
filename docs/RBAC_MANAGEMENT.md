# RBAC (Role-Based Access Control) Management Guide

## Overview

The P57 platform uses a comprehensive Role-Based Access Control (RBAC) system to manage user permissions. This guide explains how to manage roles and permissions for admin users.

## Problem: Admin API Endpoints Returning 403 Forbidden

### Root Cause
The RBAC system was implemented but users were not assigned any roles, causing all admin API endpoints to return 403 Forbidden errors.

### Solution
Users need to be assigned appropriate roles (like `admin`) to access admin endpoints.

## Quick Start: Assign Admin Role

To assign admin role to users, run:

```bash
# Assign admin role to specific users
npm run assign-admin -- hurshidbey@gmail.com mustafaabdurahmonov7777@gmail.com

# Or assign to any email
npm run assign-admin -- user@example.com
```

## System Architecture

### Tables

1. **roles** - Defines different access levels
   - `super_admin` - Full system access (priority: 100)
   - `admin` - General administrative access (priority: 50)
   - `content_manager` - Manage content only (priority: 30)
   - `support` - Customer support access (priority: 20)

2. **permissions** - Defines what actions can be performed
   - Resources: protocols, prompts, users, payments, coupons, audit_logs, roles
   - Actions: read, create, update, delete, toggle_free, update_tier, refund, toggle, assign

3. **role_permissions** - Links roles to permissions

4. **user_roles** - Links users to roles

5. **audit_logs** - Tracks all admin actions

### Permission Structure

Each permission is defined as `resource:action`. For example:
- `protocols:read` - View protocols
- `protocols:create` - Create new protocols
- `users:update_tier` - Change user subscription tier
- `roles:assign` - Assign roles to users

## Role Capabilities

### Super Admin (`super_admin`)
- Full access to all resources and actions
- Can manage roles and permissions
- Can view audit logs
- Cannot be modified or deleted

### Admin (`admin`)
- Access to most administrative functions
- Cannot manage roles (except viewing)
- Can manage protocols, prompts, users, payments, and coupons
- Can view audit logs

### Content Manager (`content_manager`)
- Can read, create, and update protocols and prompts
- No access to user, payment, or system management

### Support (`support`)
- Read-only access to users, payments, and coupons
- Useful for customer support staff

## Managing Roles via API

### Assign a Role to a User

```bash
# First, get auth token
curl -X POST https://app.p57.uz/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "password"}'

# Then assign role (requires roles:assign permission)
curl -X POST https://app.p57.uz/api/admin/users/USER_ID/roles \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"roleId": 2, "expiresAt": null}'
```

### List All Roles

```bash
curl https://app.p57.uz/api/admin/roles \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### View User's Permissions

```bash
curl https://app.p57.uz/api/admin/users/USER_ID/permissions \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Troubleshooting

### "Access denied" errors
1. Check if user has any roles assigned:
   - Look in the `user_roles` table
   - Use the API endpoint `/api/admin/users/USER_ID/permissions`

2. Verify the required permission for the endpoint:
   - Check `server/routes.ts` for the `requirePermission()` middleware
   - Ensure the user's role has that permission

### "Invalid token" errors
1. Ensure you're using a valid Supabase JWT token
2. Token should be passed as `Authorization: Bearer TOKEN`
3. Check if the user exists in Supabase Auth

### Database connection issues
1. Verify `DATABASE_URL` is set correctly
2. Ensure the RBAC tables exist (run migrations)
3. Check PostgreSQL logs for connection errors

## Security Best Practices

1. **Principle of Least Privilege**: Only grant the minimum permissions needed
2. **Regular Audits**: Review the audit_logs table regularly
3. **Temporary Roles**: Use `expiresAt` for temporary access
4. **Role Hierarchy**: Higher priority roles override lower ones
5. **System Roles**: Never modify or delete system roles (super_admin, admin)

## Migration from Email-Based Admin System

The system maintains backward compatibility with the `ADMIN_EMAILS` environment variable. If a user's email is in this list but they don't have a role, they'll still get admin access. However, it's recommended to migrate to the RBAC system:

1. Add emails to `ADMIN_EMAILS` (temporary)
2. Assign proper roles using the script
3. Remove emails from `ADMIN_EMAILS`

## Audit Trail

All admin actions are logged in the `audit_logs` table with:
- User ID and email
- Action performed
- Resource affected
- Timestamp
- IP address and user agent
- Success/failure status
- Error messages (if any)

View audit logs:
```bash
curl https://app.p57.uz/api/admin/audit-logs \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Future Enhancements

1. **Role Templates**: Pre-defined role sets for common use cases
2. **Dynamic Permissions**: Create custom permissions without code changes
3. **Permission Groups**: Bundle related permissions together
4. **UI for Role Management**: Visual interface for managing roles
5. **Two-Factor Authentication**: Additional security for admin roles