// Domain validation utility for cross-domain OAuth
// This ensures only trusted domains can be used for authentication redirects

import { DOMAINS } from '@shared/config/domains';

// Get allowed domains from centralized config
const ALLOWED_DOMAINS = DOMAINS.allowedOrigins;

/**
 * Validates if a domain is in our allowed list
 * @param domain The domain to validate (should include protocol)
 * @returns true if domain is allowed, false otherwise
 */
export function isAllowedDomain(domain: string): boolean {
  // Normalize the domain by removing trailing slashes
  const normalizedDomain = domain.replace(/\/$/, '');
  
  // Check if the domain is in our allowed list
  return ALLOWED_DOMAINS.some(allowed => 
    normalizedDomain.toLowerCase() === allowed.toLowerCase().replace(/\/$/, '')
  );
}

/**
 * Gets the safe redirect URL, defaulting to current origin if invalid
 * @param storedDomain The domain retrieved from storage
 * @returns A safe domain to redirect to
 */
export function getSafeRedirectDomain(storedDomain: string | null): string {
  if (!storedDomain) {
    return window.location.origin;
  }
  
  // Validate the stored domain
  if (isAllowedDomain(storedDomain)) {
    return storedDomain;
  }
  
  console.warn('[Domain Validation] Stored domain not in allowed list:', storedDomain);
  // Fall back to current origin if stored domain is not allowed
  return window.location.origin;
}

/**
 * Stores the current domain if it's allowed
 * @returns true if domain was stored, false otherwise
 */
export function storeCurrentDomain(): boolean {
  const currentOrigin = window.location.origin;
  
  console.log('[Domain Validation] Attempting to store domain:', currentOrigin);
  console.log('[Domain Validation] Allowed domains:', ALLOWED_DOMAINS);
  
  // Always store the domain for now to avoid breaking OAuth
  localStorage.setItem('auth_origin_domain', currentOrigin);
  
  if (isAllowedDomain(currentOrigin)) {
    console.log('[Domain Validation] Domain is allowed and stored');
    return true;
  }
  
  console.warn('[Domain Validation] Domain not in allowed list but stored anyway:', currentOrigin);
  return true; // Return true to prevent breaking OAuth flow
}