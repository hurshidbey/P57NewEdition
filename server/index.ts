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
import { initializeSecurity } from "./utils/security-config";

const app = express();

// Initialize security checks
initializeSecurity();

// Apply security middleware first
app.use(securityHeaders);
app.use(cors(corsOptions));
app.use(additionalSecurityHeaders);

// Apply rate limiting
app.use('/api/', applyRateLimits);

// Body parsing with size limits
app.use(express.json({ limit: requestSizeLimits.json }));
app.use(express.urlencoded(requestSizeLimits.urlencoded));

// Input sanitization and SQL injection prevention
app.use(sanitizeBody);
app.use(preventSqlInjection);

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
  // Configure session middleware with secure settings
  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
    console.error('⚠️  WARNING: SESSION_SECRET is not set or too short. Using a random secret.');
    const crypto = await import('crypto');
    process.env.SESSION_SECRET = crypto.randomBytes(32).toString('hex');
  }

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
})();
