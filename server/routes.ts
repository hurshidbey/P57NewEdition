import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProtocolSchema } from "@shared/schema";
import { evaluatePrompt } from "./openai-service";
import { z } from "zod";
import { setupPaymeRoutes } from "./payme/routes-new";
import { setupPaymeWebhookRoutes } from "./payme/webhook-routes";
import { setupAtmosRoutes } from "./atmos-routes";

// Define user interface for our application
interface AppUser {
  id: number;
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

// Admin middleware function to check if user is an admin
const isAdmin = (req: any, res: Response, next: NextFunction) => {
  console.log("Admin auth check - user:", req.session?.user ? `ID: ${req.session.user.id}, Role: ${req.session.user.role}` : 'No user');
  
  if (!req.session?.user) {
    console.log("Admin auth failed - not authenticated");
    return res.status(401).json({ message: "Not authenticated" });
  }
  
  if (req.session.user.role !== "admin") {
    console.log(`Admin auth failed - wrong role: ${req.session.user.role}`);
    return res.status(403).json({ message: "Not authorized" });
  }
  
  console.log("Admin auth success");
  next();
};

// Basic setupAuth function - this will be enhanced with proper authentication later
const setupAuth = (app: Express) => {
  // Session middleware setup would go here
  // For now, this is a placeholder that can be enhanced with passport.js or similar
  console.log("Auth setup initialized - basic session-based auth");
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);
  
  // Set up Payme routes
  app.use(setupPaymeRoutes());
  
  // Set up Payme webhook endpoint
  app.use(setupPaymeWebhookRoutes());
  
  // Set up ATMOS payment routes
  app.use('/api', setupAtmosRoutes());
  
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
  
  // Get all protocols with pagination
  app.get("/api/protocols", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const search = req.query.search as string;
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;

      let protocols;
      if (search) {
        protocols = await storage.searchProtocols(search);
        if (categoryId) {
          protocols = protocols.filter(p => p.categoryId === categoryId);
        }
        protocols = protocols.slice(offset, offset + limit);
      } else {
        protocols = await storage.getProtocols(limit, offset);
        if (categoryId) {
          protocols = protocols.filter(p => p.categoryId === categoryId);
        }
      }

      res.json(protocols);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch protocols" });
    }
  });

  // Get single protocol
  app.get("/api/protocols/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const protocol = await storage.getProtocol(id);
      
      if (!protocol) {
        return res.status(404).json({ message: "Protocol not found" });
      }
      
      res.json(protocol);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch protocol" });
    }
  });

  // Create new protocol
  app.post("/api/protocols", async (req, res) => {
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
  app.put("/api/protocols/:id", async (req, res) => {
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
  app.delete("/api/protocols/:id", async (req, res) => {
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

  // Get all categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
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
      console.error("Evaluation error:", error);
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
      console.error('OpenAI test error:', error);
      res.status(500).json({
        connected: false,
        error: error.message,
        apiKeyPresent: !!process.env.OPENAI_API_KEY
      });
    }
  });

  // Get user progress
  app.get("/api/progress/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const result = await storage.getUserProgress(userId);
      res.json(result);
    } catch (error: any) {
      console.error('Error fetching user progress:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Update protocol progress
  app.post("/api/progress/:userId/:protocolId", async (req, res) => {
    try {
      const { userId, protocolId } = req.params;
      const { score } = req.body;
      
      const result = await storage.updateProtocolProgress(
        userId, 
        parseInt(protocolId), 
        score
      );
      
      res.json(result);
    } catch (error: any) {
      console.error('Error updating protocol progress:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Simple auth endpoint (basic implementation)
  app.post("/api/auth/login", async (req: any, res) => {
    try {
      const { username, password } = req.body;
      
      if ((username === "admin" && password === "admin123") || 
          (username === "hurshidbey@gmail.com" && password === "20031000a")) {
        // Set up session for authenticated user
        const userId = username === "admin" ? 1 : 2;
        const user = { 
          id: userId, 
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

  // Payment success page - where users return after completing payment on Payme
  app.get("/payment/success", async (req, res) => {
    // This is where users land after successful payment
    // You can add order verification logic here if needed
    res.redirect("/?payment=success");
  });

  // Create new payment order and redirect to Payme
  app.post("/api/payment/create-order", isAuthenticated, async (req: any, res) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      // Generate unique order ID with timestamp
      const orderId = `ORDER-${Date.now()}-${req.user.id}`;
      
      // Fixed amount for platform access (149,000 UZS = 14,900,000 tiyins)
      const amount = 14900000;
      
      // Create order in database (this will need to be implemented in storage)
      // For now, we'll simulate this - to be implemented when storage is updated
      const order = {
        order_id: orderId,
        user_id: req.user.id,
        amount: amount,
        status: 'pending'
      };
      
      const merchantId = process.env.PAYME_MERCHANT_ID;
      
      if (!merchantId) {
        return res.status(500).json({ message: "Payment system configuration error" });
      }
      
      // Create payment URL using the exact format Payme expects
      // Based on the error URL, Payme expects: m=merchant&a=amount&o=order_id format
      const paymeParams = `m=${merchantId};a=${amount};o=${orderId}`;
      const encodedParams = Buffer.from(paymeParams).toString('base64');
      
      // Try production checkout URL as many merchants only work with production even in test mode
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

  const httpServer = createServer(app);
  return httpServer;
}
