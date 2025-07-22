// Click.uz Payment Routes
import { Router } from 'express';
import { ClickService, CLICK_ERRORS } from './click-service';

export function setupClickRoutes(): Router {
  const router = Router();
  const clickService = new ClickService();

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

  // Unified endpoint for both prepare and complete requests
  router.post('/click/pay', async (req, res) => {
    try {
      const { action } = req.body;
      
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
      
      if (action === 0) {
        // Prepare request
        result = await clickService.handlePrepare(req.body);
      } else if (action === 1) {
        // Complete request
        result = await clickService.handleComplete(req.body);
        
        // If payment completed successfully, upgrade user tier
        if (result.error === CLICK_ERRORS.SUCCESS) {
          try {
            // Extract user info from merchant_trans_id
            // Format: "P57-{userId}-{timestamp}-{random}"
            const parts = req.body.merchant_trans_id.split('-');
            const userId = parts[1]; // This should be the user ID
            
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

      console.log(`📤 [CLICK] Response:`, result);
      res.json(result);

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

  return router;
}