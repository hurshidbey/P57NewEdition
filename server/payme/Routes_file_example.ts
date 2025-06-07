// server/routes.ts
import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertCategorySchema, insertProtocolSchema, insertPromptTemplateSchema } from "@shared/schema";
import { setupAuth } from "./auth"; // comparePasswords and hashPassword will be used from auth.ts
import { evaluatePrompt, getMemoryStats } from "./openai";
import { setupPaymeRoutes } from "./payme/routes-new";
import { setupPaymeWebhookRoutes } from "./payme/webhook-routes";
import { paymentRouter } from './payment-routes';

// Middleware to ensure user is authenticated
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated() || !req.user) { // Check req.user as well
    return res.status(401).json({ message: "Not authenticated" });
  }
  next();
};

// Admin middleware function to check if user is an admin
const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  console.log("Admin auth check - authenticated:", req.isAuthenticated());
  console.log("Admin auth check - user:", req.user ? `ID: ${req.user.id}, Role: ${req.user.role}` : 'No user');
  
  if (!req.isAuthenticated() || !req.user) {
    console.log("Admin auth failed - not authenticated");
    return res.status(401).json({ message: "Not authenticated" });
  }
  
  if (req.user.role !== "admin") {
    console.log(`Admin auth failed - wrong role: ${req.user.role}`);
    return res.status(403).json({ message: "Not authorized" });
  }
  
  console.log("Admin auth success");
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);
  
  // Set up Payme routes
  app.use(setupPaymeRoutes());
  
  // Set up Payme webhook endpoint
  app.use(setupPaymeWebhookRoutes());
  
  // Set up payment order routes
  app.use('/api/payment', paymentRouter);
  
  // Payment success page - where users return after completing payment on Payme
  app.get("/payment/success", async (req, res) => {
    // This is where users land after successful payment
    // You can add order verification logic here if needed
    res.redirect("/?payment=success");
  });

  // Create new payment order and redirect to Payme
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

  // Endpoint to change password
  app.post("/api/user/change-password", isAuthenticated, async (req, res, next) => {
    try {
      const { newPassword } = req.body;
      // No need for currentPassword if user is already authenticated by session
      // The 'isAuthenticated' middleware ensures req.user is present.

      if (!newPassword || newPassword.length < 8) {
        return res.status(400).json({ message: "Yangi parol kamida 8 ta belgidan iborat bo'lishi kerak" });
      }

      if (!req.user || !req.user.id) { // Should be guaranteed by isAuthenticated
          return res.status(401).json({ message: "Foydalanuvchi topilmadi" });
      }

      const success = await storage.updateUserPassword(req.user.id, newPassword);

      if (success) {
        // Update session user's isFirstLogin flag if necessary
        if (req.session && req.user) {
            req.user.isFirstLogin = false; 
            // Passport typically handles saving session changes, but explicit save can ensure it.
            req.session.save(err => {
                if (err) {
                    return next(err);
                }
                res.status(200).json({ message: "Parol muvaffaqiyatli o'zgartirildi" });
            });
        } else {
            res.status(200).json({ message: "Parol muvaffaqiyatli o'zgartirildi" });
        }
      } else {
        res.status(500).json({ message: "Parolni o'zgartirishda xatolik yuz berdi" });
      }
    } catch (err) {
      next(err);
    }
  });
  
  // Admin Routes
  app.get("/api/admin/users-for-approval", isAdmin, async (req, res) => {
    try {
      const users = await storage.getUsersForApproval();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users for approval:", error);
      res.status(500).json({ message: "Error fetching users for approval" });
    }
  });
  
  // Get all approved users
  app.get("/api/admin/approved-users", isAdmin, async (req, res) => {
    try {
      const users = await storage.getApprovedUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching approved users:", error);
      res.status(500).json({ message: "Error fetching approved users" });
    }
  });
  
  app.post("/api/admin/approve-user/:id", isAdmin, async (req, res) => {
    // ... (rest of admin routes as before)
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.approveUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error approving user:", error);
      res.status(500).json({ message: "Error approving user" });
    }
  });
  
  // Categories Routes (no changes needed here for this feature)
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Error fetching categories" });
    }
  });

  app.get("/api/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }

      const category = await storage.getCategoryById(id);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      res.json(category);
    } catch (error) {
      console.error("Error fetching category:", error);
      res.status(500).json({ message: "Error fetching category" });
    }
  });

  app.get("/api/categories/slug/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const category = await storage.getCategoryBySlug(slug);
      
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      res.json(category);
    } catch (error) {
      console.error("Error fetching category by slug:", error);
      res.status(500).json({ message: "Error fetching category" });
    }
  });

  app.post("/api/categories", isAdmin, async (req, res) => { // Added isAdmin for safety
    try {
      const result = insertCategorySchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid category data", errors: result.error.errors });
      }

      const category = await storage.createCategory(result.data);
      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Error creating category" });
    }
  });

  app.put("/api/categories/:id", isAdmin, async (req, res) => { // Added isAdmin for safety
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }

      const result = insertCategorySchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid category data", errors: result.error.errors });
      }

      const category = await storage.updateCategory(id, result.data);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      res.json(category);
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(500).json({ message: "Error updating category" });
    }
  });

  // Protocols Routes (no changes needed here for this feature)
  app.get("/api/protocols", async (req, res) => {
    try {
      const protocols = await storage.getProtocols();
      res.json(protocols);
    } catch (error) {
      console.error("Error fetching protocols:", error);
      res.status(500).json({ message: "Error fetching protocols" });
    }
  });

  app.get("/api/protocols/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid protocol ID" });
      }

      const protocol = await storage.getProtocolById(id);
      if (!protocol) {
        return res.status(404).json({ message: "Protocol not found" });
      }

      res.json(protocol);
    } catch (error) {
      console.error("Error fetching protocol:", error);
      res.status(500).json({ message: "Error fetching protocol" });
    }
  });

  app.get("/api/categories/:categoryId/protocols", async (req, res) => {
    try {
      const categoryId = parseInt(req.params.categoryId);
      if (isNaN(categoryId)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }

      const protocols = await storage.getProtocolsByCategory(categoryId);
      res.json(protocols);
    } catch (error) {
      console.error("Error fetching protocols by category:", error);
      res.status(500).json({ message: "Error fetching protocols" });
    }
  });

  app.post("/api/protocols", isAdmin, async (req, res) => { // Added isAdmin for safety
    try {
      const result = insertProtocolSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid protocol data", errors: result.error.errors });
      }

      const protocol = await storage.createProtocol(result.data);
      res.status(201).json(protocol);
    } catch (error) {
      console.error("Error creating protocol:", error);
      res.status(500).json({ message: "Error creating protocol" });
    }
  });

  app.put("/api/protocols/:id", isAdmin, async (req, res) => { // Added isAdmin for safety
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid protocol ID" });
      }

      const result = insertProtocolSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid protocol data", errors: result.error.errors });
      }

      const protocol = await storage.updateProtocol(id, result.data);
      if (!protocol) {
        return res.status(404).json({ message: "Protocol not found" });
      }

      res.json(protocol);
    } catch (error) {
      console.error("Error updating protocol:", error);
      res.status(500).json({ message: "Error updating protocol" });
    }
  });

  // User Progress, Favorites, Notes, Prompt Templates Routes
  // IMPORTANT: Secure these endpoints with `isAuthenticated` if they modify user-specific data.
  app.get("/api/progress/:userId", isAuthenticated, async (req, res) => {
    try {
      const userIdFromParam = parseInt(req.params.userId);
      if (isNaN(userIdFromParam) || (req.user && req.user.id !== userIdFromParam && req.user.role !== 'admin')) {
        return res.status(403).json({ message: "Not authorized to view this progress" });
      }
      const progress = await storage.getUserProgress(userIdFromParam);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching user progress:", error);
      res.status(500).json({ message: "Error fetching user progress" });
    }
  });

  app.post("/api/progress/:protocolId", isAuthenticated, async (req, res) => {
    try {
      const protocolId = parseInt(req.params.protocolId);
      if (isNaN(protocolId)) return res.status(400).json({ message: "Invalid protocol ID" });
      if (!req.user || !req.user.id) return res.status(401).json({message: "User not found"}); // Should not happen due to isAuthenticated

      const schema = z.object({ completed: z.boolean(), notes: z.string().optional() });
      const result = schema.safeParse(req.body);
      if (!result.success) return res.status(400).json({ message: "Invalid progress data", errors: result.error.errors });

      const completedAt = result.data.completed ? new Date() : null;
      const progress = await storage.createOrUpdateProgress({
        userId: req.user.id, protocolId, completed: result.data.completed, completedAt, notes: result.data.notes
      });
      res.status(201).json(progress);
    } catch (error) {
      console.error("Error updating progress:", error);
      res.status(500).json({ message: "Error updating progress" });
    }
  });

  // Favorites Routes
  app.get("/api/favorites/:userId", isAuthenticated, async (req, res) => {
    try {
      const userIdFromParam = parseInt(req.params.userId);
      if (isNaN(userIdFromParam) || (req.user && req.user.id !== userIdFromParam && req.user.role !== 'admin')) {
        return res.status(403).json({ message: "Not authorized to view these favorites" });
      }
      const favorites = await storage.getUserFavorites(userIdFromParam);
      res.json(favorites);
    } catch (error) {
      console.error("Error fetching user favorites:", error);
      res.status(500).json({ message: "Error fetching user favorites" });
    }
  });

  app.post("/api/favorites/:protocolId", isAuthenticated, async (req, res) => {
    try {
      const protocolId = parseInt(req.params.protocolId);
      if (isNaN(protocolId)) return res.status(400).json({ message: "Invalid protocol ID" });
      if (!req.user || !req.user.id) return res.status(401).json({message: "User not found"});

      const favorite = await storage.addFavorite({ userId: req.user.id, protocolId });
      res.status(201).json(favorite);
    } catch (error) {
      console.error("Error adding favorite:", error);
      res.status(500).json({ message: "Error adding favorite" });
    }
  });

  app.delete("/api/favorites/:protocolId", isAuthenticated, async (req, res) => {
    try {
      const protocolId = parseInt(req.params.protocolId);
      if (isNaN(protocolId)) return res.status(400).json({ message: "Invalid protocol ID" });
      if (!req.user || !req.user.id) return res.status(401).json({message: "User not found"});

      const success = await storage.removeFavorite(req.user.id, protocolId);
      if (!success) {
        return res.status(404).json({ message: "Favorite not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error removing favorite:", error);
      res.status(500).json({ message: "Error removing favorite" });
    }
  });

  // Prompt Templates Routes
  app.get("/api/templates", isAuthenticated, async (req, res) => {
    try {
      if (!req.user || !req.user.id) return res.status(401).json({message: "User not found"});
      
      const templates = await storage.getPromptTemplates(req.user.id);
      res.json(templates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      res.status(500).json({ message: "Error fetching templates" });
    }
  });

  app.get("/api/templates/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid template ID" });
      
      const template = await storage.getPromptTemplateById(id);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      // Only allow users to access their own templates unless they're an admin
      if (!req.user || (template.userId !== req.user.id && req.user.role !== 'admin')) {
        return res.status(403).json({ message: "Not authorized to view this template" });
      }
      
      res.json(template);
    } catch (error) {
      console.error("Error fetching template:", error);
      res.status(500).json({ message: "Error fetching template" });
    }
  });

  app.post("/api/templates", isAuthenticated, async (req, res) => {
    try {
      if (!req.user || !req.user.id) return res.status(401).json({message: "User not found"});
      
      const result = insertPromptTemplateSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid template data", errors: result.error.errors });
      }
      
      const templateData = {
        ...result.data,
        userId: req.user.id
      };
      
      const template = await storage.createPromptTemplate(templateData);
      res.status(201).json(template);
    } catch (error) {
      console.error("Error creating template:", error);
      res.status(500).json({ message: "Error creating template" });
    }
  });

  app.put("/api/templates/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid template ID" });
      
      const template = await storage.getPromptTemplateById(id);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      // Only allow users to update their own templates unless they're an admin
      if (!req.user || (template.userId !== req.user.id && req.user.role !== 'admin')) {
        return res.status(403).json({ message: "Not authorized to update this template" });
      }
      
      const result = insertPromptTemplateSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid template data", errors: result.error.errors });
      }
      
      const updatedTemplate = await storage.updatePromptTemplate(id, result.data);
      res.json(updatedTemplate);
    } catch (error) {
      console.error("Error updating template:", error);
      res.status(500).json({ message: "Error updating template" });
    }
  });

  app.delete("/api/templates/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid template ID" });
      
      const template = await storage.getPromptTemplateById(id);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      // Only allow users to delete their own templates unless they're an admin
      if (!req.user || (template.userId !== req.user.id && req.user.role !== 'admin')) {
        return res.status(403).json({ message: "Not authorized to delete this template" });
      }
      
      const success = await storage.deletePromptTemplate(id);
      if (!success) {
        return res.status(500).json({ message: "Error deleting template" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting template:", error);
      res.status(500).json({ message: "Error deleting template" });
    }
  });

  // AI Evaluation route
  app.post("/api/evaluate-prompt", isAuthenticated, async (req, res) => {
    try {
      const { prompt, protocolId, protocolTitle, protocolDescription, goodExample, badExample } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ message: "Prompt text is required" });
      }
      
      if (!protocolId) {
        return res.status(400).json({ message: "Protocol ID is required" });
      }
      
      const evaluation = await evaluatePrompt(
        prompt,
        protocolId,
        protocolTitle || "",
        protocolDescription || "",
        goodExample || "",
        badExample || ""
      );
      
      res.json(evaluation);
    } catch (error) {
      console.error("Error evaluating prompt:", error);
      res.status(500).json({ message: "Error evaluating prompt" });
    }
  });

  // Create server
  const server = createServer(app);
  return server;
}