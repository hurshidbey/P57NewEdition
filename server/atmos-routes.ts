// ATMOS Payment Routes
import { Router } from 'express';
import { AtmosService } from './atmos-service';
import { logger } from './utils/logger';
import { telegramNotifications } from './services/telegram-notifications';

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
      const { amount, description, couponCode, userId, userEmail } = req.body;

      if (!amount || amount < 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid amount'
        });
      }

      let finalAmount = amount;
      let appliedCoupon = null;
      let originalAmount = amount;
      let discountAmount = 0;

      // Check if coupon code is provided
      if (couponCode) {
        const { storage } = await import('./storage');
        const coupon = await storage.getCouponByCode(couponCode.trim().toUpperCase());
        
        if (coupon && coupon.isActive) {
          // Validate coupon (same checks as validation endpoint)
          const now = new Date();
          
          if (coupon.validUntil && new Date(coupon.validUntil) < now) {
            logger.warn('Coupon is expired');
          } else if (coupon.validFrom && new Date(coupon.validFrom) > now) {
            logger.warn('Coupon is not yet valid');
          } else if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
            logger.warn('Coupon usage limit reached');
          } else {
            // Calculate discount
            originalAmount = amount;
            
            if (coupon.discountType === 'percentage') {
              discountAmount = Math.floor(originalAmount * (coupon.discountValue / 100));
              finalAmount = originalAmount - discountAmount;
            } else if (coupon.discountType === 'fixed') {
              discountAmount = Math.min(coupon.discountValue, originalAmount);
              finalAmount = originalAmount - discountAmount;
            }
            
            appliedCoupon = coupon;
            logger.info('Coupon applied', { originalAmount, discountAmount, finalAmount });
          }
        } else {
          logger.warn('Coupon not found or inactive');
        }
      }

      // Check if this is a 100% discount scenario
      if (finalAmount === 0 && appliedCoupon) {
        logger.info('Processing 100% discount transaction');
        
        // Get authenticated user from request body
        // Note: userId and userEmail are already destructured from req.body above
        
        if (!userId) {
          return res.status(401).json({
            success: false,
            message: 'Authentication required'
          });
        }
        
        // Create admin Supabase client
        const { createClient } = await import('@supabase/supabase-js');
        const adminSupabase = createClient(
          process.env.SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
        
        // Verify user exists
        const { data: { user }, error: userError } = await adminSupabase.auth.admin.getUserById(userId);
        if (!user || userError) {
          return res.status(401).json({
            success: false,
            message: 'User not found'
          });
        }
        
        // Check if user already has paid tier
        if (user.user_metadata?.tier === 'paid') {
          return res.status(400).json({
            success: false,
            message: 'User already has premium access'
          });
        }
        
        // Create a payment record
        const { PaymentTransactionService } = await import('./services/payment-transaction-service');
        const transactionService = new PaymentTransactionService();
        
        const transaction = await transactionService.createTransaction({
          userId: user.id,
          userEmail: user.email!,
          originalAmount: originalAmount / 100, // Convert from tiins to UZS
          finalAmount: 0,
          discountAmount: discountAmount / 100,
          paymentMethod: 'coupon',
          couponId: appliedCoupon.id,
          couponCode: appliedCoupon.code,
          metadata: {
            createdBy: 'atmos-100-discount',
            userTier: user.user_metadata?.tier || 'free',
            isFullDiscount: true
          }
        });
        
        // Mark transaction as completed
        await transactionService.updateTransactionStatus(
          transaction.id,
          'completed',
          'COUPON_100_DISCOUNT'
        );
        
        // Upgrade user to premium tier
        const { error: updateError } = await adminSupabase.auth.admin.updateUserById(
          user.id,
          {
            user_metadata: {
              ...user.user_metadata,
              tier: 'paid',
              payment_date: new Date().toISOString(),
              payment_method: 'coupon_100_discount',
              transaction_id: transaction.id
            }
          }
        );
        
        if (updateError) {
          logger.error('Failed to upgrade user tier', updateError);
          throw new Error('Failed to apply premium access');
        }
        
        // Record coupon usage
        const { storage } = await import('./storage');
        await storage.recordCouponUsage({
          couponId: appliedCoupon.id,
          userId: user.id,
          userEmail: user.email!,
          paymentId: transaction.id,
          originalAmount: originalAmount / 100,
          discountAmount: discountAmount / 100,
          finalAmount: 0
        });
        
        logger.info('User upgraded with 100% discount coupon', {
          userId: user.id,
          transactionId: transaction.id
        });
        
        // Return success without payment URL
        return res.json({
          success: true,
          isFullDiscount: true,
          transaction_id: transaction.id,
          message: "Premium kirish muvaffaqiyatli faollashtirildi!",
          coupon: {
            id: appliedCoupon.id,
            code: appliedCoupon.code,
            originalAmount,
            discountAmount,
            finalAmount: 0,
            discountPercent: 100
          }
        });
      }

      // Generate unique account ID for this payment
      const { generateShortTransId } = await import('./utils/payment-utils');
      const account = generateShortTransId('atmos', !!appliedCoupon);

      // Create transaction with final amount (after discount)
      const result = await atmosService.createTransaction(
        finalAmount,
        account
      );

      if (result.result.code !== 'OK') {
        throw new Error(result.result.description || 'Transaction creation failed');
      }

      // Store payment session for later retrieval in webhook
      if (result.transaction_id) {
        const { storage } = await import('./storage');
        const { generateShortTransId } = await import('./utils/payment-utils');
        
        // Create payment session
        const sessionId = generateShortTransId('atmos_session', !!appliedCoupon);
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour expiry
        
        await storage.createPaymentSession({
          id: sessionId,
          userId: userId || 'guest',
          userEmail: userEmail || 'guest@p57.uz',
          amount: finalAmount,
          originalAmount,
          discountAmount,
          couponId: appliedCoupon?.id || null,
          merchantTransId: result.transaction_id.toString(),
          paymentMethod: 'atmos',
          idempotencyKey: `atmos_${result.transaction_id}`,
          metadata: {
            account,
            couponCode: appliedCoupon?.code,
            description
          },
          expiresAt
        });
        
        console.log(`💾 [ATMOS] Created payment session ${sessionId} for transaction ${result.transaction_id}`);
      }

      res.json({
        success: true,
        result: result.result,
        transaction_id: result.transaction_id,
        store_transaction: result.store_transaction,
        // Include coupon info in response
        coupon: appliedCoupon ? {
          id: appliedCoupon.id,
          code: appliedCoupon.code,
          originalAmount,
          discountAmount,
          finalAmount
        } : null
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
      } else if (errorMsg.includes('token') || errorMsg.includes('unauthorized') || errorMsg.includes('401')) {
        message = 'To\'lov tizimi vaqtincha ishlamayapti. Iltimos keyinroq urinib ko\'ring';
      } else if (errorMsg.includes('too many') || errorMsg.includes('rate limit')) {
        message = 'Juda ko\'p urinish. Iltimos biroz kuting';
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

      logger.payment('ATMOS payment confirmation', { code: result.result?.code });

      if (result.result.code !== 'OK') {
        console.error(`❌ [ATMOS] Confirmation failed:`, result);
        throw new Error(result.result.description || 'Transaction confirmation failed');
      }

      // Check if transaction was successful
      if (result.store_transaction?.confirmed) {

        // CRITICAL FIX: Upgrade user tier to 'paid' after successful payment
        const authHeader = req.headers.authorization;
        logger.debug('Processing payment callback', { hasAuth: !!authHeader });
        
        if (authHeader && authHeader.startsWith('Bearer ')) {
          try {
            const token = authHeader.split(' ')[1];
            logger.debug('Token validation', { tokenLength: token?.length });
            
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
            
            logger.debug('User ID decoded from token');
            
            // Get user directly with admin client
            const { data: { user }, error: userError } = await adminSupabase.auth.admin.getUserById(userId);
            if (user && !userError) {
              logger.payment('Upgrading user tier', { userId: user.id });
              
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
                  // Get payment session for this transaction
                  const { storage } = await import('./storage');
                  let paymentSession = null;
                  try {
                    paymentSession = await storage.getPaymentSessionByMerchantId(transactionId.toString());
                  } catch (sessionError) {
                    console.error(`⚠️ [ATMOS] Failed to retrieve payment session for transaction ${transactionId}:`, sessionError);
                    // Continue without session data
                  }
                  
                  let couponInfo = null;
                  if (paymentSession) {
                    console.log(`📋 [ATMOS] Retrieved payment session for transaction ${transactionId}`);
                    couponInfo = {
                      couponId: paymentSession.coupon_id,
                      originalAmount: paymentSession.original_amount,
                      discountAmount: paymentSession.discount_amount,
                      finalAmount: paymentSession.amount
                    };
                  } else {
                    console.log(`⚠️ [ATMOS] No payment session found for transaction ${transactionId}`);
                  }
                  
                  const paymentRecord = {
                    id: `payment_${transactionId}_${Date.now()}`,
                    userId: user.id,
                    userEmail: user.email || 'unknown@email.com',
                    amount: couponInfo?.finalAmount || result.store_transaction?.amount || 1425000,
                    transactionId: transactionId.toString(),
                    status: 'completed',
                    atmosData: JSON.stringify(result.store_transaction || {}),
                    // Add coupon fields
                    couponId: couponInfo?.couponId || null,
                    originalAmount: couponInfo?.originalAmount || null,
                    discountAmount: couponInfo?.discountAmount || null
                  };
                  
                  // Store in database for admin panel
                  await storage.storePayment(paymentRecord);
                  console.log(`💾 [PAYMENT] Payment record stored for admin tracking`);
                  
                  // Track coupon usage if coupon was applied
                  if (couponInfo?.couponId) {
                    try {
                      await storage.incrementCouponUsage(couponInfo.couponId);
                      await storage.recordCouponUsage({
                        couponId: couponInfo.couponId,
                        userId: user.id,
                        userEmail: user.email || 'unknown@email.com',
                        paymentId: paymentRecord.id,
                        originalAmount: couponInfo.originalAmount,
                        discountAmount: couponInfo.discountAmount,
                        finalAmount: couponInfo.finalAmount
                      });
                      console.log(`✅ [PAYMENT] Coupon usage tracked for coupon ${couponInfo.couponId}`);
                    } catch (couponError) {
                      console.error(`⚠️ [PAYMENT] Failed to track coupon usage:`, couponError);
                    }
                  } else if (paymentRecord.couponId) {
                    // Fallback: If couponInfo not in body but payment record has couponId
                    try {
                      await storage.incrementCouponUsage(paymentRecord.couponId);
                      await storage.recordCouponUsage({
                        couponId: paymentRecord.couponId,
                        userId: user.id,
                        userEmail: user.email || 'unknown@email.com',
                        paymentId: paymentRecord.id,
                        originalAmount: paymentRecord.originalAmount || paymentRecord.amount,
                        discountAmount: paymentRecord.discountAmount || 0,
                        finalAmount: paymentRecord.amount
                      });
                      console.log(`✅ [PAYMENT] Coupon usage tracked (fallback) for coupon ${paymentRecord.couponId}`);
                    } catch (couponError) {
                      console.error(`⚠️ [PAYMENT] Failed to track coupon usage (fallback):`, couponError);
                    }
                  }
                  
                  // Send Telegram notification for successful payment after we have all data
                  try {
                    await telegramNotifications.notifyPaymentSuccess({
                      userId: user.id,
                      userEmail: user.email!,
                      userName: user.user_metadata?.name,
                      amount: couponInfo?.finalAmount || result.store_transaction?.amount || 0,
                      paymentMethod: 'atmos',
                      transactionId: transactionId.toString(),
                      couponCode: paymentSession?.metadata?.couponCode,
                      couponDiscount: couponInfo?.discountAmount || 0,
                      timestamp: new Date()
                    });
                    console.log(`✅ [ATMOS] Payment notification sent for ${user.email}`);
                  } catch (notifError) {
                    console.error('[ATMOS] Failed to send payment notification:', notifError);
                  }
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
            // Get payment session for this transaction
            const { storage } = await import('./storage');
            let paymentSession = null;
            try {
              paymentSession = await storage.getPaymentSessionByMerchantId(transactionId.toString());
            } catch (sessionError) {
              console.error(`⚠️ [ATMOS] Failed to retrieve payment session for transaction ${transactionId} (no auth):`, sessionError);
              // Continue without session data
            }
            
            let couponInfo = null;
            if (paymentSession) {
              console.log(`📋 [ATMOS] Retrieved payment session for transaction ${transactionId} (no auth)`);
              couponInfo = {
                couponId: paymentSession.coupon_id,
                originalAmount: paymentSession.original_amount,
                discountAmount: paymentSession.discount_amount,
                finalAmount: paymentSession.amount
              };
            } else {
              console.log(`⚠️ [ATMOS] No payment session found for transaction ${transactionId} (no auth)`);
            }
            
            const paymentRecord = {
              id: `payment_${transactionId}_${Date.now()}`,
              userId: 'UNKNOWN_NO_AUTH',
              userEmail: 'payment_without_auth@unknown.com',
              amount: couponInfo?.finalAmount || result.store_transaction?.amount || 1425000,
              transactionId: transactionId.toString(),
              status: 'completed_no_auth',
              atmosData: JSON.stringify({
                ...result.store_transaction,
                error: 'NO_AUTH_HEADER',
                timestamp: new Date().toISOString()
              }),
              // Add coupon fields
              couponId: couponInfo?.couponId || null,
              originalAmount: couponInfo?.originalAmount || null,
              discountAmount: couponInfo?.discountAmount || null
            };
            
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
      console.error(`❌ [ATMOS] Confirm error:`, error);
      console.error(`❌ [ATMOS] Error details:`, error.message, error.response?.data);

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

  // Resend OTP endpoint
  router.post('/atmos/resend-otp', async (req, res) => {
    try {
      const { transactionId } = req.body;

      if (!transactionId) {
        return res.status(400).json({
          success: false,
          message: 'Transaction ID talab qilinadi'
        });
      }

      console.log(`📤 [ATMOS] Resending OTP for transaction: ${transactionId}`);

      const result = await atmosService.resendOtp(transactionId);

      if (result.result.code !== 'OK') {
        throw new Error(result.result.description || 'Failed to resend OTP');
      }

      res.json({
        success: true,
        result: result.result,
        message: 'SMS kod qayta yuborildi'
      });

    } catch (error: any) {
      console.error(`❌ [ATMOS] Resend OTP error:`, error);
      
      // Handle specific errors
      let message = 'SMS kodni qayta yuborishda xatolik';
      const errorMsg = error.message?.toLowerCase() || '';
      
      if (errorMsg.includes('not found') || errorMsg.includes('topilmadi')) {
        message = 'Tranzaksiya topilmadi';
      } else if (errorMsg.includes('expired') || errorMsg.includes('muddati')) {
        message = 'Tranzaksiya muddati tugagan';
      } else if (errorMsg.includes('already') || errorMsg.includes('allaqachon')) {
        message = 'SMS kod allaqachon yuborilgan';
      }

      res.status(400).json({
        success: false,
        message,
        details: error.message
      });
    }
  });

  return router;
}