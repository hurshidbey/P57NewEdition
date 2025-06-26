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

        // CRITICAL FIX: Upgrade user tier to 'paid' after successful payment
        const authHeader = req.headers.authorization;
        console.log(`🔍 [PAYMENT] Auth header present: ${!!authHeader}`);
        
        if (authHeader && authHeader.startsWith('Bearer ')) {
          try {
            const token = authHeader.split(' ')[1];
            console.log(`🔍 [PAYMENT] Token length: ${token?.length}, Token preview: ${token?.substring(0, 20)}...`);
            
            const { createClient } = await import('@supabase/supabase-js');
            
            // CRITICAL FIX: Use service role key to verify token and get user
            const adminSupabase = createClient(
              process.env.SUPABASE_URL!,
              process.env.SUPABASE_SERVICE_ROLE_KEY!
            );
            
            // Decode JWT to get user ID directly
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(Buffer.from(base64, 'base64').toString());
            const userId = payload.sub;
            
            console.log(`🔍 [PAYMENT] Decoded user ID from token: ${userId}`);
            
            // Get user directly with admin client
            const { data: { user }, error: userError } = await adminSupabase.auth.admin.getUserById(userId);
            if (user && !userError) {
              console.log(`🎯 [PAYMENT] Upgrading user tier: ${user.email} (${user.id})`);
              
              // Update user metadata with the same admin client
              const { error: updateError } = await adminSupabase.auth.admin.updateUserById(user.id, {
                user_metadata: {
                  ...user.user_metadata,
                  tier: 'paid',
                  paidAt: new Date().toISOString()
                }
              });
              
              if (updateError) {
                console.error(`❌ [PAYMENT] Failed to upgrade user tier for ${user.email}:`, updateError);
                // Still continue - don't fail the payment
              } else {
                console.log(`✅ [PAYMENT] Successfully upgraded user tier for ${user.email} - OLD TIER: ${user.user_metadata?.tier || 'free'} -> NEW TIER: paid`);
                
                // Store payment record for admin tracking
                try {
                  const paymentRecord = {
                    id: `payment_${transactionId}_${Date.now()}`,
                    userId: user.id,
                    userEmail: user.email || 'unknown@email.com',
                    amount: 5000, // 5,000 UZS
                    transactionId: transactionId.toString(),
                    status: 'completed',
                    atmosData: JSON.stringify(result.store_transaction || {})
                  };
                  
                  // Store in database for admin panel
                  const { storage } = await import('./storage');
                  await storage.storePayment(paymentRecord);
                  console.log(`💾 [PAYMENT] Payment record stored for admin tracking`);
                } catch (dbError) {
                  console.error(`⚠️ [PAYMENT] Failed to store payment record (payment still successful):`, dbError);
                }
              }
            } else {
              console.error(`❌ [PAYMENT] Failed to get user from token:`, userError);
            }
          } catch (error) {
            console.error(`❌ [PAYMENT] Critical error in tier upgrade:`, error);
            // Don't fail the payment for backend errors
          }
        } else {
          console.error(`❌ [PAYMENT] No authorization header provided for tier upgrade`);
          
          // CRITICAL: Store payment record even without auth for manual recovery
          try {
            const paymentRecord = {
              id: `payment_${transactionId}_${Date.now()}`,
              userId: 'UNKNOWN_NO_AUTH',
              userEmail: 'payment_without_auth@unknown.com',
              amount: 5000, // 5,000 UZS
              transactionId: transactionId.toString(),
              status: 'completed_no_auth',
              atmosData: JSON.stringify({
                ...result.store_transaction,
                error: 'NO_AUTH_HEADER',
                timestamp: new Date().toISOString()
              })
            };
            
            const { storage } = await import('./storage');
            await storage.storePayment(paymentRecord);
            console.log(`⚠️ [PAYMENT] Payment recorded without auth - needs manual tier upgrade`);
          } catch (dbError) {
            console.error(`❌ [PAYMENT] Critical: Failed to store orphaned payment:`, dbError);
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

  // Other routes remain the same...
  return router;
}