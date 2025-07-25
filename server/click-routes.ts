// Click.uz Payment Routes
import { Router } from 'express';
import { ClickService, CLICK_ERRORS } from './click-service';
import { checkPendingPayment } from './payment-recovery';

// Middleware to parse Click.uz requests which might come as form-encoded
function parseClickRequest(req: any, res: any, next: any) {
  // Log raw request data
  console.log(`🌐 [CLICK-PARSER] Original body type:`, typeof req.body);
  console.log(`🌐 [CLICK-PARSER] Content-Type:`, req.headers['content-type']);
  
  // If body is a string (form-encoded data parsed as string), try to parse it
  if (typeof req.body === 'string') {
    try {
      req.body = JSON.parse(req.body);
      console.log(`🌐 [CLICK-PARSER] Parsed string body to JSON`);
    } catch (e) {
      console.log(`🌐 [CLICK-PARSER] Failed to parse string body as JSON`);
    }
  }
  
  // Convert string numbers to actual numbers for Click.uz fields
  if (req.body) {
    const numericFields = ['action', 'amount', 'service_id', 'click_paydoc_id', 'error'];
    numericFields.forEach(field => {
      if (req.body[field] && typeof req.body[field] === 'string') {
        req.body[field] = parseFloat(req.body[field]);
        console.log(`🌐 [CLICK-PARSER] Converted ${field} from string to number:`, req.body[field]);
      }
    });
  }
  
  next();
}

export function setupClickRoutes(): Router {
  const router = Router();
  const clickService = new ClickService();
  
  // Apply parsing middleware to all Click routes
  router.use(parseClickRequest);

  // Test route
  router.get('/click/test', (_req, res) => {
    res.json({
      success: true,
      message: 'Click.uz integration is active',
      serviceId: process.env.CLICK_SERVICE_ID,
      timestamp: new Date().toISOString()
    });
  });

  // Click.uz callback test endpoint - helps verify connectivity
  router.all('/click/callback-test', (req, res) => {
    console.log(`🧪 [CLICK] Callback test:`, {
      method: req.method,
      headers: req.headers,
      body: req.body,
      query: req.query,
      ip: req.ip,
      timestamp: new Date().toISOString()
    });
    
    res.json({
      success: true,
      message: 'Callback endpoint is accessible',
      method: req.method,
      receivedAt: new Date().toISOString(),
      yourIp: req.ip
    });
  });

  // Create transaction endpoint - generates payment URL
  router.post('/click/create-transaction', async (req, res) => {
    try {
      const { amount, userId, userEmail, couponCode } = req.body;
      
      console.log(`📝 [CLICK] Creating transaction:`, {
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
      if (!userId || userId === 'guest') {
        console.error(`❌ [CLICK] No user ID provided`);
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }
      
      // Check if userId is email (for OAuth users who might have email as ID)
      let actualUserId = userId;
      if (userId.includes('@')) {
        console.log(`📧 [CLICK] User ID appears to be email: ${userId}, will lookup actual ID`);
        // We'll find the actual user ID below when we verify the user exists
      }
      
      // Verify user exists in Supabase
      const { createClient } = await import('@supabase/supabase-js');
      const adminSupabase = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      
      let user;
      let userError;
      
      // If userId looks like email, find user by email
      if (userId.includes('@')) {
        const { data: users, error } = await adminSupabase.auth.admin.listUsers({
          page: 1,
          perPage: 1000
        });
        
        if (!error && users) {
          user = users.users.find(u => u.email === userId);
          if (user) {
            actualUserId = user.id;
            console.log(`✅ [CLICK] Found user by email: ${userId} -> ${actualUserId}`);
          } else {
            userError = new Error('User not found by email');
          }
        } else {
          userError = error;
        }
      } else {
        // Try to get user by ID
        const result = await adminSupabase.auth.admin.getUserById(userId);
        user = result.data.user;
        userError = result.error;
      }
      
      if (!user || userError) {
        console.error(`❌ [CLICK] User not found: ${userId}`, userError?.message);
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }
      
      console.log(`✅ [CLICK] Valid user: ${user.email} (${user.id})`);
      
      // Check if user already has paid tier
      if (user.user_metadata?.tier === 'paid') {
        console.log(`⚠️ [CLICK] User ${user.email} already has paid tier`);
        return res.status(400).json({
          success: false,
          message: 'User already has premium access'
        });
      }

      // Import payment utils
      const { generatePaymentSessionId, generateShortTransId, generateIdempotencyKey, calculateSessionExpiry } = await import('./utils/payment-utils');
      
      // Generate secure IDs for payment session
      const sessionId = generatePaymentSessionId();
      const merchantTransId = generateShortTransId('click', !!couponCode);
      const idempotencyKey = generateIdempotencyKey(actualUserId, amount);
      
      // If coupon is provided, validate and apply discount
      let finalAmount = amount;
      let appliedCoupon = null;
      
      if (couponCode) {
        const { storage } = await import('./storage');
        const coupon = await storage.getCouponByCode(couponCode.trim().toUpperCase());
        
        if (coupon && coupon.isActive) {
          const now = new Date();
          
          // Validate coupon dates and usage
          if (coupon.validUntil && new Date(coupon.validUntil) < now) {
            console.log(`⚠️ [CLICK] Coupon ${couponCode} is expired`);
          } else if (coupon.validFrom && new Date(coupon.validFrom) > now) {
            console.log(`⚠️ [CLICK] Coupon ${couponCode} is not yet valid`);
          } else if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
            console.log(`⚠️ [CLICK] Coupon ${couponCode} usage limit reached`);
          } else {
            // Apply discount
            if (coupon.discountType === 'percentage') {
              const discountAmount = Math.floor(amount * (coupon.discountValue / 100));
              finalAmount = amount - discountAmount;
            } else if (coupon.discountType === 'fixed') {
              const discountAmount = Math.min(coupon.discountValue, amount);
              finalAmount = amount - discountAmount;
            }
            
            appliedCoupon = coupon;
            console.log(`✅ [CLICK] Coupon ${couponCode} applied: ${amount} -> ${finalAmount}`);
          }
        }
      }

      // Check if this is a 100% discount scenario
      if (finalAmount === 0 && appliedCoupon) {
        console.log(`🎉 [CLICK] Processing 100% discount transaction for user ${user.email}`);
        
        try {
          // Use PaymentTransactionService for consistency with atmos routes
          const { PaymentTransactionService } = await import('./services/payment-transaction-service');
          const transactionService = new PaymentTransactionService();
          
          // Create payment transaction with 100% discount
          const transaction = await transactionService.createTransaction({
            userId: actualUserId,
            userEmail: user.email!,
            originalAmount: amount,
            finalAmount: 0,
            discountAmount: amount,
            paymentMethod: 'coupon', // Use 'coupon' payment method for 100% discounts
            couponId: appliedCoupon.id,
            couponCode: appliedCoupon.code,
            metadata: {
              isFullDiscount: true,
              completedAt: new Date().toISOString(),
              merchantTransId: merchantTransId
            }
          });
          
          console.log(`✅ [CLICK] 100% discount transaction created:`, transaction);
        
          // Complete the transaction immediately for 100% discount
          const completionResult = await transactionService.completeTransaction(
            transaction.id,
            merchantTransId
          );
          
          if (!completionResult.success) {
            throw new Error(completionResult.error || 'Failed to complete transaction');
          }
          
          console.log(`✅ [CLICK] Transaction completed and user upgraded:`, completionResult);
          console.log(`✅ [CLICK] User ${user.email} upgraded with 100% discount coupon`);
          
          // Return success without payment URL
          return res.json({
            success: true,
            isFullDiscount: true,
            transactionId: transaction.id,
            merchantTransId: merchantTransId,
            amount: 0,
            message: "Premium kirish muvaffaqiyatli faollashtirildi!",
            appliedCoupon: {
              code: appliedCoupon.code,
              discountAmount: amount,
              discountPercent: 100
            }
          });
          
        } catch (discountError: any) {
          console.error(`❌ [CLICK] Error processing 100% discount:`, discountError);
          console.error(`❌ [CLICK] Error details:`, discountError.message, discountError.stack);
          
          // Return a more specific error message
          return res.status(500).json({
            success: false,
            message: `Failed to process 100% discount: ${discountError.message || 'Unknown error'}`
          });
        }
      }

      // Get storage instance
      const { storage } = await import('./storage');
      
      // Create payment session in database
      const paymentSession = await storage.createPaymentSession({
        id: sessionId,
        userId: actualUserId,
        userEmail: user.email || userEmail,
        amount: finalAmount,
        originalAmount: amount,
        discountAmount: amount - finalAmount,
        couponId: appliedCoupon?.id || null,
        merchantTransId: merchantTransId,
        paymentMethod: 'click',
        idempotencyKey: idempotencyKey,
        metadata: {
          couponCode: couponCode,
          userAgent: req.headers['user-agent'],
          ip: req.ip
        },
        expiresAt: calculateSessionExpiry()
      });

      // Generate payment URL with new merchant trans ID
      const paymentUrl = clickService.generatePaymentUrl(finalAmount, merchantTransId, actualUserId || 'guest');
      
      console.log(`✅ [CLICK] Transaction created:`, {
        sessionId,
        merchantTransId,
        originalAmount: amount,
        finalAmount,
        paymentUrl
      });

      res.json({
        success: true,
        paymentUrl,
        orderId: merchantTransId, // Keep orderId for backward compatibility
        amount: finalAmount,
        appliedCoupon: appliedCoupon ? {
          code: appliedCoupon.code,
          discountAmount: amount - finalAmount,
          discountPercent: appliedCoupon.discountType === 'percentage' 
            ? appliedCoupon.discountValue 
            : Math.round(((amount - finalAmount) / amount) * 100)
        } : null
      });

    } catch (error: any) {
      console.error(`❌ [CLICK] Create transaction error:`, error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create transaction'
      });
    }
  });

  // Test endpoint to verify Click.uz can reach us
  router.all('/click/test-connectivity', (req, res) => {
    console.log(`🧐 [CLICK-TEST] Connectivity test from ${req.ip}`);
    console.log(`🧐 [CLICK-TEST] Method: ${req.method}`);
    console.log(`🧐 [CLICK-TEST] Headers:`, req.headers);
    console.log(`🧐 [CLICK-TEST] Body:`, req.body);
    
    res.json({
      success: true,
      message: 'Click.uz connectivity test successful',
      timestamp: new Date().toISOString(),
      your_ip: req.ip,
      method: req.method
    });
  });

  // Also handle GET requests in case Click.uz sends them
  router.get('/click/pay', (req, res) => {
    console.log(`⚠️ [CLICK] Received GET request to /click/pay`);
    console.log(`⚠️ [CLICK] Query params:`, req.query);
    res.status(405).json({
      error: -9,
      error_note: 'Method not allowed. Use POST'
    });
  });

  // Unified endpoint for both prepare and complete requests
  router.post('/click/pay', async (req, res) => {
    try {
      // Log everything about this request
      console.log(`\n⚡ [CLICK-PAY] ========== NEW REQUEST ==========`);
      console.log(`⚡ [CLICK-PAY] Time: ${new Date().toISOString()}`);
      console.log(`⚡ [CLICK-PAY] IP: ${req.ip}`);
      console.log(`⚡ [CLICK-PAY] Method: ${req.method}`);
      console.log(`⚡ [CLICK-PAY] Content-Type: ${req.headers['content-type']}`);
      console.log(`⚡ [CLICK-PAY] User-Agent: ${req.headers['user-agent']}`);
      console.log(`⚡ [CLICK-PAY] Body:`, JSON.stringify(req.body, null, 2));
      
      // CRITICAL: Log merchant_trans_id to track user
      console.log(`🔑 [CLICK-PAY] merchant_trans_id: ${req.body.merchant_trans_id}`);
      console.log(`🔑 [CLICK-PAY] click_trans_id: ${req.body.click_trans_id}`);
      
      const { action } = req.body;
      
      // Ensure action is a number
      const actionNum = typeof action === 'string' ? parseInt(action, 10) : action;
      
      console.log(`📥 [CLICK] Incoming request:`, {
        action,
        body: req.body,
        headers: req.headers,
        ip: req.ip,
        ips: req.ips,
        method: req.method,
        url: req.url,
        timestamp: new Date().toISOString()
      });

      let result;
      
      if (actionNum === 0) {
        // Prepare request
        result = await clickService.handlePrepare(req.body);
      } else if (actionNum === 1) {
        // Complete request
        result = await clickService.handleComplete(req.body);
        
        // If payment completed successfully, upgrade user tier
        if (result.error === CLICK_ERRORS.SUCCESS) {
          try {
            const { storage } = await import('./storage');
            const { createClient } = await import('@supabase/supabase-js');
            
            // Look up payment session by merchant transaction ID
            const merchantTransId = req.body.merchant_trans_id;
            const paymentSession = await storage.getPaymentSessionByMerchantId(merchantTransId);
            
            if (!paymentSession) {
              console.error(`❌ [CLICK] No payment session found for merchant_trans_id: ${merchantTransId}`);
              // Don't fail the payment response, Click.uz already processed it
              return;
            }
            
            console.log(`✅ [CLICK] Found payment session:`, {
              sessionId: paymentSession.id,
              userId: paymentSession.user_id,
              userEmail: paymentSession.user_email
            });
            
            // Update payment session with Click transaction ID
            await storage.updatePaymentSession(paymentSession.id, {
              status: 'completed',
              clickTransId: req.body.click_trans_id,
              metadata: {
                ...paymentSession.metadata,
                completedAt: new Date().toISOString(),
                clickPaydocId: req.body.click_paydoc_id
              }
            });
            
            const adminSupabase = createClient(
              process.env.SUPABASE_URL!,
              process.env.SUPABASE_SERVICE_ROLE_KEY!
            );
            
            const userId = paymentSession.user_id;
            
            if (userId) {
              // Check if user already paid (prevent duplicate upgrades)
              const { data: { user }, error: userError } = await adminSupabase.auth.admin.getUserById(userId);
              
              if (user && !userError) {
                if (user.user_metadata?.tier === 'paid') {
                  console.log(`⚠️ [CLICK] User ${user.email} already has paid tier, skipping upgrade`);
                } else {
                  // Update user tier
                  const { error: updateError } = await adminSupabase.auth.admin.updateUserById(user.id, {
                    user_metadata: {
                      ...user.user_metadata,
                      tier: 'paid',
                      paidAt: new Date().toISOString(),
                      paymentMethod: 'click',
                      clickTransId: req.body.click_trans_id
                    }
                  });
                  
                  if (!updateError) {
                    console.log(`✅ [CLICK] Successfully upgraded user tier for ${user.email}`);
                    console.log(`🎯 [CLICK] User ${user.email} (${user.id}) upgraded to PAID tier at ${new Date().toISOString()}`);
                    
                    // Store payment record
                    await storage.storePayment({
                      id: `payment_click_${req.body.click_trans_id}_${Date.now()}`,
                      userId: user.id,
                      userEmail: user.email || paymentSession.user_email,
                      amount: paymentSession.amount,
                      transactionId: req.body.click_trans_id,
                      status: 'completed',
                      atmosData: JSON.stringify({
                        paymentMethod: 'click',
                        clickTransId: req.body.click_trans_id,
                        merchantTransId: req.body.merchant_trans_id,
                        sessionId: paymentSession.id,
                        completedAt: new Date().toISOString()
                      }),
                      couponId: paymentSession.coupon_id || null,
                      originalAmount: paymentSession.original_amount || paymentSession.amount,
                      discountAmount: paymentSession.discount_amount || 0
                    });
                    
                    console.log(`💾 [CLICK] Payment record stored`);
                    
                    // If a coupon was used, increment its usage count
                    if (paymentSession.coupon_id) {
                      await storage.incrementCouponUsage(paymentSession.coupon_id);
                      await storage.recordCouponUsage({
                        couponId: paymentSession.coupon_id,
                        userId: user.id,
                        userEmail: user.email || paymentSession.user_email,
                        paymentId: req.body.click_trans_id,
                        originalAmount: paymentSession.original_amount,
                        discountAmount: paymentSession.discount_amount,
                        finalAmount: paymentSession.amount
                      });
                      console.log(`🎟️ [CLICK] Coupon usage recorded for coupon ${paymentSession.coupon_id}`);
                    }
                  } else {
                    console.error(`❌ [CLICK] Failed to upgrade user ${user.email}: ${updateError.message}`);
                  }
                }
              } else {
                console.error(`❌ [CLICK] Failed to get user ${userId} from Supabase`);
              }
            } else {
              console.error(`❌ [CLICK] No user ID in payment session`);
            }
          } catch (error) {
            console.error(`❌ [CLICK] Error upgrading user tier:`, error);
            // Don't fail the payment response
          }
        }
      } else {
        // Invalid action
        result = {
          error: CLICK_ERRORS.INVALID_REQUEST,
          error_note: 'Invalid action'
        };
      }

      console.log(`📤 [CLICK] Response:`, JSON.stringify(result, null, 2));
      console.log(`⚡ [CLICK-PAY] ========== END REQUEST ==========\n`);
      
      // Set proper headers for Click.uz
      res.set({
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      
      // Send response with proper status code
      res.status(200).json(result);

    } catch (error: any) {
      console.error(`❌ [CLICK] Route error:`, error);
      res.json({
        error: CLICK_ERRORS.INVALID_REQUEST,
        error_note: 'Server error'
      });
    }
  });

  // Create payment session (called by frontend)
  router.post('/click/create-payment', async (req, res) => {
    try {
      const { amount, couponCode, userId, userEmail } = req.body;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid amount'
        });
      }
      
      // Validate userId is a proper UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!userId || userId === 'guest' || !uuidRegex.test(userId)) {
        console.error(`❌ [CLICK] Invalid user ID format in create-payment: ${userId}`);
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      let finalAmount = amount;
      let appliedCoupon = null;
      
      // Check coupon if provided
      if (couponCode) {
        const { storage } = await import('./storage');
        const coupon = await storage.getCouponByCode(couponCode.trim().toUpperCase());
        
        if (coupon && coupon.isActive) {
          const now = new Date();
          
          if (coupon.validUntil && new Date(coupon.validUntil) < now) {
            console.log(`⚠️ [CLICK] Coupon ${couponCode} is expired`);
          } else if (coupon.validFrom && new Date(coupon.validFrom) > now) {
            console.log(`⚠️ [CLICK] Coupon ${couponCode} is not yet valid`);
          } else if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
            console.log(`⚠️ [CLICK] Coupon ${couponCode} usage limit reached`);
          } else {
            // Apply discount
            if (coupon.discountType === 'percentage') {
              const discountAmount = Math.floor(amount * (coupon.discountValue / 100));
              finalAmount = amount - discountAmount;
            } else if (coupon.discountType === 'fixed') {
              finalAmount = Math.max(0, amount - coupon.discountValue);
            }
            
            appliedCoupon = coupon;
            console.log(`✅ [CLICK] Coupon applied: ${amount} -> ${finalAmount}`);
          }
        }
      }

      // Import payment utils
      const { generatePaymentSessionId, generateShortTransId, generateIdempotencyKey, calculateSessionExpiry } = await import('./utils/payment-utils');
      
      // Generate secure IDs for payment session
      const sessionId = generatePaymentSessionId();
      const merchantTransId = generateShortTransId('click', false);
      const idempotencyKey = generateIdempotencyKey(userId, amount);
      
      // Get storage instance
      const { storage } = await import('./storage');
      
      // Create payment session in database
      const paymentSession = await storage.createPaymentSession({
        id: sessionId,
        userId: userId,
        userEmail: userEmail || 'unknown@email.com',
        amount: finalAmount,
        originalAmount: amount,
        discountAmount: amount - finalAmount,
        couponId: appliedCoupon?.id || null,
        merchantTransId: merchantTransId,
        paymentMethod: 'click',
        idempotencyKey: idempotencyKey,
        metadata: {
          couponCode: couponCode,
          userAgent: req.headers['user-agent'],
          ip: req.ip
        },
        expiresAt: calculateSessionExpiry()
      });
      
      // Generate payment URL with new merchant trans ID
      const paymentUrl = clickService.generatePaymentUrl(
        finalAmount,
        merchantTransId,
        userId || userEmail || 'guest'
      );

      res.json({
        success: true,
        paymentUrl,
        orderId: merchantTransId,  // Keep orderId for backward compatibility
        amount: finalAmount,
        originalAmount: amount,
        coupon: appliedCoupon ? {
          code: appliedCoupon.code,
          discount: amount - finalAmount
        } : null
      });

    } catch (error: any) {
      console.error(`❌ [CLICK] Create payment error:`, error);
      res.status(500).json({
        success: false,
        message: 'Failed to create payment session'
      });
    }
  });

  // Handle Click.uz Prepare/Complete requests sent to return URL
  // IMPORTANT: Click.uz sends payment notifications to the RETURN URL, not a separate callback URL
  router.post('/click/return', async (req, res) => {
    try {
      const { action } = req.body;
      
      console.log(`⚡ [CLICK-RETURN] ========== PAYMENT NOTIFICATION ==========`);
      console.log(`⚡ [CLICK-RETURN] Time: ${new Date().toISOString()}`);
      console.log(`⚡ [CLICK-RETURN] Action: ${action}`);
      console.log(`⚡ [CLICK-RETURN] Body:`, JSON.stringify(req.body, null, 2));
      
      // Ensure action is a number
      const actionNum = typeof action === 'string' ? parseInt(action, 10) : action;
      
      let result;
      
      if (actionNum === 0) {
        // Prepare request - store transaction info for later
        result = await clickService.handlePrepare(req.body);
        
        if (result.error === CLICK_ERRORS.SUCCESS) {
          const { storage } = await import('./storage');
          
          // Look up payment session by merchant transaction ID
          const merchantTransId = req.body.merchant_trans_id;
          const paymentSession = await storage.getPaymentSessionByMerchantId(merchantTransId);
          
          if (paymentSession) {
            // Update payment session with Click transaction ID and prepare status
            await storage.updatePaymentSession(paymentSession.id, {
              status: 'processing',
              clickTransId: req.body.click_trans_id,
              metadata: {
                ...paymentSession.metadata,
                clickPaydocId: req.body.click_paydoc_id,
                preparedAt: new Date().toISOString()
              }
            });
            console.log(`✅ [CLICK-RETURN] Updated payment session ${paymentSession.id} with click_trans_id`);
          } else {
            console.warn(`⚠️ [CLICK-RETURN] No payment session found for merchant_trans_id: ${merchantTransId}`);
          }
        }
      } else if (actionNum === 1) {
        // Complete request
        result = await clickService.handleComplete(req.body);
        
        // If payment completed successfully, upgrade user tier
        if (result.error === CLICK_ERRORS.SUCCESS) {
          try {
            const { storage } = await import('./storage');
            const { createClient } = await import('@supabase/supabase-js');
            
            // Find the pending payment by click_trans_id
            const paymentId = `payment_click_${req.body.click_trans_id}`;
            const pendingPayments = await storage.getUserPayments('pending');
            const pendingPayment = pendingPayments.find(p => 
              p.transactionId === req.body.click_trans_id || 
              p.id === paymentId
            );
            
            const adminSupabase = createClient(
              process.env.SUPABASE_URL!,
              process.env.SUPABASE_SERVICE_ROLE_KEY!
            );
            
            // Look up payment session by merchant transaction ID
            const merchantTransId = req.body.merchant_trans_id;
            const paymentSession = await storage.getPaymentSessionByMerchantId(merchantTransId);
            
            if (!paymentSession) {
              console.error(`❌ [CLICK-RETURN] No payment session found for merchant_trans_id: ${merchantTransId}`);
              // Don't fail the payment response, Click.uz already processed it
              return;
            }
            
            console.log(`✅ [CLICK-RETURN] Found payment session:`, {
              sessionId: paymentSession.id,
              userId: paymentSession.user_id,
              userEmail: paymentSession.user_email
            });
            
            // Update payment session as completed
            await storage.updatePaymentSession(paymentSession.id, {
              status: 'completed',
              clickTransId: req.body.click_trans_id,
              metadata: {
                ...paymentSession.metadata,
                completedAt: new Date().toISOString(),
                clickPaydocId: req.body.click_paydoc_id
              }
            });
            
            const userId = paymentSession.user_id;
            
            if (userId) {
              // Check if user already paid (prevent duplicate upgrades)
              const { data: { user }, error: userError } = await adminSupabase.auth.admin.getUserById(userId);
              
              if (user && !userError) {
                if (user.user_metadata?.tier === 'paid') {
                  console.log(`⚠️ [CLICK-RETURN] User ${user.email} already has paid tier, skipping upgrade`);
                } else {
                  // Update user tier
                  const { error: updateError } = await adminSupabase.auth.admin.updateUserById(userId, {
                    user_metadata: {
                      ...user.user_metadata,
                      tier: 'paid',
                      paidAt: new Date().toISOString(),
                      paymentMethod: 'click',
                      clickTransId: req.body.click_trans_id
                    }
                  });
                  
                  if (!updateError) {
                    console.log(`✅ [CLICK-RETURN] Successfully upgraded user tier for ${user.email}`);
                    
                    // Store completed payment record
                    await storage.storePayment({
                      id: `payment_click_completed_${req.body.click_trans_id}`,
                      userId: userId,
                      userEmail: user.email || paymentSession.user_email,
                      amount: paymentSession.amount,
                      transactionId: req.body.click_trans_id,
                      status: 'completed',
                      atmosData: JSON.stringify({
                        paymentMethod: 'click',
                        clickTransId: req.body.click_trans_id,
                        merchantTransId: req.body.merchant_trans_id,
                        sessionId: paymentSession.id,
                        completedAt: new Date().toISOString()
                      }),
                      couponId: paymentSession.coupon_id || null,
                      originalAmount: paymentSession.original_amount || paymentSession.amount,
                      discountAmount: paymentSession.discount_amount || 0
                    });
                    
                    // If a coupon was used, record its usage
                    if (paymentSession.coupon_id) {
                      await storage.incrementCouponUsage(paymentSession.coupon_id);
                      await storage.recordCouponUsage({
                        couponId: paymentSession.coupon_id,
                        userId: userId,
                        userEmail: user.email || paymentSession.user_email,
                        paymentId: req.body.click_trans_id,
                        originalAmount: paymentSession.original_amount,
                        discountAmount: paymentSession.discount_amount,
                        finalAmount: paymentSession.amount
                      });
                      console.log(`🎟️ [CLICK-RETURN] Coupon usage recorded for coupon ${paymentSession.coupon_id}`);
                    }
                  } else {
                    console.error(`❌ [CLICK-RETURN] Failed to update user tier:`, updateError);
                  }
                }
              } else {
                console.error(`❌ [CLICK-RETURN] Failed to get user ${userId} from Supabase`);
              }
            } else {
              console.error(`❌ [CLICK-RETURN] No user ID in payment session`);
            }
            
            console.log(`✅ [CLICK-RETURN] Payment completed successfully`);
          } catch (error) {
            console.error(`❌ [CLICK-RETURN] Error upgrading user:`, error);
          }
        }
      } else {
        // Invalid action
        result = {
          error: CLICK_ERRORS.INVALID_REQUEST,
          error_note: 'Invalid action'
        };
      }
      
      console.log(`📤 [CLICK-RETURN] Response:`, JSON.stringify(result, null, 2));
      console.log(`⚡ [CLICK-RETURN] ========== END NOTIFICATION ==========\n`);
      
      // Set proper headers for Click.uz
      res.set({
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      
      res.status(200).json(result);
      
    } catch (error: any) {
      console.error(`❌ [CLICK-RETURN] Route error:`, error);
      res.json({
        error: CLICK_ERRORS.INVALID_REQUEST,
        error_note: 'Server error'
      });
    }
  });
  
  // Original GET handler for browser redirects
  router.get('/click/return', async (req, res) => {
    try {
      const params = new URLSearchParams(req.query as any);
      const result = clickService.parseReturnParams(params);
      
      console.log(`🔙 [CLICK] Return from payment:`, result);
      console.log(`🔑 [CLICK] Return params:`, req.query);
      
      // Redirect to frontend with status
      const frontendUrl = process.env.APP_DOMAIN || 'https://app.p57.uz';
      
      // For mobile, Click app might not return proper success params
      // So we always redirect to processing page to check payment status
      const orderId = req.query.orderId || req.query.order_id || req.query.merchant_trans_id || 'check';
      
      console.log(`📦 [CLICK] Extracted orderId: ${orderId}`);
      
      // Always redirect to processing page, let it determine success/failure
      // This handles mobile cases where Click app doesn't return proper params
      // Also include a hint that this might be a cross-browser scenario
      const isMobile = req.headers['user-agent']?.toLowerCase().includes('mobile') || false;
      res.redirect(`${frontendUrl}/payment/processing?method=click&orderId=${orderId}&mobile=true&crossBrowser=possible`);

    } catch (error: any) {
      console.error(`❌ [CLICK] Return handler error:`, error);
      const frontendUrl = process.env.APP_DOMAIN || 'https://app.p57.uz';
      res.redirect(`${frontendUrl}/payment?error=Payment%20processing%20failed&method=click`);
    }
  });

  // Check payment status
  router.get('/click/status/:orderId', async (req, res) => {
    try {
      const { orderId } = req.params;
      
      // In production, check database for payment status
      // For now, return a mock response
      res.json({
        success: true,
        orderId,
        status: 'pending',
        message: 'Payment status check not implemented yet'
      });

    } catch (error: any) {
      console.error(`❌ [CLICK] Status check error:`, error);
      res.status(500).json({
        success: false,
        message: 'Failed to check payment status'
      });
    }
  });

  // Wait for payment completion endpoint
  router.get('/click/wait-payment/:orderId', async (req, res) => {
    try {
      const { orderId } = req.params;
      const maxAttempts = 15; // 15 seconds max wait
      let attempts = 0;
      
      console.log(`⏳ [CLICK-WAIT] Waiting for payment completion: ${orderId}`);
      
      const checkPayment = async (): Promise<boolean> => {
        try {
          // Look up payment session by merchant transaction ID (orderId)
          const { storage } = await import('./storage');
          const paymentSession = await storage.getPaymentSessionByMerchantId(orderId);
          
          if (!paymentSession) {
            console.log(`⚠️ [CLICK-WAIT] No payment session found for orderId: ${orderId}`);
            return false;
          }
          
          // Check if payment session is completed
          if (paymentSession.status === 'completed') {
            return true;
          }
          
          // Also check if user has been upgraded (as a fallback)
          const { createClient } = await import('@supabase/supabase-js');
          const adminSupabase = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
          );
          
          const { data: { user } } = await adminSupabase.auth.admin.getUserById(paymentSession.user_id);
          if (user && user.user_metadata?.tier === 'paid') {
            return true;
          }
          
          return false;
        } catch (error) {
          console.error(`❌ [CLICK-WAIT] Error checking payment:`, error);
          return false;
        }
      };
      
      // Poll for payment completion
      while (attempts < maxAttempts) {
        const isComplete = await checkPayment();
        
        if (isComplete) {
          console.log(`✅ [CLICK-WAIT] Payment completed for order ${orderId}`);
          return res.json({ success: true, message: 'Payment completed' });
        }
        
        attempts++;
        // Wait 1 second before next check
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      console.log(`⚠️ [CLICK-WAIT] Timeout waiting for payment ${orderId}`);
      res.json({ success: false, message: 'Payment still processing' });
      
    } catch (error) {
      console.error(`❌ [CLICK-WAIT] Error:`, error);
      res.status(500).json({ success: false, error: 'Internal error' });
    }
  });
  
  // Payment recovery endpoint - check for pending payments
  router.get('/payment/check-pending', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const token = authHeader.substring(7);
      
      // Verify token and get user
      const { createClient } = await import('@supabase/supabase-js');
      const adminSupabase = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      
      const { data: { user }, error } = await adminSupabase.auth.getUser(token);
      
      if (error || !user) {
        return res.status(401).json({ error: 'Invalid token' });
      }
      
      console.log(`🔍 [Payment Check] User ${user.email} checking for pending payments`);
      
      // Check if user already has paid tier
      if (user.user_metadata?.tier === 'paid') {
        console.log(`✅ [Payment Check] User ${user.email} already has premium access`);
        return res.json({ 
          upgraded: true, 
          message: 'User already has premium access' 
        });
      }
      
      // Check for pending payments
      const wasUpgraded = await checkPendingPayment(user.id);
      
      if (wasUpgraded) {
        console.log(`🎉 [Payment Check] Payment found and user ${user.email} upgraded`);
        return res.json({ 
          upgraded: true, 
          message: 'Payment found and user upgraded successfully' 
        });
      }
      
      console.log(`⏳ [Payment Check] No completed payment found yet for ${user.email}`);
      return res.json({ 
        upgraded: false, 
        message: 'No completed payment found yet' 
      });
      
    } catch (error) {
      console.error('❌ [Payment Check] Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Simple endpoint to check if current user has been upgraded
  router.get('/click/check-upgrade', async (req, res) => {
    try {
      // Get auth token from header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
          success: false, 
          message: 'No authorization token' 
        });
      }
      
      const token = authHeader.split(' ')[1];
      
      // Get admin Supabase client
      const { createClient } = await import('@supabase/supabase-js');
      const adminSupabase = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      
      // Get current user
      const { data: { user }, error } = await adminSupabase.auth.getUser(token);
      
      if (error || !user) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid token' 
        });
      }
      
      console.log(`🔍 [CLICK] Checking upgrade status for user: ${user.email}`);
      
      // Check if user has been upgraded
      const isPremium = user.user_metadata?.tier === 'paid';
      
      return res.json({ 
        success: true, 
        upgraded: isPremium,
        email: user.email,
        tier: user.user_metadata?.tier || 'free'
      });
      
    } catch (error: any) {
      console.error(`❌ [CLICK] Check upgrade error:`, error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to check upgrade status' 
      });
    }
  });

  // Remove the catch-all - it's intercepting valid requests

  return router;
}