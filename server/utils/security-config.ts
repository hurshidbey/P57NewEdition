import bcrypt from 'bcrypt';
import crypto from 'crypto';

// Password hashing configuration
const SALT_ROUNDS = 12;

export const securityConfig = {
  // Hash a password
  hashPassword: async (password: string): Promise<string> => {
    return bcrypt.hash(password, SALT_ROUNDS);
  },

  // Compare password with hash
  comparePassword: async (password: string, hash: string): Promise<boolean> => {
    return bcrypt.compare(password, hash);
  },

  // Generate secure random token
  generateSecureToken: (length: number = 32): string => {
    return crypto.randomBytes(length).toString('hex');
  },

  // Generate CSRF token
  generateCSRFToken: (): string => {
    return crypto.randomBytes(32).toString('base64');
  },

  // Validate environment configuration
  validateEnvironment: (): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    // Check required environment variables
    const requiredVars = [
      'SESSION_SECRET',
      'SUPABASE_URL',
      'SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      'DATABASE_URL',
      'OPENAI_API_KEY',
      'ATMOS_STORE_ID',
      'ATMOS_CONSUMER_KEY',
      'ATMOS_CONSUMER_SECRET'
    ];
    
    requiredVars.forEach(varName => {
      if (!process.env[varName]) {
        errors.push(`Missing required environment variable: ${varName}`);
      }
    });
    
    // Validate SESSION_SECRET length
    if (process.env.SESSION_SECRET && process.env.SESSION_SECRET.length < 32) {
      errors.push('SESSION_SECRET must be at least 32 characters long');
    }
    
    // Validate Supabase keys format
    if (process.env.SUPABASE_ANON_KEY && !process.env.SUPABASE_ANON_KEY.startsWith('eyJ')) {
      errors.push('SUPABASE_ANON_KEY appears to be invalid (should be a JWT token)');
    }
    
    if (process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_SERVICE_ROLE_KEY.startsWith('eyJ')) {
      errors.push('SUPABASE_SERVICE_ROLE_KEY appears to be invalid (should be a JWT token)');
    }
    
    // Validate OpenAI API key format
    if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.startsWith('sk-')) {
      errors.push('OPENAI_API_KEY appears to be invalid (should start with sk-)');
    }
    
    // Validate fallback admin configuration
    if (process.env.FALLBACK_ADMIN_EMAIL && !process.env.FALLBACK_ADMIN_PASSWORD_HASH) {
      errors.push('FALLBACK_ADMIN_EMAIL is set but FALLBACK_ADMIN_PASSWORD_HASH is missing');
    }
    
    if (process.env.FALLBACK_ADMIN_PASSWORD_HASH) {
      // Validate bcrypt hash format ($2a$, $2b$, or $2y$ followed by cost factor)
      if (!process.env.FALLBACK_ADMIN_PASSWORD_HASH.match(/^\$2[aby]\$\d{2}\$/)) {
        errors.push('FALLBACK_ADMIN_PASSWORD_HASH appears to be invalid (not a valid bcrypt hash)');
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  },

  // Sanitize error messages for client
  sanitizeError: (error: any): { message: string; code?: string } => {
    // Never expose internal error details to client
    const message = error.message || 'An error occurred';
    
    // Remove sensitive information from error messages
    const sanitized = message
      .replace(/postgresql:\/\/[^@]+@[^/]+/gi, 'postgresql://***')
      .replace(/sk-[a-zA-Z0-9]+/gi, 'sk-***')
      .replace(/eyJ[a-zA-Z0-9._-]+/gi, 'eyJ***');
    
    return {
      message: sanitized,
      code: error.code
    };
  }
};

// Initialize security checks on startup
export const initializeSecurity = () => {
  const { valid, errors } = securityConfig.validateEnvironment();
  
  if (!valid) {
    console.error('🚨 Security Configuration Errors:');
    errors.forEach(error => console.error(`  - ${error}`));
    
    if (process.env.NODE_ENV === 'production') {
      console.error('⚠️  CRITICAL: Running in production with security issues!');
    }
  } else {
    console.log('✅ Security configuration validated successfully');
  }
  
  // Log security status
  console.log('🔒 Security Status:');
  console.log(`  - Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`  - Session Secret: ${process.env.SESSION_SECRET ? 'Configured' : 'NOT SET'}`);
  console.log(`  - Fallback Admin: ${process.env.FALLBACK_ADMIN_EMAIL ? 'Configured' : 'Not configured'}`);
  console.log(`  - HTTPS Only Cookies: ${process.env.NODE_ENV === 'production' ? 'Enabled' : 'Disabled'}`);
  console.log(`  - Rate Limiting: Enabled`);
  console.log(`  - CORS: ${process.env.NODE_ENV === 'production' ? 'Production origins only' : 'Development mode'}`);
};