/**
 * Centralized domain configuration for P57
 * This module provides all domain-related configuration to avoid hardcoding
 */

export interface DomainConfig {
  landing: string;
  app: string;
  api: string;
  backupDomains: string[];
  allowedOrigins: string[];
  primaryDomain: string;
}

// Get domain configuration from environment or use defaults
export const DOMAINS: DomainConfig = {
  // Primary domains
  landing: process.env.LANDING_DOMAIN || 'https://p57.uz',
  app: process.env.APP_DOMAIN || 'https://app.p57.uz',
  api: process.env.API_DOMAIN || 'https://api.p57.uz',
  
  // Backup domains for failover
  backupDomains: process.env.BACKUP_DOMAINS?.split(',') || [
    'https://protokol.1foiz.com',
    'https://p57.birfoiz.uz',
    'https://srv852801.hstgr.cloud'
  ],
  
  // CORS allowed origins
  allowedOrigins: process.env.CORS_ALLOWED_ORIGINS?.split(',') || [
    'https://p57.uz',
    'https://www.p57.uz',
    'https://app.p57.uz',
    'https://api.p57.uz',
    'https://protokol.1foiz.com',
    'https://p57.birfoiz.uz',
    'https://srv852801.hstgr.cloud',
    'http://localhost:5000',
    'http://localhost:5001',
    'http://localhost:5173'
  ],
  
  // Primary domain for external references
  primaryDomain: process.env.PRIMARY_DOMAIN || 'p57.uz'
};

// Helper functions
export const getDomainConfig = (): DomainConfig => DOMAINS;

export const isAllowedOrigin = (origin: string): boolean => {
  return DOMAINS.allowedOrigins.includes(origin);
};

export const getApiUrl = (path: string = ''): string => {
  return `${DOMAINS.api}${path.startsWith('/') ? path : '/' + path}`;
};

export const getAppUrl = (path: string = ''): string => {
  return `${DOMAINS.app}${path.startsWith('/') ? path : '/' + path}`;
};

export const getLandingUrl = (path: string = ''): string => {
  return `${DOMAINS.landing}${path.startsWith('/') ? path : '/' + path}`;
};

// Get the current domain being used
export const getCurrentDomain = (): string => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return DOMAINS.app;
};

// Check if current domain is a backup domain
export const isBackupDomain = (): boolean => {
  const current = getCurrentDomain();
  return DOMAINS.backupDomains.includes(current);
};

// Get preferred domain based on availability
export const getPreferredDomain = async (): Promise<string> => {
  // Try primary domain first
  try {
    const response = await fetch(`${DOMAINS.app}/health`, { 
      method: 'HEAD',
      mode: 'no-cors'
    });
    return DOMAINS.app;
  } catch (error) {
    // Try backup domains
    for (const backup of DOMAINS.backupDomains) {
      try {
        const response = await fetch(`${backup}/health`, { 
          method: 'HEAD',
          mode: 'no-cors'
        });
        return backup;
      } catch (e) {
        continue;
      }
    }
  }
  
  // Default to primary if all checks fail
  return DOMAINS.app;
};

// Migration helpers
export const shouldShowDomainMigrationNotice = (): boolean => {
  const current = getCurrentDomain();
  // Show notice if using old primary domain
  return current.includes('p57.birfoiz.uz');
};

export const getMigrationMessage = (): string => {
  return `We've moved! Our new address is ${DOMAINS.app}. You'll be redirected automatically.`;
};

// Domain validation for OAuth and security
export const isValidRedirectDomain = (domain: string): boolean => {
  // Remove trailing slash for comparison
  const normalizedDomain = domain.replace(/\/$/, '');
  
  // Check against all allowed domains
  const allDomains = [
    DOMAINS.landing,
    DOMAINS.app,
    DOMAINS.api,
    ...DOMAINS.backupDomains,
    ...DOMAINS.allowedOrigins
  ];
  
  return allDomains.some(allowed => 
    normalizedDomain.toLowerCase() === allowed.toLowerCase().replace(/\/$/, '')
  );
};

// Environment-specific helpers
export const isDevelopment = (): boolean => {
  return process.env.NODE_ENV === 'development';
};

export const isProduction = (): boolean => {
  return process.env.NODE_ENV === 'production';
};

// Get domain for specific services
export const getServiceUrls = () => ({
  auth: `${DOMAINS.api}/auth`,
  payments: `${DOMAINS.api}/payments`,
  protocols: `${DOMAINS.api}/protocols`,
  health: `${DOMAINS.api}/health`,
  support: `${DOMAINS.landing}/support`,
  terms: `${DOMAINS.app}/terms`,
  privacy: `${DOMAINS.app}/privacy`
});

// Email configuration
export const getEmailAddresses = () => ({
  support: `support@${DOMAINS.primaryDomain}`,
  legal: `legal@${DOMAINS.primaryDomain}`,
  info: `info@${DOMAINS.primaryDomain}`,
  admin: `admin@${DOMAINS.primaryDomain}`,
  devops: `devops@${DOMAINS.primaryDomain}`,
  security: `security@${DOMAINS.primaryDomain}`,
  finance: `finance@${DOMAINS.primaryDomain}`,
  cto: `cto@${DOMAINS.primaryDomain}`
});

// Export for use in environment validation
export const requiredDomainEnvVars = [
  'LANDING_DOMAIN',
  'APP_DOMAIN', 
  'API_DOMAIN',
  'PRIMARY_DOMAIN'
];

export const optionalDomainEnvVars = [
  'BACKUP_DOMAINS',
  'CORS_ALLOWED_ORIGINS'
];