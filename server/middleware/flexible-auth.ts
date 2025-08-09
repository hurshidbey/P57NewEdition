import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
      session?: any;
    }
  }
}

// Initialize Supabase client for token validation
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

/**
 * Flexible authentication middleware that supports both:
 * 1. Express session-based authentication (legacy)
 * 2. Supabase JWT Bearer token authentication (modern)
 * 
 * This allows gradual migration from session to token-based auth
 */
export const flexibleAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // First, check for session-based authentication (legacy support)
    if (req.session?.user) {
      req.user = req.session.user;
      logger.debug('Auth via session', { userId: req.user.id });
      return next();
    }

    // Second, check for Bearer token authentication
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      try {
        // Validate token with Supabase
        const { data: { user }, error } = await supabase.auth.getUser(token);
        
        if (!error && user) {
          // Check if user is admin
          const adminEmails = process.env.ADMIN_EMAILS 
            ? process.env.ADMIN_EMAILS.split(',').map(email => email.trim())
            : ['hurshidbey@gmail.com', 'mustafaabdurahmonov7777@gmail.com'];
          const isAdmin = user.user_metadata?.role === 'admin' || adminEmails.includes(user.email || '');
          
          // Transform Supabase user to match legacy user format
          req.user = {
            id: user.id,
            email: user.email,
            username: user.email?.split('@')[0] || user.id,
            role: isAdmin ? 'admin' : (user.user_metadata?.role || 'user'),
            tier: isAdmin ? 'paid' : (user.user_metadata?.tier || 'free'), // Admins get paid tier
            // Include full Supabase user data for new features
            supabaseUser: user
          };
          logger.debug('Auth via Bearer token', { userId: user.id, tier: req.user.tier });
          return next();
        }
      } catch (tokenError) {
        logger.warn('Invalid Bearer token', { error: tokenError });
      }
    }

    // No authentication found - this is OK for public routes
    next();
  } catch (error) {
    logger.error('Error in flexible auth middleware', { error });
    next(); // Continue without auth rather than failing
  }
};

/**
 * Middleware to require authentication (works with both session and token)
 */
export const requireFlexibleAuth = async (req: Request, res: Response, next: NextFunction) => {
  // First apply flexible auth to populate req.user
  await flexibleAuth(req, res, () => {
    if (!req.user) {
      return res.status(401).json({ 
        message: "Authentication required",
        hint: "Please login or provide a valid authorization token"
      });
    }
    next();
  });
};

/**
 * Optional authentication - populates req.user if authenticated but doesn't require it
 */
export const optionalAuth = flexibleAuth;

/**
 * Check if user is admin (works with both auth methods)
 */
export const isFlexibleAdmin = async (req: Request, res: Response, next: NextFunction) => {
  await requireFlexibleAuth(req, res, () => {
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
    const userEmail = req.user?.email || req.user?.supabaseUser?.email;
    
    if (!userEmail || !adminEmails.includes(userEmail)) {
      return res.status(403).json({ 
        message: "Admin access required" 
      });
    }
    
    next();
  });
};