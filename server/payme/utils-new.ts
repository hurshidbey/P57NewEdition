// server/payme/utils-new.ts

/**
 * Generate a Payme checkout URL for redirecting users
 * @param merchantId Merchant ID from Payme
 * @param orderId The ID of the order to be paid
 * @param amount Amount in tiyins (smallest currency unit)
 * @param isTest Whether to use test environment
 * @returns Checkout URL for Payme
 */
export function generatePaymeUrl(merchantId: string, orderId: string, amount: number, isTest: boolean = false): string {
  // Create the Payme parameter string
  const paymeString = Buffer.from(
    `m=${merchantId};ac.order_id=${orderId};a=${amount}`,
  ).toString('base64');
  
  // Determine which Payme environment to use
  const baseUrl = isTest ? 'https://checkout.test.paycom.uz/' : 'https://checkout.paycom.uz/';
  
  // Return the full URL
  return `${baseUrl}${paymeString}`;
}

/**
 * Format timestamp for Payme API (Unix timestamp in seconds)
 * @param date Date object or undefined
 * @returns Unix timestamp in seconds or undefined
 */
export function formatTimestamp(date?: Date | null): number | undefined {
  if (!date) return undefined;
  return Math.floor(date.getTime() / 1000);
}

/**
 * Generate a unique order ID for Payme transactions
 * @param prefix Optional prefix for the order ID
 * @returns Unique order ID
 */
export function generateOrderId(prefix: string = 'ORDER'): string {
  const timestamp = Date.now();
  const randomPart = Math.random().toString(36).substring(2, 10);
  return `${prefix}-${timestamp}-${randomPart}`;
}