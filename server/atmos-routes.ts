// ATMOS Payment Routes
import { Router } from 'express';
import { AtmosService } from './atmos-service';

export function setupAtmosRoutes(): Router {
  const router = Router();
  const atmosService = new AtmosService();
  
  // Test route
  router.get('/atmos/test', async (_req, res) => {
    try {
      // Try to get access token to test credentials
      await (atmosService as any).getAccessToken();

      res.json({
        success: true,
        message: 'ATMOS connection successful',
        storeId: process.env.ATMOS_STORE_ID,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {

      res.status(500).json({
        success: false,
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Create transaction for one-time payment
  router.post('/atmos/create-transaction', async (req, res) => {
    try {
      const { amount, description } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid amount'
        });
      }

      // Generate unique account ID for this payment
      const account = `P57-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      const result = await atmosService.createTransaction(
        amount,
        account
      );

      if (result.result.code !== 'OK') {
        throw new Error(result.result.description || 'Transaction creation failed');
      }

      res.json({
        success: true,
        result: result.result,
        transaction_id: result.transaction_id,
        store_transaction: result.store_transaction
      });

    } catch (error: any) {

      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create transaction'
      });
    }
  });

  // Pre-apply transaction (send card details)
  router.post('/atmos/pre-apply', async (req, res) => {
    try {
      const { transactionId, cardNumber, expiry } = req.body;

      if (!transactionId || !cardNumber || !expiry) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields'
        });
      }

      // Validate card number (16 digits)
      if (!/^\d{16}$/.test(cardNumber)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid card number format (16 digits required)'
        });
      }

      // Validate expiry (MMYY format) and convert to YYMM
      if (!/^\d{4}$/.test(expiry)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid expiry format (MMYY required)'
        });
      }

      // Convert MMYY to YYMM format
      const formattedExpiry = expiry.substring(2) + expiry.substring(0, 2);

      const result = await atmosService.preApplyTransaction(
        transactionId,
        cardNumber,
        formattedExpiry
      );

      if (result.result.code !== 'OK') {
        throw new Error(result.result.description || 'Pre-apply failed');
      }

      res.json({
        success: true,
        result: result.result,
        message: 'SMS kod yuborildi'
      });

    } catch (error: any) {

      // Handle specific ATMOS errors
      let message = 'Karta ma\'lumotlarini tekshirishda xatolik';
      const errorMsg = error.message?.toLowerCase() || '';
      
      if (errorMsg.includes('karta') || errorMsg.includes('card')) {
        message = 'Karta ma\'lumotlari noto\'g\'ri';
      } else if (errorMsg.includes('muddati') || errorMsg.includes('expir')) {
        message = 'Kartaning amal qilish muddati tugagan';
      } else if (errorMsg.includes('mablag') || errorMsg.includes('balance') || errorMsg.includes('insufficient')) {
        message = 'Kartada yetarli mablag\' yo\'q';
      } else if (errorMsg.includes('sms')) {
        message = 'SMS xizmati ulanmagan. Bankingizga murojaat qiling';
      } else if (errorMsg.includes('blok') || errorMsg.includes('block')) {
        message = 'Karta bloklangan';
      }

      res.status(400).json({
        success: false,
        message,
        details: error.message
      });
    }
  });

  // Confirm transaction with OTP
  router.post('/atmos/confirm', async (req, res) => {
    try {
      const { transactionId, otpCode } = req.body;

      if (!transactionId || !otpCode) {
        return res.status(400).json({
          success: false,
          message: 'Transaction ID va SMS kod talab qilinadi'
        });
      }

      // Validate OTP format (6 digits)
      if (!/^\d{6}$/.test(otpCode)) {
        return res.status(400).json({
          success: false,
          message: 'SMS kod 6 raqamdan iborat bo\'lishi kerak'
        });
      }

      const result = await atmosService.applyTransaction(transactionId, otpCode);

      if (result.result.code !== 'OK') {
        throw new Error(result.result.description || 'Transaction confirmation failed');
      }

      // Check if transaction was successful
      if (result.store_transaction?.confirmed) {

        // Upgrade user tier to 'paid' after successful payment
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          try {
            const token = authHeader.split(' ')[1];
            const { createClient } = await import('@supabase/supabase-js');
            const supabase = createClient(
              'https://bazptglwzqstppwlvmvb.supabase.co',
              'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhenB0Z2x3enFzdHBwd2x2bXZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwMTc1OTAsImV4cCI6MjA2NDU5MzU5MH0.xRh0LCDWP6YD3F4mDGrIK3krwwZw-DRx0iXy7MmIPY8'
            );
            
            const { data: { user }, error: userError } = await supabase.auth.getUser(token);
            if (user && !userError) {
              // Update user metadata with paid tier
              const { error: updateError } = await supabase.auth.updateUser({
                data: {
                  ...user.user_metadata,
                  tier: 'paid',
                  paidAt: new Date().toISOString()
                }
              });
              
              if (updateError) {

              } else {

              }
            }
          } catch (error) {

          }
        }
        
        res.json({
          success: true,
          result: result.result,
          store_transaction: result.store_transaction,
          message: 'To\'lov muvaffaqiyatli amalga oshirildi. Premium imkoniyatlarga kirish ochildi!',
          tierUpgraded: true
        });
      } else {
        throw new Error('Transaction not confirmed');
      }

    } catch (error: any) {

      // Handle specific OTP errors
      let message = 'SMS kodni tasdiqlashda xatolik';
      const errorMsg = error.message?.toLowerCase() || '';
      
      if (errorMsg.includes('otp') || errorMsg.includes('kod')) {
        message = 'SMS kod noto\'g\'ri';
      } else if (errorMsg.includes('muddati') || errorMsg.includes('expir') || errorMsg.includes('timeout')) {
        message = 'SMS kodning amal qilish muddati tugagan';
      } else if (errorMsg.includes('yopiq') || errorMsg.includes('closed')) {
        message = 'Tranzaksiya allaqachon yakunlangan';
      }

      res.status(400).json({
        success: false,
        message,
        details: error.message
      });
    }
  });

  // Get transaction details
  router.get('/atmos/transaction/:transactionId', async (req, res) => {
    try {
      const transactionId = parseInt(req.params.transactionId);

      if (!transactionId || isNaN(transactionId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid transaction ID'
        });
      }

      const result = await atmosService.getTransaction(transactionId);

      res.json({
        success: true,
        result: result.result,
        store_transaction: result.store_transaction
      });

    } catch (error: any) {

      res.status(500).json({
        success: false,
        message: 'Failed to get transaction details',
        details: error.message
      });
    }
  });

  // Resend OTP
  router.post('/atmos/resend-otp', async (req, res) => {
    try {
      const { transactionId } = req.body;

      if (!transactionId) {
        return res.status(400).json({
          success: false,
          message: 'Transaction ID required'
        });
      }

      const result = await atmosService.resendOtp(transactionId);

      if (result.result.code !== 'OK') {
        throw new Error(result.result.description || 'Failed to resend OTP');
      }

      res.json({
        success: true,
        message: 'SMS kod qayta yuborildi',
        transaction_id: result.transaction_id
      });

    } catch (error: any) {

      res.status(500).json({
        success: false,
        message: 'SMS kodni qayta yuborishda xatolik',
        details: error.message
      });
    }
  });

  // Card binding endpoints (for subscriptions)
  router.post('/atmos/bind-card/init', async (req, res) => {
    try {
      const { cardNumber, expiry } = req.body;

      if (!cardNumber || !expiry) {
        return res.status(400).json({
          success: false,
          message: 'Card number and expiry required'
        });
      }

      // Convert MMYY to YYMM
      const formattedExpiry = expiry.substring(2) + expiry.substring(0, 2);

      const result = await atmosService.bindCardInit(cardNumber, formattedExpiry);

      if (result.result.code !== 'OK') {
        throw new Error(result.result.description || 'Card binding failed');
      }

      res.json({
        success: true,
        transaction_id: result.transaction_id,
        phone: result.phone,
        message: 'Karta ulash uchun SMS kod yuborildi'
      });

    } catch (error: any) {

      res.status(500).json({
        success: false,
        message: 'Kartani ulashda xatolik',
        details: error.message
      });
    }
  });

  router.post('/atmos/bind-card/confirm', async (req, res) => {
    try {
      const { transactionId, otp } = req.body;

      if (!transactionId || !otp) {
        return res.status(400).json({
          success: false,
          message: 'Transaction ID and OTP required'
        });
      }

      const result = await atmosService.bindCardConfirm(transactionId, otp);

      if (result.result.code !== 'OK') {
        throw new Error(result.result.description || 'Card binding confirmation failed');
      }

      res.json({
        success: true,
        card_token: result.data.card_token,
        card_info: {
          pan: result.data.pan,
          expiry: result.data.expiry,
          card_holder: result.data.card_holder
        },
        message: 'Karta muvaffaqiyatli ulandi'
      });

    } catch (error: any) {

      res.status(500).json({
        success: false,
        message: 'Kartani tasdiqlashda xatolik',
        details: error.message
      });
    }
  });

  // Success callback (not used in API integration, but kept for compatibility)
  router.get('/payment/atmos/success', (_req, res) => {
    res.redirect('/?payment=success&method=atmos');
  });

  // Error callback (not used in API integration, but kept for compatibility)
  router.get('/payment/atmos/error', (_req, res) => {
    res.redirect('/?payment=error&method=atmos');
  });

  return router;
}
