// Click.uz Payment Routes - Version 2 with proper transaction management
import { Router, Request, Response } from 'express';
import { ClickService, CLICK_ERRORS } from './click-service';
import { PaymentTransactionService } from './services/payment-transaction-service';
import { createClient } from '@supabase/supabase-js';
import { monitoring } from './services/monitoring-service';
import { logger } from './utils/logger';

// Middleware to parse Click.uz requests
function parseClickRequest(req: any, res: any, next: any) {
  logger.debug('Click.uz request parser', {
    bodyType: typeof req.body,
    contentType: req.headers['content-type']
  });
  
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
      
      logger.payment('Creating transaction', {
        amount,
        userId,
        hasCoupon: !!couponCode
      });

      // Validate input
      if (!amount || amount < 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid amount'
        });
      }
      
      // Validate user authentication
      if (!userId) {
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
        logger.error('User not found', { userId });
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }
      
      logger.info('Valid user found', { userId: user.id });
      
      // Check if user already has paid tier
      if (user.user_metadata?.tier === 'paid') {
        logger.info('User already has paid tier', { userId: user.id });
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
        logger.info('Processing coupon code', { couponCode, amount });
        const { storage } = await import('./storage');
        const coupon = await storage.getCouponByCode(couponCode.trim().toUpperCase());
        
        logger.info('Coupon lookup result', { 
          found: !!coupon, 
          isActive: coupon?.isActive,
          discountType: coupon?.discountType,
          discountValue: coupon?.discountValue 
        });
        
        if (coupon && coupon.isActive) {
          const now = new Date();
          
          // Validate coupon
          if (coupon.validUntil && new Date(coupon.validUntil) < now) {
            logger.warn('Coupon is expired', { couponId: coupon.id });
          } else if (coupon.validFrom && new Date(coupon.validFrom) > now) {
            logger.warn('Coupon is not yet valid', { couponId: coupon.id });
          } else if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
            logger.warn('Coupon usage limit reached', { couponId: coupon.id });
          } else {
            // Apply discount
            if (coupon.discountType === 'percentage') {
              discountAmount = Math.floor(amount * (coupon.discountValue / 100));
            } else if (coupon.discountType === 'fixed') {
              discountAmount = Math.min(coupon.discountValue, amount);
            }
            
            finalAmount = amount - discountAmount;
            appliedCoupon = coupon;
            logger.info('Coupon applied', { 
              couponId: coupon.id, 
              originalAmount: amount, 
              discountAmount,
              finalAmount,
              isZeroAmount: finalAmount === 0
            });
          }
        }
      }

      logger.info('Pre-transaction check', { 
        finalAmount, 
        hasAppliedCoupon: !!appliedCoupon,
        isZeroAmount: finalAmount === 0,
        willBypassPayment: finalAmount === 0 && !!appliedCoupon
      });

      // Check if this is a 100% discount scenario
      if (finalAmount === 0 && appliedCoupon) {
        logger.payment('Processing 100% discount transaction', {
          userId: user.id,
          couponCode: appliedCoupon.code
        });

        // Create payment transaction with special status
        const transaction = await transactionService.createTransaction({
          userId: user.id,
          userEmail: user.email!,
          originalAmount: amount,
          finalAmount: 0,
          discountAmount: discountAmount,
          paymentMethod: 'coupon',
          couponId: appliedCoupon.id,
          couponCode: appliedCoupon.code,
          metadata: {
            createdBy: 'click-v2',
            userTier: user.user_metadata?.tier || 'free',
            isFullDiscount: true
          }
        });

        // Immediately mark transaction as completed
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
          originalAmount: amount,
          discountAmount: discountAmount,
          finalAmount: 0
        });

        // Log successful upgrade
        monitoring.logPaymentTransaction(
          transaction.id,
          user.id,
          user.email!,
          'completed',
          0,
          'coupon',
          {
            originalAmount: amount,
            discountAmount: discountAmount,
            couponCode: appliedCoupon.code,
            isFullDiscount: true
          }
        );

        logger.payment('User upgraded with 100% discount coupon', {
          userId: user.id,
          transactionId: transaction.id
        });

        // Return success without payment URL
        return res.json({
          success: true,
          isFullDiscount: true,
          transactionId: transaction.id,
          merchantTransId: transaction.merchantTransId,
          amount: 0,
          message: "Premium kirish muvaffaqiyatli faollashtirildi!",
          appliedCoupon: {
            code: appliedCoupon.code,
            discountAmount: discountAmount,
            discountPercent: 100
          }
        });
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

      logger.payment('Transaction created', {
        transactionId: transaction.id,
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
      
      logger.info('Payment URL generated successfully');

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
      logger.error('Failed to create transaction', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create transaction'
      });
    }
  });

  // Unified endpoint for both prepare and complete requests
  router.post('/click/pay', async (req: Request, res: Response) => {
    try {
      logger.payment('Click.uz callback received', {
        action: req.body.action,
        transactionId: req.body.click_trans_id,
        merchantTransId: req.body.merchant_trans_id
      });
      
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
              logger.payment('Transaction marked as processing', { transactionId: transaction.id });
            }
          } catch (error) {
            logger.error('Failed to update transaction status', error);
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
              logger.payment('Completing transaction', { transactionId: transaction.id });
              
              // Complete the transaction (this also updates user tier)
              const completionResult = await transactionService.completeTransaction(
                transaction.id,
                req.body.click_trans_id
              );
              
              if (completionResult.success) {
                logger.payment('Payment completed successfully', { transactionId: transaction.id });
                
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
                
                logger.debug('Legacy payment record stored');
              } else {
                logger.error('Failed to complete transaction', { error: completionResult.error });
                
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
              logger.error('Transaction not found for merchant ID');
            }
          } catch (error) {
            logger.error('Error completing payment', error);
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

      logger.payment('Click.uz callback response sent', {
        error: result.error,
        errorNote: result.error_note
      });
      
      // Send response
      res.status(200).json(result);

    } catch (error: any) {
      logger.error('Click.uz route error', error);
      res.json({
        error: CLICK_ERRORS.INVALID_REQUEST,
        error_note: 'Server error'
      });
    }
  });

  // Return payment callback endpoint
  router.all('/click/return', async (req: Request, res: Response) => {
    try {
      logger.info('User returned from payment', {
        status: req.query.status,
        hasTransactionId: !!req.query.merchant_trans_id
      });

      // Extract transaction info from query params
      const { merchant_trans_id, status } = req.query;
      
      if (merchant_trans_id && status === 'success') {
        // Find and update the transaction
        const transaction = await transactionService.getTransactionByMerchantId(merchant_trans_id as string);
        
        if (transaction && transaction.status !== 'completed') {
          // Mark as completed if not already
          await transactionService.completeTransaction(transaction.id);
          logger.info('Transaction completed via return URL');
        }
      }

      // Redirect to success page
      res.redirect('/payment/success?method=click');
      
    } catch (error) {
      logger.error('Click.uz return route error', error);
      res.redirect('/payment/failed?method=click');
    }
  });

  return router;
}