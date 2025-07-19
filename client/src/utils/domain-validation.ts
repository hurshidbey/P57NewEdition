// Domain validation utility for cross-domain OAuth
// This ensures only trusted domains can be used for authentication redirects

const ALLOWED_DOMAINS = [
  'https://p57.birfoiz.uz',
  'https://protokol.1foiz.com',
  'https://srv852801.hstgr.cloud',
  'http://localhost:5000',
  'http://localhost:5001',
  'http://localhost:5173'
];

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
    normalizedDomain.toLowerCase() === allowed.toLowerCase()
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
  
  if (isAllowedDomain(currentOrigin)) {
    localStorage.setItem('auth_origin_domain', currentOrigin);
    return true;
  }
  
  console.warn('[Domain Validation] Current domain not allowed:', currentOrigin);
  return false;
}