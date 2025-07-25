import { z } from 'zod';

/**
 * Validates a credit card number using the Luhn algorithm
 * @param cardNumber - The card number to validate (digits only)
 * @returns true if valid, false otherwise
 */
export function isValidCardNumber(cardNumber: string): boolean {
  // Remove all non-digit characters
  const digits = cardNumber.replace(/\D/g, '');
  
  // Check if it's a valid length (typically 13-19 digits)
  if (digits.length < 13 || digits.length > 19) {
    return false;
  }
  
  // Luhn algorithm implementation
  let sum = 0;
  let isEven = false;
  
  // Loop through values starting from the rightmost digit
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits.charAt(i), 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
}

/**
 * Sanitizes and validates a merchant transaction ID
 * @param transId - The transaction ID to validate
 * @returns sanitized transaction ID
 */
export function sanitizeMerchantTransId(transId: string): string {
  // Only allow alphanumeric, dash, and underscore
  return transId.replace(/[^a-zA-Z0-9\-_]/g, '');
}

/**
 * Validates a payment amount
 * @param amount - The amount to validate
 * @param minAmount - Minimum allowed amount (default: 1000 UZS)
 * @param maxAmount - Maximum allowed amount (default: 100M UZS)
 * @returns true if valid, false otherwise
 */
export function isValidPaymentAmount(amount: number, minAmount: number = 1000, maxAmount: number = 100000000): boolean {
  return amount >= minAmount && amount <= maxAmount && Number.isInteger(amount);
}

// Zod schemas for payment validation
export const PaymentParamsSchema = z.object({
  amount: z.number()
    .int()
    .min(1000, 'Amount must be at least 1000 UZS')
    .max(100000000, 'Amount cannot exceed 100,000,000 UZS'),
  merchantTransId: z.string()
    .min(1)
    .max(64)
    .regex(/^[a-zA-Z0-9\-_]+$/, 'Invalid transaction ID format'),
  userId: z.string().uuid('Invalid user ID format'),
  couponCode: z.string().optional()
});

export const CardDetailsSchema = z.object({
  cardNumber: z.string()
    .regex(/^\d{16}$/, 'Card number must be 16 digits')
    .refine(isValidCardNumber, 'Invalid card number'),
  expiry: z.string()
    .regex(/^\d{4}$/, 'Expiry must be in MMYY format')
    .refine((val) => {
      const month = parseInt(val.substring(0, 2));
      return month >= 1 && month <= 12;
    }, 'Invalid expiry month')
});

export const OTPSchema = z.object({
  otpCode: z.string()
    .regex(/^\d{6}$/, 'OTP must be 6 digits'),
  transactionId: z.union([z.string(), z.number()])
});

/**
 * Generate a cryptographically secure transaction ID
 */
export function generateSecureTransactionId(): string {
  const timestamp = Date.now();
  const randomBytes = require('crypto').randomBytes(16).toString('hex');
  return `P57_${timestamp}_${randomBytes}`;
}

/**
 * Validates coupon code format (alphanumeric and underscores only)
 */
export function sanitizeCouponCode(code: string): string {
  return code.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '');
}