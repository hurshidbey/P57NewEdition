// ATMOS Payment Routes
import { Router } from 'express';
import { AtmosService } from './atmos-service';

export function setupAtmosRoutes(): Router {
  const router = Router();
  const atmosService = new AtmosService();

  // Create transaction
  router.post('/api/atmos/create-transaction', async (req, res) => {
    try {
      const { amount, description } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid amount'
        });
      }

      // Generate unique order ID
      const orderId = `ATMOS-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

      const result = await atmosService.createTransaction(
        amount,
        orderId,
        description || 'Protokol 57 Payment'
      );

      console.log('✅ ATMOS transaction created for order:', orderId);

      res.json({
        success: true,
        result: result.result,
        orderId
      });

    } catch (error: any) {
      console.error('❌ ATMOS create transaction error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create transaction'
      });
    }
  });

  // Pre-apply transaction (process card details)
  router.post('/api/atmos/pre-apply', async (req, res) => {
    try {
      const { transactionId, cardNumber, expiry } = req.body;

      if (!transactionId || !cardNumber || !expiry) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields'
        });
      }

      // Validate card number (basic validation)
      if (!/^\d{16}$/.test(cardNumber)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid card number format'
        });
      }

      // Validate expiry (MMYY format)
      if (!/^\d{4}$/.test(expiry)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid expiry format (MMYY required)'
        });
      }

      const result = await atmosService.preApplyTransaction(
        transactionId,
        cardNumber,
        expiry
      );

      console.log('✅ ATMOS transaction pre-applied:', transactionId);

      res.json({
        success: true,
        result: result.result
      });

    } catch (error: any) {
      console.error('❌ ATMOS pre-apply error:', error);
      
      // Handle specific ATMOS errors
      let message = 'Card validation failed';
      if (error.message.includes('Invalid card')) {
        message = 'Karta ma\'lumotlari noto\'g\'ri';
      } else if (error.message.includes('Expired')) {
        message = 'Kartaning amal qilish muddati tugagan';
      } else if (error.message.includes('Insufficient')) {
        message = 'Kartada yetarli mablag\' yo\'q';
      }

      res.status(400).json({
        success: false,
        message
      });
    }
  });

  // Confirm transaction with OTP
  router.post('/api/atmos/confirm', async (req, res) => {
    try {
      const { transactionId, otpCode } = req.body;

      if (!transactionId || !otpCode) {
        return res.status(400).json({
          success: false,
          message: 'Missing transaction ID or OTP code'
        });
      }

      // Validate OTP format
      if (!/^\d{6}$/.test(otpCode)) {
        return res.status(400).json({
          success: false,
          message: 'SMS kod 6 raqamdan iborat bo\'lishi kerak'
        });
      }

      const result = await atmosService.confirmTransaction(transactionId, otpCode);

      console.log('✅ ATMOS transaction confirmed:', transactionId);

      // Check if transaction was successful
      if (result.result && result.result.status === 'success') {
        res.json({
          success: true,
          result: result.result,
          message: 'To\'lov muvaffaqiyatli amalga oshirildi'
        });
      } else {
        throw new Error('Transaction confirmation failed');
      }

    } catch (error: any) {
      console.error('❌ ATMOS confirm error:', error);
      
      // Handle specific OTP errors
      let message = 'SMS kodni tasdiqlashda xatolik';
      if (error.message.includes('Invalid OTP') || error.message.includes('Wrong code')) {
        message = 'SMS kod noto\'g\'ri';
      } else if (error.message.includes('Expired') || error.message.includes('timeout')) {
        message = 'SMS kodning amal qilish muddati tugagan';
      }

      res.status(400).json({
        success: false,
        message
      });
    }
  });

  // Get transaction details
  router.get('/api/atmos/transaction/:transactionId', async (req, res) => {
    try {
      const { transactionId } = req.params;

      if (!transactionId) {
        return res.status(400).json({
          success: false,
          message: 'Transaction ID required'
        });
      }

      const result = await atmosService.getTransaction(transactionId);

      res.json({
        success: true,
        result: result.result
      });

    } catch (error: any) {
      console.error('❌ ATMOS get transaction error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get transaction details'
      });
    }
  });

  // Test ATMOS connection
  router.get('/api/atmos/test', async (_req, res) => {
    try {
      // Try to get access token to test credentials
      const atmosService = new AtmosService();
      await (atmosService as any).getAccessToken();

      res.json({
        success: true,
        message: 'ATMOS connection successful',
        storeId: process.env.ATMOS_STORE_ID,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      console.error('❌ ATMOS test error:', error);
      res.status(500).json({
        success: false,
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Success callback
  router.get('/payment/atmos/success', (_req, res) => {
    res.redirect('/?payment=success&method=atmos');
  });

  // Error callback
  router.get('/payment/atmos/error', (_req, res) => {
    res.redirect('/?payment=error&method=atmos');
  });

  console.log('✅ ATMOS routes configured');
  return router;
}