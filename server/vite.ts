import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`[${formattedTime}] [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as true,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
  viteLogger.error(msg, options);
        // Don't exit in production, just log the error
        if (process.env.NODE_ENV !== 'production') {
          process.exit(1);
        }
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    
    // Skip API routes and let them be handled by Express
    if (url.startsWith('/api/') || url.startsWith('/health')) {
      return next();
    }

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ 
        "Content-Type": "text/html",
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
      }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(process.cwd(), "dist", "public");

  console.log(`[serveStatic] Directory exists: ${fs.existsSync(distPath)}`);
  
  // List contents if directory exists
  if (fs.existsSync(distPath)) {
    try {
      const files = fs.readdirSync(distPath);

    } catch (err) {

    }
  }

  if (!fs.existsSync(distPath)) {

    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // Serve static files with proper caching headers
  app.use(express.static(distPath, {
    maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0,
    etag: true,
    lastModified: true
  }));

  // fall through to index.html if the file doesn't exist, but NOT for API routes or assets
  app.use((req, res, next) => {
    // Skip this catch-all for API routes
    if (req.originalUrl.startsWith('/api/')) {

      return next();
    }
    
    // Skip this catch-all for static assets
    if (req.originalUrl.includes('/assets/') || 
        req.originalUrl.endsWith('.js') || 
        req.originalUrl.endsWith('.css') || 
        req.originalUrl.endsWith('.png') || 
        req.originalUrl.endsWith('.jpg') || 
        req.originalUrl.endsWith('.svg') ||
        req.originalUrl.endsWith('.ico')) {
      return next();
    }
    
    const indexPath = path.resolve(distPath, "index.html");

    if (!fs.existsSync(indexPath)) {

      return res.status(500).json({ error: 'Application not built properly' });
    }
    
    res.sendFile(indexPath, (err) => {
      if (err) {

        next(err);
      }
    });
  });
}
