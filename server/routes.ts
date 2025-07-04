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
      process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role key for admin operations
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
    return res.status(403).json({ message: "Access denied - admin only" });
  }
  
  req.user = req.session.user;
  next();
};

export function setupRoutes(app: Express): Server {
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

  // Get user progress
  app.get("/api/progress/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const progress = await storage.getUserProgress(userId);
      res.json(progress);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch progress", error: error.message });
    }
  });

  // Update protocol progress
  app.post("/api/progress/:userId/:protocolId", async (req, res) => {
    try {
      const { userId, protocolId } = req.params;
      const { score } = req.body;
      
      const progress = await storage.updateProtocolProgress(
        userId, 
        parseInt(protocolId), 
        score || 70
      );
      
      res.json(progress);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to update progress", error: error.message });
    }
  });

  // Delete protocol progress
  app.delete("/api/progress/:userId/:protocolId", async (req, res) => {
    try {
      const { userId, protocolId } = req.params;
      
      const result = await storage.deleteProtocolProgress(
        userId, 
        parseInt(protocolId)
      );
      
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to delete progress", error: error.message });
    }
  });

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
      
      // For demo purposes, we'll use a simple password check
      // In production, use proper password hashing (bcrypt, etc.)
      const validPassword = password === user.password;
      
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
  app.get("/api/auth/me", (req, res) => {
    if (!req.session?.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.json({ user: req.session.user });
  });

  // Admin routes for protocol management
  app.post("/api/admin/protocols", isSupabaseAdmin, async (req, res) => {
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

  app.put("/api/admin/protocols/:id", isSupabaseAdmin, async (req, res) => {
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

  app.delete("/api/admin/protocols/:id", isSupabaseAdmin, async (req, res) => {
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

  // Prompts endpoints
  app.get("/api/prompts", async (req, res) => {
    try {
      const userTier = (req.query.tier as string) || 'free';
      const prompts = await hybridPromptsStorage.getPrompts(userTier);
      res.json(prompts);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch prompts", error: error.message });
    }
  });

  app.get("/api/prompts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
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
  app.get("/api/admin/prompts", isSupabaseAdmin, async (req, res) => {
    try {
      const prompts = await hybridPromptsStorage.getAllPrompts();
      res.json(prompts);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch prompts", error: error.message });
    }
  });

  app.post("/api/admin/prompts", isSupabaseAdmin, async (req, res) => {
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

  app.put("/api/admin/prompts/:id", isSupabaseAdmin, async (req, res) => {
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

  app.delete("/api/admin/prompts/:id", isSupabaseAdmin, async (req, res) => {
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
  setupAtmosRoutes(app);

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

  // Delete protocol progress (with Supabase auth verification)
  app.delete("/api/progress/:userId/:protocolId", async (req, res) => {
    try {
      const { userId, protocolId } = req.params;
      
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
      
      // Only allow users to delete their own progress
      if (user.id !== userId) {
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
  app.get("/api/admin/users", isSupabaseAdmin, async (req, res) => {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY! // Fixed: Use correct env var name
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


  const httpServer = createServer(app);

  return httpServer;
}
