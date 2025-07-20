import { Router } from 'express';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { eq, and, gte, lte, like, desc, sql } from 'drizzle-orm';
import { auditLogs } from '../../shared/rbac-schema';
import { requireAuth, requirePermission, auditLog } from '../middleware/rbac';
import { z } from 'zod';

const router = Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

// Query parameters schema
const auditLogQuerySchema = z.object({
  userId: z.string().optional(),
  resource: z.string().optional(),
  action: z.string().optional(),
  status: z.enum(['success', 'failed', 'denied']).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional()
});

/**
 * Get audit logs with filtering and pagination
 */
router.get('/audit-logs',
  requireAuth,
  requirePermission('audit_logs', 'read'),
  auditLog('audit_logs', 'read'),
  async (req, res) => {
    try {
      // Parse and validate query parameters
      const query = auditLogQuerySchema.parse(req.query);
      const offset = (query.page - 1) * query.limit;

      // Build where conditions
      const conditions = [];

      if (query.userId) {
        conditions.push(eq(auditLogs.userId, query.userId));
      }

      if (query.resource) {
        conditions.push(eq(auditLogs.resource, query.resource));
      }

      if (query.action) {
        conditions.push(eq(auditLogs.action, query.action));
      }

      if (query.status) {
        conditions.push(eq(auditLogs.status, query.status));
      }

      if (query.from) {
        conditions.push(gte(auditLogs.createdAt, new Date(query.from)));
      }

      if (query.to) {
        conditions.push(lte(auditLogs.createdAt, new Date(query.to)));
      }

      if (query.search) {
        conditions.push(
          or(
            like(auditLogs.userEmail, `%${query.search}%`),
            like(auditLogs.resourceId, `%${query.search}%`),
            like(auditLogs.errorMessage, `%${query.search}%`)
          )
        );
      }

      // Get total count
      const [countResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(auditLogs)
        .where(and(...conditions));

      const totalCount = Number(countResult.count);

      // Get paginated results
      const logs = await db
        .select()
        .from(auditLogs)
        .where(and(...conditions))
        .orderBy(desc(auditLogs.createdAt))
        .limit(query.limit)
        .offset(offset);

      // Format response
      res.json({
        logs,
        pagination: {
          page: query.page,
          limit: query.limit,
          total: totalCount,
          pages: Math.ceil(totalCount / query.limit)
        }
      });

    } catch (error) {
      console.error('Error fetching audit logs:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid query parameters', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
  }
);

/**
 * Get audit log statistics
 */
router.get('/audit-logs/stats',
  requireAuth,
  requirePermission('audit_logs', 'read'),
  async (req, res) => {
    try {
      const { from, to } = req.query;
      
      const conditions = [];
      if (from) {
        conditions.push(gte(auditLogs.createdAt, new Date(from as string)));
      }
      if (to) {
        conditions.push(lte(auditLogs.createdAt, new Date(to as string)));
      }

      // Get statistics by resource and action
      const statsByResource = await db
        .select({
          resource: auditLogs.resource,
          action: auditLogs.action,
          status: auditLogs.status,
          count: sql<number>`count(*)`
        })
        .from(auditLogs)
        .where(and(...conditions))
        .groupBy(auditLogs.resource, auditLogs.action, auditLogs.status);

      // Get statistics by user
      const statsByUser = await db
        .select({
          userId: auditLogs.userId,
          userEmail: auditLogs.userEmail,
          count: sql<number>`count(*)`,
          lastActivity: sql<Date>`max(${auditLogs.createdAt})`
        })
        .from(auditLogs)
        .where(and(...conditions))
        .groupBy(auditLogs.userId, auditLogs.userEmail)
        .orderBy(desc(sql`count(*)`))
        .limit(10);

      // Get failure statistics
      const failureStats = await db
        .select({
          resource: auditLogs.resource,
          action: auditLogs.action,
          errorMessage: auditLogs.errorMessage,
          count: sql<number>`count(*)`
        })
        .from(auditLogs)
        .where(
          and(
            eq(auditLogs.status, 'failed'),
            ...conditions
          )
        )
        .groupBy(auditLogs.resource, auditLogs.action, auditLogs.errorMessage)
        .orderBy(desc(sql`count(*)`))
        .limit(10);

      res.json({
        byResource: statsByResource,
        topUsers: statsByUser,
        topFailures: failureStats
      });

    } catch (error) {
      console.error('Error fetching audit statistics:', error);
      res.status(500).json({ error: 'Failed to fetch audit statistics' });
    }
  }
);

/**
 * Get audit logs for a specific resource
 */
router.get('/audit-logs/resource/:resource/:id',
  requireAuth,
  requirePermission('audit_logs', 'read'),
  async (req, res) => {
    try {
      const { resource, id } = req.params;
      const { page = 1, limit = 20 } = req.query;
      
      const offset = (Number(page) - 1) * Number(limit);

      const logs = await db
        .select()
        .from(auditLogs)
        .where(
          and(
            eq(auditLogs.resource, resource),
            eq(auditLogs.resourceId, id)
          )
        )
        .orderBy(desc(auditLogs.createdAt))
        .limit(Number(limit))
        .offset(offset);

      res.json(logs);

    } catch (error) {
      console.error('Error fetching resource audit logs:', error);
      res.status(500).json({ error: 'Failed to fetch resource audit logs' });
    }
  }
);

/**
 * Get user activity logs
 */
router.get('/audit-logs/user/:userId',
  requireAuth,
  requirePermission('audit_logs', 'read'),
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 20 } = req.query;
      
      const offset = (Number(page) - 1) * Number(limit);

      const logs = await db
        .select()
        .from(auditLogs)
        .where(eq(auditLogs.userId, userId))
        .orderBy(desc(auditLogs.createdAt))
        .limit(Number(limit))
        .offset(offset);

      res.json(logs);

    } catch (error) {
      console.error('Error fetching user audit logs:', error);
      res.status(500).json({ error: 'Failed to fetch user audit logs' });
    }
  }
);

export default router;