#!/usr/bin/env node

/**
 * Environment validation script for development
 * Validates .env files before starting the application
 * Usage: node scripts/validate-env.js [--file .env.production]
 */

const fs = require('fs');
const path = require('path');

// Colors for output
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const NC = '\x1b[0m'; // No Color

// Required environment variables by category
const REQUIRED_VARS = {
  'Core Configuration': [
    { name: 'SESSION_SECRET', minLength: 32, pattern: null },
    { name: 'NODE_ENV', values: ['development', 'production', 'test'] }
  ],
  'Database': [
    { name: 'DATABASE_URL', pattern: /^postgres(ql)?:\/\// }
  ],
  'Supabase': [
    { name: 'SUPABASE_URL', pattern: /^https:\/\/.*\.supabase\.co$/ },
    { name: 'SUPABASE_SERVICE_ROLE_KEY', pattern: /^eyJ[a-zA-Z0-9._-]+$/ },
    { name: 'SUPABASE_ANON_KEY', pattern: /^eyJ[a-zA-Z0-9._-]+$/, optional: true }
  ],
  'Client Variables': [
    { name: 'VITE_SUPABASE_URL', pattern: /^https:\/\/.*\.supabase\.co$/ },
    { name: 'VITE_SUPABASE_ANON_KEY', pattern: /^eyJ[a-zA-Z0-9._-]+$/ }
  ],
  'Payment Gateway': [
    { name: 'ATMOS_STORE_ID', pattern: /^\d+$/ },
    { name: 'ATMOS_CONSUMER_KEY', minLength: 1 },
    { name: 'ATMOS_CONSUMER_SECRET', minLength: 1 },
    { name: 'ATMOS_ENV', values: ['production', 'test'] }
  ]
};

// Optional variables with validation
const OPTIONAL_VARS = {
  'AI Integration': [
    { name: 'OPENAI_API_KEY', pattern: /^sk-[a-zA-Z0-9]{48,}$/ }
  ],
  'Telegram': [
    { name: 'TELEGRAM_BOT_TOKEN', pattern: /^\d+:[a-zA-Z0-9_-]+$/ },
    { name: 'VITE_TELEGRAM_BOT_USERNAME', pattern: /^[a-zA-Z0-9_]+$/ }
  ],
  'Admin Configuration': [
    { name: 'ADMIN_EMAILS', pattern: /^[^,]+(,[^,]+)*$/ },
    { name: 'FALLBACK_ADMIN_EMAIL', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    { name: 'FALLBACK_ADMIN_PASSWORD_HASH', pattern: /^\$2[aby]\$\d{2}\$.{53}$/ }
  ]
};

// Parse command line arguments
const args = process.argv.slice(2);
let envFile = '.env';
let verbose = false;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--file' && args[i + 1]) {
    envFile = args[i + 1];
    i++;
  } else if (args[i] === '--verbose' || args[i] === '-v') {
    verbose = true;
  } else if (args[i] === '--help' || args[i] === '-h') {
    console.log(`
${BLUE}P57 Environment Validator${NC}

Usage:
  node scripts/validate-env.js [options]

Options:
  --file FILE    Path to env file (default: .env)
  --verbose, -v  Show all variables including valid ones
  --help, -h     Show this help message

Examples:
  node scripts/validate-env.js
  node scripts/validate-env.js --file .env.production
  node scripts/validate-env.js --file .env.production --verbose
`);
    process.exit(0);
  }
}

// Load environment file
function loadEnvFile(filePath) {
  const fullPath = path.resolve(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.error(`${RED}✗ Environment file not found: ${fullPath}${NC}`);
    return null;
  }
  
  const content = fs.readFileSync(fullPath, 'utf8');
  const env = {};
  
  content.split('\n').forEach((line, lineNum) => {
    // Skip comments and empty lines
    if (line.trim().startsWith('#') || !line.trim()) return;
    
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      env[key] = value;
    } else if (line.trim()) {
      console.warn(`${YELLOW}⚠ Invalid line ${lineNum + 1}: ${line}${NC}`);
    }
  });
  
  return env;
}

// Validate a single variable
function validateVar(varDef, value) {
  const errors = [];
  
  if (varDef.minLength && value.length < varDef.minLength) {
    errors.push(`must be at least ${varDef.minLength} characters long`);
  }
  
  if (varDef.pattern && !varDef.pattern.test(value)) {
    errors.push(`invalid format`);
  }
  
  if (varDef.values && !varDef.values.includes(value)) {
    errors.push(`must be one of: ${varDef.values.join(', ')}`);
  }
  
  return errors;
}

// Validate paired variables
function validatePairs(env) {
  const errors = [];
  
  // Check fallback admin pairing
  const hasEmail = !!env.FALLBACK_ADMIN_EMAIL;
  const hasHash = !!env.FALLBACK_ADMIN_PASSWORD_HASH;
  
  if (hasEmail !== hasHash) {
    if (hasEmail && !hasHash) {
      errors.push('FALLBACK_ADMIN_EMAIL is set but FALLBACK_ADMIN_PASSWORD_HASH is missing');
    } else {
      errors.push('FALLBACK_ADMIN_PASSWORD_HASH is set but FALLBACK_ADMIN_EMAIL is missing');
    }
  }
  
  // Check VITE variable consistency
  if (env.SUPABASE_URL && env.VITE_SUPABASE_URL) {
    if (env.SUPABASE_URL !== env.VITE_SUPABASE_URL) {
      errors.push('SUPABASE_URL and VITE_SUPABASE_URL should match');
    }
  }
  
  return errors;
}

// Main validation
function validateEnv(env) {
  let hasErrors = false;
  let hasWarnings = false;
  const results = {
    required: { passed: 0, failed: 0, missing: 0 },
    optional: { configured: 0, missing: 0, invalid: 0 }
  };
  
  console.log(`\n${BLUE}════════════════════════════════════════${NC}`);
  console.log(`${BLUE}    P57 Environment Validation Report${NC}`);
  console.log(`${BLUE}════════════════════════════════════════${NC}`);
  console.log(`\nValidating: ${path.resolve(envFile)}`);
  console.log(`Environment: ${env.NODE_ENV || 'not set'}\n`);
  
  // Validate required variables
  console.log(`${BLUE}Required Variables:${NC}`);
  
  for (const [category, vars] of Object.entries(REQUIRED_VARS)) {
    console.log(`\n  ${category}:`);
    
    for (const varDef of vars) {
      const value = env[varDef.name];
      
      if (!value) {
        console.log(`    ${RED}✗ ${varDef.name}${NC} - missing`);
        hasErrors = true;
        results.required.missing++;
      } else {
        const errors = validateVar(varDef, value);
        
        if (errors.length > 0) {
          console.log(`    ${RED}✗ ${varDef.name}${NC} - ${errors.join(', ')}`);
          hasErrors = true;
          results.required.failed++;
        } else {
          if (verbose) {
            const displayValue = varDef.name.includes('SECRET') || varDef.name.includes('KEY') 
              ? value.substring(0, 10) + '...' 
              : value;
            console.log(`    ${GREEN}✓ ${varDef.name}${NC} = ${displayValue}`);
          }
          results.required.passed++;
        }
      }
    }
  }
  
  // Validate optional variables
  console.log(`\n${BLUE}Optional Variables:${NC}`);
  
  for (const [category, vars] of Object.entries(OPTIONAL_VARS)) {
    console.log(`\n  ${category}:`);
    
    for (const varDef of vars) {
      const value = env[varDef.name];
      
      if (!value) {
        if (verbose) {
          console.log(`    ${YELLOW}⊖ ${varDef.name}${NC} - not configured`);
        }
        results.optional.missing++;
      } else {
        const errors = validateVar(varDef, value);
        
        if (errors.length > 0) {
          console.log(`    ${YELLOW}⚠ ${varDef.name}${NC} - ${errors.join(', ')}`);
          hasWarnings = true;
          results.optional.invalid++;
        } else {
          if (verbose) {
            const displayValue = varDef.name.includes('SECRET') || varDef.name.includes('KEY') 
              ? value.substring(0, 10) + '...' 
              : value;
            console.log(`    ${GREEN}✓ ${varDef.name}${NC} = ${displayValue}`);
          }
          results.optional.configured++;
        }
      }
    }
  }
  
  // Validate variable pairs
  const pairErrors = validatePairs(env);
  if (pairErrors.length > 0) {
    console.log(`\n${BLUE}Validation Rules:${NC}`);
    pairErrors.forEach(error => {
      console.log(`  ${RED}✗ ${error}${NC}`);
      hasErrors = true;
    });
  }
  
  // Summary
  console.log(`\n${BLUE}Summary:${NC}`);
  console.log(`  Required: ${GREEN}${results.required.passed} passed${NC}, ${RED}${results.required.failed} failed${NC}, ${RED}${results.required.missing} missing${NC}`);
  console.log(`  Optional: ${GREEN}${results.optional.configured} configured${NC}, ${YELLOW}${results.optional.invalid} invalid${NC}, ${results.optional.missing} not set`);
  
  // Recommendations
  if (results.optional.missing > 0 || hasWarnings) {
    console.log(`\n${YELLOW}Recommendations:${NC}`);
    
    if (!env.OPENAI_API_KEY) {
      console.log(`  - Configure OPENAI_API_KEY to enable AI evaluation features`);
    }
    if (!env.ADMIN_EMAILS) {
      console.log(`  - Configure ADMIN_EMAILS for admin access control`);
    }
    if (!env.TELEGRAM_BOT_TOKEN && env.VITE_TELEGRAM_BOT_USERNAME) {
      console.log(`  - Configure TELEGRAM_BOT_TOKEN to enable bot features`);
    }
  }
  
  // Final status
  console.log('');
  if (hasErrors) {
    console.log(`${RED}✗ Validation FAILED${NC} - Please fix the errors above before starting the application.`);
    return false;
  } else if (hasWarnings) {
    console.log(`${YELLOW}⚠ Validation passed with warnings${NC} - The application can start but some features may be limited.`);
    return true;
  } else {
    console.log(`${GREEN}✓ Validation PASSED${NC} - All required variables are correctly configured.`);
    return true;
  }
}

// Main execution
const env = loadEnvFile(envFile);

if (!env) {
  process.exit(1);
}

const isValid = validateEnv(env);

// Create a validation report file if requested
if (args.includes('--report')) {
  const report = {
    timestamp: new Date().toISOString(),
    file: path.resolve(envFile),
    valid: isValid,
    environment: env.NODE_ENV || 'not set',
    variableCount: Object.keys(env).length
  };
  
  fs.writeFileSync('env-validation-report.json', JSON.stringify(report, null, 2));
  console.log(`\nReport saved to: env-validation-report.json`);
}

process.exit(isValid ? 0 : 1);