// server/payme/transaction-cache.ts
/**
 * Simple caching mechanism for Payme transaction responses
 * Ensures that repeated API calls return the exact same response
 */

// Cache for PerformTransaction responses
const performResponseCache: Record<string, any> = {};

// Store a PerformTransaction response
export function storePerformResponse(transactionId: string, response: any): void {
  performResponseCache[transactionId] = {...response};
  console.log(`Stored PerformTransaction response for ${transactionId}`);
}

// Get a cached PerformTransaction response
export function getCachedPerformResponse(transactionId: string): any | null {
  return performResponseCache[transactionId] || null;
}

// Check if a PerformTransaction response exists
export function hasPerformResponse(transactionId: string): boolean {
  return !!performResponseCache[transactionId];
}