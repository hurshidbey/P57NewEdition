import { Request, Response, NextFunction } from 'express';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { eq, and, or, gte } from 'drizzle-orm';
import { createClient } from '@supabase/supabase-js';
import { 
  userRoles, 
  roles, 
  permissions, 
  rolePermissions,
  auditLogs,
  type Resource,
  type Action,
  AUDIT_STATUS
} from '../../shared/rbac-schema';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: any;
      userRoles?: string[];
      userPermissions?: Set<string>;
    }
  }
}

// Initialize database connection
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Authentication middleware - validates JWT and loads user
 */
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

/**
 * Load user roles and permissions
 */
export const loadUserPermissions = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next();
  }

  try {
    // Get user's roles (excluding expired ones)
    const userRoleRecords = await db
      .select({
        roleId: userRoles.roleId,
        roleName: roles.name,
        rolePriority: roles.priority,
        expiresAt: userRoles.expiresAt
      })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(
        and(
          eq(userRoles.userId, req.user.id),
          or(
            eq(userRoles.expiresAt, null),
            gte(userRoles.expiresAt, new Date())
          )
        )
      );

    // Store role names
    req.userRoles = userRoleRecords.map(r => r.roleName);

    // Get all permissions for user's roles
    const permissionRecords = await db
      .select({
        resource: permissions.resource,
        action: permissions.action
      })
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(
        rolePermissions.roleId.in(userRoleRecords.map(r => r.roleId))
      );

    // Store permissions as a Set for fast lookup
    req.userPermissions = new Set(
      permissionRecords.map(p => `${p.resource}:${p.action}`)
    );

    // Check if user is super admin (for backward compatibility)
    const isSuperAdmin = req.userRoles.includes('super_admin');
    if (isSuperAdmin) {
      // Super admin has all permissions
      req.userPermissions = new Set(['*:*']);
    }

    next();
  } catch (error) {
    console.error('Permission loading error:', error);
    next(); // Continue without permissions
  }
};

/**
 * Permission checking middleware
 */
export const requirePermission = (resource: Resource, action: Action) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Ensure user is authenticated
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Load permissions if not already loaded
    if (!req.userPermissions) {
      await loadUserPermissions(req, res, () => {});
    }

    // Check permission
    const requiredPermission = `${resource}:${action}`;
    const hasPermission = 
      req.userPermissions?.has('*:*') || // Super admin
      req.userPermissions?.has(requiredPermission);

    if (!hasPermission) {
      // Log denied access
      await logAuditEvent({
        userId: req.user.id,
        userEmail: req.user.email || 'unknown',
        action,
        resource,
        resourceId: req.params.id || undefined,
        status: AUDIT_STATUS.DENIED,
        errorMessage: 'Insufficient permissions',
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent']
      });

      return res.status(403).json({ 
        error: 'Access denied',
        required: requiredPermission,
        message: `You need ${action} permission for ${resource}`
      });
    }

    next();
  };
};

/**
 * Require any of the specified permissions
 */
export const requireAnyPermission = (permissions: Array<{ resource: Resource, action: Action }>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!req.userPermissions) {
      await loadUserPermissions(req, res, () => {});
    }

    const hasAnyPermission = permissions.some(p => {
      const permission = `${p.resource}:${p.action}`;
      return req.userPermissions?.has('*:*') || req.userPermissions?.has(permission);
    });

    if (!hasAnyPermission) {
      return res.status(403).json({ 
        error: 'Access denied',
        message: 'You need at least one of the required permissions'
      });
    }

    next();
  };
};

/**
 * Require a specific role
 */
export const requireRole = (roleName: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!req.userRoles) {
      await loadUserPermissions(req, res, () => {});
    }

    if (!req.userRoles?.includes(roleName) && !req.userRoles?.includes('super_admin')) {
      return res.status(403).json({ 
        error: 'Access denied',
        message: `${roleName} role required`
      });
    }

    next();
  };
};

/**
 * Audit logging middleware
 */
export const auditLog = (resource: Resource, action: Action) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Capture original send function
    const originalSend = res.send;
    const startTime = Date.now();

    // Override send to log after response
    res.send = function(data: any) {
      res.send = originalSend;
      const responseData = res.send(data);
      
      // Log audit event after response is sent
      const status = res.statusCode >= 200 && res.statusCode < 300 
        ? AUDIT_STATUS.SUCCESS 
        : AUDIT_STATUS.FAILED;

      const duration = Date.now() - startTime;

      // Don't block response for audit logging
      logAuditEvent({
        userId: req.user?.id || 'anonymous',
        userEmail: req.user?.email || 'anonymous',
        action,
        resource,
        resourceId: req.params.id || req.body?.id || undefined,
        details: {
          method: req.method,
          path: req.path,
          query: req.query,
          body: sanitizeBody(req.body),
          statusCode: res.statusCode,
          duration
        },
        status,
        errorMessage: status === AUDIT_STATUS.FAILED ? data?.error || data?.message : undefined,
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent']
      }).catch(error => {
        console.error('Audit logging error:', error);
      });

      return responseData;
    };

    next();
  };
};

/**
 * Log audit event to database
 */
async function logAuditEvent(event: {
  userId: string;
  userEmail: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: any;
  status: string;
  errorMessage?: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  try {
    await db.insert(auditLogs).values(event);
  } catch (error) {
    console.error('Failed to log audit event:', error);
  }
}

/**
 * Sanitize request body for audit logging
 * Remove sensitive fields like passwords
 */
function sanitizeBody(body: any): any {
  if (!body) return body;
  
  const sanitized = { ...body };
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];
  
  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  }
  
  return sanitized;
}

/**
 * Backward compatibility with isSupabaseAdmin
 * This maintains compatibility during migration
 */
export const isSupabaseAdmin = async (req: Request, res: Response, next: NextFunction) => {
  // First try RBAC system
  await requireAuth(req, res, async () => {
    await loadUserPermissions(req, res, async () => {
      // Check if user has admin role or super_admin role
      if (req.userRoles?.includes('admin') || req.userRoles?.includes('super_admin')) {
        return next();
      }

      // Fall back to email-based check for backward compatibility
      const adminEmails = process.env.ADMIN_EMAILS 
        ? process.env.ADMIN_EMAILS.split(',').map(email => email.trim())
        : [];

      if (adminEmails.includes(req.user?.email)) {
        console.warn(`⚠️  User ${req.user.email} using legacy email-based admin access`);
        return next();
      }

      // Log denied access
      await logAuditEvent({
        userId: req.user?.id || 'unknown',
        userEmail: req.user?.email || 'unknown',
        action: 'access',
        resource: 'admin',
        status: AUDIT_STATUS.DENIED,
        errorMessage: 'Not an admin',
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent']
      });

      res.status(403).json({ error: 'Access denied - admin only' });
    });
  });
};