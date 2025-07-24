/**
 * Simple logger utility to replace console.log statements
 * Ensures no sensitive data is logged in production
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: any;
}

class Logger {
  private get isDevelopment() {
    return process.env.NODE_ENV !== 'production';
  }

  private sanitize(data: any): any {
    if (!data) return data;
    
    // List of sensitive field names to redact
    const sensitiveFields = [
      'password', 'token', 'secret', 'key', 'authorization',
      'card_number', 'cvv', 'pin', 'otp', 'session',
      'email', 'phone', 'phoneNumber', 'userEmail'
    ];

    if (typeof data === 'string') {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map(item => this.sanitize(item));
    }

    if (typeof data === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(data)) {
        const lowerKey = key.toLowerCase();
        if (sensitiveFields.some(field => lowerKey.includes(field))) {
          sanitized[key] = '[REDACTED]';
        } else if (typeof value === 'object') {
          sanitized[key] = this.sanitize(value);
        } else {
          sanitized[key] = value;
        }
      }
      return sanitized;
    }

    return data;
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(this.sanitize(context))}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  debug(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      console.log(this.formatMessage('debug', message, context));
    }
  }

  info(message: string, context?: LogContext) {
    console.log(this.formatMessage('info', message, context));
  }

  warn(message: string, context?: LogContext) {
    console.warn(this.formatMessage('warn', message, context));
  }

  error(message: string, error?: Error | any, context?: LogContext) {
    const errorContext = {
      ...context,
      error: error instanceof Error ? {
        message: error.message,
        stack: this.isDevelopment ? error.stack : undefined
      } : error
    };
    console.error(this.formatMessage('error', message, errorContext));
  }

  // Special method for payment logging - extra careful with sensitive data
  payment(action: string, details: any) {
    const safeDetails = {
      transactionId: details.transactionId || details.transaction_id,
      userId: details.userId || details.user_id,
      amount: details.amount,
      status: details.status,
      // Never log full card numbers, tokens, etc.
    };
    this.info(`[PAYMENT] ${action}`, safeDetails);
  }
}

export const logger = new Logger();