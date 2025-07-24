import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger } from '../../utils/logger';

describe('Logger Utility', () => {
  let consoleLogSpy: any;
  let consoleWarnSpy: any;
  let consoleErrorSpy: any;
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    // Spy on console methods
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore original console methods and environment
    vi.restoreAllMocks();
    process.env.NODE_ENV = originalEnv;
  });

  describe('Sensitive Data Sanitization', () => {
    it('should redact password fields', () => {
      logger.info('User login', {
        username: 'testuser',
        password: 'secret123'
      });

      const logCall = consoleLogSpy.mock.calls[0][0];
      expect(logCall).toContain('[REDACTED]');
      expect(logCall).not.toContain('secret123');
    });

    it('should redact email fields', () => {
      logger.info('User created', {
        name: 'Test User',
        email: 'test@example.com',
        userEmail: 'another@example.com'
      });

      const logCall = consoleLogSpy.mock.calls[0][0];
      expect(logCall).toContain('[REDACTED]');
      expect(logCall).not.toContain('test@example.com');
      expect(logCall).not.toContain('another@example.com');
    });

    it('should redact token and key fields', () => {
      logger.info('API call', {
        endpoint: '/api/test',
        token: 'bearer-123456',
        secret: 'api-secret-key',
        key: 'private-key'
      });

      const logCall = consoleLogSpy.mock.calls[0][0];
      expect(logCall).toContain('[REDACTED]');
      expect(logCall).not.toContain('bearer-123456');
      expect(logCall).not.toContain('api-secret-key');
      expect(logCall).not.toContain('private-key');
    });

    it('should redact nested sensitive fields', () => {
      logger.info('Complex object', {
        user: {
          id: 123,
          email: 'nested@example.com',
          profile: {
            phone: '+1234567890'
          }
        }
      });

      const logCall = consoleLogSpy.mock.calls[0][0];
      expect(logCall).toContain('[REDACTED]');
      expect(logCall).not.toContain('nested@example.com');
      expect(logCall).not.toContain('+1234567890');
    });
  });

  describe('Log Levels', () => {
    it('should log info messages', () => {
      logger.info('Test info message', { data: 'test' });
      
      expect(consoleLogSpy).toHaveBeenCalled();
      const logCall = consoleLogSpy.mock.calls[0][0];
      expect(logCall).toContain('[INFO]');
      expect(logCall).toContain('Test info message');
    });

    it('should log warning messages', () => {
      logger.warn('Test warning', { code: 'WARN001' });
      
      expect(consoleWarnSpy).toHaveBeenCalled();
      const logCall = consoleWarnSpy.mock.calls[0][0];
      expect(logCall).toContain('[WARN]');
      expect(logCall).toContain('Test warning');
    });

    it('should log error messages with error objects', () => {
      const error = new Error('Test error');
      logger.error('Operation failed', error, { operation: 'test' });
      
      expect(consoleErrorSpy).toHaveBeenCalled();
      const logCall = consoleErrorSpy.mock.calls[0][0];
      expect(logCall).toContain('[ERROR]');
      expect(logCall).toContain('Operation failed');
      expect(logCall).toContain('Test error');
    });

    it('should not log debug messages in production', () => {
      process.env.NODE_ENV = 'production';
      
      logger.debug('Debug message', { debug: true });
      
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it('should log debug messages in development', () => {
      process.env.NODE_ENV = 'development';
      
      logger.debug('Debug message', { debug: true });
      
      expect(consoleLogSpy).toHaveBeenCalled();
      const logCall = consoleLogSpy.mock.calls[0][0];
      expect(logCall).toContain('[DEBUG]');
    });
  });

  describe('Payment Logging', () => {
    it('should log payment actions with safe details only', () => {
      logger.payment('Payment initiated', {
        transactionId: 'TXN123',
        transaction_id: 'TXN456',
        userId: 'USER789',
        user_id: 'USER012',
        amount: 10000,
        status: 'pending',
        cardNumber: '1234567890123456',
        cvv: '123'
      });

      const logCall = consoleLogSpy.mock.calls[0][0];
      expect(logCall).toContain('[PAYMENT]');
      expect(logCall).toContain('TXN123');
      expect(logCall).toContain('USER789');
      expect(logCall).toContain('10000');
      expect(logCall).toContain('pending');
      expect(logCall).not.toContain('1234567890123456');
      expect(logCall).not.toContain('123');
    });
  });

  describe('Log Formatting', () => {
    it('should include timestamp in logs', () => {
      logger.info('Test message');
      
      const logCall = consoleLogSpy.mock.calls[0][0];
      // Check for ISO date format
      expect(logCall).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/);
    });

    it('should handle null and undefined gracefully', () => {
      logger.info('Test with nullish values', {
        nullValue: null,
        undefinedValue: undefined,
        emptyString: '',
        zero: 0
      });

      expect(consoleLogSpy).toHaveBeenCalled();
      // Should not throw error
    });
  });
});