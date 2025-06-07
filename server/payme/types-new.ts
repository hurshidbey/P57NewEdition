// server/payme/types-new.ts

// Payment transaction states
export enum PaymeStatus {
  CANCELLED = -1,
  PENDING = 1,
  PAID = 2
}

// Payme error codes
export enum PaymeError {
  MethodNotFound = -32601,
  InvalidParams = -32600,
  InternalError = -31008,
  TransactionNotFound = -31003,
  InvalidState = -31008,
  InvalidAmount = -31001,
  InvalidAccount = -31050,
  AlreadyPaid = -31099
}

// Payme API methods
export enum PaymeMethod {
  CheckPerformTransaction = 'CheckPerformTransaction',
  CreateTransaction = 'CreateTransaction',
  PerformTransaction = 'PerformTransaction',
  CancelTransaction = 'CancelTransaction',
  CheckTransaction = 'CheckTransaction',
  GetStatement = 'GetStatement'
}

// Payme transaction interface
export interface PaymeTransaction {
  id: number;
  transaction_id: string;
  order_id: string;
  amount: number;
  created_at: Date;
  paid_at?: Date | null;
  cancelled_at?: Date | null;
  status: PaymeStatus;
  reason?: string | null;
  user_id?: number | null;
}