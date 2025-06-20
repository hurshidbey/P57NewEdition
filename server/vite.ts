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

  console.log(`${formattedTime} [${source}] ${message}`);
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
  const distPath = path.resolve(import.meta.dirname, "..", "dist", "public");
  
  console.log(`[serveStatic] Looking for static files in: ${distPath}`);
  console.log(`[serveStatic] Directory exists: ${fs.existsSync(distPath)}`);
  
  // List contents if directory exists
  if (fs.existsSync(distPath)) {
    try {
      const files = fs.readdirSync(distPath);
      console.log(`[serveStatic] Files in dist directory:`, files);
    } catch (err) {
      console.log(`[serveStatic] Error reading directory:`, err);
    }
  }

  if (!fs.existsSync(distPath)) {
    console.error(`[serveStatic] Build directory not found: ${distPath}`);
    console.error(`[serveStatic] Make sure to build the client first with: npm run build`);
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
  console.log(`[serveStatic] Express static middleware configured for: ${distPath}`);

  // fall through to index.html if the file doesn't exist, but NOT for API routes
  app.use((req, res, next) => {
    // Skip this catch-all for API routes
    if (req.originalUrl.startsWith('/api/')) {
      console.log(`[serveStatic] SKIPPING catch-all for API route: ${req.originalUrl}`);
      return next();
    }
    
    const indexPath = path.resolve(distPath, "index.html");
    console.log(`[serveStatic] Fallback route hit for: ${req.originalUrl}`);
    
    if (!fs.existsSync(indexPath)) {
      console.error(`[serveStatic] index.html not found at: ${indexPath}`);
      return res.status(500).json({ error: 'Application not built properly' });
    }
    
    res.sendFile(indexPath, (err) => {
      if (err) {
        console.error(`[serveStatic] Error serving index.html:`, err);
        next(err);
      }
    });
  });
}
