import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import DOMPurify from 'isomorphic-dompurify';

// Sanitize string input
export const sanitizeString = (input: string): string => {
  if (!input) return '';
  // Remove any HTML tags and scripts
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
};

// Middleware to handle validation errors
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Validation failed',
      errors: errors.array() 
    });
  }
  next();
};

// Common validation rules
export const validationRules = {
  // Auth validation
  authLogin: [
    body('username').trim().notEmpty().withMessage('Username is required')
      .isLength({ min: 3, max: 50 }).withMessage('Username must be 3-50 characters'),
    body('password').notEmpty().withMessage('Password is required')
      .isLength({ min: 6, max: 100 }).withMessage('Password must be 6-100 characters'),
  ],
  
  // Protocol validation
  protocolId: [
    param('id').isInt({ min: 1 }).withMessage('Invalid protocol ID'),
  ],
  
  protocolQuery: [
    query('page').optional().isInt({ min: 1 }).withMessage('Invalid page number'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),
    query('search').optional().trim().isLength({ max: 100 }).withMessage('Search query too long'),
    query('category').optional().trim().isLength({ max: 50 }),
    query('difficulty').optional().isIn(['beginner', 'intermediate', 'advanced']),
  ],
  
  // Payment validation
  paymentCreate: [
    body('amount').isInt({ min: 100, max: 10000000 }).withMessage('Invalid amount'),
    body('description').optional().trim().isLength({ max: 200 }),
  ],
  
  paymentCard: [
    body('cardNumber').matches(/^\d{16}$/).withMessage('Invalid card number'),
    body('expiry').matches(/^\d{4}$/).withMessage('Invalid expiry format'),
    body('transactionId').isInt().withMessage('Invalid transaction ID'),
  ],
  
  paymentOtp: [
    body('transactionId').isInt().withMessage('Invalid transaction ID'),
    body('otpCode').matches(/^\d{6}$/).withMessage('OTP must be 6 digits'),
  ],
  
  // Evaluation validation
  evaluation: [
    body('context').trim().notEmpty().withMessage('Context is required')
      .isLength({ max: 5000 }).withMessage('Context too long'),
    body('userPrompt').trim().notEmpty().withMessage('User prompt is required')
      .isLength({ max: 2000 }).withMessage('User prompt too long'),
  ],
  
  // Admin validation
  adminProtocol: [
    body('number').isInt({ min: 1 }).withMessage('Invalid protocol number'),
    body('title').trim().notEmpty().isLength({ max: 200 }),
    body('description').trim().notEmpty().isLength({ max: 5000 }),
    body('categoryId').isInt({ min: 1 }),
    body('isFreeAccess').optional().isBoolean(),
  ],
};

// Sanitize request body middleware
export const sanitizeBody = (req: Request, res: Response, next: NextFunction) => {
  if (req.body && typeof req.body === 'object') {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeString(req.body[key]);
      }
    });
  }
  next();
};

// SQL injection prevention (additional layer on top of Drizzle ORM)
export const preventSqlInjection = (req: Request, res: Response, next: NextFunction) => {
  const suspiciousPatterns = [
    /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b)/i,
    /(--|\/\*|\*\/|xp_|sp_)/i,
    /(\bor\b\s*\d+\s*=\s*\d+)/i,
    /(\band\b\s*\d+\s*=\s*\d+)/i,
  ];
  
  const checkValue = (value: any): boolean => {
    if (typeof value === 'string') {
      return suspiciousPatterns.some(pattern => pattern.test(value));
    }
    return false;
  };
  
  // Check all request inputs
  const inputs = { ...req.query, ...req.params, ...req.body };
  
  for (const [key, value] of Object.entries(inputs)) {
    if (checkValue(value)) {
      return res.status(400).json({ 
        message: 'Invalid input detected',
        error: 'Suspicious patterns found in request' 
      });
    }
  }
  
  next();
};