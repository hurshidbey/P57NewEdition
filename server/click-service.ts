// Click.uz Payment Gateway Service
// Documentation: https://docs.click.uz/

import crypto from 'crypto';
import https from 'https';
import { URL } from 'url';

interface ClickPrepareRequest {
  click_trans_id: string;
  service_id: number;
  click_paydoc_id: string;
  merchant_trans_id: string;
  amount: number;
  action: number;
  error: number;
  error_note: string;
  sign_time: string;
  sign_string: string;
}

interface ClickCompleteRequest extends ClickPrepareRequest {
  merchant_prepare_id: string;
}

interface ClickResponse {
  click_trans_id: string;
  merchant_trans_id: string;
  merchant_prepare_id?: string;
  merchant_confirm_id?: string;
  error: number;
  error_note: string;
}

// Click.uz Error Codes
export const CLICK_ERRORS = {
  SUCCESS: 0,
  SIGN_CHECK_FAILED: -1,
  INCORRECT_AMOUNT: -2,
  ORDER_NOT_FOUND: -3,
  ORDER_ALREADY_PAID: -4,
  ORDER_CANCELLED: -5,
  TRANSACTION_NOT_FOUND: -6,
  TRANSACTION_EXPIRED: -7,
  ORDER_PENDING: -8,
  INVALID_REQUEST: -9,
} as const;

export class ClickService {
  private serviceId: string;
  private merchantId: string;
  private secretKey: string;
  private merchantUserId: string;
  private baseUrl: string;
  private returnUrl: string;

  constructor() {
    this.serviceId = process.env.CLICK_SERVICE_ID!;
    this.merchantId = process.env.CLICK_MERCHANT_ID!;
    this.secretKey = process.env.CLICK_SECRET_KEY!;
    this.merchantUserId = process.env.CLICK_MERCHANT_USER_ID!;
    this.returnUrl = process.env.CLICK_RETURN_URL || 'https://app.p57.uz/api/click/return';
    
    const env = process.env.CLICK_ENV || 'production';
    this.baseUrl = env === 'test' 
      ? 'https://my.click.uz/services/pay/test'
      : 'https://my.click.uz/services/pay';

    console.log(`🔧 [CLICK] Service initialized:`, {
      env,
      baseUrl: this.baseUrl,
      serviceId: this.serviceId,
      merchantId: this.merchantId,
      returnUrl: this.returnUrl
    });

    // Only require credentials in production
    if (!this.serviceId || !this.merchantId || !this.secretKey || !this.merchantUserId) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Click.uz credentials not configured');
      } else {
        console.warn('⚠️  [CLICK] Service running in development mode without credentials');
      }
    }
  }

  // Generate MD5 hash for request verification
  private generateHash(data: string): string {
    return crypto.createHash('md5').update(data).digest('hex');
  }

  // Verify incoming request signature
  verifySignature(params: ClickPrepareRequest | ClickCompleteRequest): boolean {
    const { sign_string, sign_time, action } = params;
    
    // Build the hash string based on action type
    let hashString: string;
    
    if (action === 0) {
      // Prepare request
      hashString = `${params.click_trans_id}${this.serviceId}${this.secretKey}${params.merchant_trans_id}${params.amount}${action}${sign_time}`;
    } else {
      // Complete request
      const completeParams = params as ClickCompleteRequest;
      hashString = `${params.click_trans_id}${this.serviceId}${this.secretKey}${params.merchant_trans_id}${completeParams.merchant_prepare_id}${params.amount}${action}${sign_time}`;
    }
    
    const expectedHash = this.generateHash(hashString);
    
    console.log(`🔐 [CLICK] Signature verification:`, {
      action,
      expectedHash,
      receivedHash: sign_string,
      valid: expectedHash === sign_string
    });
    
    return expectedHash === sign_string;
  }

  // Handle prepare request (action=0)
  async handlePrepare(params: ClickPrepareRequest): Promise<ClickResponse> {
    console.log(`📥 [CLICK] Prepare request:`, params);

    // Verify signature
    if (!this.verifySignature(params)) {
      console.error(`❌ [CLICK] Signature verification failed`);
      return {
        click_trans_id: params.click_trans_id,
        merchant_trans_id: params.merchant_trans_id,
        error: CLICK_ERRORS.SIGN_CHECK_FAILED,
        error_note: 'Invalid signature'
      };
    }

    try {
      // Extract order/payment ID from merchant_trans_id
      // Format: "P57-{timestamp}-{random}"
      const orderId = params.merchant_trans_id;
      
      // Verify amount (Click sends amount in soums, not tiins)
      const expectedAmount = 1425000; // Base price in soums
      
      // Check for coupon application
      // In real implementation, we'd check database for the order amount
      // For now, we'll accept the amount if it's reasonable
      if (params.amount <= 0) {
        return {
          click_trans_id: params.click_trans_id,
          merchant_trans_id: params.merchant_trans_id,
          error: CLICK_ERRORS.INCORRECT_AMOUNT,
          error_note: 'Invalid amount'
        };
      }

      // Generate prepare ID
      const merchantPrepareId = `prepare_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      // In production, save transaction to database here
      console.log(`✅ [CLICK] Prepare successful:`, {
        orderId,
        amount: params.amount,
        merchantPrepareId
      });

      return {
        click_trans_id: params.click_trans_id,
        merchant_trans_id: params.merchant_trans_id,
        merchant_prepare_id: merchantPrepareId,
        error: CLICK_ERRORS.SUCCESS,
        error_note: 'Success'
      };

    } catch (error) {
      console.error(`❌ [CLICK] Prepare error:`, error);
      return {
        click_trans_id: params.click_trans_id,
        merchant_trans_id: params.merchant_trans_id,
        error: CLICK_ERRORS.INVALID_REQUEST,
        error_note: 'Internal error'
      };
    }
  }

  // Handle complete request (action=1)
  async handleComplete(params: ClickCompleteRequest): Promise<ClickResponse> {
    console.log(`📥 [CLICK] Complete request:`, params);

    // Verify signature
    if (!this.verifySignature(params)) {
      console.error(`❌ [CLICK] Signature verification failed`);
      return {
        click_trans_id: params.click_trans_id,
        merchant_trans_id: params.merchant_trans_id,
        merchant_prepare_id: params.merchant_prepare_id,
        error: CLICK_ERRORS.SIGN_CHECK_FAILED,
        error_note: 'Invalid signature'
      };
    }

    try {
      // Verify prepare ID exists
      if (!params.merchant_prepare_id) {
        return {
          click_trans_id: params.click_trans_id,
          merchant_trans_id: params.merchant_trans_id,
          error: CLICK_ERRORS.TRANSACTION_NOT_FOUND,
          error_note: 'Transaction not found'
        };
      }

      // Generate confirm ID
      const merchantConfirmId = `confirm_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      // In production:
      // 1. Update transaction status to completed
      // 2. Upgrade user tier to 'paid'
      // 3. Store payment record

      console.log(`✅ [CLICK] Payment completed successfully:`, {
        orderId: params.merchant_trans_id,
        amount: params.amount,
        merchantConfirmId
      });

      return {
        click_trans_id: params.click_trans_id,
        merchant_trans_id: params.merchant_trans_id,
        merchant_prepare_id: params.merchant_prepare_id,
        merchant_confirm_id: merchantConfirmId,
        error: CLICK_ERRORS.SUCCESS,
        error_note: 'Success'
      };

    } catch (error) {
      console.error(`❌ [CLICK] Complete error:`, error);
      return {
        click_trans_id: params.click_trans_id,
        merchant_trans_id: params.merchant_trans_id,
        merchant_prepare_id: params.merchant_prepare_id,
        error: CLICK_ERRORS.INVALID_REQUEST,
        error_note: 'Internal error'
      };
    }
  }

  // Generate payment URL for redirect
  generatePaymentUrl(amount: number, orderId: string, userId: string): string {
    // CRITICAL FIX: Click.uz expects amount as a decimal string with 2 decimal places
    // Example: 14250 should be sent as "14250.00"
    const formattedAmount = amount.toFixed(2);
    
    console.log(`💰 [CLICK] Payment URL parameters:`, {
      amount_raw: amount,
      amount_formatted: formattedAmount,
      service_id: this.serviceId,
      merchant_id: this.merchantId
    });
    
    // Build Click payment URL with parameters
    const params = new URLSearchParams({
      service_id: this.serviceId,
      merchant_id: this.merchantId,
      amount: formattedAmount,
      transaction_param: orderId,
      return_url: this.returnUrl
    });

    // Use the correct Click.uz payment URL format
    const paymentUrl = `https://my.click.uz/services/pay?${params.toString()}`;
    
    console.log(`🔗 [CLICK] Generated payment URL:`, paymentUrl);
    console.log(`🎯 [CLICK] Full URL breakdown:`, {
      base: 'https://my.click.uz/services/pay',
      params: params.toString(),
      decoded_amount: formattedAmount
    });
    
    return paymentUrl;
  }

  // Create payment form data for frontend
  createPaymentForm(amount: number, orderId: string, userId: string) {
    return {
      url: this.baseUrl,
      method: 'GET',
      params: {
        service_id: this.serviceId,
        merchant_id: this.merchantId,
        amount: amount.toString(),
        transaction_param: orderId,
        merchant_user_id: userId,
        return_url: this.returnUrl
      }
    };
  }

  // Parse return URL parameters after payment
  parseReturnParams(params: URLSearchParams): {
    success: boolean;
    transactionId?: string;
    error?: string;
  } {
    // Click.uz return parameters
    const clickTransId = params.get('click_trans_id');
    const merchantTransId = params.get('merchant_trans_id');
    const error = params.get('error');
    const errorNote = params.get('error_note');
    
    console.log(`🔍 [CLICK] Return params:`, {
      clickTransId,
      merchantTransId,
      error,
      errorNote,
      allParams: Array.from(params.entries())
    });

    // If there's an error parameter, payment failed
    // If there's a click_trans_id without error, payment succeeded
    const success = !error && !!clickTransId;

    return {
      success,
      transactionId: clickTransId || merchantTransId || undefined,
      error: errorNote || error || undefined
    };
  }
}