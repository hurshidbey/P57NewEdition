import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import cors from "cors";
import { setupRoutes } from "./routes";
import { hybridPromptsStorage } from "./hybrid-storage";
import { setupVite, serveStatic, log } from "./vite";
import { securityHeaders, corsOptions, additionalSecurityHeaders, requestSizeLimits } from "./middleware/security";
import { applyRateLimits } from "./middleware/rate-limit";
import { sanitizeBody, preventSqlInjection } from "./middleware/validation";
import { logger } from "./utils/logger";
import { initializeSecurity } from "./utils/security-config";
import { createTimeoutMiddleware, timeoutConfigs } from "./middleware/timeout";
import { initializeEnvValidation, getValidatedEnv } from "./utils/env-validator";

const app = express();

// Trust proxy headers - CRITICAL for proper IP detection behind NGINX
app.set('trust proxy', true);

// Initialize security checks
initializeSecurity();

// Apply security middleware first
app.use(securityHeaders);

// Apply CORS only to API routes, not static files
app.use((req, res, next) => {
  // Skip CORS for static files to fix Chrome issues
  if (req.path.startsWith('/assets/') || 
      req.path.endsWith('.js') || 
      req.path.endsWith('.css') || 
      req.path.endsWith('.png') || 
      req.path.endsWith('.jpg') || 
      req.path.endsWith('.svg') ||
      req.path.endsWith('.ico') ||
      req.path === '/') {
    return next();
  }
  cors(corsOptions)(req, res, next);
});

app.use(additionalSecurityHeaders);

// Apply rate limiting
app.use('/api/', applyRateLimits);

// Body parsing with size limits
app.use(express.json({ limit: requestSizeLimits.json }));
app.use(express.urlencoded({ ...requestSizeLimits.urlencoded, extended: true }));

// Secure logging for payment requests
app.use((req, res, next) => {
  if (req.path.includes('/click/') || req.path.includes('/api/click/')) {
    logger.payment('Payment provider request', {
      method: req.method,
      path: req.path,
      // Only log non-sensitive info
      hasBody: !!req.body,
      contentType: req.headers['content-type']
    });
  }
  next();
});

// Input sanitization and SQL injection prevention
app.use(sanitizeBody);
app.use(preventSqlInjection);

// Apply timeout middleware with route-specific configurations
app.use('/api/payments', createTimeoutMiddleware(timeoutConfigs.payment));
app.use('/api/evaluate', createTimeoutMiddleware(timeoutConfigs.evaluation));
app.use('/api', createTimeoutMiddleware(timeoutConfigs.api));
app.use('/assets', createTimeoutMiddleware(timeoutConfigs.static));
app.use(createTimeoutMiddleware(timeoutConfigs.api)); // Default timeout for everything else

// Session middleware will be configured in the async block below

// Disable caching in development
if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store'
    });
    next();
  });
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson: any, ...args: any[]) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args] as any);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Validate environment variables first
  log('🔍 Validating environment configuration...');
  const envValidation = initializeEnvValidation({
    exitOnError: true,
    loadEnvFile: process.env.NODE_ENV !== 'production'
  });
  
  // Get validated environment
  const validatedEnv = getValidatedEnv();
  
  // Configure session middleware with secure settings
  // No need to check SESSION_SECRET anymore as it's validated above

  app.use(session({
    secret: process.env.SESSION_SECRET!,
    name: 'p57_session', // Custom session name
    resave: false,
    saveUninitialized: false,
    rolling: true, // Reset expiry on activity
    cookie: {
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      httpOnly: true, // Prevent XSS
      sameSite: 'strict', // CSRF protection
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  try {
    await hybridPromptsStorage.initialize();

  } catch (error) {

  }

  let server;
  try {
    server = await setupRoutes(app);

  } catch (error) {

    throw error;
  }

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  const env = app.get("env");

  // IMPORTANT: Set up static file serving BEFORE the error handler
  if (env === "development") {

    await setupVite(app, server);
  } else {

    serveStatic(app);

  }

  // Error handler MUST come AFTER static file serving
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    
    // Log the error for debugging

    if (err.stack) {

    }

    // Only send JSON responses for API routes
    if (req.originalUrl.startsWith('/api/')) {
      res.status(status).json({ 
        message,
        ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
      });
    } else {
      // For non-API routes, send a plain error response
      res.status(status).send(message);
    }
    
    // Don't throw in production - let the server continue running
    if (process.env.NODE_ENV !== 'production' && req.originalUrl.startsWith('/api/')) {
      throw err;
    }
  });

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = process.env.PORT ? parseInt(process.env.PORT) : 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });

  // Graceful shutdown handling
  let isShuttingDown = false;
  const connections = new Set();

  server.on('connection', (conn) => {
    connections.add(conn);
    conn.on('close', () => {
      connections.delete(conn);
    });
  });

  const gracefulShutdown = async (signal: string) => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    log(`${signal} received, starting graceful shutdown...`);

    // Stop accepting new connections
    server.close(() => {
      log('HTTP server closed');
    });

    // Close existing connections gracefully
    const closeTimeout = setTimeout(() => {
      log('Forcing connections to close...');
      connections.forEach(conn => conn.destroy());
    }, 30000); // 30 second grace period

    // Wait for existing connections to close
    await new Promise<void>((resolve) => {
      const checkInterval = setInterval(() => {
        if (connections.size === 0) {
          clearInterval(checkInterval);
          clearTimeout(closeTimeout);
          resolve();
        }
      }, 100);
    });

    // Close database connections if needed
    try {
      await hybridPromptsStorage.close();
      log('Database connections closed');
    } catch (error) {
      log('Error closing database connections:', error);
    }

    log('Graceful shutdown complete');
    process.exit(0);
  };

  // Handle shutdown signals
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  // Handle uncaught errors
  process.on('uncaughtException', (error) => {
    log('Uncaught Exception:', error);
    gracefulShutdown('uncaughtException');
  });

  process.on('unhandledRejection', (reason, promise) => {
    log('Unhandled Rejection at:', promise, 'reason:', reason);
    gracefulShutdown('unhandledRejection');
  });
})();
