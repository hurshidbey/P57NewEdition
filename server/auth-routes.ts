import { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { monitoring, EventType, Severity } from './services/monitoring-service';
import { logger } from './utils/logger';

export function setupAuthRoutes(): Router {
  const router = Router();

  // Initialize user metadata after OAuth login
  router.post('/api/auth/initialize-metadata', async (req: Request, res: Response) => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
          success: false, 
          message: 'No authorization token provided' 
        });
      }

      const token = authHeader.substring(7);
      
      // Create admin Supabase client
      const adminSupabase = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      // Verify the token and get user
      const { data: { user }, error: userError } = await adminSupabase.auth.getUser(token);
      
      if (userError || !user) {
        console.error('[AUTH] Failed to get user:', userError);
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid token' 
        });
      }

      logger.info('Initializing user metadata', { userId: user.id });

      // Log OAuth login
      const hasCompleteMetadata = !!user.user_metadata?.tier && !!user.user_metadata?.name;
      monitoring.logOAuthLogin(
        user.id,
        user.email!,
        user.app_metadata?.provider || 'unknown',
        hasCompleteMetadata
      );

      // Check if user metadata needs initialization
      const needsUpdate = !hasCompleteMetadata;
      
      if (needsUpdate) {
        // Extract name from various sources
        const name = user.user_metadata?.name || 
                    user.user_metadata?.full_name || 
                    user.user_metadata?.displayName || // Google OAuth sometimes uses this
                    user.user_metadata?.given_name || // Another Google OAuth field
                    user.email?.split('@')[0] || 
                    'User';

        const metadataToUpdate = {
          tier: user.user_metadata?.tier || 'free',
          name: name
        };

        // Update user metadata
        const { error: updateError } = await adminSupabase.auth.admin.updateUserById(user.id, {
          user_metadata: {
            ...user.user_metadata,
            ...metadataToUpdate
          }
        });

        if (updateError) {
          console.error(`[AUTH] Failed to update user metadata:`, updateError);
          
          // Log failure
          monitoring.logMetadataInitialization(
            user.id,
            user.email!,
            false,
            metadataToUpdate,
            updateError.message
          );

          return res.status(500).json({ 
            success: false, 
            message: 'Failed to update user metadata' 
          });
        }

        logger.info('Successfully initialized user metadata', { userId: user.id });
        
        // Log success
        monitoring.logMetadataInitialization(
          user.id,
          user.email!,
          true,
          metadataToUpdate
        );
        
        // Return updated user data
        const { data: { user: updatedUser } } = await adminSupabase.auth.admin.getUserById(user.id);
        
        return res.json({
          success: true,
          user: {
            id: updatedUser!.id,
            email: updatedUser!.email!,
            name: updatedUser!.user_metadata.name,
            tier: updatedUser!.user_metadata.tier
          }
        });
      } else {
        logger.info('User already has complete metadata', { userId: user.id });
        
        return res.json({
          success: true,
          user: {
            id: user.id,
            email: user.email!,
            name: user.user_metadata.name,
            tier: user.user_metadata.tier
          }
        });
      }
    } catch (error) {
      console.error('[AUTH] Error initializing metadata:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  });

  // Endpoint to check user metadata status
  router.get('/api/auth/check-metadata', async (req: Request, res: Response) => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
          success: false, 
          message: 'No authorization token provided' 
        });
      }

      const token = authHeader.substring(7);
      
      // Create admin Supabase client
      const adminSupabase = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      // Verify the token and get user
      const { data: { user }, error: userError } = await adminSupabase.auth.getUser(token);
      
      if (userError || !user) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid token' 
        });
      }

      const hasCompleteMetadata = !!user.user_metadata?.tier && !!user.user_metadata?.name;
      
      return res.json({
        success: true,
        hasCompleteMetadata,
        metadata: {
          tier: user.user_metadata?.tier || null,
          name: user.user_metadata?.name || null
        }
      });
    } catch (error) {
      console.error('[AUTH] Error checking metadata:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  });

  // Development-only test user endpoints
  if (process.env.NODE_ENV === 'development') {
    // Test users data
    const TEST_USERS = [
      {
        email: 'test@p57.uz',
        password: 'test123456',
        name: 'Test User',
        tier: 'free'
      },
      {
        email: 'premium@p57.uz',
        password: 'premium123456',
        name: 'Premium User',
        tier: 'paid'
      },
      {
        email: 'admin@p57.uz',
        password: 'admin123456',
        name: 'Admin User',
        tier: 'paid',
        isAdmin: true
      }
    ];

    // Create or get test user endpoint
    router.post('/api/auth/test-login', async (req: Request, res: Response) => {
      try {
        const { email, password } = req.body;
        
        // Find test user
        const testUser = TEST_USERS.find(u => u.email === email && u.password === password);
        
        if (!testUser) {
          return res.status(401).json({
            success: false,
            message: 'Invalid test user credentials'
          });
        }

        // Create admin Supabase client
        const adminSupabase = createClient(
          process.env.SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // First try to get the user from Supabase Auth
        const { data: { users: authUsers }, error: listError } = await adminSupabase.auth.admin.listUsers({
          filter: `email.eq.${email}`,
          page: 1,
          perPage: 1
        });

        let userId: string;
        let userExists = false;

        if (authUsers && authUsers.length > 0) {
          // User exists in Auth
          userId = authUsers[0].id;
          userExists = true;
          logger.info('Test user already exists in Auth', { email, userId });
          
          // Update user metadata if needed
          const existingUser = authUsers[0];
          if (existingUser.user_metadata?.tier !== testUser.tier || 
              existingUser.user_metadata?.name !== testUser.name) {
            await adminSupabase.auth.admin.updateUserById(userId, {
              user_metadata: {
                name: testUser.name,
                tier: testUser.tier
              }
            });
            logger.info('Updated test user metadata', { email, userId });
          }
        } else {
          // Create user in Supabase Auth
          const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
              name: testUser.name,
              tier: testUser.tier
            }
          });

          if (authError) {
            console.error('[TEST AUTH] Failed to create user:', authError);
            return res.status(500).json({
              success: false,
              message: 'Failed to create test user'
            });
          }

          userId = authData.user.id;

        }

        // Check if user exists in database
        if (!userExists) {
          const { data: existingDbUser } = await adminSupabase
            .from('users')
            .select('id')
            .eq('id', userId)
            .single();

          if (!existingDbUser) {
            // Insert into users table only if not exists
            const { error: dbError } = await adminSupabase
              .from('users')
              .insert({
                id: userId,
                email,
                name: testUser.name,
                tier: testUser.tier,
                is_admin: testUser.isAdmin || false,
                email_verified: true,
                created_at: new Date().toISOString()
              });

            if (dbError) {
              console.error('[TEST AUTH] Failed to insert user:', dbError);
            } else {
              logger.info('Test user created in database', { email, userId });
            }
          }
        }

        // Sign in the user
        const { data: signInData, error: signInError } = await adminSupabase.auth.signInWithPassword({
          email,
          password
        });

        if (signInError) {
          console.error('[TEST AUTH] Sign in failed:', signInError);
          return res.status(401).json({
            success: false,
            message: 'Failed to sign in test user'
          });
        }

        // Add admin email to session if admin
        if (testUser.isAdmin) {
          (req.session as any).adminEmail = email;
        }

        return res.json({
          success: true,
          user: {
            id: userId,
            email,
            name: testUser.name,
            tier: testUser.tier,
            isAdmin: testUser.isAdmin || false
          },
          session: signInData.session
        });

      } catch (error) {
        console.error('[TEST AUTH] Error:', error);
        return res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    });

    // Get test users list endpoint
    router.get('/api/auth/test-users', (req: Request, res: Response) => {
      return res.json({
        success: true,
        users: TEST_USERS.map(u => ({
          email: u.email,
          name: u.name,
          tier: u.tier,
          isAdmin: u.isAdmin || false
        }))
      });
    });
  }

  return router;
}