import { pgTable, text, serial, integer, timestamp, jsonb, unique, primaryKey, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Roles table - defines different access levels
export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  priority: integer("priority").notNull().default(0), // Higher number = higher priority
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Permissions table - defines what actions can be performed
export const permissions = pgTable("permissions", {
  id: serial("id").primaryKey(),
  resource: text("resource").notNull(), // e.g., 'protocols', 'users', 'payments'
  action: text("action").notNull(),     // e.g., 'read', 'create', 'update', 'delete'
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => {
  return {
    uniqueResourceAction: unique().on(table.resource, table.action),
  };
});

// Role-Permission junction table
export const rolePermissions = pgTable("role_permissions", {
  roleId: integer("role_id").notNull().references(() => roles.id, { onDelete: "cascade" }),
  permissionId: integer("permission_id").notNull().references(() => permissions.id, { onDelete: "cascade" }),
  grantedAt: timestamp("granted_at").defaultNow(),
  grantedBy: text("granted_by"),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.roleId, table.permissionId] }),
  };
});

// User-Role junction table
export const userRoles = pgTable("user_roles", {
  userId: text("user_id").notNull(), // Supabase user ID
  roleId: integer("role_id").notNull().references(() => roles.id, { onDelete: "cascade" }),
  grantedAt: timestamp("granted_at").defaultNow(),
  grantedBy: text("granted_by"),
  expiresAt: timestamp("expires_at"), // Optional: for temporary roles
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.userId, table.roleId] }),
  };
});

// Audit logs table - tracks all admin actions
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  userEmail: text("user_email").notNull(),
  action: text("action").notNull(),
  resource: text("resource").notNull(),
  resourceId: text("resource_id"),
  details: jsonb("details"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  status: text("status").notNull(), // 'success', 'failed', 'denied'
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => {
  return {
    userIdIdx: index("idx_audit_logs_user_id").on(table.userId),
    resourceIdx: index("idx_audit_logs_resource").on(table.resource, table.resourceId),
    createdAtIdx: index("idx_audit_logs_created_at").on(table.createdAt.desc()),
  };
});

// Zod schemas for validation
export const insertRoleSchema = createInsertSchema(roles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPermissionSchema = createInsertSchema(permissions).omit({
  id: true,
  createdAt: true,
});

export const insertRolePermissionSchema = createInsertSchema(rolePermissions).omit({
  grantedAt: true,
});

export const insertUserRoleSchema = createInsertSchema(userRoles).omit({
  grantedAt: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true,
});

// Type exports
export type Role = typeof roles.$inferSelect;
export type InsertRole = z.infer<typeof insertRoleSchema>;
export type Permission = typeof permissions.$inferSelect;
export type InsertPermission = z.infer<typeof insertPermissionSchema>;
export type RolePermission = typeof rolePermissions.$inferSelect;
export type InsertRolePermission = z.infer<typeof insertRolePermissionSchema>;
export type UserRole = typeof userRoles.$inferSelect;
export type InsertUserRole = z.infer<typeof insertUserRoleSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;

// Permission resource and action constants
export const RESOURCES = {
  PROTOCOLS: 'protocols',
  PROMPTS: 'prompts',
  USERS: 'users',
  PAYMENTS: 'payments',
  COUPONS: 'coupons',
  AUDIT_LOGS: 'audit_logs',
  ROLES: 'roles',
} as const;

export const ACTIONS = {
  READ: 'read',
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  TOGGLE_FREE: 'toggle_free',
  UPDATE_TIER: 'update_tier',
  REFUND: 'refund',
  TOGGLE: 'toggle',
  ASSIGN: 'assign',
} as const;

export type Resource = (typeof RESOURCES)[keyof typeof RESOURCES];
export type Action = (typeof ACTIONS)[keyof typeof ACTIONS];

// Default roles
export const DEFAULT_ROLES = {
  SUPER_ADMIN: { name: 'super_admin', priority: 100, description: 'Full system access' },
  ADMIN: { name: 'admin', priority: 50, description: 'General administrative access' },
  CONTENT_MANAGER: { name: 'content_manager', priority: 30, description: 'Manage content only' },
  SUPPORT: { name: 'support', priority: 20, description: 'Customer support access' },
} as const;

// Audit log status types
export const AUDIT_STATUS = {
  SUCCESS: 'success',
  FAILED: 'failed',
  DENIED: 'denied',
} as const;

export type AuditStatus = (typeof AUDIT_STATUS)[keyof typeof AUDIT_STATUS];