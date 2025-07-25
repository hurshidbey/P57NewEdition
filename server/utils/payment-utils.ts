import crypto from 'crypto';

/**
 * Generate a secure payment session ID
 */
export function generatePaymentSessionId(): string {
  return `ps_${Date.now()}_${crypto.randomBytes(16).toString('hex')}`;
}

/**
 * Generate a secure merchant transaction ID that doesn't expose user data
 */
export function generateMerchantTransId(): string {
  const timestamp = Date.now().toString(36); // Base36 for shorter IDs
  const random = crypto.randomBytes(6).toString('hex');
  return `P57_${timestamp}_${random}`;
}

/**
 * Generate an idempotency key for preventing duplicate payments
 */
export function generateIdempotencyKey(userId: string, amount: number, timestamp?: number): string {
  const ts = timestamp || Date.now();
  const data = `${userId}_${amount}_${ts}`;
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Calculate payment session expiry (default 30 minutes)
 */
export function calculateSessionExpiry(minutes: number = 30): Date {
  return new Date(Date.now() + minutes * 60 * 1000);
}