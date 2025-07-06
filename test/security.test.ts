import { describe, it, expect, beforeAll } from 'vitest';
import { securityConfig } from '../server/utils/security-config';

describe('Security Configuration Tests', () => {
  describe('Password Hashing', () => {
    it('should hash passwords securely with bcrypt', async () => {
      const password = 'testPassword123!';
      const hash = await securityConfig.hashPassword(password);
      
      // Check that hash is not the same as password
      expect(hash).not.toBe(password);
      
      // Check that hash has bcrypt format ($2b$...)
      expect(hash).toMatch(/^\$2[ayb]\$.{56}$/);
    });

    it('should verify correct passwords', async () => {
      const password = 'testPassword123!';
      const hash = await securityConfig.hashPassword(password);
      
      const isValid = await securityConfig.comparePassword(password, hash);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect passwords', async () => {
      const password = 'testPassword123!';
      const wrongPassword = 'wrongPassword456!';
      const hash = await securityConfig.hashPassword(password);
      
      const isValid = await securityConfig.comparePassword(wrongPassword, hash);
      expect(isValid).toBe(false);
    });
  });

  describe('Token Generation', () => {
    it('should generate secure random tokens', () => {
      const token1 = securityConfig.generateSecureToken();
      const token2 = securityConfig.generateSecureToken();
      
      // Tokens should be unique
      expect(token1).not.toBe(token2);
      
      // Default length should be 64 characters (32 bytes hex)
      expect(token1).toHaveLength(64);
      
      // Should be hexadecimal
      expect(token1).toMatch(/^[a-f0-9]+$/);
    });

    it('should generate CSRF tokens', () => {
      const token = securityConfig.generateCSRFToken();
      
      // Should be base64 encoded
      expect(token).toMatch(/^[A-Za-z0-9+/=]+$/);
      
      // Should be 44 characters (32 bytes base64)
      expect(token).toHaveLength(44);
    });
  });

  describe('Error Sanitization', () => {
    it('should remove sensitive database URLs', () => {
      const error = new Error('Connection failed: postgresql://user:password@db.supabase.co:5432/postgres');
      const sanitized = securityConfig.sanitizeError(error);
      
      expect(sanitized.message).not.toContain('user:password');
      expect(sanitized.message).toContain('postgresql://***');
    });

    it('should remove API keys from errors', () => {
      const error = new Error('Invalid API key: sk-proj-1234567890abcdef');
      const sanitized = securityConfig.sanitizeError(error);
      
      expect(sanitized.message).not.toContain('sk-proj-1234567890abcdef');
      expect(sanitized.message).toContain('sk-***');
    });

    it('should remove JWT tokens from errors', () => {
      const error = new Error('Invalid token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.payload.signature');
      const sanitized = securityConfig.sanitizeError(error);
      
      expect(sanitized.message).not.toContain('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
      expect(sanitized.message).toContain('eyJ***');
    });
  });

  describe('Environment Validation', () => {
    beforeAll(() => {
      // Set up minimal test environment
      process.env.SESSION_SECRET = 'test-secret-that-is-long-enough-32-chars';
      process.env.SUPABASE_URL = 'https://test.supabase.co';
      process.env.SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';
      process.env.DATABASE_URL = 'postgresql://test';
      process.env.OPENAI_API_KEY = 'sk-test123';
      process.env.ATMOS_STORE_ID = '1234';
      process.env.ATMOS_CONSUMER_KEY = 'test-key';
      process.env.ATMOS_CONSUMER_SECRET = 'test-secret';
    });

    it('should validate required environment variables', () => {
      const { valid, errors } = securityConfig.validateEnvironment();
      
      expect(valid).toBe(true);
      expect(errors).toHaveLength(0);
    });

    it('should detect missing environment variables', () => {
      const originalKey = process.env.OPENAI_API_KEY;
      delete process.env.OPENAI_API_KEY;
      
      const { valid, errors } = securityConfig.validateEnvironment();
      
      expect(valid).toBe(false);
      expect(errors).toContain('Missing required environment variable: OPENAI_API_KEY');
      
      // Restore for other tests
      process.env.OPENAI_API_KEY = originalKey;
    });

    it('should validate SESSION_SECRET length', () => {
      const originalSecret = process.env.SESSION_SECRET;
      process.env.SESSION_SECRET = 'too-short';
      
      const { valid, errors } = securityConfig.validateEnvironment();
      
      expect(valid).toBe(false);
      expect(errors).toContain('SESSION_SECRET must be at least 32 characters long');
      
      // Restore
      process.env.SESSION_SECRET = originalSecret;
    });
  });
});

describe('Security Headers', () => {
  it('should have CSP headers configured', async () => {
    const { securityHeaders } = await import('../server/middleware/security');
    expect(securityHeaders).toBeDefined();
  });

  it('should have CORS properly configured', async () => {
    const { corsOptions } = await import('../server/middleware/security');
    expect(corsOptions.credentials).toBe(true);
    expect(corsOptions.maxAge).toBe(86400);
  });
});

describe('Rate Limiting', () => {
  it('should have different rate limits for different endpoints', async () => {
    const rateLimits = await import('../server/middleware/rate-limit');
    
    expect(rateLimits.authLimiter).toBeDefined();
    expect(rateLimits.paymentLimiter).toBeDefined();
    expect(rateLimits.evaluationLimiter).toBeDefined();
    expect(rateLimits.adminLimiter).toBeDefined();
  });
});

describe('Input Validation', () => {
  it('should have validation rules defined', async () => {
    const { validationRules } = await import('../server/middleware/validation');
    
    expect(validationRules.authLogin).toBeDefined();
    expect(validationRules.paymentCard).toBeDefined();
    expect(validationRules.paymentOtp).toBeDefined();
  });

  it('should sanitize HTML from strings', async () => {
    const { sanitizeString } = await import('../server/middleware/validation');
    
    const maliciousInput = '<script>alert("XSS")</script>Hello';
    const sanitized = sanitizeString(maliciousInput);
    
    expect(sanitized).toBe('Hello');
    expect(sanitized).not.toContain('<script>');
  });
});