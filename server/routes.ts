import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { hybridPromptsStorage } from "./hybrid-storage";
import { insertProtocolSchema, insertPromptSchema, users } from "@shared/schema";
import { evaluatePrompt } from "./openai-service";
import { z } from "zod";
import { setupAtmosRoutes } from "./atmos-routes";
import { eq } from "drizzle-orm";

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

// Admin middleware function to check if user is an admin (using Supabase auth)
const isSupabaseAdmin = async (req: any, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    );
    
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    // Only allow admin users
    const adminEmails = [
      process.env.ADMIN_EMAIL,
      'hurshidbey@gmail.com',
      'mustafaabdurahmonov7777@gmail.com'
    ].filter(Boolean); // Remove any undefined values
    
    if (!adminEmails.includes(user.email)) {
      return res.status(403).json({ error: 'Access denied - admin only' });
    }
    
    req.user = user;
    next();
  } catch (error: any) {

    res.status(500).json({ error: 'Authentication failed' });
  }
};

// Admin middleware function to check if user is an admin (legacy session-based)
const isAdmin = (req: any, res: Response, next: NextFunction) => {

  if (!req.session?.user) {

    return res.status(401).json({ message: "Not authenticated" });
  }
  
  if (req.session.user.role !== "admin") {

    return res.status(403).json({ message: "Not authorized" });
  }

  next();
};

// Basic setupAuth function - this will be enhanced with proper authentication later
const setupAuth = (app: Express) => {
  // Session middleware setup would go here
  // For now, this is a placeholder that can be enhanced with passport.js or similar

};

export async function registerRoutes(app: Express): Promise<Server> {

  // Set up authentication routes
  setupAuth(app);

  // Set up ATMOS payment routes
  app.use('/api', setupAtmosRoutes());
  
  // Enhanced health check endpoint with comprehensive metrics
  app.get("/api/health", async (req, res) => {
    try {
      const memUsage = process.memoryUsage();
      const startTime = Date.now();
      
      const health = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'unknown',
        uptime: {
          seconds: Math.floor(process.uptime()),
          formatted: formatUptime(process.uptime())
        },
        memory: {
          used: Math.round(memUsage.heapUsed / 1024 / 1024),
          total: Math.round(memUsage.heapTotal / 1024 / 1024),
          rss: Math.round(memUsage.rss / 1024 / 1024),
          external: Math.round(memUsage.external / 1024 / 1024),
          percentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100)
        },
        database: {
          connected: false,
          supabase: false,
          memory: false,
          responseTime: null as number | null
        },
        performance: {
          responseTime: null as number | null,
          cpuUsage: process.cpuUsage(),
          platform: process.platform,
          nodeVersion: process.version
        },
        services: {
          api: 'ok',
          storage: 'unknown'
        }
      };
      
      // Test database connectivity and measure response time
      const dbStartTime = Date.now();
      try {
        if ((storage as any).isHealthy) {
          health.database.connected = await (storage as any).isHealthy();
          health.database.responseTime = Date.now() - dbStartTime;
        }
        
        // Check specific connection types
        if ((global as any).supabaseStorage) {
          health.database.supabase = true;
          health.services.storage = 'supabase';
        } else if (health.database.connected) {
          health.services.storage = 'database';
        } else {
          health.services.storage = 'memory';
        }
        
        // Always have memory storage as backup
        health.database.memory = true;
        
      } catch (dbError) {
        health.database.connected = false;
        health.database.responseTime = Date.now() - dbStartTime;
        health.services.storage = 'error';
      }
      
      // Calculate total response time
      health.performance.responseTime = Date.now() - startTime;
      
      // Determine overall status
      if (!health.database.connected && !health.database.memory) {
        health.status = 'degraded';
      } else if (health.memory.percentage > 90) {
        health.status = 'warning';
      }
      
      // Set appropriate HTTP status
      const httpStatus = health.status === 'ok' ? 200 : 
                        health.status === 'warning' ? 200 : 503;
      
      res.status(httpStatus).json(health);
    } catch (error) {
      res.status(500).json({
        status: 'error',
        timestamp: new Date().toISOString(),
        error: (error as Error).message,
        stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
      });
    }
  });
  
  // Add cache control for API routes in development
  if (process.env.NODE_ENV === "development") {
    app.use("/api/*", (req, res, next) => {
      res.set({
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      next();
    });
  }
  
  // Get all protocols with pagination and tier-based filtering
  app.get("/api/protocols", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const difficulty = req.query.difficulty as string;

      let protocols;
      
      // If difficulty filter is applied, get all protocols first
      if (difficulty) {
        protocols = await storage.getProtocols(1000, 0); // Get all protocols
      } else {
        protocols = await storage.getProtocols(limit, offset);
      }

      // Apply difficulty filter based on protocol number ranges
      if (difficulty) {
        protocols = protocols.filter(p => {
          if (difficulty === "BEGINNER") return p.number >= 1 && p.number <= 20;
          if (difficulty === "ORTA DARAJA") return p.number >= 21 && p.number <= 40;
          if (difficulty === "YUQORI DARAJA") return p.number >= 41 && p.number <= 57;
          return true;
        });
      }

      // Apply tier-based filtering
      const authHeader = req.headers.authorization;
      let userTier = 'free'; // Default to free tier
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
          const token = authHeader.split(' ')[1];
          const { createClient } = await import('@supabase/supabase-js');
          const supabase = createClient(
            'https://bazptglwzqstppwlvmvb.supabase.co',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhenB0Z2x3enFzdHBwd2x2bXZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwMTc1OTAsImV4cCI6MjA2NDU5MzU5MH0.xRh0LCDWP6YD3F4mDGrIK3krwwZw-DRx0iXy7MmIPY8'
          );
          
          const { data: { user }, error } = await supabase.auth.getUser(token);
          if (user && !error) {
            // CRITICAL FIX: Check if user is admin first
            if (user.email === 'hurshidbey@gmail.com' || user.email === 'mustafaabdurahmonov7777@gmail.com') {
              userTier = 'admin'; // Special tier for admin
            } else {
              // Check user tier from metadata - new users default to free tier
              userTier = user.user_metadata?.tier || 'free'; // New users are free by default
            }
          }
        } catch (error) {

        }
      }
      
      // Free users see ALL protocols, but some are marked as locked
      // Paid users see all protocols unlocked
      // No filtering here - the frontend will handle lock/unlock UI

      // Apply pagination after filtering
      if (difficulty) {
        protocols = protocols.slice(offset, offset + limit);
      }

      res.json(protocols);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch protocols" });
    }
  });

  // Get single protocol with tier-based access control
  app.get("/api/protocols/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const protocol = await storage.getProtocol(id);
      
      if (!protocol) {
        return res.status(404).json({ message: "Protocol not found" });
      }
      
      // Check user tier for access control
      const authHeader = req.headers.authorization;
      let userTier = 'free'; // Default to free tier
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
          const token = authHeader.split(' ')[1];
          const { createClient } = await import('@supabase/supabase-js');
          const supabase = createClient(
            'https://bazptglwzqstppwlvmvb.supabase.co',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhenB0Z2x3enFzdHBwd2x2bXZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwMTc1OTAsImV4cCI6MjA2NDU5MzU5MH0.xRh0LCDWP6YD3F4mDGrIK3krwwZw-DRx0iXy7MmIPY8'
          );
          
          const { data: { user }, error } = await supabase.auth.getUser(token);
          if (user && !error) {
            // CRITICAL FIX: Check if user is admin first
            if (user.email === 'hurshidbey@gmail.com' || user.email === 'mustafaabdurahmonov7777@gmail.com') {
              userTier = 'admin'; // Special tier for admin
            } else {
              userTier = user.user_metadata?.tier || 'free'; // New users are free by default
            }
          }
        } catch (error) {

        }
      }
      
      // Add user tier info to response so frontend can handle locking
      const protocolWithTier = { ...protocol, userTier };
      
      res.json(protocolWithTier);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch protocol" });
    }
  });

  // Create new protocol
  app.post("/api/protocols", isSupabaseAdmin, async (req, res) => {
    try {
      const validatedData = insertProtocolSchema.parse(req.body);
      const protocol = await storage.createProtocol(validatedData);
      res.status(201).json(protocol);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create protocol" });
    }
  });

  // Update protocol
  app.put("/api/protocols/:id", isSupabaseAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertProtocolSchema.partial().parse(req.body);
      const protocol = await storage.updateProtocol(id, validatedData);
      
      if (!protocol) {
        return res.status(404).json({ message: "Protocol not found" });
      }
      
      res.json(protocol);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update protocol" });
    }
  });

  // Delete protocol
  app.delete("/api/protocols/:id", isSupabaseAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteProtocol(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Protocol not found" });
      }
      
      res.json({ message: "Protocol deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete protocol" });
    }
  });

  // Toggle protocol free access status (Admin only)
  app.patch("/api/admin/protocols/:id/toggle-free", isSupabaseAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { isFreeAccess } = req.body;
      
      if (typeof isFreeAccess !== 'boolean') {
        return res.status(400).json({ message: "isFreeAccess must be a boolean" });
      }
      
      // If setting to free, check current count of free protocols
      if (isFreeAccess) {
        const allProtocols = await storage.getProtocols(1000, 0);
        const currentFreeCount = allProtocols.filter(p => p.isFreeAccess && p.id !== id).length;
        
        if (currentFreeCount >= 3) {
          return res.status(400).json({ 
            message: "Maximum 3 protocols can be free. Please remove free access from another protocol first.",
            currentFreeCount
          });
        }
      }
      
      const updated = await storage.updateProtocol(id, { isFreeAccess });
      
      if (!updated) {
        return res.status(404).json({ message: "Protocol not found" });
      }
      
      res.json(updated);
    } catch (error) {

      res.status(500).json({ message: "Failed to update protocol free access" });
    }
  });

  // Get all protocols for admin (no filtering) - CRITICAL FIX
  app.get("/api/admin/protocols", isSupabaseAdmin, async (req, res) => {
    try {
      const protocols = await storage.getProtocols(1000, 0); // Get all protocols without any filtering
      res.json(protocols);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch protocols for admin" });
    }
  });

  // Get free protocols count and list (Admin only)
  app.get("/api/admin/protocols/free-status", isSupabaseAdmin, async (req, res) => {
    try {
      const allProtocols = await storage.getProtocols(1000, 0);
      const freeProtocols = allProtocols.filter(p => p.isFreeAccess);
      
      res.json({
        freeCount: freeProtocols.length,
        maxFreeAllowed: 3,
        freeProtocols: freeProtocols.map(p => ({
          id: p.id,
          number: p.number,
          title: p.title
        }))
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch free protocols status" });
    }
  });

  // Admin: Create protocol
  app.post("/api/admin/protocols", isSupabaseAdmin, async (req, res) => {
    try {
      const validatedData = insertProtocolSchema.parse(req.body);
      
      const protocol = await storage.createProtocol(validatedData);
      
      res.status(201).json(protocol);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create protocol" });
    }
  });

  // Admin: Update protocol
  app.put("/api/admin/protocols/:id", isSupabaseAdmin, async (req, res) => {
    try {
      const protocolId = parseInt(req.params.id);
      
      if (isNaN(protocolId)) {
        return res.status(400).json({ message: "Invalid protocol ID" });
      }
      
      const validatedData = insertProtocolSchema.partial().parse(req.body);
      
      const protocol = await storage.updateProtocol(protocolId, validatedData);
      
      if (!protocol) {
        return res.status(404).json({ message: "Protocol not found" });
      }
      
      res.json(protocol);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update protocol" });
    }
  });

  // Admin: Delete protocol
  app.delete("/api/admin/protocols/:id", isSupabaseAdmin, async (req, res) => {
    try {
      const protocolId = parseInt(req.params.id);
      
      if (isNaN(protocolId)) {
        return res.status(400).json({ message: "Invalid protocol ID" });
      }
      
      const success = await storage.deleteProtocol(protocolId);
      
      if (!success) {
        return res.status(404).json({ message: "Protocol not found" });
      }
      
      res.json({ message: "Protocol deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete protocol" });
    }
  });

  // Get all categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Get prompts (filtered by user tier) - Fast JSON reads
  app.get("/api/prompts", async (req, res) => {
    try {
      const { userTier = 'free' } = req.query;
      const prompts = await hybridPromptsStorage.getPrompts(userTier as string);
      res.json(prompts);
    } catch (error) {

      res.status(500).json({ message: "Failed to fetch prompts" });
    }
  });

  // Get single prompt (with tier validation) - Fast JSON reads
  app.get("/api/prompts/:id", async (req, res) => {
    try {
      const promptId = parseInt(req.params.id);
      const { userTier = 'free' } = req.query;
      
      if (isNaN(promptId)) {
        return res.status(400).json({ message: "Invalid prompt ID" });
      }
      
      const prompt = await hybridPromptsStorage.getPrompt(promptId, userTier as string);
      
      if (!prompt) {
        return res.status(404).json({ message: "Prompt not found" });
      }
      
      res.json(prompt);
    } catch (error) {

      res.status(500).json({ message: "Failed to fetch prompt" });
    }
  });

  // Admin: Create prompt - Database + JSON sync
  app.post("/api/admin/prompts", isSupabaseAdmin, async (req, res) => {
    try {
      const validatedData = insertPromptSchema.parse(req.body);
      
      const prompt = await hybridPromptsStorage.createPrompt(validatedData);
      
      res.status(201).json(prompt);
    } catch (error) {

      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create prompt" });
    }
  });

  // Admin: Update prompt - Database + JSON sync
  app.put("/api/admin/prompts/:id", isSupabaseAdmin, async (req, res) => {
    try {
      const promptId = parseInt(req.params.id);
      
      if (isNaN(promptId)) {
        return res.status(400).json({ message: "Invalid prompt ID" });
      }
      
      const validatedData = insertPromptSchema.partial().parse(req.body);
      
      const prompt = await hybridPromptsStorage.updatePrompt(promptId, validatedData);
      
      if (!prompt) {
        return res.status(404).json({ message: "Prompt not found" });
      }
      
      res.json(prompt);
    } catch (error) {

      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update prompt" });
    }
  });

  // Admin: Delete prompt - Database + JSON sync
  app.delete("/api/admin/prompts/:id", isSupabaseAdmin, async (req, res) => {
    try {
      const promptId = parseInt(req.params.id);
      
      if (isNaN(promptId)) {
        return res.status(400).json({ message: "Invalid prompt ID" });
      }
      
      const success = await hybridPromptsStorage.deletePrompt(promptId);
      
      if (!success) {
        return res.status(404).json({ message: "Prompt not found" });
      }
      
      res.json({ message: "Prompt deleted successfully" });
    } catch (error) {

      res.status(500).json({ message: "Failed to delete prompt" });
    }
  });

  // Admin: Get all prompts (no filtering) - Fresh database data
  app.get("/api/admin/prompts", isSupabaseAdmin, async (req, res) => {
    try {
      const prompts = await hybridPromptsStorage.getAllPrompts();
      res.json(prompts);
    } catch (error) {

      res.status(500).json({ message: "Failed to fetch prompts" });
    }
  });

  // Simple test endpoint to verify API routing works
  app.get("/api/test", (req, res) => {
    res.json({ 
      message: "API routes are working!", 
      timestamp: new Date().toISOString(),
      route: "/api/test" 
    });
  });

  // Test endpoint: Direct Supabase connection (no auth required)
  app.get("/api/test/prompts", async (req, res) => {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        'https://bazptglwzqstppwlvmvb.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhenB0Z2x3enFzdHBwd2x2bXZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTAxNzU5MCwiZXhwIjoyMDY0NTkzNTkwfQ.GdDEVx5CRy1NC_2e5QbtCKcXZmoEL1z2RU7SlHA_-oQ'
      );
      
      const { userTier = 'free' } = req.query;
      
      let query = supabase.from('prompts').select('*');
      
      if (userTier === 'free') {
        query = query.eq('is_public', true).eq('is_premium', false);
      } else {
        query = query.eq('is_public', true);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) {
        return res.status(500).json({ error: error.message });
      }
      
      res.json({
        userTier,
        count: data.length,
        prompts: data
      });
      
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Evaluate user prompt against a protocol
  app.post("/api/protocols/:id/evaluate", async (req, res) => {
    try {
      const protocolId = parseInt(req.params.id);
      const { prompt } = req.body;

      if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
        return res.status(400).json({ message: "Prompt is required" });
      }

      if (prompt.length > 300) {
        return res.status(400).json({ message: "Prompt too long (max 300 characters)" });
      }

      const protocol = await storage.getProtocol(protocolId);
      if (!protocol) {
        return res.status(404).json({ message: "Protocol not found" });
      }

      const evaluation = await evaluatePrompt(prompt.trim(), protocol);
      res.json(evaluation);
    } catch (error) {

      res.status(500).json({ message: "Failed to evaluate prompt" });
    }
  });

  // Test Supabase connection endpoint
  app.get("/api/test-supabase", async (req, res) => {
    try {
      // This will test if we can connect to Supabase from the server
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        'https://bazptglwzqstppwlvmvb.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhenB0Z2x3enFzdHBwd2x2bXZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwMTc1OTAsImV4cCI6MjA2NDU5MzU5MH0.xRh0LCDWP6YD3F4mDGrIK3krwwZw-DRx0iXy7MmIPY8'
      );
      
      const { data, error } = await supabase.auth.getSession();
      
      res.json({
        connected: !error,
        error: error?.message,
        sessionExists: !!data.session
      });
    } catch (error: any) {
      res.status(500).json({ 
        connected: false, 
        error: error.message 
      });
    }
  });

  // Test OpenAI connection endpoint
  app.get("/api/test-openai", async (req, res) => {
    try {
      const { testOpenAIConnection } = await import('./openai-service');
      const isConnected = await testOpenAIConnection();
      
      res.json({
        connected: isConnected,
        message: isConnected ? 'OpenAI connection successful' : 'OpenAI connection failed',
        apiKeyPresent: !!process.env.OPENAI_API_KEY,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {

      res.status(500).json({
        connected: false,
        error: error.message,
        apiKeyPresent: !!process.env.OPENAI_API_KEY
      });
    }
  });

  // Get user progress (with Supabase auth verification)
  app.get("/api/progress/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      
      // Verify Supabase JWT token
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No authorization token provided' });
      }
      
      const token = authHeader.split(' ')[1];
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        'https://bazptglwzqstppwlvmvb.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhenB0Z2x3enFzdHBwd2x2bXZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwMTc1OTAsImV4cCI6MjA2NDU5MzU5MH0.xRh0LCDWP6YD3F4mDGrIK3krwwZw-DRx0iXy7MmIPY8'
      );
      
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (error || !user) {
        return res.status(401).json({ error: 'Invalid token' });
      }
      
      // Only allow users to access their own progress
      if (user.id !== userId) {
        return res.status(403).json({ error: 'Access denied - can only access own progress' });
      }
      
      const result = await storage.getUserProgress(userId);
      res.json(result);
    } catch (error: any) {

      res.status(500).json({ error: error.message });
    }
  });

  // Update protocol progress (with Supabase auth verification)
  app.post("/api/progress/:userId/:protocolId", async (req, res) => {
    try {
      const { userId, protocolId } = req.params;
      const { score } = req.body;
      
      // Verify Supabase JWT token
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No authorization token provided' });
      }
      
      const token = authHeader.split(' ')[1];
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        'https://bazptglwzqstppwlvmvb.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhenB0Z2x3enFzdHBwd2x2bXZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwMTc1OTAsImV4cCI6MjA2NDU5MzU5MH0.xRh0LCDWP6YD3F4mDGrIK3krwwZw-DRx0iXy7MmIPY8'
      );
      
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (error || !user) {
        return res.status(401).json({ error: 'Invalid token' });
      }
      
      // Only allow users to update their own progress
      if (user.id !== userId) {
        return res.status(403).json({ error: 'Access denied - can only update own progress' });
      }
      
      const result = await storage.updateProtocolProgress(
        userId, 
        parseInt(protocolId), 
        score
      );
      
      res.json(result);
    } catch (error: any) {

      res.status(500).json({ error: error.message });
    }
  });

  // Admin: Get all users
  app.get("/api/admin/users", isSupabaseAdmin, async (req, res) => {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_KEY!
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
  app.get("/api/admin/payments", isSupabaseAdmin, async (req, res) => {
    try {
      const payments = await storage.getPayments();
      console.log(`📊 [ADMIN] Retrieved ${payments.length} payment records`);
      res.json(payments);
    } catch (error: any) {
      console.error(`❌ [ADMIN] Failed to get payments:`, error);
      res.status(500).json({ error: error.message });
    }
  });

  // Simple auth endpoint (basic implementation)
  app.post("/api/auth/login", async (req: any, res) => {
    try {
      const { username, password } = req.body;
      
      // Check if credentials match known users
      if ((username === "admin" && password === "admin123") || 
          (username === "hurshidbey@gmail.com" && password === "20031000a")) {
        
        // Try to find or create user in database
        let dbUser;
        try {
          // First try to find existing user
          dbUser = await storage.getUserByUsername(username);
          
          if (!dbUser) {
            // Create new user if doesn't exist
            dbUser = await storage.createUser({
              username,
              password // In production, this should be hashed!
            });
          }
        } catch (dbError) {

          // Fallback to consistent IDs if DB fails
          // Create a consistent hash-based ID for users when DB is unavailable
          const hashCode = username.split('').reduce((hash: number, char: string) => {
            return ((hash << 5) - hash) + char.charCodeAt(0);
          }, 0);
          
          dbUser = {
            id: Math.abs(hashCode) % 1000000, // Ensure positive ID under 1M
            username,
            password
          };
        }
        
        // Set up session for authenticated user
        const user = { 
          id: String(dbUser?.id || (username === "admin" ? 1 : 2)), 
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

  // Admin: Get all users
  app.get("/api/admin/users", isSupabaseAdmin, async (req, res) => {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      
      const { data: users, error } = await supabase.auth.admin.listUsers();
      if (error) throw error;
      
      const formattedUsers = users.users.map(user => ({
        id: user.id,
        email: user.email,
        tier: user.user_metadata?.tier || 'free',
        createdAt: user.created_at,
        paidAt: user.user_metadata?.paidAt || null
      }));
      
      res.json(formattedUsers);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Admin: Get all payments
  app.get("/api/admin/payments", isSupabaseAdmin, async (req, res) => {
    try {
      const payments = await storage.getPayments();
      res.json(payments || []);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
