import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
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

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Protocol = typeof protocols.$inferSelect;
export type InsertProtocol = z.infer<typeof insertProtocolSchema>;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
