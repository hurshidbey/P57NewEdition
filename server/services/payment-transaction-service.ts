import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

export interface CreateTransactionParams {
  userId: string;
  userEmail: string;
  originalAmount: number;
  finalAmount: number;
  discountAmount?: number;
  paymentMethod: 'click' | 'atmos';
  couponId?: number;
  couponCode?: string;
  metadata?: Record<string, any>;
}

export interface PaymentTransaction {
  id: string;
  userId: string;
  userEmail: string;
  merchantTransId: string;
  externalTransId?: string;
  paymentMethod: 'click' | 'atmos';
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  currency: string;
  couponId?: number;
  couponCode?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  metadata: Record<string, any>;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export class PaymentTransactionService {
  private supabase: any;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not found');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Create a new payment transaction
   */
  async createTransaction(params: CreateTransactionParams): Promise<PaymentTransaction> {
    const merchantTransId = this.generateMerchantTransId(params.paymentMethod);
    
    const transactionData = {
      user_id: params.userId,
      user_email: params.userEmail,
      merchant_trans_id: merchantTransId,
      payment_method: params.paymentMethod,
      original_amount: params.originalAmount,
      discount_amount: params.discountAmount || 0,
      final_amount: params.finalAmount,
      currency: 'UZS',
      coupon_id: params.couponId,
      coupon_code: params.couponCode,
      status: 'pending',
      metadata: params.metadata || {}
    };

    const { data, error } = await this.supabase
      .from('payment_transactions')
      .insert(transactionData)
      .select()
      .single();

    if (error) {
      console.error('[PaymentTransactionService] Failed to create transaction:', error);
      throw new Error(`Failed to create transaction: ${error.message}`);
    }

    return this.mapToTransaction(data);
  }

  /**
   * Get transaction by merchant transaction ID
   */
  async getTransactionByMerchantId(merchantTransId: string): Promise<PaymentTransaction | null> {
    const { data, error } = await this.supabase
      .from('payment_transactions')
      .select('*')
      .eq('merchant_trans_id', merchantTransId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // Not found
        return null;
      }
      console.error('[PaymentTransactionService] Failed to get transaction:', error);
      throw new Error(`Failed to get transaction: ${error.message}`);
    }

    return data ? this.mapToTransaction(data) : null;
  }

  /**
   * Get transaction by external transaction ID (from payment provider)
   */
  async getTransactionByExternalId(externalTransId: string): Promise<PaymentTransaction | null> {
    const { data, error } = await this.supabase
      .from('payment_transactions')
      .select('*')
      .eq('external_trans_id', externalTransId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // Not found
        return null;
      }
      console.error('[PaymentTransactionService] Failed to get transaction:', error);
      throw new Error(`Failed to get transaction: ${error.message}`);
    }

    return data ? this.mapToTransaction(data) : null;
  }

  /**
   * Update transaction status
   */
  async updateTransactionStatus(
    transactionId: string, 
    status: PaymentTransaction['status'],
    externalTransId?: string,
    errorMessage?: string
  ): Promise<PaymentTransaction> {
    const updateData: any = { status };
    
    if (externalTransId) {
      updateData.external_trans_id = externalTransId;
    }
    
    if (errorMessage) {
      updateData.error_message = errorMessage;
    }
    
    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }

    const { data, error } = await this.supabase
      .from('payment_transactions')
      .update(updateData)
      .eq('id', transactionId)
      .select()
      .single();

    if (error) {
      console.error('[PaymentTransactionService] Failed to update transaction:', error);
      throw new Error(`Failed to update transaction: ${error.message}`);
    }

    return this.mapToTransaction(data);
  }

  /**
   * Complete a payment transaction and update user tier
   */
  async completeTransaction(transactionId: string, externalTransId?: string): Promise<{
    success: boolean;
    transaction?: PaymentTransaction;
    error?: string;
  }> {
    // Use the database function to complete the transaction atomically
    const { data, error } = await this.supabase
      .rpc('complete_payment_transaction', {
        p_transaction_id: transactionId,
        p_external_trans_id: externalTransId
      });

    if (error) {
      console.error('[PaymentTransactionService] Failed to complete transaction:', error);
      return {
        success: false,
        error: error.message
      };
    }

    if (!data.success) {
      return {
        success: false,
        error: data.error
      };
    }

    // Get the updated transaction
    const transaction = await this.getTransactionById(transactionId);
    
    return {
      success: true,
      transaction: transaction!
    };
  }

  /**
   * Get transaction by ID
   */
  async getTransactionById(transactionId: string): Promise<PaymentTransaction | null> {
    const { data, error } = await this.supabase
      .from('payment_transactions')
      .select('*')
      .eq('id', transactionId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // Not found
        return null;
      }
      console.error('[PaymentTransactionService] Failed to get transaction:', error);
      throw new Error(`Failed to get transaction: ${error.message}`);
    }

    return data ? this.mapToTransaction(data) : null;
  }

  /**
   * Get user's payment transactions
   */
  async getUserTransactions(userId: string, limit = 10): Promise<PaymentTransaction[]> {
    const { data, error } = await this.supabase
      .from('payment_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[PaymentTransactionService] Failed to get user transactions:', error);
      throw new Error(`Failed to get user transactions: ${error.message}`);
    }

    return data.map(this.mapToTransaction);
  }

  /**
   * Generate a unique merchant transaction ID
   */
  private generateMerchantTransId(paymentMethod: string): string {
    const timestamp = Date.now();
    const randomPart = Math.random().toString(36).substring(2, 8);
    return `P57_${paymentMethod.toUpperCase()}_${timestamp}_${randomPart}`;
  }

  /**
   * Map database record to PaymentTransaction interface
   */
  private mapToTransaction(data: any): PaymentTransaction {
    return {
      id: data.id,
      userId: data.user_id,
      userEmail: data.user_email,
      merchantTransId: data.merchant_trans_id,
      externalTransId: data.external_trans_id,
      paymentMethod: data.payment_method,
      originalAmount: parseFloat(data.original_amount),
      discountAmount: parseFloat(data.discount_amount || 0),
      finalAmount: parseFloat(data.final_amount),
      currency: data.currency,
      couponId: data.coupon_id,
      couponCode: data.coupon_code,
      status: data.status,
      metadata: data.metadata || {},
      errorMessage: data.error_message,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      completedAt: data.completed_at ? new Date(data.completed_at) : undefined
    };
  }
}