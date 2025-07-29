import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  tier: text("tier").notNull().default('free'), // 'free' | 'paid'
  paidAt: timestamp("paid_at"),
});

export const protocols = pgTable("protocols", {
  id: serial("id").primaryKey(),
  number: integer("number").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  badExample: text("bad_example"),
  goodExample: text("good_example"),
  categoryId: integer("category_id").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  // New fields for enhanced protocol structure
  problemStatement: text("problem_statement"),
  whyExplanation: text("why_explanation"),
  solutionApproach: text("solution_approach"),
  difficultyLevel: text("difficulty_level"),
  levelOrder: integer("level_order"),
  // Free tier access control
  isFreeAccess: boolean("is_free_access").notNull().default(false),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
});

export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  protocolId: integer("protocol_id").notNull(),
  completedAt: timestamp("completed_at").defaultNow(),
  practiceCount: integer("practice_count").default(1),
  lastScore: integer("last_score"),
  accessedProtocolsCount: integer("accessed_protocols_count").default(0),
});

export const prompts = pgTable("prompts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  isPremium: boolean("is_premium").notNull().default(false),
  isPublic: boolean("is_public").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const payments = pgTable("payments", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  userEmail: text("user_email").notNull(),
  amount: integer("amount").notNull(),
  transactionId: text("transaction_id").notNull(),
  status: text("status").notNull().default('pending'), // 'pending' | 'completed' | 'failed'
  atmosData: text("atmos_data"), // JSON string of ATMOS response
  createdAt: timestamp("created_at").defaultNow(),
  // Coupon fields
  couponId: integer("coupon_id"),
  originalAmount: integer("original_amount"),
  discountAmount: integer("discount_amount"),
});

// Coupons table for discount codes
export const coupons = pgTable("coupons", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  description: text("description"), // Admin note about the coupon
  discountType: text("discount_type").notNull(), // 'percentage' | 'fixed'
  discountValue: integer("discount_value").notNull(), // 60 for 60% or 100000 for 100k UZS
  originalPrice: integer("original_price").notNull().default(1425000), // Default full price
  maxUses: integer("max_uses"), // null = unlimited
  usedCount: integer("used_count").default(0),
  validFrom: timestamp("valid_from").defaultNow(),
  validUntil: timestamp("valid_until"),
  isActive: boolean("is_active").default(true),
  createdBy: text("created_by"), // Admin who created it
  createdAt: timestamp("created_at").defaultNow(),
});

// Track coupon usage
export const couponUsages = pgTable("coupon_usages", {
  id: serial("id").primaryKey(),
  couponId: integer("coupon_id").notNull(),
  userId: text("user_id"),
  userEmail: text("user_email"),
  paymentId: text("payment_id"),
  originalAmount: integer("original_amount"),
  discountAmount: integer("discount_amount"),
  finalAmount: integer("final_amount"),
  usedAt: timestamp("used_at").defaultNow(),
});

// Payment sessions for tracking payment flow
export const paymentSessions = pgTable("payment_sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  userEmail: text("user_email").notNull(),
  amount: integer("amount").notNull(),
  originalAmount: integer("original_amount"),
  discountAmount: integer("discount_amount"),
  couponId: integer("coupon_id"),
  merchantTransId: text("merchant_trans_id").notNull().unique(),
  paymentMethod: text("payment_method").notNull(),
  idempotencyKey: text("idempotency_key").notNull().unique(),
  metadata: json("metadata").$type<Record<string, any>>(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertProtocolSchema = createInsertSchema(protocols).omit({
  id: true,
  createdAt: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
});

export const insertUserProgressSchema = createInsertSchema(userProgress).omit({
  id: true,
  completedAt: true,
});

export const insertPromptSchema = createInsertSchema(prompts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  createdAt: true,
});

export const insertCouponSchema = createInsertSchema(coupons).omit({
  id: true,
  usedCount: true,
  createdAt: true,
});

export const insertCouponUsageSchema = createInsertSchema(couponUsages).omit({
  id: true,
  usedAt: true,
});

export const insertPaymentSessionSchema = createInsertSchema(paymentSessions).omit({
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Protocol = typeof protocols.$inferSelect;
export type InsertProtocol = z.infer<typeof insertProtocolSchema>;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
export type Prompt = typeof prompts.$inferSelect;
export type InsertPrompt = z.infer<typeof insertPromptSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Coupon = typeof coupons.$inferSelect;
export type InsertCoupon = z.infer<typeof insertCouponSchema>;
export type CouponUsage = typeof couponUsages.$inferSelect;
export type InsertCouponUsage = z.infer<typeof insertCouponUsageSchema>;
export type PaymentSession = typeof paymentSessions.$inferSelect;
export type InsertPaymentSession = z.infer<typeof insertPaymentSessionSchema>;
