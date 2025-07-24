import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiLimiter, authLimiter, paymentLimiter, evaluationLimiter } from '../../middleware/rate-limit';
import type { Request, Response, NextFunction } from 'express';

describe('Rate Limiting Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      ip: '192.168.1.1',
      path: '/api/test',
      headers: {},
      session: {}
    };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
    mockNext = vi.fn();
  });

  describe('Rate Limit Configurations', () => {
    it('should have correct API rate limit (500 requests per 15 minutes)', () => {
      // Access the rate limiter configuration
      const limiterOptions = (apiLimiter as any).options;
      
      expect(limiterOptions.max).toBe(500);
      expect(limiterOptions.windowMs).toBe(15 * 60 * 1000); // 15 minutes
    });

    it('should have correct auth rate limit (5 requests per 15 minutes)', () => {
      const limiterOptions = (authLimiter as any).options;
      
      expect(limiterOptions.max).toBe(5);
      expect(limiterOptions.windowMs).toBe(15 * 60 * 1000);
      expect(limiterOptions.skipSuccessfulRequests).toBe(true);
    });

    it('should have correct payment rate limit (10 requests per hour)', () => {
      const limiterOptions = (paymentLimiter as any).options;
      
      expect(limiterOptions.max).toBe(10);
      expect(limiterOptions.windowMs).toBe(60 * 60 * 1000); // 1 hour
    });

    it('should have correct evaluation rate limit (10 requests per 5 minutes)', () => {
      const limiterOptions = (evaluationLimiter as any).options;
      
      expect(limiterOptions.max).toBe(10);
      expect(limiterOptions.windowMs).toBe(5 * 60 * 1000); // 5 minutes
    });
  });

  describe('Client Identification', () => {
    it('should use user ID for authenticated users', () => {
      mockReq.session = {
        user: { id: 'user123' }
      };

      // Get the key generator function
      const keyGenerator = (apiLimiter as any).options.keyGenerator;
      const clientId = keyGenerator(mockReq);
      
      expect(clientId).toBe('user_user123');
    });

    it('should use IP address for anonymous users', () => {
      mockReq.session = {};
      mockReq.ip = '192.168.1.100';

      const keyGenerator = (apiLimiter as any).options.keyGenerator;
      const clientId = keyGenerator(mockReq);
      
      expect(clientId).toBe('192.168.1.100');
    });

    it('should handle X-Forwarded-For header', () => {
      mockReq.session = {};
      mockReq.headers = {
        'x-forwarded-for': '10.0.0.1, 192.168.1.1'
      };

      const keyGenerator = (apiLimiter as any).options.keyGenerator;
      const clientId = keyGenerator(mockReq);
      
      expect(clientId).toBe('10.0.0.1'); // Should use first IP
    });

    it('should handle X-Real-IP header', () => {
      mockReq.session = {};
      mockReq.ip = undefined;
      mockReq.headers = {
        'x-real-ip': '10.0.0.2'
      };

      const keyGenerator = (apiLimiter as any).options.keyGenerator;
      const clientId = keyGenerator(mockReq);
      
      expect(clientId).toBe('10.0.0.2');
    });
  });

  describe('Rate Limit Messages', () => {
    it('should have appropriate error messages', () => {
      const apiMessage = (apiLimiter as any).options.message;
      const authMessage = (authLimiter as any).options.message;
      const paymentMessage = (paymentLimiter as any).options.message;
      
      expect(apiMessage).toBe('Too many requests from this IP, please try again later.');
      expect(authMessage).toBe('Too many authentication attempts, please try again later.');
      expect(paymentMessage).toBe('Too many payment attempts, please try again later.');
    });
  });

  describe('Security Headers', () => {
    it('should use standard rate limit headers', () => {
      const limiterOptions = (apiLimiter as any).options;
      
      expect(limiterOptions.standardHeaders).toBe(true);
      expect(limiterOptions.legacyHeaders).toBe(false);
    });
  });
});