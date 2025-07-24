import { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { monitoring, EventType, Severity } from './services/monitoring-service';

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

      console.log(`[AUTH] Initializing metadata for user: ${user.email} (${user.id})`);

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

        console.log(`[AUTH] Successfully initialized metadata for ${user.email}`);
        
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
        console.log(`[AUTH] User ${user.email} already has complete metadata`);
        
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

  return router;
}