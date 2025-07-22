// Click.uz Payment Routes
import { Router } from 'express';
import { ClickService, CLICK_ERRORS } from './click-service';

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
      const { amount, userId, couponCode } = req.body;
      
      console.log(`📝 [CLICK] Creating transaction:`, {
        amount,
        userId,
        couponCode
      });

      // Validate input
      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid amount'
        });
      }

      // Generate unique order ID
      // Format: "P57-{timestamp}-{random}" (shorter to avoid Click.uz length limits)
      const orderId = `P57-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      
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

      // Generate payment URL
      const paymentUrl = clickService.generatePaymentUrl(finalAmount, orderId, userId || 'guest');
      
      console.log(`✅ [CLICK] Transaction created:`, {
        orderId,
        originalAmount: amount,
        finalAmount,
        paymentUrl
      });

      res.json({
        success: true,
        paymentUrl,
        orderId,
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
            // Since we shortened the format, we can't extract userId from merchant_trans_id
            // We'll need to look it up from the transaction record or skip user upgrade
            console.log(`⚠️ [CLICK] Cannot extract userId from shortened merchant_trans_id format`);
            const userId = null; // Will need to implement transaction lookup
            
            if (userId && userId !== 'guest') {
              // Import necessary modules
              const { createClient } = await import('@supabase/supabase-js');
              const adminSupabase = createClient(
                process.env.SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!
              );
              
              // Get user and upgrade tier
              const { data: { user }, error: userError } = await adminSupabase.auth.admin.getUserById(userId);
              
              if (user && !userError) {
                console.log(`🎯 [CLICK] Upgrading user tier: ${user.email} (${user.id})`);
                
                const { error: updateError } = await adminSupabase.auth.admin.updateUserById(user.id, {
                  user_metadata: {
                    ...user.user_metadata,
                    tier: 'paid',
                    paidAt: new Date().toISOString(),
                    paymentMethod: 'click'
                  }
                });
                
                if (!updateError) {
                  console.log(`✅ [CLICK] Successfully upgraded user tier for ${user.email}`);
                  
                  // Store payment record
                  const { storage } = await import('./storage');
                  await storage.storePayment({
                    id: `payment_click_${req.body.click_trans_id}_${Date.now()}`,
                    userId: user.id,
                    userEmail: user.email || 'unknown@email.com',
                    amount: req.body.amount,
                    transactionId: req.body.click_trans_id,
                    status: 'completed',
                    atmosData: JSON.stringify({
                      paymentMethod: 'click',
                      clickTransId: req.body.click_trans_id,
                      merchantTransId: req.body.merchant_trans_id,
                      completedAt: new Date().toISOString()
                    }),
                    couponId: null,
                    originalAmount: null,
                    discountAmount: null
                  });
                  
                  console.log(`💾 [CLICK] Payment record stored`);
                }
              }
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

      // Generate order ID (keep it short for Click.uz)
      const orderId = `P57-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      
      // Generate payment URL
      const paymentUrl = clickService.generatePaymentUrl(
        finalAmount,
        orderId,
        userId || userEmail || 'guest'
      );

      // Store initial payment record
      if (userId) {
        try {
          const { storage } = await import('./storage');
          await storage.storePayment({
            id: `payment_click_pending_${orderId}`,
            userId: userId,
            userEmail: userEmail || 'unknown@email.com',
            amount: finalAmount,
            transactionId: orderId,
            status: 'pending',
            atmosData: JSON.stringify({
              paymentMethod: 'click',
              originalAmount: amount,
              finalAmount: finalAmount,
              couponApplied: !!appliedCoupon,
              createdAt: new Date().toISOString()
            }),
            couponId: appliedCoupon?.id || null,
            originalAmount: amount,
            discountAmount: amount - finalAmount
          });
        } catch (error) {
          console.error(`⚠️ [CLICK] Failed to store initial payment record:`, error);
        }
      }

      res.json({
        success: true,
        paymentUrl,
        orderId,
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

  // Handle return from Click payment page
  router.get('/click/return', async (req, res) => {
    try {
      const params = new URLSearchParams(req.query as any);
      const result = clickService.parseReturnParams(params);
      
      console.log(`🔙 [CLICK] Return from payment:`, result);
      
      // Redirect to frontend with status
      const frontendUrl = process.env.APP_DOMAIN || 'https://app.p57.uz';
      
      if (result.success) {
        res.redirect(`${frontendUrl}/?payment=success&method=click&transaction=${result.transactionId}`);
      } else {
        res.redirect(`${frontendUrl}/payment?error=${encodeURIComponent(result.error || 'Payment failed')}&method=click`);
      }

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

  // Catch-all for any Click.uz requests we might be missing
  router.all('/click/*', (req, res) => {
    console.log(`🎆 [CLICK-CATCHALL] Unhandled Click.uz request`);
    console.log(`🎆 [CLICK-CATCHALL] Path: ${req.path}`);
    console.log(`🎆 [CLICK-CATCHALL] Method: ${req.method}`);
    console.log(`🎆 [CLICK-CATCHALL] Headers:`, req.headers);
    console.log(`🎆 [CLICK-CATCHALL] Body:`, req.body);
    
    // Return a generic error response
    res.json({
      error: -9,
      error_note: 'Unknown endpoint'
    });
  });

  return router;
}