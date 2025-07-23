import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import * as fs from 'fs';
import * as path from 'path';

// Custom validators
const urlValidator = z.string().url().refine(
  (url) => url.startsWith('http://') || url.startsWith('https://'),
  { message: 'URL must start with http:// or https://' }
);

const jwtValidator = z.string().refine(
  (token) => token.startsWith('eyJ'),
  { message: 'Must be a valid JWT token' }
);

const bcryptHashValidator = z.string().refine(
  (hash) => /^\$2[aby]\$\d{2}\$.{53}$/.test(hash),
  { message: 'Must be a valid bcrypt hash' }
);

// Environment schema with detailed validation
const envSchema = z.object({
  // Core Configuration
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().regex(/^\d+$/, 'Must be a valid port number').default('5000'),
  
  // Session Configuration
  SESSION_SECRET: z.string().min(32, 'Must be at least 32 characters long'),
  
  // Database Configuration
  DATABASE_URL: z.string().refine(
    (url) => url.startsWith('postgresql://') || url.startsWith('postgres://'),
    { message: 'Must be a valid PostgreSQL connection string' }
  ),
  
  // Supabase Configuration
  SUPABASE_URL: urlValidator.refine(
    (url) => url.includes('.supabase.co'),
    { message: 'Must be a valid Supabase URL' }
  ),
  SUPABASE_SERVICE_ROLE_KEY: jwtValidator,
  SUPABASE_ANON_KEY: jwtValidator.optional(),
  
  // Client-side Variables (VITE_*)
  VITE_SUPABASE_URL: urlValidator.refine(
    (url) => url.includes('.supabase.co'),
    { message: 'Must be a valid Supabase URL' }
  ),
  VITE_SUPABASE_ANON_KEY: jwtValidator,
  VITE_TELEGRAM_BOT_USERNAME: z.string().optional(),
  
  // Payment Gateway (ATMOS)
  ATMOS_STORE_ID: z.string().min(1, 'Store ID is required'),
  ATMOS_CONSUMER_KEY: z.string().min(1, 'Consumer key is required'),
  ATMOS_CONSUMER_SECRET: z.string().min(1, 'Consumer secret is required'),
  ATMOS_ENV: z.enum(['production', 'test']).default('production'),
  
  // External Services (Optional but validated if present)
  OPENAI_API_KEY: z.string().optional(),
  
  TELEGRAM_BOT_TOKEN: z.string()
    .regex(/^\d+:[a-zA-Z0-9_-]+$/, 'Invalid Telegram bot token format')
    .optional(),
  
  MAILTRAP_API_TOKEN: z.string().optional(),
  MAILTRAP_SMTP_HOST: z.string().optional(),
  MAILTRAP_SMTP_PORT: z.string().regex(/^\d+$/).optional(),
  MAILTRAP_SMTP_USERNAME: z.string().optional(),
  MAILTRAP_SMTP_PASSWORD: z.string().optional(),
  
  // Admin Configuration
  ADMIN_EMAILS: z.string()
    .transform((val) => val.split(',').map(email => email.trim()))
    .refine(
      (emails) => emails.every(email => z.string().email().safeParse(email).success),
      { message: 'All admin emails must be valid email addresses' }
    )
    .transform((emails) => emails.join(','))
    .optional(),
  
  // Fallback Admin (Optional but both required if one is set)
  FALLBACK_ADMIN_EMAIL: z.string().email().optional(),
  FALLBACK_ADMIN_PASSWORD_HASH: bcryptHashValidator.optional(),
}).refine(
  (data) => {
    // If one fallback admin field is set, both must be set
    const hasEmail = Boolean(data.FALLBACK_ADMIN_EMAIL);
    const hasHash = Boolean(data.FALLBACK_ADMIN_PASSWORD_HASH);
    return hasEmail === hasHash;
  },
  {
    message: 'Both FALLBACK_ADMIN_EMAIL and FALLBACK_ADMIN_PASSWORD_HASH must be set together',
    path: ['FALLBACK_ADMIN_EMAIL']
  }
);

// Type for validated environment
export type ValidatedEnv = z.infer<typeof envSchema>;

// Validation result type
export interface ValidationResult {
  valid: boolean;
  env?: ValidatedEnv;
  errors?: Array<{
    path: string;
    message: string;
  }>;
  warnings?: string[];
}

// Main validation function
export function validateEnv(): ValidationResult {
  const startTime = Date.now();
  const warnings: string[] = [];
  
  try {
    // Parse and validate
    const env = envSchema.parse(process.env);
    
    // Check for optional features that might be expected
    if (!env.OPENAI_API_KEY) {
      warnings.push('OPENAI_API_KEY not configured - AI evaluation features will be disabled');
    }
    
    if (!env.ADMIN_EMAILS) {
      warnings.push('ADMIN_EMAILS not configured - using fallback admin authentication only');
    }
    
    if (!env.TELEGRAM_BOT_TOKEN && env.VITE_TELEGRAM_BOT_USERNAME) {
      warnings.push('Telegram bot username configured but no bot token - bot features disabled');
    }
    
    const duration = Date.now() - startTime;
    console.log(`✅ Environment validation completed in ${duration}ms`);
    
    return {
      valid: true,
      env,
      warnings: warnings.length > 0 ? warnings : undefined
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationError = fromZodError(error, {
        prefix: '❌ Environment validation failed',
        prefixSeparator: '\n\n',
        issueSeparator: '\n',
      });
      
      // Extract clean error messages
      const errors = error.issues.map(issue => ({
        path: issue.path.join('.'),
        message: issue.message
      }));
      
      console.error(validationError.toString());
      
      return {
        valid: false,
        errors
      };
    }
    
    // Unexpected error
    console.error('❌ Unexpected error during validation:', error);
    return {
      valid: false,
      errors: [{
        path: 'unknown',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      }]
    };
  }
}

// Helper to check if running in production
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

// Helper to get required services based on environment
export function getRequiredServices(): string[] {
  const services = [
    'DATABASE_URL',
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'SESSION_SECRET'
  ];
  
  if (isProduction()) {
    services.push(
      'ATMOS_STORE_ID',
      'ATMOS_CONSUMER_KEY',
      'ATMOS_CONSUMER_SECRET'
    );
  }
  
  return services;
}

// Load and validate .env file (for development)
export function loadEnvFile(envPath?: string): void {
  const defaultPath = path.resolve(process.cwd(), '.env');
  const filePath = envPath || defaultPath;
  
  if (fs.existsSync(filePath)) {
    const envContent = fs.readFileSync(filePath, 'utf8');
    const lines = envContent.split('\n');
    
    lines.forEach(line => {
      // Skip comments and empty lines
      if (line.trim().startsWith('#') || !line.trim()) return;
      
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        // Only set if not already set (don't override existing env vars)
        if (!process.env[key.trim()]) {
          process.env[key.trim()] = value;
        }
      }
    });
    
    console.log(`📁 Loaded environment from: ${filePath}`);
  } else {
    console.warn(`⚠️  Environment file not found: ${filePath}`);
  }
}

// Export validated environment (throws if invalid)
export function getValidatedEnv(): ValidatedEnv {
  const result = validateEnv();
  
  if (!result.valid) {
    throw new Error('Environment validation failed. Please check the logs above.');
  }
  
  // Log warnings
  if (result.warnings && result.warnings.length > 0) {
    console.log('\n⚠️  Environment Warnings:');
    result.warnings.forEach(warning => {
      console.log(`  - ${warning}`);
    });
    console.log('');
  }
  
  return result.env!;
}

// Initialize environment validation
export function initializeEnvValidation(options?: {
  exitOnError?: boolean;
  loadEnvFile?: boolean;
  envFilePath?: string;
}): ValidationResult {
  const { 
    exitOnError = true, 
    loadEnvFile = process.env.NODE_ENV !== 'production',
    envFilePath 
  } = options || {};
  
  // Load .env file in development
  if (loadEnvFile && envFilePath) {
    try {
      require('dotenv').config({ path: envFilePath });
    } catch (error) {
      console.warn('Failed to load env file:', error);
    }
  }
  
  // Validate environment
  const result = validateEnv();
  
  if (!result.valid && exitOnError) {
    console.error('\n❌ Cannot start application with invalid environment configuration.');
    console.error('Please fix the errors above and try again.\n');
    process.exit(1);
  }
  
  return result;
}

// Export for use in other modules
export { envSchema };