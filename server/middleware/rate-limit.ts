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
  
  // Removed sensitive logging - IP addresses should not be logged in production
  
  // Log when rate limit is being approached (80% threshold)
  const limiter = req.rateLimit;
  if (limiter && limiter.remaining !== undefined && limiter.limit !== undefined) {
    const percentUsed = ((limiter.limit - limiter.remaining) / limiter.limit) * 100;
    if (percentUsed >= 80) {
      console.warn(`[RateLimit WARNING] Client approaching rate limit: ${percentUsed.toFixed(0)}% for ${req.path} (${limiter.remaining}/${limiter.limit} remaining)`);
    }
  }
  
  return clientIp;
};

// General API rate limit
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Increased to 500 requests per 15 minutes to handle progress polling
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
  max: 10, // Limit to 10 evaluation requests per 5 minutes (costly API calls)
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

// Progress endpoint - needs frequent updates for real-time tracking
export const progressLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // Allow 60 requests per minute (1 per second)
  message: 'Too many progress requests, please slow down.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getClientId,
});

// Special rate limiter for Click.uz - more permissive for payment provider
export const clickLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // Allow 100 requests per minute from payment provider
  message: 'Click.uz rate limit exceeded',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => 'click-uz-server', // All Click.uz requests share same rate limit
});

// Middleware to apply different rate limits based on path
export const applyRateLimits = (req: Request, res: Response, next: Function) => {
  const path = req.path;
  
  // Skip rate limiting for Click.uz callback endpoints
  if (path.includes('/click/pay') || path.includes('/click/test')) {
    // Skip rate limiting for payment provider callbacks
    return next();
  }
  
  // Apply specific rate limiters based on path
  if (path.includes('/auth/login') || path.includes('/auth/signup')) {
    return authLimiter(req, res, next);
  } else if (path.includes('/atmos/resend-otp')) {
    // Special case for OTP resend - more lenient
    return otpResendLimiter(req, res, next);
  } else if (path.includes('/atmos/') || path.includes('/payment')) {
    return paymentLimiter(req, res, next);
  } else if (path.includes('/progress')) {
    // Progress endpoint needs frequent updates
    return progressLimiter(req, res, next);
  } else if (path.includes('/evaluate')) {
    return evaluationLimiter(req, res, next);
  } else if (path.includes('/admin/')) {
    return adminLimiter(req, res, next);
  } else {
    return apiLimiter(req, res, next);
  }
};