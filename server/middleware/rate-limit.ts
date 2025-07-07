import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

// Helper to get client identifier
const getClientId = (req: Request): string => {
  // Use authenticated user ID if available
  if (req.session?.user?.id) {
    return `user_${req.session.user.id}`;
  }
  
  // Otherwise use IP address
  return req.ip || req.socket.remoteAddress || 'unknown';
};

// General API rate limit
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Increased from 100 to 500 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getClientId,
});

// Strict rate limit for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 auth requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful auth
  keyGenerator: getClientId,
});

// Rate limit for payment endpoints
export const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 payment attempts per hour
  message: 'Too many payment attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getClientId,
});

// Rate limit for AI evaluation endpoints
export const evaluationLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // Limit to 20 evaluations per 5 minutes
  message: 'Too many evaluation requests, please slow down.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getClientId,
});

// Admin endpoints - more lenient
export const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Higher limit for admin operations
  message: 'Admin rate limit exceeded.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getClientId,
});

// Middleware to apply different rate limits based on path
export const applyRateLimits = (req: Request, res: Response, next: Function) => {
  const path = req.path;
  
  // Apply specific rate limiters based on path
  if (path.includes('/auth/login') || path.includes('/auth/signup')) {
    return authLimiter(req, res, next);
  } else if (path.includes('/atmos/') || path.includes('/payment')) {
    return paymentLimiter(req, res, next);
  } else if (path.includes('/evaluate')) {
    return evaluationLimiter(req, res, next);
  } else if (path.includes('/admin/')) {
    return adminLimiter(req, res, next);
  } else {
    return apiLimiter(req, res, next);
  }
};