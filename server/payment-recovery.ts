import { createClient } from '@supabase/supabase-js';
import { storage } from './storage';

export async function checkPendingPayment(userId: string): Promise<boolean> {
  try {
    console.log(`🔍 [Payment Recovery] Checking pending payments for user: ${userId}`);
    
    // Get all pending payments for this user from the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const pendingPayments = await storage.getUserPayments(userId);
    
    const recentPending = pendingPayments.filter(p => 
      p.status === 'pending' && 
      new Date(p.createdAt) > oneHourAgo
    );
    
    if (recentPending.length === 0) {
      console.log(`📭 [Payment Recovery] No pending payments found for user ${userId}`);
      return false;
    }
    
    console.log(`📋 [Payment Recovery] Found ${recentPending.length} pending payments`);
    
    // Check each pending payment's order ID pattern
    for (const payment of recentPending) {
      // Try to find a completed payment with matching pattern
      const allPayments = await storage.getUserPayments('completed');
      const matchingCompleted = allPayments.find(p => {
        if (p.status !== 'completed') return false;
        
        // Check if the transaction IDs match or have similar patterns
        const pendingOrderId = payment.transactionId;
        const completedData = JSON.parse(p.atmosData || '{}');
        
        return completedData.merchantTransId?.includes(userId.substring(0, 8));
      });
      
      if (matchingCompleted) {
        console.log(`✅ [Payment Recovery] Found matching completed payment!`);
        
        // Upgrade user tier
        const adminSupabase = createClient(
          process.env.SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
        
        const { data: { user }, error: userError } = await adminSupabase.auth.admin.getUserById(userId);
        
        if (user && !userError && user.user_metadata?.tier !== 'paid') {
          const { error: updateError } = await adminSupabase.auth.admin.updateUserById(userId, {
            user_metadata: {
              ...user.user_metadata,
              tier: 'paid',
              paidAt: new Date().toISOString(),
              paymentMethod: 'click',
              recoveredPayment: true
            }
          });
          
          if (!updateError) {
            console.log(`🎉 [Payment Recovery] Successfully upgraded user ${user.email} to paid tier`);
            return true;
          }
        }
      }
    }
    
    return false;
  } catch (error) {
    console.error(`❌ [Payment Recovery] Error:`, error);
    return false;
  }
}

export async function createPaymentCheckEndpoint(router: any) {
  // Add endpoint to manually check pending payments
  router.get('/api/payment/check-pending', async (req: any, res: any) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const token = authHeader.substring(7);
      
      // Verify token and get user
      const adminSupabase = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      
      const { data: { user }, error } = await adminSupabase.auth.getUser(token);
      
      if (error || !user) {
        return res.status(401).json({ error: 'Invalid token' });
      }
      
      // Check if user already has paid tier
      if (user.user_metadata?.tier === 'paid') {
        return res.json({ 
          upgraded: true, 
          message: 'User already has premium access' 
        });
      }
      
      // Check for pending payments
      const wasUpgraded = await checkPendingPayment(user.id);
      
      if (wasUpgraded) {
        return res.json({ 
          upgraded: true, 
          message: 'Payment found and user upgraded successfully' 
        });
      }
      
      return res.json({ 
        upgraded: false, 
        message: 'No completed payment found yet' 
      });
      
    } catch (error) {
      console.error('Payment check error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
}