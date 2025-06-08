// ATMOS Payment Gateway Service
// Documentation: https://docs.atmos.uz/

export class AtmosService {
  private baseUrl = 'https://api.atmos.uz';
  private storeId: string;
  private consumerKey: string;
  private consumerSecret: string;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    this.storeId = process.env.ATMOS_STORE_ID!;
    this.consumerKey = process.env.ATMOS_CONSUMER_KEY!;
    this.consumerSecret = process.env.ATMOS_CONSUMER_SECRET!;

    if (!this.storeId || !this.consumerKey || !this.consumerSecret) {
      throw new Error('ATMOS credentials not configured');
    }

    console.log('ATMOS Service initialized for store:', this.storeId);
  }

  // Get access token (valid for 1 hour)
  private async getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const credentials = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');
      
      const response = await fetch(`${this.baseUrl}/merchant/v1/oauth/token`, {
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

      const data = await response.json();
      
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
  private async apiRequest(endpoint: string, data: any): Promise<any> {
    const token = await this.getAccessToken();
    
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error('ATMOS API Error:', responseData);
        throw new Error(`API request failed: ${response.status}`);
      }

      return responseData;
    } catch (error) {
      console.error('ATMOS API Request Error:', error);
      throw error;
    }
  }

  // Create transaction
  async createTransaction(amount: number, orderId: string, description: string = 'Protokol 57 Payment'): Promise<any> {
    const transactionData = {
      store_id: this.storeId,
      amount: amount, // Amount in tiins (1 UZS = 100 tiins)
      order_id: orderId,
      description: description,
      lang: 'uz', // Language preference
      success_url: 'https://srv852801.hstgr.cloud/payment/atmos/success',
      error_url: 'https://srv852801.hstgr.cloud/payment/atmos/error'
    };

    console.log('Creating ATMOS transaction:', transactionData);

    try {
      const result = await this.apiRequest('/merchant/v1/transactions/create', transactionData);
      console.log('✅ ATMOS transaction created:', result);
      return result;
    } catch (error) {
      console.error('❌ ATMOS create transaction error:', error);
      throw error;
    }
  }

  // Pre-apply transaction (process card details)
  async preApplyTransaction(transactionId: string, cardNumber: string, expiry: string): Promise<any> {
    const preApplyData = {
      transaction_id: transactionId,
      card_number: cardNumber,
      card_expire: expiry
    };

    console.log('Pre-applying ATMOS transaction:', { transaction_id: transactionId });

    try {
      const result = await this.apiRequest('/merchant/v1/transactions/pre-apply', preApplyData);
      console.log('✅ ATMOS transaction pre-applied:', result);
      return result;
    } catch (error) {
      console.error('❌ ATMOS pre-apply error:', error);
      throw error;
    }
  }

  // Confirm transaction with OTP
  async confirmTransaction(transactionId: string, otpCode: string): Promise<any> {
    const confirmData = {
      transaction_id: transactionId,
      otp: otpCode
    };

    console.log('Confirming ATMOS transaction:', { transaction_id: transactionId });

    try {
      const result = await this.apiRequest('/merchant/v1/transactions/confirm', confirmData);
      console.log('✅ ATMOS transaction confirmed:', result);
      return result;
    } catch (error) {
      console.error('❌ ATMOS confirm error:', error);
      throw error;
    }
  }

  // Get transaction details
  async getTransaction(transactionId: string): Promise<any> {
    const token = await this.getAccessToken();
    
    try {
      const response = await fetch(`${this.baseUrl}/merchant/v1/transactions/${transactionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('ATMOS Get Transaction Error:', result);
        throw new Error(`Get transaction failed: ${response.status}`);
      }

      return result;
    } catch (error) {
      console.error('❌ ATMOS get transaction error:', error);
      throw error;
    }
  }

  // Reverse transaction (if needed)
  async reverseTransaction(transactionId: string): Promise<any> {
    const reverseData = {
      transaction_id: transactionId
    };

    console.log('Reversing ATMOS transaction:', { transaction_id: transactionId });

    try {
      const result = await this.apiRequest('/merchant/v1/transactions/reverse', reverseData);
      console.log('✅ ATMOS transaction reversed:', result);
      return result;
    } catch (error) {
      console.error('❌ ATMOS reverse error:', error);
      throw error;
    }
  }
}