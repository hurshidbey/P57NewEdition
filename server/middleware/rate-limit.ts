import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

// Helper to get client identifier
const getClientId = (req: Request): string => {
  // Use authenticated user ID if available
  if (req.session?.user?.id) {
    return `user_${req.session.user.id}`;
  }
  
  // Get real IP address (trust proxy must be enabled)
  const realIp = req.ip || 
                 req.headers['x-forwarded-for'] as string || 
                 req.headers['x-real-ip'] as string || 
                 req.socket.remoteAddress || 
                 'unknown';
  
  // Extract first IP if x-forwarded-for contains multiple IPs
  const clientIp = realIp.split(',')[0].trim();
  
  // Log for debugging - temporarily enabled in production to debug 429 errors
  console.log(`[RateLimit] Client IP: ${clientIp}, Path: ${req.path}, Headers: X-Real-IP=${req.headers['x-real-ip']}, X-Forwarded-For=${req.headers['x-forwarded-for']}`);
  
  // Log when rate limit is being approached (80% threshold)
  const limiter = req.rateLimit;
  if (limiter && limiter.remaining !== undefined && limiter.limit !== undefined) {
    const percentUsed = ((limiter.limit - limiter.remaining) / limiter.limit) * 100;
    if (percentUsed >= 80) {
      console.warn(`[RateLimit WARNING] Client ${clientIp} at ${percentUsed.toFixed(0)}% of rate limit for ${req.path} (${limiter.remaining}/${limiter.limit} remaining)`);
    }
  }
  
  return clientIp;
};

// General API rate limit
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Temporarily increased to 1000 to resolve 429 errors
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
  max: 50, // Temporarily increased to 50 to resolve 429 errors
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

// OTP resend - more lenient since users often need multiple attempts
export const otpResendLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // Allow 10 OTP resends per 5 minutes
  message: 'Too many OTP resend attempts, please wait a few minutes.',
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
  } else if (path.includes('/atmos/resend-otp')) {
    // Special case for OTP resend - more lenient
    return otpResendLimiter(req, res, next);
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