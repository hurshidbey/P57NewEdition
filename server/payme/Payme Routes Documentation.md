# Payme Routes Documentation - PROTOCOL57

## Overview
This document details the Payme payment routes implementation in the main routes.ts file and their integration with the payment system.

## Route Registration

### Import Statements
```typescript
import { setupPaymeRoutes } from "./payme/routes-new";
import { setupPaymeWebhookRoutes } from "./payme/webhook-routes";
import { paymentRouter } from './payment-routes';
```

### Route Setup (lines 44-51)
```typescript
export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);
  
  // Set up Payme routes
  app.use(setupPaymeRoutes());
  
  // Set up Payme webhook endpoint
  app.use(setupPaymeWebhookRoutes());
  
  // Set up payment order routes
  app.use('/api/payment', paymentRouter);
  
  // ... rest of routes
}
```

## Payment Endpoints

### 1. Payment Success Redirect
**Endpoint:** `GET /payment/success`
**Purpose:** Landing page for users returning from Payme checkout

```typescript
app.get("/payment/success", async (req, res) => {
  // This is where users land after successful payment
  // You can add order verification logic here if needed
  res.redirect("/?payment=success");
});
```

**Usage:**
- Users are redirected here after completing payment on Payme
- Redirects to frontend with success parameter
- Can be extended with order verification logic

### 2. Create Payment Order
**Endpoint:** `POST /api/payment/create-order`
**Authentication:** Required (`isAuthenticated` middleware)
**Purpose:** Creates order and generates Payme checkout URL

```typescript
app.post("/api/payment/create-order", isAuthenticated, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Generate unique order ID with timestamp
    const orderId = `ORDER-${Date.now()}-${req.user.id}`;
    
    // Fixed amount for platform access (149,000 UZS = 14,900,000 tiyins)
    const amount = 14900000;
    
    // Create order in database
    const order = await storage.createOrder({
      order_id: orderId,
      user_id: req.user.id,
      amount: amount,
      status: 'pending'
    });
    
    if (!order) {
      return res.status(500).json({ message: "Failed to create order" });
    }
    
    const merchantId = process.env.PAYME_MERCHANT_ID;
    
    if (!merchantId) {
      return res.status(500).json({ message: "Payment system configuration error" });
    }
    
    // Create payment URL using the exact format Payme expects
    const paymeParams = `m=${merchantId};a=${amount};o=${orderId}`;
    const encodedParams = Buffer.from(paymeParams).toString('base64');
    
    // Production checkout URL
    const paymeUrl = `https://checkout.paycom.uz/${encodedParams}`;
    
    console.log('=== PAYME URL GENERATION DEBUG ===');
    console.log('Payme Merchant ID:', merchantId);
    console.log('Order ID:', orderId);
    console.log('Amount:', amount);
    console.log('Generated Payme URL params:', paymeParams);
    console.log('Encoded params:', encodedParams);
    console.log('Final Payme URL:', paymeUrl);
    console.log('=== END DEBUG ===');
    
    console.log(`Created new order: ${orderId} for user ${req.user.id} with amount ${amount}`);
    
    res.json({
      success: true,
      orderId: orderId,
      amount: amount,
      paymentUrl: paymeUrl,
      message: "Order created successfully"
    });
    
  } catch (error) {
    console.error("Error creating payment order:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to create payment order" 
    });
  }
});
```

## Order Creation Process

### 1. Authentication Check
- Validates user session using `isAuthenticated` middleware
- Ensures `req.user` and `req.user.id` exist

### 2. Order ID Generation
```typescript
const orderId = `ORDER-${Date.now()}-${req.user.id}`;
```
**Format:** `ORDER-{timestamp}-{userId}`
**Example:** `ORDER-1748546527701-123`

### 3. Amount Configuration
```typescript
const amount = 14900000; // 149,000 UZS in tiyins
```
- Fixed amount for platform access
- Amount in tiyins (smallest currency unit)
- 1 UZS = 100 tiyins

### 4. Database Order Creation
```typescript
const order = await storage.createOrder({
  order_id: orderId,
  user_id: req.user.id,
  amount: amount,
  status: 'pending'
});
```

### 5. Payme URL Generation
```typescript
const paymeParams = `m=${merchantId};a=${amount};o=${orderId}`;
const encodedParams = Buffer.from(paymeParams).toString('base64');
const paymeUrl = `https://checkout.paycom.uz/${encodedParams}`;
```

**Parameter Format:**
- `m` = Merchant ID
- `a` = Amount in tiyins
- `o` = Order ID
- Parameters are Base64 encoded

## Response Formats

### Success Response
```json
{
  "success": true,
  "orderId": "ORDER-1748546527701-123",
  "amount": 14900000,
  "paymentUrl": "https://checkout.paycom.uz/bT02ODJjMDA1MjUzYTJlMzA5Y2YwNDhkNzA7YT0xNDkwMDAwMDtvPU9SREVSLTE3NDg1NDY1Mjc3MDEtMTIz",
  "message": "Order created successfully"
}
```

### Error Responses

**Authentication Error:**
```json
{
  "message": "User not authenticated"
}
```

**Order Creation Error:**
```json
{
  "message": "Failed to create order"
}
```

**Configuration Error:**
```json
{
  "message": "Payment system configuration error"
}
```

**General Error:**
```json
{
  "success": false,
  "message": "Failed to create payment order"
}
```

## Environment Dependencies

### Required Environment Variables
```bash
PAYME_MERCHANT_ID=682c005253a2e309cf048d70
```

### Configuration Validation
```typescript
const merchantId = process.env.PAYME_MERCHANT_ID;

if (!merchantId) {
  return res.status(500).json({ 
    message: "Payment system configuration error" 
  });
}
```

## Logging and Debugging

### Debug Output
```typescript
console.log('=== PAYME URL GENERATION DEBUG ===');
console.log('Payme Merchant ID:', merchantId);
console.log('Order ID:', orderId);
console.log('Amount:', amount);
console.log('Generated Payme URL params:', paymeParams);
console.log('Encoded params:', encodedParams);
console.log('Final Payme URL:', paymeUrl);
console.log('=== END DEBUG ===');
```

### Order Creation Log
```typescript
console.log(`Created new order: ${orderId} for user ${req.user.id} with amount ${amount}`);
```

### Error Logging
```typescript
console.error("Error creating payment order:", error);
```

## Integration Flow

### 1. Frontend Request
```javascript
const response = await fetch('/api/payment/create-order', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  credentials: 'include' // For session authentication
});

const data = await response.json();
if (data.success) {
  window.location.href = data.paymentUrl;
}
```

### 2. Backend Processing
1. Authenticate user session
2. Generate unique order ID
3. Create database order record
4. Generate Payme checkout URL
5. Return payment URL to frontend

### 3. User Redirect
1. Frontend redirects user to `data.paymentUrl`
2. User completes payment on Payme interface
3. Payme processes payment via webhook endpoints
4. User returns to `/payment/success`

## Security Considerations

### Authentication
- All payment endpoints require authentication
- Session-based user verification
- User ID validation before order creation

### Data Validation
- Order creation validates required fields
- Environment variable validation
- Error handling for invalid states

### URL Security
- Base64 encoding of payment parameters
- No sensitive data exposed in URLs
- Merchant ID validation

## Error Handling

### Database Errors
- Order creation failure handling
- Storage operation validation
- Transaction rollback considerations

### Configuration Errors
- Missing environment variables
- Invalid merchant configuration
- Payment system unavailability

### User Errors
- Authentication failures
- Invalid session states
- Duplicate order prevention

## Testing

### Test Order Creation
```bash
curl -X POST http://localhost:5000/api/payment/create-order \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{}'
```

### Expected Test Response
```json
{
  "success": true,
  "orderId": "ORDER-1748546527701-123",
  "amount": 14900000,
  "paymentUrl": "https://checkout.paycom.uz/...",
  "message": "Order created successfully"
}
```

## Related Files

### Dependencies
- `./payme/routes-new.ts` - Main Payme API routes
- `./payme/webhook-routes.ts` - Webhook handling routes
- `./payment-routes.ts` - Additional payment routes
- `./storage.ts` - Database operations
- `./auth.ts` - Authentication middleware

### Database Tables
- `orders` - Order records
- `payment_transactions` - Transaction tracking
- `users` - User authentication

## Current Status

**Active Endpoints:**
- ✅ `POST /api/payment/create-order` - Order creation
- ✅ `GET /payment/success` - Success redirect
- ✅ `POST /api/payment/payme` - Payme API (from routes-new.ts)
- ✅ `POST /api/payment/webhook` - Webhook handling

**Configuration:**
- ✅ Merchant ID: `682c005253a2e309cf048d70`
- ✅ Test environment active
- ✅ Database integration complete
- ✅ URL generation working