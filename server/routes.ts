import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { hybridPromptsStorage } from "./hybrid-storage";
import { insertProtocolSchema, insertPromptSchema, users } from "@shared/schema";
import { evaluatePrompt } from "./openai-service";
import { z } from "zod";
import { setupAtmosRoutes } from "./atmos-routes";
import { setupClickRoutes } from "./click-routes";
import { setupAuthRoutes } from "./auth-routes";
import { setupDiagnosticRoutes } from "./diagnostic-routes";
import { eq } from "drizzle-orm";
import { securityConfig } from "./utils/security-config";
import os from "os";
import { requireAuth, requirePermission, auditLog, isSupabaseAdmin as rbacIsSupabaseAdmin } from "./middleware/rbac";
import { RESOURCES, ACTIONS } from "@shared/rbac-schema";
import auditLogRoutes from "./routes/audit-logs";
import roleRoutes from "./routes/roles";
import dnsHealthRoutes from "./routes/dns-health";
import { flexibleAuth, requireFlexibleAuth, optionalAuth, isFlexibleAdmin } from "./middleware/flexible-auth";

// Simple request counter for metrics
class RequestCounter {
  private total: number = 0;
  private windowStart: number = Date.now();
  private windowCount: number = 0;
  private windowDuration: number = 60000; // 1 minute window

  increment() {
    this.total++;
    this.windowCount++;
    
    // Reset window if expired
    const now = Date.now();
    if (now - this.windowStart > this.windowDuration) {
      this.windowStart = now;
      this.windowCount = 1;
    }
  }

  getTotal() {
    return this.total;
  }

  getRate() {
    const elapsed = (Date.now() - this.windowStart) / 1000; // seconds
    return elapsed > 0 ? (this.windowCount / elapsed).toFixed(2) : '0';
  }
}

const requestCounter = new RequestCounter();
let activeConnections = 0;

function getActiveConnections() {
  return activeConnections;
}

// Helper function to format uptime
function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / (24 * 60 * 60));
  const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((seconds % (60 * 60)) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m ${secs}s`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

// Define user interface for our application
interface AppUser {
  id: string;
  username: string;
  role?: string;
}

// Define session interface
interface AppSession {
  user?: AppUser;
}

// Middleware to ensure user is authenticated
const isAuthenticated = (req: any, res: Response, next: NextFunction) => {
  // For now, check if user is in session - this will be enhanced with proper auth later
  if (!req.session?.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  // Add user to req for easier access
  req.user = req.session.user;
  next();
};

// Use RBAC-based admin middleware (backward compatible with ADMIN_EMAILS)
const isSupabaseAdmin = rbacIsSupabaseAdmin;

// Admin middleware function to check if user is an admin (legacy session-based)
const isAdmin = (req: any, res: Response, next: NextFunction) => {
  if (!req.session?.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  
  if (req.session.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied - admin only" });
  }
  
  req.user = req.session.user;
  next();
};

export function setupRoutes(app: Express): Server {
  // Middleware to track requests and connections
  app.use((req, res, next) => {
    requestCounter.increment();
    activeConnections++;
    
    res.on('finish', () => {
      activeConnections--;
    });
    
    res.on('close', () => {
      activeConnections--;
    });
    
    next();
  });

  // Health check endpoint
  app.get("/health", (req, res) => {
    const uptime = process.uptime();
    res.json({
      status: "healthy",
      uptime: formatUptime(uptime),
      timestamp: new Date().toISOString(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // Detailed metrics endpoint for monitoring
  app.get("/metrics", async (req, res) => {
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    // Calculate requests per second (simple implementation)
    const currentTime = Date.now();
    const requestRate = requestCounter.getRate();
    
    // Get database connection status
    let dbStatus = "unknown";
    try {
      const isConnected = await storage.isConnected();
      dbStatus = isConnected ? "connected" : "disconnected";
    } catch (error) {
      dbStatus = "error";
    }
    
    const metrics = {
      system: {
        hostname: os.hostname(),
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
        pid: process.pid,
        uptime: formatUptime(uptime),
        uptimeSeconds: uptime
      },
      memory: {
        rss: memoryUsage.rss,
        heapTotal: memoryUsage.heapTotal,
        heapUsed: memoryUsage.heapUsed,
        external: memoryUsage.external,
        arrayBuffers: memoryUsage.arrayBuffers,
        heapUsedPercent: ((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100).toFixed(2)
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system
      },
      requests: {
        total: requestCounter.getTotal(),
        rate: requestRate,
        activeConnections: getActiveConnections()
      },
      database: {
        status: dbStatus
      },
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    };
    
    res.json(metrics);
  });

  // Readiness probe - checks if the app is ready to serve traffic
  app.get("/ready", async (req, res) => {
    const checks = {
      server: true,
      database: false,
      timestamp: new Date().toISOString()
    };
    
    try {
      // Check database connection
      checks.database = await storage.isConnected();
    } catch (error) {
      checks.database = false;
    }
    
    const isReady = checks.server && checks.database;
    
    res.status(isReady ? 200 : 503).json({
      ready: isReady,
      checks,
      message: isReady ? "Application is ready" : "Application is not ready"
    });
  });

  // Test authentication middleware
  app.get("/api/test-auth", flexibleAuth, (req, res) => {
    res.json({
      authenticated: !!req.user,
      authMethod: req.user ? (req.user.supabaseUser ? 'jwt' : 'session') : 'none',
      user: req.user ? {
        id: req.user.id,
        email: req.user.email,
        tier: req.user.tier
      } : null
    });
  });

  // Test OpenAI endpoint
  app.get("/api/test-openai", async (req, res) => {
    try {
      const testResult = await evaluatePrompt(
        "Bu prompt qanday yaxshilanishi mumkin?",
        "Menga yordam bering"
      );
      res.json({ 
        success: true, 
        message: "OpenAI connection successful",
        evaluation: testResult
      });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        message: "OpenAI connection failed", 
        error: error.message 
      });
    }
  });

  // Get all protocols with pagination and filtering
  app.get("/api/protocols", async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string;
      const category = req.query.category as string;
      const difficulty = req.query.difficulty as string;
      const offset = (page - 1) * limit;

      const protocols = await storage.getProtocols(limit, offset, search, category, difficulty);
      
      res.json(protocols);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch protocols", error: error.message });
    }
  });

  // Get single protocol by ID
  app.get("/api/protocols/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const protocol = await storage.getProtocol(id);
      
      if (!protocol) {
        return res.status(404).json({ message: "Protocol not found" });
      }
      
      res.json(protocol);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch protocol", error: error.message });
    }
  });

  // Get all categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch categories", error: error.message });
    }
  });

  // Progress endpoints are defined later with proper authentication

  // Basic authentication endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }
      
      // Find user by username
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Use bcrypt to compare password with stored hash
      const validPassword = await securityConfig.comparePassword(password, user.password || '');
      
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Store user in session (excluding password)
      req.session!.user = {
        id: user.id.toString(),
        username: user.username,
        role: user.role || 'user'
      };
      
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword, message: "Login successful" });
    } catch (error: any) {
      res.status(500).json({ message: "Login failed", error: error.message });
    }
  });

  // Logout endpoint
  app.post("/api/auth/logout", (req, res) => {
    req.session!.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logout successful" });
    });
  });

  // Get current user from session
  app.get("/api/auth/me", flexibleAuth, (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.json({ user: req.user });
  });

  // Admin routes for protocol management
  // Get all protocols for admin
  app.get("/api/admin/protocols", 
    isSupabaseAdmin,
    async (req, res) => {
    try {
      const protocols = await storage.getProtocols(1000); // Get all protocols for admin
      res.json(protocols);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch protocols", error: error.message });
    }
  });

  app.post("/api/admin/protocols", 
    isSupabaseAdmin,
    async (req, res) => {
    try {
      const protocolData = insertProtocolSchema.parse(req.body);
      const protocol = await storage.createProtocol(protocolData);
      res.json(protocol);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid protocol data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create protocol", error: error.message });
    }
  });

  app.put("/api/admin/protocols/:id", 
    isSupabaseAdmin,
    async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const protocolData = insertProtocolSchema.partial().parse(req.body);
      
      const protocol = await storage.updateProtocol(id, protocolData);
      
      if (!protocol) {
        return res.status(404).json({ message: "Protocol not found" });
      }
      
      res.json(protocol);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid protocol data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update protocol", error: error.message });
    }
  });

  app.delete("/api/admin/protocols/:id", 
    isSupabaseAdmin,
    async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteProtocol(id);
      
      if (!success) {
        return res.status(404).json({ message: "Protocol not found" });
      }
      
      res.json({ message: "Protocol deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to delete protocol", error: error.message });
    }
  });

  // Toggle protocol free access
  app.patch("/api/admin/protocols/:id/toggle-free", 
    isSupabaseAdmin,
    async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { isFreeAccess } = req.body;
      
      const protocol = await storage.updateProtocol(id, { isFreeAccess });
      
      if (!protocol) {
        return res.status(404).json({ message: "Protocol not found" });
      }
      
      res.json(protocol);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to update protocol access", error: error.message });
    }
  });

  // Prompts endpoints
  app.get("/api/prompts", async (req, res) => {
    try {
      // Check if user is authenticated via Supabase (for admins)
      const authHeader = req.headers.authorization;
      let isAdmin = false;
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
          const token = authHeader.split(' ')[1];
          const { createClient } = await import('@supabase/supabase-js');
          const supabase = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_ANON_KEY!
          );
          
          const { data: { user }, error } = await supabase.auth.getUser(token);
          
          if (!error && user) {
            // Check if user is admin
            const adminEmails = process.env.ADMIN_EMAILS 
              ? process.env.ADMIN_EMAILS.split(',').map(email => email.trim())
              : [];
            
            isAdmin = adminEmails.includes(user.email || '');
          }
        } catch (e) {
          // Silent fail - not critical for this endpoint
        }
      }
      
      // If admin, return all prompts regardless of tier
      if (isAdmin) {
        const allPrompts = await hybridPromptsStorage.getAllPrompts();
        res.json(allPrompts);
      } else {
        // For regular users, respect the tier parameter
        const userTier = (req.query.tier as string) || 'free';
        const prompts = await hybridPromptsStorage.getPrompts(userTier);
        res.json(prompts);
      }
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch prompts", error: error.message });
    }
  });

  app.get("/api/prompts/:id", async (req, res) => {
    try {
      // Validate ID parameter
      if (!req.params.id || req.params.id === 'undefined') {
        return res.status(400).json({ message: "Invalid prompt ID" });
      }
      
      const id = parseInt(req.params.id);
      
      // Check if ID is a valid number
      if (isNaN(id)) {
        return res.status(400).json({ message: "Prompt ID must be a number" });
      }
      
      const prompt = await hybridPromptsStorage.getPrompt(id);
      
      if (!prompt) {
        return res.status(404).json({ message: "Prompt not found" });
      }
      
      res.json(prompt);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch prompt", error: error.message });
    }
  });

  // Admin prompts endpoints
  app.get("/api/admin/prompts", 
    isSupabaseAdmin,
    async (req, res) => {
    try {
      const prompts = await hybridPromptsStorage.getAllPrompts();
      res.json(prompts);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch prompts", error: error.message });
    }
  });

  app.post("/api/admin/prompts", 
    isSupabaseAdmin,
    async (req, res) => {
    try {
      const promptData = insertPromptSchema.parse(req.body);
      const prompt = await hybridPromptsStorage.createPrompt(promptData);
      res.json(prompt);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid prompt data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create prompt", error: error.message });
    }
  });

  app.put("/api/admin/prompts/:id", 
    isSupabaseAdmin,
    async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const promptData = insertPromptSchema.partial().parse(req.body);
      
      const prompt = await hybridPromptsStorage.updatePrompt(id, promptData);
      
      if (!prompt) {
        return res.status(404).json({ message: "Prompt not found" });
      }
      
      res.json(prompt);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid prompt data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update prompt", error: error.message });
    }
  });

  app.delete("/api/admin/prompts/:id", 
    isSupabaseAdmin,
    async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await hybridPromptsStorage.deletePrompt(id);
      
      if (!success) {
        return res.status(404).json({ message: "Prompt not found" });
      }
      
      res.json({ message: "Prompt deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to delete prompt", error: error.message });
    }
  });

  // AI Evaluation endpoint
  app.post("/api/protocols/:id/evaluate", async (req, res) => {
    try {
      const { context, userPrompt } = req.body;
      
      if (!context || !userPrompt) {
        return res.status(400).json({ 
          message: "Context and userPrompt are required" 
        });
      }
      
      const evaluation = await evaluatePrompt(context, userPrompt);
      
      res.json({
        success: true,
        evaluation
      });
    } catch (error: any) {
      console.error('Evaluation error:', error);
      res.status(500).json({ 
        success: false,
        message: "Failed to evaluate prompt", 
        error: error.message 
      });
    }
  });

  // Setup Atmos payment routes
  const atmosRouter = setupAtmosRoutes();
  app.use('/api', atmosRouter);
  
  // Setup Auth routes for metadata initialization
  const authRouter = setupAuthRoutes();
  app.use(authRouter);
  
  // Setup Click.uz payment routes
  const clickRouter = setupClickRoutes();
  
  // Add specific middleware for Click.uz endpoints
  app.use('/api', (req, res, next) => {
    // Special handling for Click.uz requests
    if (req.path.includes('/click/')) {
      // Log all Click.uz requests at the routing level
      console.log(`🔵 [CLICK-ROUTER] ${req.method} ${req.path} from ${req.ip}`);
      
      // Allow Click.uz servers to access our endpoints
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', '*');
      
      // Handle preflight
      if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
      }
    }
    next();
  });
  
  app.use('/api', clickRouter);
  
  // Setup Diagnostic routes for system health monitoring
  const diagnosticRouter = setupDiagnosticRoutes();
  app.use(diagnosticRouter);
  
  // RBAC routes
  app.use('/api/admin', auditLogRoutes);
  app.use('/api/admin', roleRoutes);
  
  // DNS health monitoring routes (public)
  app.use('/api', dnsHealthRoutes);

  // Get user progress (with flexible authentication)
  app.get("/api/progress/:userId", requireFlexibleAuth, async (req, res) => {
    try {
      const { userId } = req.params;
      
      // Only allow users to access their own progress
      if (req.user.id !== userId && req.user.supabaseUser?.id !== userId) {
        return res.status(403).json({ error: 'Access denied - can only access own progress' });
      }
      
      const result = await storage.getUserProgress(userId);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update protocol progress (with flexible authentication)
  app.post("/api/progress/:userId/:protocolId", requireFlexibleAuth, async (req, res) => {
    try {
      const { userId, protocolId } = req.params;
      const { score } = req.body;
      
      // Only allow users to update their own progress
      if (req.user.id !== userId && req.user.supabaseUser?.id !== userId) {
        return res.status(403).json({ error: 'Access denied - can only update own progress' });
      }
      
      const result = await storage.updateProtocolProgress(
        userId, 
        parseInt(protocolId), 
        score || 70
      );
      
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete protocol progress (with flexible authentication)
  app.delete("/api/progress/:userId/:protocolId", requireFlexibleAuth, async (req, res) => {
    try {
      const { userId, protocolId } = req.params;
      
      // Only allow users to delete their own progress
      if (req.user.id !== userId && req.user.supabaseUser?.id !== userId) {
        return res.status(403).json({ error: 'Access denied - can only delete own progress' });
      }
      
      const result = await storage.deleteProtocolProgress(
        userId, 
        parseInt(protocolId)
      );
      
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin: Get all users
  app.get("/api/admin/users", 
    isSupabaseAdmin,
    async (req, res) => {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role key for admin operations
      );
      
      const { data: users, error } = await supabase.auth.admin.listUsers();
      
      if (error) throw error;
      
      // Format users with tier information
      const formattedUsers = users.users.map(user => ({
        id: user.id,
        email: user.email || '',
        tier: user.user_metadata?.tier || 'free',
        createdAt: user.created_at
      }));
      
      res.json(formattedUsers);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin: Get all payments
  app.get("/api/admin/payments", 
    isSupabaseAdmin,
    async (req, res) => {
    try {
      const payments = await storage.getPayments();
      console.log(`📊 [ADMIN] Retrieved ${payments.length} payment records`);
      res.json(payments);
    } catch (error: any) {
      console.error(`❌ [ADMIN] Failed to get payments:`, error);
      res.status(500).json({ error: error.message });
    }
  });

  // ======= COUPON ENDPOINTS =======
  
  // Validate coupon code (public endpoint)
  app.post("/api/coupons/validate", async (req, res) => {
    try {
      const { code, amount } = req.body;
      
      if (!code) {
        return res.status(400).json({ 
          valid: false, 
          message: "Kupon kodi kiritilmagan" 
        });
      }

      console.log(`📝 [API] Validating coupon code: ${code}`);
      const coupon = await storage.getCouponByCode(code.trim().toUpperCase());
      
      if (!coupon) {
        return res.status(404).json({ 
          valid: false, 
          message: "Bunday kupon kodi mavjud emas" 
        });
      }

      // Check if coupon is active
      if (!coupon.isActive) {
        return res.status(400).json({ 
          valid: false, 
          message: "Bu kupon kodi faol emas" 
        });
      }

      // Check expiration
      if (coupon.validUntil && new Date(coupon.validUntil) < new Date()) {
        return res.status(400).json({ 
          valid: false, 
          message: "Bu kupon kodining muddati tugagan" 
        });
      }

      // Check if not yet valid
      if (coupon.validFrom && new Date(coupon.validFrom) > new Date()) {
        return res.status(400).json({ 
          valid: false, 
          message: "Bu kupon kodi hali faol emas" 
        });
      }

      // Check usage limits
      if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
        return res.status(400).json({ 
          valid: false, 
          message: "Bu kupon kodining foydalanish limiti tugagan" 
        });
      }

      // Calculate discount
      const originalAmount = amount || coupon.originalPrice;
      let discountAmount = 0;
      let finalAmount = originalAmount;

      if (coupon.discountType === 'percentage') {
        discountAmount = Math.floor(originalAmount * (coupon.discountValue / 100));
        finalAmount = originalAmount - discountAmount;
      } else if (coupon.discountType === 'fixed') {
        discountAmount = Math.min(coupon.discountValue, originalAmount);
        finalAmount = originalAmount - discountAmount;
      }

      res.json({
        valid: true,
        coupon: {
          id: coupon.id,
          code: coupon.code,
          description: coupon.description,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          originalAmount,
          discountAmount,
          finalAmount,
          discountPercent: coupon.discountType === 'percentage' 
            ? coupon.discountValue 
            : Math.round((discountAmount / originalAmount) * 100)
        },
        message: "Kupon kodi muvaffaqiyatli qo'llandi!"
      });

    } catch (error: any) {
      console.error('❌ [COUPON] Validation error:', error);
      res.status(500).json({ 
        valid: false, 
        message: "Kupon kodini tekshirishda xatolik" 
      });
    }
  });

  // Admin: Get all coupons
  app.get("/api/admin/coupons", 
    isSupabaseAdmin,
    async (req, res) => {
    try {
      const coupons = await storage.getCoupons();
      res.json(coupons);
    } catch (error: any) {
      console.error('❌ [ADMIN] Failed to get coupons:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Admin: Create new coupon
  app.post("/api/admin/coupons", 
    isSupabaseAdmin,
    async (req, res) => {
    try {
      const { 
        code, 
        description, 
        discountType, 
        discountValue, 
        originalPrice,
        maxUses,
        validFrom,
        validUntil,
        isActive 
      } = req.body;
      
      console.log('📝 [ADMIN] Creating coupon with data:', req.body);
      
      // Ensure code is uppercase
      const normalizedCode = code.trim().toUpperCase();
      
      // Check if code already exists
      const existing = await storage.getCouponByCode(normalizedCode);
      if (existing) {
        return res.status(400).json({ 
          error: "Bu kupon kodi allaqachon mavjud" 
        });
      }

      // Create coupon with only the expected fields
      const couponData: any = {
        code: normalizedCode,
        description: description || '',
        discountType: discountType || 'percentage',
        discountValue: discountValue || 0,
        originalPrice: originalPrice || 1425000,
        isActive: isActive !== undefined ? isActive : true,
        createdBy: req.user?.email || 'admin'
      };
      
      // Only add optional fields if they have values
      if (maxUses !== undefined && maxUses !== null && maxUses !== '') {
        couponData.maxUses = parseInt(maxUses);
      }
      if (validFrom) {
        couponData.validFrom = validFrom;
      }
      if (validUntil) {
        couponData.validUntil = validUntil;
      }
      
      console.log('📝 [ADMIN] Processed coupon data:', couponData);
      
      const coupon = await storage.createCoupon(couponData);
      
      res.json(coupon);
    } catch (error: any) {
      console.error('❌ [ADMIN] Failed to create coupon:', error);
      console.error('❌ [ADMIN] Error stack:', error.stack);
      res.status(500).json({ error: error.message });
    }
  });

  // Admin: Update coupon
  app.put("/api/admin/coupons/:id", 
    isSupabaseAdmin,
    async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { code, ...updateData } = req.body;
      
      // If code is being updated, normalize it
      if (code) {
        updateData.code = code.trim().toUpperCase();
      }
      
      const coupon = await storage.updateCoupon(id, updateData);
      if (!coupon) {
        return res.status(404).json({ error: "Kupon topilmadi" });
      }
      
      res.json(coupon);
    } catch (error: any) {
      console.error('❌ [ADMIN] Failed to update coupon:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Admin: Delete coupon
  app.delete("/api/admin/coupons/:id", 
    isSupabaseAdmin,
    async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteCoupon(id);
      
      if (!success) {
        return res.status(404).json({ error: "Kupon topilmadi" });
      }
      
      res.json({ success: true });
    } catch (error: any) {
      console.error('❌ [ADMIN] Failed to delete coupon:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Admin: Toggle coupon active status
  app.patch("/api/admin/coupons/:id/toggle", 
    isSupabaseAdmin,
    async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { isActive } = req.body;
      
      const coupon = await storage.updateCoupon(id, { isActive });
      if (!coupon) {
        return res.status(404).json({ error: "Kupon topilmadi" });
      }
      
      res.json(coupon);
    } catch (error: any) {
      console.error('❌ [ADMIN] Failed to toggle coupon:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Admin: Get coupon usage history
  app.get("/api/admin/coupons/:id/usage", 
    isSupabaseAdmin,
    async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const usage = await storage.getCouponUsageHistory(id);
      res.json(usage);
    } catch (error: any) {
      console.error('❌ [ADMIN] Failed to get coupon usage:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Simple auth endpoint (basic implementation)
  app.post("/api/auth/login", async (req: any, res) => {
    try {
      const { username, password } = req.body;
      
      // First, try to authenticate against database users
      let dbUser;
      let isAuthenticated = false;
      
      try {
        // Try to find existing user in database
        dbUser = await storage.getUserByUsername(username);
        
        if (dbUser && dbUser.password) {
          // Check if the password is hashed (bcrypt hashes start with $2)
          if (dbUser.password.startsWith('$2')) {
            // Use bcrypt comparison for hashed passwords
            isAuthenticated = await securityConfig.comparePassword(password, dbUser.password);
          } else {
            // Legacy plain text comparison (should be migrated to bcrypt)
            isAuthenticated = password === dbUser.password;
            console.warn(`⚠️ User ${username} has unhashed password - consider migrating to bcrypt`);
          }
        }
      } catch (dbError) {
        console.error('Database authentication error:', dbError);
      }
      
      // If not authenticated via database, check fallback admin credentials
      if (!isAuthenticated && !dbUser) {
        const fallbackEmail = process.env.FALLBACK_ADMIN_EMAIL;
        const fallbackPasswordHash = process.env.FALLBACK_ADMIN_PASSWORD_HASH;
        
        if (fallbackEmail && fallbackPasswordHash && username === fallbackEmail) {
          try {
            isAuthenticated = await securityConfig.comparePassword(password, fallbackPasswordHash);
            if (isAuthenticated) {
              console.log(`ℹ️ Fallback admin authentication used for ${username}`);
              
              // Create a consistent user object for fallback admin
              const hashCode = username.split('').reduce((hash: number, char: string) => {
                return ((hash << 5) - hash) + char.charCodeAt(0);
              }, 0);
              
              dbUser = {
                id: Math.abs(hashCode) % 1000000, // Ensure positive ID under 1M
                username,
                password: fallbackPasswordHash // Store the hash, not the plain password
              };
            }
          } catch (error) {
            console.error('Fallback authentication error:', error);
          }
        }
      }
      
      // If authenticated, set up the session
      if (isAuthenticated && dbUser) {
        const user = { 
          id: String(dbUser.id), 
          username: username, 
          role: "admin" 
        };
        
        if (req.session) {
          req.session.user = user;
        }
        res.json({ user, success: true });
      } else {
        res.status(401).json({ message: "Invalid credentials" });
      }
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });


  const httpServer = createServer(app);

  return httpServer;
}
