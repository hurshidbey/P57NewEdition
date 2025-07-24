import { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { PaymentTransactionService } from './services/payment-transaction-service';
import { monitoring } from './services/monitoring-service';

interface DiagnosticResult {
  check: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: any;
}

export function setupDiagnosticRoutes(): Router {
  const router = Router();
  const transactionService = new PaymentTransactionService();

  // Health check endpoint with detailed diagnostics
  router.get('/api/diagnostics/health', async (req: Request, res: Response) => {
    const results: DiagnosticResult[] = [];

    // Check 1: Database connectivity
    try {
      const adminSupabase = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      
      const { error } = await adminSupabase.from('payment_transactions').select('count').single();
      
      results.push({
        check: 'database_connectivity',
        status: error ? 'fail' : 'pass',
        message: error ? `Database connection failed: ${error.message}` : 'Database is accessible',
      });
    } catch (error: any) {
      results.push({
        check: 'database_connectivity',
        status: 'fail',
        message: `Database check failed: ${error.message}`,
      });
    }

    // Check 2: OAuth users with missing metadata
    try {
      const adminSupabase = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      
      const { data, error } = await adminSupabase.rpc('get_users_with_missing_metadata');
      
      if (error) {
        results.push({
          check: 'oauth_metadata_check',
          status: 'warning',
          message: 'Could not check OAuth metadata',
          details: { error: error.message }
        });
      } else {
        const count = data?.length || 0;
        results.push({
          check: 'oauth_metadata_check',
          status: count > 0 ? 'warning' : 'pass',
          message: count > 0 
            ? `Found ${count} OAuth users with missing metadata` 
            : 'All OAuth users have proper metadata',
          details: { users_missing_metadata: count }
        });
      }
    } catch (error: any) {
      results.push({
        check: 'oauth_metadata_check',
        status: 'fail',
        message: `OAuth metadata check failed: ${error.message}`,
      });
    }

    // Check 3: Pending transactions older than 1 hour
    try {
      const adminSupabase = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      
      const { data, error } = await adminSupabase
        .from('payment_transactions')
        .select('id, user_email, created_at')
        .in('status', ['pending', 'processing'])
        .lt('created_at', oneHourAgo);
      
      if (error) {
        results.push({
          check: 'stuck_transactions',
          status: 'warning',
          message: 'Could not check for stuck transactions',
          details: { error: error.message }
        });
      } else {
        const count = data?.length || 0;
        results.push({
          check: 'stuck_transactions',
          status: count > 0 ? 'warning' : 'pass',
          message: count > 0 
            ? `Found ${count} transactions stuck in pending/processing state` 
            : 'No stuck transactions found',
          details: { 
            stuck_count: count,
            transactions: data?.map(t => ({
              id: t.id,
              user: t.user_email,
              age: `${Math.floor((Date.now() - new Date(t.created_at).getTime()) / 1000 / 60)} minutes`
            }))
          }
        });
      }
    } catch (error: any) {
      results.push({
        check: 'stuck_transactions',
        status: 'fail',
        message: `Transaction check failed: ${error.message}`,
      });
    }

    // Check 4: Payment provider connectivity
    const clickServiceAvailable = !!process.env.CLICK_SERVICE_ID && !!process.env.CLICK_SECRET_KEY;
    const atmosServiceAvailable = !!process.env.ATMOS_STORE_ID && !!process.env.ATMOS_CONSUMER_KEY;
    
    results.push({
      check: 'payment_providers',
      status: (clickServiceAvailable || atmosServiceAvailable) ? 'pass' : 'fail',
      message: 'Payment provider configuration',
      details: {
        click: clickServiceAvailable ? 'configured' : 'not configured',
        atmos: atmosServiceAvailable ? 'configured' : 'not configured'
      }
    });

    // Calculate overall health
    const failedChecks = results.filter(r => r.status === 'fail').length;
    const warningChecks = results.filter(r => r.status === 'warning').length;
    
    const overallStatus = failedChecks > 0 ? 'unhealthy' : 
                         warningChecks > 0 ? 'degraded' : 'healthy';

    res.json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      checks: results,
      summary: {
        total: results.length,
        passed: results.filter(r => r.status === 'pass').length,
        warnings: warningChecks,
        failures: failedChecks
      }
    });
  });

  // Recovery endpoint for stuck OAuth users
  router.post('/api/diagnostics/recover-oauth-users', async (req: Request, res: Response) => {
    try {
      // Require admin authentication
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.includes('admin-recovery-token')) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      const adminSupabase = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      // Find users with missing metadata
      const { data: users, error } = await adminSupabase.auth.admin.listUsers({
        page: 1,
        perPage: 1000
      });

      if (error) {
        throw error;
      }

      let recovered = 0;
      let failed = 0;
      const errors: any[] = [];

      for (const user of users.users) {
        if (!user.user_metadata?.tier || !user.user_metadata?.name) {
          try {
            const { error: updateError } = await adminSupabase.auth.admin.updateUserById(user.id, {
              user_metadata: {
                ...user.user_metadata,
                tier: user.user_metadata?.tier || 'free',
                name: user.user_metadata?.name || 
                      user.user_metadata?.full_name || 
                      user.email?.split('@')[0] || 
                      'User'
              }
            });

            if (updateError) {
              throw updateError;
            }

            recovered++;
            
            monitoring.logMetadataInitialization(
              user.id,
              user.email!,
              true,
              { source: 'recovery_script' }
            );
          } catch (error: any) {
            failed++;
            errors.push({
              user_id: user.id,
              email: user.email,
              error: error.message
            });
          }
        }
      }

      res.json({
        success: true,
        summary: {
          total_users: users.users.length,
          missing_metadata: recovered + failed,
          recovered,
          failed
        },
        errors: errors.length > 0 ? errors : undefined
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });

  // Recovery endpoint for stuck transactions
  router.post('/api/diagnostics/recover-stuck-transactions', async (req: Request, res: Response) => {
    try {
      // Require admin authentication
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.includes('admin-recovery-token')) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      const adminSupabase = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      // Find stuck transactions (older than 2 hours)
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
      
      const { data: stuckTransactions, error } = await adminSupabase
        .from('payment_transactions')
        .select('*')
        .in('status', ['pending', 'processing'])
        .lt('created_at', twoHoursAgo);

      if (error) {
        throw error;
      }

      let cancelled = 0;
      let errors: any[] = [];

      for (const transaction of stuckTransactions) {
        try {
          await transactionService.updateTransactionStatus(
            transaction.id,
            'cancelled',
            undefined,
            'Transaction cancelled due to timeout'
          );
          cancelled++;
        } catch (error: any) {
          errors.push({
            transaction_id: transaction.id,
            error: error.message
          });
        }
      }

      res.json({
        success: true,
        summary: {
          stuck_transactions: stuckTransactions.length,
          cancelled,
          failed: errors.length
        },
        errors: errors.length > 0 ? errors : undefined
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });

  // Monitoring stats endpoint
  router.get('/api/diagnostics/monitoring-stats', async (req: Request, res: Response) => {
    try {
      const hours = parseInt(req.query.hours as string) || 24;
      
      const adminSupabase = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      const { data: stats, error } = await adminSupabase.rpc('get_monitoring_stats', {
        p_hours: hours
      });

      if (error) {
        throw error;
      }

      res.json({
        success: true,
        time_range_hours: hours,
        stats: stats?.stats || {},
        generated_at: new Date().toISOString()
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });

  return router;
}