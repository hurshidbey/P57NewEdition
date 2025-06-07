// server/payme/schema.ts
import { 
  pgTable, 
  serial, 
  text,
  integer,
  timestamp,
  boolean 
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { PaymeStatus } from "./types";

export const payment_transactions = pgTable("payment_transactions", {
  id: serial("id").primaryKey(),
  order_id: text("order_id").notNull(),
  amount: integer("amount").notNull(),
  status: integer("status").notNull().default(PaymeStatus.PENDING),
  created_at: timestamp("created_at").notNull().defaultNow(),
  paid_at: timestamp("paid_at"),
  cancelled_at: timestamp("cancelled_at"),
  reason: text("reason"),
  transaction_id: text("transaction_id").unique(),
  user_id: integer("user_id"),
});

// Create insert schema
export const insertPaymentTransactionSchema = createInsertSchema(payment_transactions).omit({
  id: true,
});

export type InsertPaymentTransaction = z.infer<typeof insertPaymentTransactionSchema>;
export type PaymentTransaction = typeof payment_transactions.$inferSelect;