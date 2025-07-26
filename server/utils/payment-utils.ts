import crypto from 'crypto';

/**
 * Generate a secure payment session ID
 */
export function generatePaymentSessionId(): string {
  return `ps_${Date.now()}_${crypto.randomBytes(16).toString('hex')}`;
}

/**
 * Generate a secure merchant transaction ID that doesn't expose user data
 * Format: XX000000 where XX is letters and 000000 is numbers
 */
export function generateMerchantTransId(prefix: string = 'PS'): string {
  // Use timestamp modulo to get last 4 digits
  const timestamp = Date.now();
  const timestampPart = (timestamp % 10000).toString().padStart(4, '0');
  
  // Generate 2 random digits
  const randomPart = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  
  // Combine to create 6-digit number
  const numericPart = `${timestampPart}${randomPart}`;
  
  // Ensure prefix is exactly 2 uppercase letters
  const normalizedPrefix = prefix.substring(0, 2).toUpperCase().padEnd(2, 'S');
  
  return `${normalizedPrefix}${numericPart}`;
}

/**
 * Generate a short merchant transaction ID with custom prefix based on payment type
 * @param paymentMethod - Payment method (click, atmos, coupon)
 * @param hasCoupon - Whether the payment includes a coupon
 */
export function generateShortTransId(paymentMethod: string, hasCoupon: boolean = false): string {
  let prefix = 'PS'; // Default: Payment Standard
  
  if (hasCoupon) {
    prefix = 'PC'; // Payment Coupon
  } else if (paymentMethod === 'atmos') {
    prefix = 'PA'; // Payment Atmos
  } else if (paymentMethod === 'click') {
    prefix = 'PK'; // Payment cliCK
  }
  
  return generateMerchantTransId(prefix);
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