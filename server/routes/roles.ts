import { Router } from 'express';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { eq, and, desc, asc, sql } from 'drizzle-orm';
import { 
  roles, 
  permissions, 
  rolePermissions, 
  userRoles,
  insertRoleSchema,
  insertUserRoleSchema
} from '../../shared/rbac-schema';
import { requireAuth, requirePermission, auditLog } from '../middleware/rbac';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

const router = Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Get all roles with their permissions
 */
router.get('/roles',
  requireAuth,
  requirePermission('roles', 'read'),
  auditLog('roles', 'read'),
  async (req, res) => {
    try {
      // Get all roles
      const allRoles = await db
        .select()
        .from(roles)
        .orderBy(desc(roles.priority), asc(roles.name));

      // Get permissions for each role
      const rolesWithPermissions = await Promise.all(
        allRoles.map(async (role) => {
          const perms = await db
            .select({
              id: permissions.id,
              resource: permissions.resource,
              action: permissions.action,
              description: permissions.description
            })
            .from(rolePermissions)
            .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
            .where(eq(rolePermissions.roleId, role.id));

          return {
            ...role,
            permissions: perms
          };
        })
      );

      res.json(rolesWithPermissions);
    } catch (error) {
      console.error('Error fetching roles:', error);
      res.status(500).json({ error: 'Failed to fetch roles' });
    }
  }
);

/**
 * Get a specific role
 */
router.get('/roles/:id',
  requireAuth,
  requirePermission('roles', 'read'),
  async (req, res) => {
    try {
      const roleId = parseInt(req.params.id);

      const [role] = await db
        .select()
        .from(roles)
        .where(eq(roles.id, roleId))
        .limit(1);

      if (!role) {
        return res.status(404).json({ error: 'Role not found' });
      }

      // Get role permissions
      const perms = await db
        .select({
          id: permissions.id,
          resource: permissions.resource,
          action: permissions.action,
          description: permissions.description
        })
        .from(rolePermissions)
        .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
        .where(eq(rolePermissions.roleId, roleId));

      // Get users with this role
      const users = await db
        .select({
          userId: userRoles.userId,
          grantedAt: userRoles.grantedAt,
          grantedBy: userRoles.grantedBy,
          expiresAt: userRoles.expiresAt
        })
        .from(userRoles)
        .where(eq(userRoles.roleId, roleId));

      res.json({
        ...role,
        permissions: perms,
        userCount: users.length,
        users: users
      });
    } catch (error) {
      console.error('Error fetching role:', error);
      res.status(500).json({ error: 'Failed to fetch role' });
    }
  }
);

/**
 * Create a new role
 */
router.post('/roles',
  requireAuth,
  requirePermission('roles', 'create'),
  auditLog('roles', 'create'),
  async (req, res) => {
    try {
      const roleData = insertRoleSchema.parse(req.body);

      const [newRole] = await db
        .insert(roles)
        .values(roleData)
        .returning();

      res.status(201).json(newRole);
    } catch (error) {
      console.error('Error creating role:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid role data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to create role' });
    }
  }
);

/**
 * Update a role
 */
router.put('/roles/:id',
  requireAuth,
  requirePermission('roles', 'update'),
  auditLog('roles', 'update'),
  async (req, res) => {
    try {
      const roleId = parseInt(req.params.id);
      const updates = insertRoleSchema.partial().parse(req.body);

      // Don't allow updating system roles
      const [existingRole] = await db
        .select()
        .from(roles)
        .where(eq(roles.id, roleId))
        .limit(1);

      if (!existingRole) {
        return res.status(404).json({ error: 'Role not found' });
      }

      if (['super_admin', 'admin'].includes(existingRole.name)) {
        return res.status(400).json({ error: 'Cannot modify system roles' });
      }

      const [updatedRole] = await db
        .update(roles)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(roles.id, roleId))
        .returning();

      res.json(updatedRole);
    } catch (error) {
      console.error('Error updating role:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid role data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to update role' });
    }
  }
);

/**
 * Delete a role
 */
router.delete('/roles/:id',
  requireAuth,
  requirePermission('roles', 'delete'),
  auditLog('roles', 'delete'),
  async (req, res) => {
    try {
      const roleId = parseInt(req.params.id);

      // Don't allow deleting system roles
      const [existingRole] = await db
        .select()
        .from(roles)
        .where(eq(roles.id, roleId))
        .limit(1);

      if (!existingRole) {
        return res.status(404).json({ error: 'Role not found' });
      }

      if (['super_admin', 'admin', 'content_manager', 'support'].includes(existingRole.name)) {
        return res.status(400).json({ error: 'Cannot delete system roles' });
      }

      await db.delete(roles).where(eq(roles.id, roleId));

      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting role:', error);
      res.status(500).json({ error: 'Failed to delete role' });
    }
  }
);

/**
 * Grant permissions to a role
 */
router.post('/roles/:id/permissions',
  requireAuth,
  requirePermission('roles', 'update'),
  auditLog('roles', 'update'),
  async (req, res) => {
    try {
      const roleId = parseInt(req.params.id);
      const { permissionIds } = req.body;

      if (!Array.isArray(permissionIds)) {
        return res.status(400).json({ error: 'permissionIds must be an array' });
      }

      // Remove existing permissions
      await db
        .delete(rolePermissions)
        .where(eq(rolePermissions.roleId, roleId));

      // Add new permissions
      if (permissionIds.length > 0) {
        await db.insert(rolePermissions).values(
          permissionIds.map(permId => ({
            roleId,
            permissionId: permId,
            grantedBy: req.user.email
          }))
        );
      }

      // Return updated role with permissions
      const perms = await db
        .select({
          id: permissions.id,
          resource: permissions.resource,
          action: permissions.action
        })
        .from(rolePermissions)
        .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
        .where(eq(rolePermissions.roleId, roleId));

      res.json({ roleId, permissions: perms });
    } catch (error) {
      console.error('Error updating role permissions:', error);
      res.status(500).json({ error: 'Failed to update role permissions' });
    }
  }
);

/**
 * Assign a role to a user
 */
router.post('/users/:userId/roles',
  requireAuth,
  requirePermission('roles', 'assign'),
  auditLog('roles', 'assign'),
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { roleId, expiresAt } = req.body;

      // Verify user exists in Supabase
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
      if (userError || !userData.user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Verify role exists
      const [role] = await db
        .select()
        .from(roles)
        .where(eq(roles.id, roleId))
        .limit(1);

      if (!role) {
        return res.status(404).json({ error: 'Role not found' });
      }

      // Check if user already has this role
      const existing = await db
        .select()
        .from(userRoles)
        .where(
          and(
            eq(userRoles.userId, userId),
            eq(userRoles.roleId, roleId)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        return res.status(400).json({ error: 'User already has this role' });
      }

      // Assign role
      await db.insert(userRoles).values({
        userId,
        roleId,
        grantedBy: req.user.email,
        expiresAt: expiresAt ? new Date(expiresAt) : null
      });

      res.status(201).json({ 
        success: true,
        user: userData.user.email,
        role: role.name
      });
    } catch (error) {
      console.error('Error assigning role:', error);
      res.status(500).json({ error: 'Failed to assign role' });
    }
  }
);

/**
 * Remove a role from a user
 */
router.delete('/users/:userId/roles/:roleId',
  requireAuth,
  requirePermission('roles', 'assign'),
  auditLog('roles', 'assign'),
  async (req, res) => {
    try {
      const { userId, roleId } = req.params;

      const result = await db
        .delete(userRoles)
        .where(
          and(
            eq(userRoles.userId, userId),
            eq(userRoles.roleId, parseInt(roleId))
          )
        );

      res.json({ success: true });
    } catch (error) {
      console.error('Error removing role:', error);
      res.status(500).json({ error: 'Failed to remove role' });
    }
  }
);

/**
 * Get all permissions
 */
router.get('/permissions',
  requireAuth,
  requirePermission('roles', 'read'),
  async (req, res) => {
    try {
      const allPermissions = await db
        .select()
        .from(permissions)
        .orderBy(permissions.resource, permissions.action);

      // Group by resource
      const grouped = allPermissions.reduce((acc, perm) => {
        if (!acc[perm.resource]) {
          acc[perm.resource] = [];
        }
        acc[perm.resource].push(perm);
        return acc;
      }, {} as Record<string, typeof allPermissions>);

      res.json(grouped);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      res.status(500).json({ error: 'Failed to fetch permissions' });
    }
  }
);

/**
 * Get user's roles and permissions
 */
router.get('/users/:userId/permissions',
  requireAuth,
  async (req, res) => {
    try {
      const { userId } = req.params;

      // Only allow users to view their own permissions unless they have role read permission
      if (userId !== req.user.id && !req.userPermissions?.has('roles:read')) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Get user's roles
      const userRoleData = await db
        .select({
          roleId: userRoles.roleId,
          roleName: roles.name,
          roleDescription: roles.description,
          rolePriority: roles.priority,
          grantedAt: userRoles.grantedAt,
          expiresAt: userRoles.expiresAt
        })
        .from(userRoles)
        .innerJoin(roles, eq(userRoles.roleId, roles.id))
        .where(eq(userRoles.userId, userId));

      // Get permissions for all user's roles
      const userPermissions = await db
        .select({
          resource: permissions.resource,
          action: permissions.action,
          description: permissions.description
        })
        .from(rolePermissions)
        .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
        .where(
          rolePermissions.roleId.in(userRoleData.map(r => r.roleId))
        );

      res.json({
        roles: userRoleData,
        permissions: userPermissions
      });
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      res.status(500).json({ error: 'Failed to fetch user permissions' });
    }
  }
);

export default router;