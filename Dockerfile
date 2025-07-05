FROM node:20

# Install dependencies for tsx and development
RUN apt-get update && apt-get install -y python3 make g++ curl && rm -rf /var/lib/apt/lists/*

# Accept build args for VITE environment variables
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_TELEGRAM_BOT_USERNAME

# Set as ENV for build process
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_TELEGRAM_BOT_USERNAME=$VITE_TELEGRAM_BOT_USERNAME

# Skip Puppeteer download
ENV PUPPETEER_SKIP_DOWNLOAD=true

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Copy assets to public directory before build
RUN mkdir -p client/public/attached_assets
RUN cp -r attached_assets/* client/public/attached_assets/ || true
# Ensure icon directories are copied
RUN ls -la client/public/attached_assets/ || true

# Build the application with embedded VITE variables
RUN npm run build

# Copy package.json to dist directory so Node.js knows it's ESM
RUN cp package.json dist/

# Create non-root user
RUN groupadd --gid 1001 nodejs && \
    useradd --uid 1001 --gid nodejs --shell /bin/bash --create-home nextjs

# Change ownership
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Reset working directory after user switch (critical for ESM module resolution)
WORKDIR /app

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/api/protocols || exit 1

# Set environment variable for production
ENV NODE_ENV=production

# Start command for production (ESM modules with .mjs extension)
CMD ["sh", "-c", "cd /app && node --enable-source-maps dist/index.mjs"]
