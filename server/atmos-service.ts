// ATMOS Payment Gateway Service
// Documentation: https://docs.atmos.uz/

import https from 'https';
import { URL } from 'url';

interface AtmosTokenResponse {
  access_token: string;
  scope: string;
  token_type: string;
  expires_in: number;
}

interface AtmosTransactionResponse {
  result: {
    code: string;
    description: string;
  };
  transaction_id?: number;
  store_transaction?: any;
}

export class AtmosService {
  private baseUrl: string;
  private storeId: string;
  private consumerKey: string;
  private consumerSecret: string;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    this.storeId = process.env.ATMOS_STORE_ID!;
    this.consumerKey = process.env.ATMOS_CONSUMER_KEY!;
    this.consumerSecret = process.env.ATMOS_CONSUMER_SECRET!;
    
    // Use different base URLs for test and production
    const env = process.env.ATMOS_ENV || 'production';
    this.baseUrl = env === 'test' ? 'https://test-partner.atmos.uz' : 'https://partner.atmos.uz';

    if (!this.storeId || !this.consumerKey || !this.consumerSecret) {
      throw new Error('ATMOS credentials not configured');
    }

    console.log('ATMOS Service initialized for store:', this.storeId);
  }

  // Helper function to make HTTPS requests
  private async makeRequest(url: string, options: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const requestOptions = {
        hostname: urlObj.hostname,
        port: urlObj.port || 443,
        path: urlObj.pathname + urlObj.search,
        method: options.method || 'GET',
        headers: options.headers || {}
      };

      const req = https.request(requestOptions, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const result = {
              ok: res.statusCode! >= 200 && res.statusCode! < 300,
              status: res.statusCode,
              json: () => Promise.resolve(JSON.parse(data)),
              text: () => Promise.resolve(data)
            };
            resolve(result);
          } catch (error) {
            reject(error);
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      if (options.body) {
        req.write(options.body);
      }

      req.end();
    });
  }

  // Get access token (valid for 1 hour)
  private async getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const credentials = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');
      
      const response = await this.makeRequest(`${this.baseUrl}/token`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Token request failed: ${response.status} ${errorText}`);
      }

      const data: AtmosTokenResponse = await response.json();
      
      if (!data.access_token) {
        throw new Error('No access token received');
      }

      this.accessToken = data.access_token;
      // Set expiry to 55 minutes (5 minutes before actual expiry for safety)
      this.tokenExpiry = Date.now() + (55 * 60 * 1000);
      
      console.log('✅ ATMOS access token obtained');
      return this.accessToken;
    } catch (error) {
      console.error('❌ ATMOS token error:', error);
      throw new Error(`Failed to get ATMOS access token: ${error}`);
    }
  }

  // Make authenticated API request
  private async apiRequest(endpoint: string, data: any, method: string = 'POST'): Promise<any> {
    const token = await this.getAccessToken();
    
    try {
      const response = await this.makeRequest(`${this.baseUrl}${endpoint}`, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: method !== 'GET' ? JSON.stringify(data) : undefined
      });

      // First get the raw response text
      const responseText = await response.text();
      
      // Check if response is XML (fault response)
      if (responseText.startsWith('<')) {
        console.error('ATMOS API returned XML fault:', responseText);
        
        // Try to extract error message from XML
        const faultMatch = responseText.match(/<faultstring[^>]*>([^<]+)<\/faultstring>/);
        const errorMessage = faultMatch ? faultMatch[1] : 'ATMOS API returned XML fault response';
        
        throw new Error(errorMessage);
      }
      
      // Parse as JSON
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse ATMOS response:', responseText);
        throw new Error('Invalid response format from ATMOS API');
      }

      if (!response.ok) {
        console.error('ATMOS API Error:', responseData);
        throw new Error(responseData.result?.description || `API request failed: ${response.status}`);
      }

      return responseData;
    } catch (error) {
      console.error('ATMOS API Request Error:', error);
      throw error;
    }
  }

  // Create transaction for one-time payment
  async createTransaction(amount: number, account: string, terminalId?: string): Promise<AtmosTransactionResponse> {
    const transactionData: any = {
      amount: amount, // Amount in tiins (1 UZS = 100 tiins)
      account: account, // Unique payment identifier
      store_id: this.storeId, // Keep as string as ATMOS expects
      lang: 'ru' // Language for responses
    };

    // Only add terminal_id if provided
    if (terminalId) {
      transactionData.terminal_id = terminalId;
    }

    console.log('Creating ATMOS transaction:', transactionData);

    try {
      const result = await this.apiRequest('/merchant/pay/create', transactionData);
      console.log('✅ ATMOS transaction created:', result);
      return result;
    } catch (error) {
      console.error('❌ ATMOS create transaction error:', error);
      throw error;
    }
  }

  // Pre-apply transaction (send card details and get OTP)
  async preApplyTransaction(transactionId: number, cardNumber: string, expiry: string): Promise<any> {
    const preApplyData = {
      transaction_id: transactionId,
      card_number: cardNumber,
      expiry: expiry, // Format: YYMM
      store_id: this.storeId
    };

    console.log('Pre-applying ATMOS transaction:', { transaction_id: transactionId, store_id: this.storeId });

    try {
      const result = await this.apiRequest('/merchant/pay/pre-apply', preApplyData);
      console.log('✅ ATMOS transaction pre-applied, OTP sent');
      return result;
    } catch (error) {
      console.error('❌ ATMOS pre-apply error:', error);
      throw error;
    }
  }

  // Apply/Confirm transaction with OTP
  async applyTransaction(transactionId: number, otpCode: string): Promise<any> {
    const applyData = {
      transaction_id: transactionId,
      otp: otpCode,
      store_id: this.storeId
    };

    console.log('Applying ATMOS transaction:', { transaction_id: transactionId, store_id: this.storeId });
    console.log('Apply data:', JSON.stringify(applyData, null, 2));

    try {
      const result = await this.apiRequest('/merchant/pay/confirm', applyData);
      console.log('✅ ATMOS transaction applied:', result);
      return result;
    } catch (error) {
      console.error('❌ ATMOS apply error:', error);
      throw error;
    }
  }

  // Get transaction details
  async getTransaction(transactionId: number): Promise<any> {
    const data = {
      store_id: this.storeId,
      transaction_id: transactionId
    };

    console.log('Getting ATMOS transaction:', { transaction_id: transactionId });

    try {
      const result = await this.apiRequest('/merchant/pay/get', data);
      console.log('✅ ATMOS transaction details:', result);
      return result;
    } catch (error) {
      console.error('❌ ATMOS get transaction error:', error);
      throw error;
    }
  }

  // Reverse/Cancel transaction (if needed)
  async reverseTransaction(successTransId: number, reason?: string): Promise<any> {
    const reverseData = {
      transaction_id: successTransId, // Use success_trans_id from confirmed transaction
      reason: reason || 'User requested cancellation'
    };

    console.log('Reversing ATMOS transaction:', { transaction_id: successTransId });

    try {
      const result = await this.apiRequest('/merchant/pay/reverse', reverseData);
      console.log('✅ ATMOS transaction reversed:', result);
      return result;
    } catch (error) {
      console.error('❌ ATMOS reverse error:', error);
      throw error;
    }
  }

  // Resend OTP if needed
  async resendOtp(transactionId: number): Promise<any> {
    const data = {
      transaction_id: transactionId
    };

    console.log('Resending OTP for transaction:', transactionId);

    try {
      const result = await this.apiRequest('/merchant/pay/otp-resend', data);
      console.log('✅ OTP resent successfully');
      return result;
    } catch (error) {
      console.error('❌ ATMOS resend OTP error:', error);
      throw error;
    }
  }

  // For subscription/recurring payments - bind card
  async bindCardInit(cardNumber: string, expiry: string): Promise<any> {
    const bindData = {
      card_number: cardNumber,
      expiry: expiry // Format: YYMM
    };

    console.log('Initiating card binding');

    try {
      const result = await this.apiRequest('/partner/bind-card/init', bindData);
      console.log('✅ Card binding initiated:', result);
      return result;
    } catch (error) {
      console.error('❌ Card binding init error:', error);
      throw error;
    }
  }

  // Confirm card binding
  async bindCardConfirm(transactionId: number, otp: string): Promise<any> {
    const confirmData = {
      transaction_id: transactionId,
      otp: otp
    };

    console.log('Confirming card binding:', { transaction_id: transactionId });

    try {
      const result = await this.apiRequest('/partner/bind-card/confirm', confirmData);
      console.log('✅ Card binding confirmed:', result);
      return result;
    } catch (error) {
      console.error('❌ Card binding confirm error:', error);
      throw error;
    }
  }

  // Create transaction with bound card (for subscriptions)
  async createBoundCardTransaction(amount: number, account: string, cardToken: string, terminalId?: string): Promise<any> {
    // First create the transaction
    const createResult = await this.createTransaction(amount, account, terminalId);
    
    if (!createResult.transaction_id) {
      throw new Error('Failed to create transaction');
    }

    // Then pre-apply with card token
    const preApplyData = {
      transaction_id: createResult.transaction_id,
      card_token: cardToken,
      store_id: this.storeId
    };

    try {
      const preApplyResult = await this.apiRequest('/merchant/pay/pre-apply', preApplyData);
      console.log('✅ Bound card transaction pre-applied');
      
      // For bound cards, we can directly apply with OTP 111111
      const applyResult = await this.applyTransaction(createResult.transaction_id, '111111');
      
      return applyResult;
    } catch (error) {
      console.error('❌ Bound card transaction error:', error);
      throw error;
    }
  }
}
