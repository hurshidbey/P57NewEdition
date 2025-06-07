// server/payme/webhook-controller.ts
// import { db } from '../db';
// import { payment_transactions, users } from '../../shared/schema';
// import { eq, and, gte, lte, isNull, isNotNull } from 'drizzle-orm';

// Payment transaction states
enum PaymeStatus {
  CANCELLED = -1,
  PENDING = 1,
  PAID = 2
}

// Payme error codes
enum PaymeError {
  MethodNotFound = -32601,
  InvalidParams = -32600,
  InternalError = -31008,
  TransactionNotFound = -31003,
  InvalidState = -31008,
  InvalidAmount = -31001,
  InvalidAccount = -31050,
  AlreadyPaid = -31099
}

// Interface for transaction from database
interface Transaction {
  id: number;
  order_id: string;
  amount: number;
  status: number;
  created_at: Date;
  paid_at: Date | null;
  cancelled_at: Date | null;
  reason: string | null;
  transaction_id: string | null;
  user_id: number | null;
}

export class PaymeWebhookController {
  private merchantId: string;
  private isTestEnv: boolean;
  
  constructor() {
    this.merchantId = process.env.PAYME_MERCHANT_ID || '';
    this.isTestEnv = process.env.NODE_ENV !== 'production';
    
    if (!this.merchantId) {
      console.warn('PAYME_MERCHANT_ID environment variable is not set');
    }
  }
  
  /**
   * Handle all Payme webhook requests
   */
  public async handleWebhook(req: any, res: any) {
    try {
      const { method, params, id } = req.body;
      
      if (!method || !id) {
        return res.status(400).json(this.createError(id || '0', PaymeError.InvalidParams, 'Invalid request format'));
      }
      
      // Process based on method
      switch (method) {
        case 'CheckPerformTransaction':
          return await this.checkPerformTransaction(id, params, res);
        case 'CreateTransaction':
          return await this.createTransaction(id, params, res);
        case 'PerformTransaction':
          return await this.performTransaction(id, params, res);
        case 'CheckTransaction':
          return await this.checkTransaction(id, params, res);
        case 'CancelTransaction':
          return await this.cancelTransaction(id, params, res);
        case 'GetStatement':
          return await this.getStatement(id, params, res);
        default:
          return res.status(200).json(this.createError(id, PaymeError.MethodNotFound, `Method '${method}' not found`));
      }
    } catch (error) {
      console.error('Error processing Payme webhook:', error);
      return res.status(200).json(
        this.createError('0', PaymeError.InternalError, 'Internal server error')
      );
    }
  }
  
  /**
   * Check if the user is eligible to pay
   */
  private async checkPerformTransaction(id: string, params: any, res: any) {
    try {
      // Extract parameters
      const amount = params.amount;
      const orderId = params.account?.order_id;
      
      // Validate parameters
      if (!amount || !orderId) {
        return res.status(200).json(
          this.createError(id, PaymeError.InvalidParams, 'Invalid parameters: amount and order_id are required')
        );
      }
      
      // In our system, orderId is the user ID, so we need to check if the user exists
      const userId = orderId;
      const user = await db.query.users.findFirst({
        where: eq(users.id, parseInt(userId))
      });
      
      if (!user) {
        return res.status(200).json(
          this.createError(id, PaymeError.InvalidAccount, 'User not found')
        );
      }
      
      // For our platform, we have a fixed payment amount
      // We can include a validation for the amount if needed in the future
      
      // Return success
      return res.status(200).json({
        result: {
          allow: true
        },
        id
      });
      
    } catch (error) {
      console.error('Error in checkPerformTransaction:', error);
      return res.status(200).json(
        this.createError(id, PaymeError.InternalError, 'Internal server error')
      );
    }
  }
  
  /**
   * Create a new transaction
   */
  private async createTransaction(id: string, params: any, res: any) {
    try {
      // Extract parameters
      const paymeTransactionId = params.id;
      const amount = params.amount;
      const orderId = params.account?.order_id;
      const time = params.time;
      
      // Validate parameters
      if (!paymeTransactionId || !amount || !orderId || !time) {
        return res.status(200).json(
          this.createError(id, PaymeError.InvalidParams, 'Invalid parameters')
        );
      }
      
      // Check if transaction already exists
      const existingTransaction = await db.query.payment_transactions.findFirst({
        where: eq(payment_transactions.transaction_id, paymeTransactionId)
      });
      
      // If transaction exists, return its state
      if (existingTransaction) {
        return res.status(200).json({
          result: {
            create_time: Math.floor(existingTransaction.created_at.getTime() / 1000),
            transaction: existingTransaction.id.toString(),
            state: existingTransaction.status
          },
          id
        });
      }
      
      // Check if there are other active transactions for this order
      const activeTransactions = await db.query.payment_transactions.findFirst({
        where: and(
          eq(payment_transactions.order_id, orderId),
          eq(payment_transactions.status, PaymeStatus.PENDING)
        )
      });
      
      if (activeTransactions) {
        return res.status(200).json(
          this.createError(id, PaymeError.AlreadyPaid, 'Another transaction is in progress for this order')
        );
      }
      
      // Create a new transaction
      const [newTransaction] = await db.insert(payment_transactions).values({
        transaction_id: paymeTransactionId,
        order_id: orderId,
        amount: amount,
        status: PaymeStatus.PENDING,
        created_at: new Date(time), 
        user_id: parseInt(orderId) // In our system, orderId is the user ID
      }).returning();
      
      return res.status(200).json({
        result: {
          create_time: Math.floor(newTransaction.created_at.getTime() / 1000),
          transaction: newTransaction.id.toString(),
          state: newTransaction.status
        },
        id
      });
      
    } catch (error) {
      console.error('Error in createTransaction:', error);
      return res.status(200).json(
        this.createError(id, PaymeError.InternalError, 'Internal server error')
      );
    }
  }
  
  /**
   * Check transaction status
   */
  private async checkTransaction(id: string, params: any, res: any) {
    try {
      // Extract parameters
      const paymeTransactionId = params.id;
      
      // Validate parameters
      if (!paymeTransactionId) {
        return res.status(200).json(
          this.createError(id, PaymeError.InvalidParams, 'Transaction ID is required')
        );
      }
      
      // Find the transaction
      const transaction = await db.query.payment_transactions.findFirst({
        where: eq(payment_transactions.transaction_id, paymeTransactionId)
      });
      
      if (!transaction) {
        return res.status(200).json(
          this.createError(id, PaymeError.TransactionNotFound, 'Transaction not found')
        );
      }
      
      // Return transaction details
      return res.status(200).json({
        result: {
          create_time: Math.floor(transaction.created_at.getTime() / 1000),
          perform_time: transaction.paid_at ? Math.floor(transaction.paid_at.getTime() / 1000) : 0,
          cancel_time: transaction.cancelled_at ? Math.floor(transaction.cancelled_at.getTime() / 1000) : 0,
          transaction: transaction.id.toString(),
          state: transaction.status,
          reason: transaction.reason ? parseInt(transaction.reason) : null
        },
        id
      });
      
    } catch (error) {
      console.error('Error in checkTransaction:', error);
      return res.status(200).json(
        this.createError(id, PaymeError.InternalError, 'Internal server error')
      );
    }
  }
  
  /**
   * Execute transaction after verification
   */
  private async performTransaction(id: string, params: any, res: any) {
    try {
      // Extract parameters
      const paymeTransactionId = params.id;
      
      // Validate parameters
      if (!paymeTransactionId) {
        return res.status(200).json(
          this.createError(id, PaymeError.InvalidParams, 'Transaction ID is required')
        );
      }
      
      // Find the transaction
      const transaction = await db.query.payment_transactions.findFirst({
        where: eq(payment_transactions.transaction_id, paymeTransactionId)
      });
      
      if (!transaction) {
        return res.status(200).json(
          this.createError(id, PaymeError.TransactionNotFound, 'Transaction not found')
        );
      }
      
      // If transaction is already completed, return its state
      if (transaction.status === PaymeStatus.PAID) {
        return res.status(200).json({
          result: {
            transaction: transaction.id.toString(),
            perform_time: Math.floor((transaction.paid_at || new Date()).getTime() / 1000),
            state: transaction.status
          },
          id
        });
      }
      
      // If transaction is cancelled, return error
      if (transaction.status === PaymeStatus.CANCELLED) {
        return res.status(200).json(
          this.createError(id, PaymeError.InvalidState, 'Transaction was cancelled')
        );
      }
      
      // Update transaction state to PAID
      const performTime = Date.now();
      await db.update(payment_transactions)
        .set({
          status: PaymeStatus.PAID,
          paid_at: new Date(performTime)
        })
        .where(eq(payment_transactions.transaction_id, paymeTransactionId));
        
      // Update user's payment status if needed
      if (transaction.user_id) {
        await db.update(users)
          .set({ 
            isApproved: true 
          })
          .where(eq(users.id, transaction.user_id));
      }
      
      return res.status(200).json({
        result: {
          transaction: transaction.id.toString(),
          perform_time: Math.floor(performTime / 1000),
          state: PaymeStatus.PAID
        },
        id
      });
      
    } catch (error) {
      console.error('Error in performTransaction:', error);
      return res.status(200).json(
        this.createError(id, PaymeError.InternalError, 'Internal server error')
      );
    }
  }
  
  /**
   * Cancel transaction
   */
  private async cancelTransaction(id: string, params: any, res: any) {
    try {
      // Extract parameters
      const paymeTransactionId = params.id;
      const reason = params.reason;
      
      // Validate parameters
      if (!paymeTransactionId) {
        return res.status(200).json(
          this.createError(id, PaymeError.InvalidParams, 'Transaction ID is required')
        );
      }
      
      // Find the transaction
      const transaction = await db.query.payment_transactions.findFirst({
        where: eq(payment_transactions.transaction_id, paymeTransactionId)
      });
      
      if (!transaction) {
        return res.status(200).json(
          this.createError(id, PaymeError.TransactionNotFound, 'Transaction not found')
        );
      }
      
      // If transaction is already cancelled, return its state
      if (transaction.status === PaymeStatus.CANCELLED) {
        return res.status(200).json({
          result: {
            transaction: transaction.id.toString(),
            cancel_time: Math.floor((transaction.cancelled_at || new Date()).getTime() / 1000),
            state: transaction.status
          },
          id
        });
      }
      
      // Update transaction state to CANCELLED
      const cancelTime = Date.now();
      await db.update(payment_transactions)
        .set({
          status: PaymeStatus.CANCELLED,
          cancelled_at: new Date(cancelTime),
          reason: reason ? reason.toString() : null
        })
        .where(eq(payment_transactions.transaction_id, paymeTransactionId));
      
      return res.status(200).json({
        result: {
          transaction: transaction.id.toString(),
          cancel_time: Math.floor(cancelTime / 1000),
          state: PaymeStatus.CANCELLED
        },
        id
      });
      
    } catch (error) {
      console.error('Error in cancelTransaction:', error);
      return res.status(200).json(
        this.createError(id, PaymeError.InternalError, 'Internal server error')
      );
    }
  }
  
  /**
   * Get statement of transactions for data synchronization
   */
  private async getStatement(id: string, params: any, res: any) {
    try {
      // Extract parameters
      const from = params.from;
      const to = params.to;
      
      // Validate parameters
      if (!from || !to) {
        return res.status(200).json(
          this.createError(id, PaymeError.InvalidParams, 'From and To timestamps are required')
        );
      }
      
      // Convert timestamps to Date objects
      const fromDate = new Date(from * 1000);
      const toDate = new Date(to * 1000);
      
      // Get transactions in the specified time range
      const transactions = await db.select()
        .from(payment_transactions)
        .where(
          and(
            // Created within time range
            and(
              gte(payment_transactions.created_at, fromDate),
              lte(payment_transactions.created_at, toDate)
            ),
            // Has been paid
            isNotNull(payment_transactions.paid_at)
          )
        );
      
      // Format transactions for Payme
      const formattedTransactions = transactions.map(transaction => ({
        id: transaction.transaction_id,
        time: Math.floor(transaction.created_at.getTime() / 1000),
        amount: transaction.amount,
        account: {
          order_id: transaction.order_id
        },
        create_time: Math.floor(transaction.created_at.getTime() / 1000),
        perform_time: transaction.paid_at ? Math.floor(transaction.paid_at.getTime() / 1000) : 0,
        cancel_time: transaction.cancelled_at ? Math.floor(transaction.cancelled_at.getTime() / 1000) : 0,
        transaction: transaction.id.toString(),
        state: transaction.status,
        reason: transaction.reason ? parseInt(transaction.reason) : null
      }));
      
      return res.status(200).json({
        result: {
          transactions: formattedTransactions
        },
        id
      });
      
    } catch (error) {
      console.error('Error in getStatement:', error);
      return res.status(200).json(
        this.createError(id, PaymeError.InternalError, 'Internal server error')
      );
    }
  }
  
  /**
   * Generate a Payme checkout URL for client redirect
   */
  public generatePaymeUrl(orderId: string, amount: number): string {
    const paymentData = `m=${this.merchantId};ac.order_id=${orderId};a=${amount}`;
    const paymeString = Buffer.from(paymentData).toString('base64');
    
    const baseUrl = this.isTestEnv
      ? "https://checkout.test.paycom.uz/"
      : "https://checkout.paycom.uz/";
      
    return `${baseUrl}${paymeString}`;
  }
  
  /**
   * Generate error response
   */
  private createError(id: string, code: number, message: string): any {
    return {
      error: {
        code: code,
        message: {
          ru: message,
          uz: message,
          en: message,
        },
      },
      id: id,
    };
  }
}