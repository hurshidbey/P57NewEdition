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
    // TEMPORARY: Reverting to old URLs until IP whitelisting is complete
    const env = process.env.ATMOS_ENV || 'production';
    this.baseUrl = env === 'test' ? 'https://test-partner.atmos.uz' : 'https://partner.atmos.uz';

    if (!this.storeId || !this.consumerKey || !this.consumerSecret) {
      throw new Error('ATMOS credentials not configured');
    }

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
        headers: {
          // Use configured domain or fallback to primary domain for Origin/Referer
          'Origin': process.env.ATMOS_ALLOWED_ORIGIN || process.env.APP_DOMAIN || 'https://app.p57.uz',
          'Referer': (process.env.ATMOS_ALLOWED_ORIGIN || process.env.APP_DOMAIN || 'https://app.p57.uz') + '/',
          'User-Agent': 'Protokol57/1.0',
          ...options.headers
        }
      };

      const req = https.request(requestOptions, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const contentType = res.headers['content-type'] || '';
            const result = {
              ok: res.statusCode! >= 200 && res.statusCode! < 300,
              status: res.statusCode,
              contentType: contentType,
              json: () => {
                // Check if response is actually JSON before parsing
                if (!contentType.includes('application/json') && !data.trim().startsWith('{') && !data.trim().startsWith('[')) {
                  throw new Error(`Expected JSON but received ${contentType || 'unknown content type'}. Response: ${data.substring(0, 200)}...`);
                }
                return Promise.resolve(JSON.parse(data));
              },
              text: () => Promise.resolve(data),
              headers: res.headers
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

    console.log('🔐 [ATMOS] Requesting new access token...');
    console.log(`🔐 [ATMOS] Using Store ID: ${this.storeId}`);
    console.log(`🔐 [ATMOS] Consumer Key: ${this.consumerKey.substring(0, 10)}...`);
    console.log(`🔐 [ATMOS] Base URL: ${this.baseUrl}`);

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

      const responseText = await response.text();
      console.log(`🔐 [ATMOS] Token response status: ${response.status}, Content-Type: ${response.contentType}`);
      
      if (!response.ok) {
        console.error(`❌ [ATMOS] Token request failed with status ${response.status}`);
        console.error(`❌ [ATMOS] Response content:`, responseText.substring(0, 500));
        
        // Check if response is HTML/XML (error page)
        if (responseText.startsWith('<') || responseText.includes('<!DOCTYPE')) {
          console.error(`❌ [ATMOS] Received HTML error page instead of JSON`);
          
          // Try to extract error from HTML
          const titleMatch = responseText.match(/<title>([^<]+)<\/title>/);
          const errorMatch = responseText.match(/<h1>([^<]+)<\/h1>/);
          const errorMessage = titleMatch?.[1] || errorMatch?.[1] || 'Authentication failed - received HTML error page';
          
          throw new Error(`ATMOS Authentication Error: ${errorMessage}. This may be due to domain restrictions or invalid credentials.`);
        }
        
        throw new Error(`Token request failed: ${response.status} ${responseText}`);
      }

      let data: AtmosTokenResponse;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error(`❌ [ATMOS] Failed to parse token response:`, responseText.substring(0, 200));
        
        // Check if it's an XML fault response
        if (responseText.includes('<faultstring>')) {
          const faultMatch = responseText.match(/<faultstring[^>]*>([^<]+)<\/faultstring>/);
          throw new Error(`ATMOS API Error: ${faultMatch?.[1] || 'Unknown XML fault'}`);
        }
        
        throw new Error('Invalid token response format - expected JSON but could not parse response');
      }
      
      if (!data.access_token) {
        console.error(`❌ [ATMOS] No access token in response:`, data);
        throw new Error('No access token received');
      }

      this.accessToken = data.access_token;
      // Set expiry to 55 minutes (5 minutes before actual expiry for safety)
      this.tokenExpiry = Date.now() + (55 * 60 * 1000);

      console.log(`✅ [ATMOS] Access token obtained successfully`);
      console.log(`✅ [ATMOS] Token expires at: ${new Date(this.tokenExpiry).toISOString()}`);

      return this.accessToken;
    } catch (error) {

      throw new Error(`Failed to get ATMOS access token: ${error}`);
    }
  }

  // Make authenticated API request with retry logic
  private async apiRequest(endpoint: string, data: any, method: string = 'POST', retryCount: number = 0): Promise<any> {
    try {
      const token = await this.getAccessToken();
      
      console.log(`📤 [ATMOS] Making ${method} request to ${endpoint}`);
      
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
      console.log(`📥 [ATMOS] Response status: ${response.status}, Content-Type: ${response.contentType}`);
      
      // Check if response is HTML (error page)
      if (responseText.startsWith('<!DOCTYPE') || responseText.includes('<html')) {
        console.error(`❌ [ATMOS] Received HTML error page for ${endpoint}`);
        console.error(`❌ [ATMOS] HTML content:`, responseText.substring(0, 500));
        
        // Extract error from HTML if possible
        const titleMatch = responseText.match(/<title>([^<]+)<\/title>/);
        const h1Match = responseText.match(/<h1>([^<]+)<\/h1>/);
        const bodyMatch = responseText.match(/<body[^>]*>([^<]+)</);
        
        const errorInfo = titleMatch?.[1] || h1Match?.[1] || bodyMatch?.[1] || 'Unknown error';
        
        // Check for specific error patterns
        if (response.status === 401 || errorInfo.toLowerCase().includes('unauthorized')) {
          // Clear token cache and retry once
          if (retryCount === 0) {
            console.log(`🔄 [ATMOS] Got 401, clearing token cache and retrying...`);
            this.accessToken = null;
            this.tokenExpiry = 0;
            return this.apiRequest(endpoint, data, method, retryCount + 1);
          }
          throw new Error(`ATMOS Authentication failed: ${errorInfo}. Please check API credentials.`);
        }
        
        throw new Error(`ATMOS API Error: Received HTML page instead of JSON. ${errorInfo}`);
      }
      
      // Check if response is XML (fault response)
      if (responseText.startsWith('<') && !responseText.startsWith('<!')) {
        console.error(`❌ [ATMOS] Received XML response for ${endpoint}`);
        
        // Try to extract error message from XML
        const faultMatch = responseText.match(/<faultstring[^>]*>([^<]+)<\/faultstring>/);
        const codeMatch = responseText.match(/<faultcode[^>]*>([^<]+)<\/faultcode>/);
        const errorMessage = faultMatch?.[1] || 'Unknown XML fault';
        const errorCode = codeMatch?.[1] || 'UNKNOWN';
        
        // Check for token expiration
        if (errorCode === '900901' || errorMessage.toLowerCase().includes('token') || errorMessage.toLowerCase().includes('expired')) {
          if (retryCount === 0) {
            console.log(`🔄 [ATMOS] Token expired, refreshing and retrying...`);
            this.accessToken = null;
            this.tokenExpiry = 0;
            return this.apiRequest(endpoint, data, method, retryCount + 1);
          }
        }
        
        throw new Error(`ATMOS API Fault (${errorCode}): ${errorMessage}`);
      }
      
      // Parse as JSON
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.error(`❌ [ATMOS] Failed to parse response as JSON:`, responseText.substring(0, 200));
        throw new Error(`Invalid JSON response from ATMOS API: ${parseError.message}`);
      }

      if (!response.ok) {
        console.error(`❌ [ATMOS] API request failed:`, responseData);
        throw new Error(responseData.result?.description || responseData.message || `API request failed: ${response.status}`);
      }

      return responseData;
    } catch (error) {
      console.error(`❌ [ATMOS] API request error for ${endpoint}:`, error);
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

    try {
      const result = await this.apiRequest('/merchant/pay/create', transactionData);

      return result;
    } catch (error) {

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

    console.log(`📝 [ATMOS] Pre-apply request:`, {
      transaction_id: transactionId,
      card_number: cardNumber.substring(0, 4) + '****' + cardNumber.substring(12),
      expiry: expiry,
      store_id: this.storeId
    });

    try {
      const result = await this.apiRequest('/merchant/pay/pre-apply', preApplyData);
      console.log('✅ [ATMOS] Pre-apply result:', JSON.stringify(result, null, 2));
      return result;
    } catch (error) {
      console.error('❌ [ATMOS] Pre-apply error:', error);
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

    console.log('Apply data:', JSON.stringify(applyData, null, 2));

    try {
      // TEMPORARY: Reverting to old endpoint until IP whitelisting is complete
      const result = await this.apiRequest('/merchant/pay/confirm', applyData);

      console.log('📥 [ATMOS] Apply transaction result:', JSON.stringify(result, null, 2));
      return result;
    } catch (error) {
      console.error('❌ [ATMOS] Apply transaction error:', error);
      throw error;
    }
  }

  // Get transaction details
  async getTransaction(transactionId: number): Promise<any> {
    const data = {
      store_id: this.storeId,
      transaction_id: transactionId
    };

    try {
      const result = await this.apiRequest('/merchant/pay/get', data);

      return result;
    } catch (error) {

      throw error;
    }
  }

  // Reverse/Cancel transaction (if needed)
  async reverseTransaction(successTransId: number, reason?: string): Promise<any> {
    const reverseData = {
      transaction_id: successTransId, // Use success_trans_id from confirmed transaction
      reason: reason || 'User requested cancellation'
    };

    try {
      const result = await this.apiRequest('/merchant/pay/reverse', reverseData);

      return result;
    } catch (error) {

      throw error;
    }
  }

  // Resend OTP if needed
  async resendOtp(transactionId: number): Promise<any> {
    const data = {
      transaction_id: transactionId,
      store_id: this.storeId // Added store_id as required by Atmos API
    };

    console.log(`📤 [ATMOS] Resending OTP for transaction ${transactionId}`);

    try {
      const result = await this.apiRequest('/merchant/pay/otp-resend', data);
      console.log('✅ [ATMOS] OTP resend result:', JSON.stringify(result, null, 2));
      return result;
    } catch (error) {
      console.error('❌ [ATMOS] OTP resend error:', error);
      throw error;
    }
  }

  // For subscription/recurring payments - bind card
  async bindCardInit(cardNumber: string, expiry: string): Promise<any> {
    const bindData = {
      card_number: cardNumber,
      expiry: expiry // Format: YYMM
    };

    try {
      const result = await this.apiRequest('/partner/bind-card/init', bindData);

      return result;
    } catch (error) {

      throw error;
    }
  }

  // Confirm card binding
  async bindCardConfirm(transactionId: number, otp: string): Promise<any> {
    const confirmData = {
      transaction_id: transactionId,
      otp: otp
    };

    try {
      const result = await this.apiRequest('/partner/bind-card/confirm', confirmData);

      return result;
    } catch (error) {

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

      // For bound cards, we can directly apply with OTP 111111
      const applyResult = await this.applyTransaction(createResult.transaction_id, '111111');
      
      return applyResult;
    } catch (error) {

      throw error;
    }
  }
}
