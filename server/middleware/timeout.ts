import { Request, Response, NextFunction } from 'express';

// Application-level timeout middleware
export function createTimeoutMiddleware(timeoutMs: number = 55000) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip timeout for health checks and WebSocket upgrades
    if (req.path === '/health' || req.path === '/nginx-health' || req.headers.upgrade === 'websocket') {
      return next();
    }

    let timeoutHandle: NodeJS.Timeout;
    let timedOut = false;

    // Set up timeout
    timeoutHandle = setTimeout(() => {
      timedOut = true;
      if (!res.headersSent) {
        console.error(`[TIMEOUT] Request timed out after ${timeoutMs}ms: ${req.method} ${req.path}`);
        res.status(504).json({
          error: 'Gateway Timeout',
          message: 'The request took too long to process. Please try again.',
          path: req.path,
          method: req.method,
          timeout: timeoutMs
        });
      }
    }, timeoutMs);

    // Clear timeout when response finishes
    const cleanup = () => {
      clearTimeout(timeoutHandle);
    };

    res.on('finish', cleanup);
    res.on('close', cleanup);

    // Override send methods to prevent sending after timeout
    const originalSend = res.send;
    const originalJson = res.json;
    const originalRedirect = res.redirect;

    res.send = function(...args: any[]): Response {
      if (timedOut) {
        console.warn('[TIMEOUT] Attempted to send response after timeout');
        return res;
      }
      return originalSend.apply(res, args);
    };

    res.json = function(...args: any[]): Response {
      if (timedOut) {
        console.warn('[TIMEOUT] Attempted to send JSON response after timeout');
        return res;
      }
      return originalJson.apply(res, args);
    };

    res.redirect = function(...args: any[]): Response {
      if (timedOut) {
        console.warn('[TIMEOUT] Attempted to redirect after timeout');
        return res;
      }
      return originalRedirect.apply(res, args);
    };

    next();
  };
}

// Specific timeout configurations for different route types
export const timeoutConfigs = {
  api: 55000,          // 55 seconds for API routes
  static: 10000,       // 10 seconds for static assets
  upload: 120000,      // 2 minutes for file uploads
  payment: 90000,      // 90 seconds for payment processing
  evaluation: 180000   // 3 minutes for AI evaluation
};