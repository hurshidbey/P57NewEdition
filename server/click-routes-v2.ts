// Click.uz Payment Routes - Version 2 with proper transaction management
import { Router, Request, Response } from 'express';
import { ClickService, CLICK_ERRORS } from './click-service';
import { PaymentTransactionService } from './services/payment-transaction-service';
import { createClient } from '@supabase/supabase-js';
import { monitoring } from './services/monitoring-service';

// Middleware to parse Click.uz requests
function parseClickRequest(req: any, res: any, next: any) {
  console.log(`🌐 [CLICK-PARSER] Original body type:`, typeof req.body);
  console.log(`🌐 [CLICK-PARSER] Content-Type:`, req.headers['content-type']);
  
  // Convert string numbers to actual numbers for Click.uz fields
  if (req.body) {
    const numericFields = ['action', 'amount', 'service_id', 'click_paydoc_id', 'error'];
    numericFields.forEach(field => {
      if (req.body[field] && typeof req.body[field] === 'string') {
        req.body[field] = parseFloat(req.body[field]);
      }
    });
  }
  
  next();
}

export function setupClickRoutesV2(): Router {
  const router = Router();
  const clickService = new ClickService();
  const transactionService = new PaymentTransactionService();
  
  // Apply parsing middleware to all Click routes
  router.use(parseClickRequest);

  // Test route
  router.get('/click/test', (_req, res) => {
    res.json({
      success: true,
      message: 'Click.uz integration V2 is active',
      version: '2.0',
      features: ['proper-transaction-tracking', 'oauth-user-support'],
      timestamp: new Date().toISOString()
    });
  });

  // Create transaction endpoint - generates payment URL
  router.post('/click/create-transaction', async (req: Request, res: Response) => {
    try {
      const { amount, userId, userEmail, couponCode } = req.body;
      
      console.log(`📝 [CLICK-V2] Creating transaction:`, {
        amount,
        userId,
        userEmail,
        couponCode
      });

      // Validate input
      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid amount'
        });
      }
      
      // Validate user authentication
      if (!userId || !userEmail) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Create admin Supabase client
      const adminSupabase = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      
      // Verify user exists and get their metadata
      const { data: { user }, error: userError } = await adminSupabase.auth.admin.getUserById(userId);
      if (!user || userError) {
        console.error(`❌ [CLICK-V2] User not found: ${userId}`);
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }
      
      console.log(`✅ [CLICK-V2] Valid user: ${user.email} (${user.id})`);
      
      // Check if user already has paid tier
      if (user.user_metadata?.tier === 'paid') {
        console.log(`⚠️ [CLICK-V2] User ${user.email} already has paid tier`);
        return res.status(400).json({
          success: false,
          message: 'User already has premium access'
        });
      }

      // Handle coupon if provided
      let finalAmount = amount;
      let discountAmount = 0;
      let appliedCoupon = null;
      
      if (couponCode) {
        const { storage } = await import('./storage');
        const coupon = await storage.getCouponByCode(couponCode.trim().toUpperCase());
        
        if (coupon && coupon.isActive) {
          const now = new Date();
          
          // Validate coupon
          if (coupon.validUntil && new Date(coupon.validUntil) < now) {
            console.log(`⚠️ [CLICK-V2] Coupon ${couponCode} is expired`);
          } else if (coupon.validFrom && new Date(coupon.validFrom) > now) {
            console.log(`⚠️ [CLICK-V2] Coupon ${couponCode} is not yet valid`);
          } else if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
            console.log(`⚠️ [CLICK-V2] Coupon ${couponCode} usage limit reached`);
          } else {
            // Apply discount
            if (coupon.discountType === 'percentage') {
              discountAmount = Math.floor(amount * (coupon.discountValue / 100));
            } else if (coupon.discountType === 'fixed') {
              discountAmount = Math.min(coupon.discountValue, amount);
            }
            
            finalAmount = amount - discountAmount;
            appliedCoupon = coupon;
            console.log(`✅ [CLICK-V2] Coupon ${couponCode} applied: ${amount} -> ${finalAmount}`);
          }
        }
      }

      // Create payment transaction in database
      const transaction = await transactionService.createTransaction({
        userId: user.id,
        userEmail: user.email!,
        originalAmount: amount,
        finalAmount: finalAmount,
        discountAmount: discountAmount,
        paymentMethod: 'click',
        couponId: appliedCoupon?.id,
        couponCode: appliedCoupon?.code,
        metadata: {
          createdBy: 'click-v2',
          userTier: user.user_metadata?.tier || 'free'
        }
      });

      console.log(`💾 [CLICK-V2] Transaction created:`, {
        id: transaction.id,
        merchantTransId: transaction.merchantTransId
      });

      // Log transaction creation
      monitoring.logPaymentTransaction(
        transaction.id,
        user.id,
        user.email!,
        'created',
        finalAmount,
        'click',
        {
          originalAmount: amount,
          discountAmount: discountAmount,
          couponCode: appliedCoupon?.code
        }
      );

      // Generate payment URL using the merchant transaction ID
      const paymentUrl = clickService.generatePaymentUrl(
        finalAmount, 
        transaction.merchantTransId, 
        transaction.id
      );
      
      console.log(`✅ [CLICK-V2] Payment URL generated:`, paymentUrl);

      res.json({
        success: true,
        paymentUrl,
        transactionId: transaction.id,
        merchantTransId: transaction.merchantTransId,
        amount: finalAmount,
        appliedCoupon: appliedCoupon ? {
          code: appliedCoupon.code,
          discountAmount: discountAmount,
          discountPercent: appliedCoupon.discountType === 'percentage' 
            ? appliedCoupon.discountValue 
            : Math.round((discountAmount / amount) * 100)
        } : null
      });

    } catch (error: any) {
      console.error(`❌ [CLICK-V2] Create transaction error:`, error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create transaction'
      });
    }
  });

  // Unified endpoint for both prepare and complete requests
  router.post('/click/pay', async (req: Request, res: Response) => {
    try {
      console.log(`\n⚡ [CLICK-V2] ========== NEW REQUEST ==========`);
      console.log(`⚡ [CLICK-V2] Time: ${new Date().toISOString()}`);
      console.log(`⚡ [CLICK-V2] Body:`, JSON.stringify(req.body, null, 2));
      
      const { action } = req.body;
      const actionNum = typeof action === 'string' ? parseInt(action, 10) : action;
      
      let result;
      
      if (actionNum === 0) {
        // Prepare request - validate the transaction
        result = await clickService.handlePrepare(req.body);
        
        // Store the external transaction ID if prepare succeeds
        if (result.error === CLICK_ERRORS.SUCCESS && req.body.merchant_trans_id) {
          try {
            const transaction = await transactionService.getTransactionByMerchantId(req.body.merchant_trans_id);
            if (transaction) {
              await transactionService.updateTransactionStatus(
                transaction.id,
                'processing',
                req.body.click_trans_id
              );
              console.log(`✅ [CLICK-V2] Transaction ${transaction.id} marked as processing`);
            }
          } catch (error) {
            console.error(`❌ [CLICK-V2] Failed to update transaction status:`, error);
          }
        }
        
      } else if (actionNum === 1) {
        // Complete request - finalize the payment
        result = await clickService.handleComplete(req.body);
        
        // If payment completed successfully, update transaction and user tier
        if (result.error === CLICK_ERRORS.SUCCESS) {
          try {
            // Find the transaction by merchant ID
            const transaction = await transactionService.getTransactionByMerchantId(req.body.merchant_trans_id);
            
            if (transaction) {
              console.log(`🎯 [CLICK-V2] Completing transaction ${transaction.id} for user ${transaction.userEmail}`);
              
              // Complete the transaction (this also updates user tier)
              const completionResult = await transactionService.completeTransaction(
                transaction.id,
                req.body.click_trans_id
              );
              
              if (completionResult.success) {
                console.log(`✅ [CLICK-V2] Successfully completed payment for ${transaction.userEmail}`);
                
                // Log successful payment and tier upgrade
                monitoring.logPaymentTransaction(
                  transaction.id,
                  transaction.userId,
                  transaction.userEmail,
                  'completed',
                  transaction.finalAmount,
                  'click',
                  {
                    externalTransId: req.body.click_trans_id
                  }
                );
                
                monitoring.logUserTierUpgrade(
                  transaction.userId,
                  transaction.userEmail,
                  'free',
                  'paid',
                  'click',
                  transaction.id
                );
                
                // Store legacy payment record for backward compatibility
                const { storage } = await import('./storage');
                await storage.storePayment({
                  id: `payment_click_${req.body.click_trans_id}_${Date.now()}`,
                  userId: transaction.userId,
                  userEmail: transaction.userEmail,
                  amount: transaction.finalAmount,
                  transactionId: req.body.click_trans_id,
                  status: 'completed',
                  atmosData: JSON.stringify({
                    paymentMethod: 'click',
                    clickTransId: req.body.click_trans_id,
                    merchantTransId: req.body.merchant_trans_id,
                    transactionId: transaction.id,
                    completedAt: new Date().toISOString()
                  }),
                  couponId: transaction.couponId || null,
                  originalAmount: transaction.originalAmount,
                  discountAmount: transaction.discountAmount
                });
                
                console.log(`💾 [CLICK-V2] Legacy payment record stored`);
              } else {
                console.error(`❌ [CLICK-V2] Failed to complete transaction: ${completionResult.error}`);
                
                // Log payment failure
                monitoring.logPaymentTransaction(
                  transaction.id,
                  transaction.userId,
                  transaction.userEmail,
                  'failed',
                  transaction.finalAmount,
                  'click',
                  {
                    reason: 'Transaction completion failed'
                  },
                  completionResult.error
                );
              }
            } else {
              console.error(`❌ [CLICK-V2] Transaction not found for merchant ID: ${req.body.merchant_trans_id}`);
            }
          } catch (error) {
            console.error(`❌ [CLICK-V2] Error completing payment:`, error);
            // Don't fail the Click.uz response - payment was successful on their side
          }
        }
      } else {
        // Invalid action
        result = {
          error: CLICK_ERRORS.INVALID_REQUEST,
          error_note: 'Invalid action'
        };
      }

      console.log(`📤 [CLICK-V2] Response:`, JSON.stringify(result, null, 2));
      console.log(`⚡ [CLICK-V2] ========== END REQUEST ==========\n`);
      
      // Send response
      res.status(200).json(result);

    } catch (error: any) {
      console.error(`❌ [CLICK-V2] Route error:`, error);
      res.json({
        error: CLICK_ERRORS.INVALID_REQUEST,
        error_note: 'Server error'
      });
    }
  });

  // Return payment callback endpoint
  router.all('/click/return', async (req: Request, res: Response) => {
    try {
      console.log(`🔙 [CLICK-V2-RETURN] User returned from payment:`, {
        query: req.query,
        body: req.body
      });

      // Extract transaction info from query params
      const { merchant_trans_id, status } = req.query;
      
      if (merchant_trans_id && status === 'success') {
        // Find and update the transaction
        const transaction = await transactionService.getTransactionByMerchantId(merchant_trans_id as string);
        
        if (transaction && transaction.status !== 'completed') {
          // Mark as completed if not already
          await transactionService.completeTransaction(transaction.id);
          console.log(`✅ [CLICK-V2-RETURN] Transaction completed via return URL`);
        }
      }

      // Redirect to success page
      res.redirect('/payment/success?method=click');
      
    } catch (error) {
      console.error(`❌ [CLICK-V2-RETURN] Error:`, error);
      res.redirect('/payment/failed?method=click');
    }
  });

  return router;
}