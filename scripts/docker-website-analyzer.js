#!/usr/bin/env node

import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';

/**
 * Docker-compatible Website Analyzer using Puppeteer
 * Optimized for container environments with proper Chrome configuration
 */
class DockerWebsiteAnalyzer {
  constructor(options = {}) {
    this.options = {
      headless: options.headless !== false,
      viewport: options.viewport || { width: 1920, height: 1080 },
      timeout: options.timeout || 30000,
      screenshotsDir: options.screenshotsDir || '/app/screenshots',
      reportsDir: options.reportsDir || '/app/reports',
      ...options
    };
    this.browser = null;
    this.page = null;
  }

  async init() {
    // Docker-optimized Chrome launch arguments
    const launchArgs = [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding'
    ];

    this.browser = await puppeteer.launch({
      headless: this.options.headless,
      args: launchArgs,
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined
    });

    this.page = await this.browser.newPage();
    await this.page.setViewport(this.options.viewport);
    await this.page.setDefaultTimeout(this.options.timeout);
    
    // Ensure directories exist
    await fs.mkdir(this.options.screenshotsDir, { recursive: true });
    await fs.mkdir(this.options.reportsDir, { recursive: true });

    console.log('🐳 Docker-optimized Puppeteer initialized');
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  /**
   * Comprehensive website analysis with Docker optimizations
   */
  async analyzeWebsite(url) {
    console.log(`🔍 Docker analyzing: ${url}`);
    
    const startTime = Date.now();
    
    try {
      await this.page.goto(url, { 
        waitUntil: 'networkidle2',
        timeout: this.options.timeout 
      });
    } catch (error) {
      console.log(`⚠️ Timeout or navigation error, continuing with partial analysis...`);
    }
    
    const loadTime = Date.now() - startTime;

    const analysis = {
      url,
      loadTime,
      timestamp: new Date().toISOString(),
      environment: 'docker',
      title: await this.getTitle(),
      meta: await this.extractMetadata(),
      performance: await this.getPerformanceMetrics(),
      security: await this.checkSecurity(),
      seo: await this.analyzeSEO(),
      content: await this.extractContent(),
      forms: await this.analyzeForms(),
      links: await this.extractLinks(),
      images: await this.extractImages(),
      technologies: await this.detectTechnologies(),
      mobileReadiness: await this.checkMobileReadiness()
    };

    return analysis;
  }

  async getTitle() {
    try {
      return await this.page.title();
    } catch (error) {
      return 'Error retrieving title';
    }
  }

  /**
   * Enhanced metadata extraction
   */
  async extractMetadata() {
    return await this.page.evaluate(() => {
      const getMeta = (name) => {
        const meta = document.querySelector(`meta[name="${name}"]`) || 
                     document.querySelector(`meta[property="${name}"]`) ||
                     document.querySelector(`meta[http-equiv="${name}"]`);
        return meta ? meta.getAttribute('content') : null;
      };

      const getLink = (rel) => {
        const link = document.querySelector(`link[rel="${rel}"]`);
        return link ? link.getAttribute('href') : null;
      };

      return {
        description: getMeta('description'),
        keywords: getMeta('keywords'),
        author: getMeta('author'),
        robots: getMeta('robots'),
        viewport: getMeta('viewport'),
        ogTitle: getMeta('og:title'),
        ogDescription: getMeta('og:description'),
        ogImage: getMeta('og:image'),
        ogUrl: getMeta('og:url'),
        ogType: getMeta('og:type'),
        twitterCard: getMeta('twitter:card'),
        twitterSite: getMeta('twitter:site'),
        canonical: getLink('canonical'),
        charset: document.characterSet,
        lang: document.documentElement.lang,
        contentType: getMeta('content-type'),
        generator: getMeta('generator')
      };
    });
  }

  /**
   * Enhanced performance metrics
   */
  async getPerformanceMetrics() {
    try {
      const metrics = await this.page.metrics();
      
      const perfTiming = await this.page.evaluate(() => {
        const timing = performance.timing;
        const navigation = performance.getEntriesByType('navigation')[0];
        const paint = performance.getEntriesByType('paint');
        
        return {
          domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
          loadComplete: timing.loadEventEnd - timing.navigationStart,
          firstPaint: paint.find(entry => entry.name === 'first-paint')?.startTime || 0,
          firstContentfulPaint: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
          domElements: document.querySelectorAll('*').length,
          transferSize: navigation?.transferSize || 0,
          encodedBodySize: navigation?.encodedBodySize || 0,
          decodedBodySize: navigation?.decodedBodySize || 0
        };
      });

      return {
        ...metrics,
        ...perfTiming
      };
    } catch (error) {
      return { error: 'Unable to collect performance metrics' };
    }
  }

  /**
   * Security analysis
   */
  async checkSecurity() {
    return await this.page.evaluate(() => {
      const issues = [];
      const protocol = window.location.protocol;
      
      if (protocol !== 'https:') {
        issues.push('Site not using HTTPS');
      }

      // Check for mixed content
      const insecureElements = document.querySelectorAll('img[src^="http:"], script[src^="http:"], link[href^="http:"]');
      if (insecureElements.length > 0) {
        issues.push(`${insecureElements.length} insecure HTTP resources found`);
      }

      // Check for inline scripts (potential XSS risk)
      const inlineScripts = document.querySelectorAll('script:not([src])');
      const hasInlineScripts = Array.from(inlineScripts).some(script => script.innerHTML.trim().length > 0);
      
      return {
        isHTTPS: protocol === 'https:',
        hasInsecureResources: insecureElements.length > 0,
        hasInlineScripts,
        securityIssues: issues
      };
    });
  }

  /**
   * SEO analysis
   */
  async analyzeSEO() {
    return await this.page.evaluate(() => {
      const issues = [];
      const warnings = [];

      // Title check
      const title = document.querySelector('title');
      if (!title || !title.textContent.trim()) {
        issues.push('Missing page title');
      } else if (title.textContent.length > 60) {
        warnings.push('Title too long (>60 characters)');
      } else if (title.textContent.length < 30) {
        warnings.push('Title too short (<30 characters)');
      }

      // Meta description check
      const description = document.querySelector('meta[name="description"]');
      if (!description || !description.content.trim()) {
        issues.push('Missing meta description');
      } else if (description.content.length > 160) {
        warnings.push('Meta description too long (>160 characters)');
      }

      // Heading structure
      const h1s = document.querySelectorAll('h1');
      if (h1s.length === 0) {
        issues.push('No H1 heading found');
      } else if (h1s.length > 1) {
        warnings.push('Multiple H1 headings found');
      }

      // Image alt attributes
      const imagesWithoutAlt = document.querySelectorAll('img:not([alt])');
      if (imagesWithoutAlt.length > 0) {
        warnings.push(`${imagesWithoutAlt.length} images without alt attributes`);
      }

      return {
        title: title?.textContent || '',
        titleLength: title?.textContent.length || 0,
        description: description?.content || '',
        descriptionLength: description?.content.length || 0,
        h1Count: h1s.length,
        issues,
        warnings
      };
    });
  }

  /**
   * Mobile readiness check
   */
  async checkMobileReadiness() {
    return await this.page.evaluate(() => {
      const viewport = document.querySelector('meta[name="viewport"]');
      const hasViewport = !!viewport;
      const viewportContent = viewport?.content || '';
      
      // Check for mobile-friendly viewport
      const hasMobileViewport = viewportContent.includes('width=device-width');
      
      // Check for touch-friendly elements
      const smallClickTargets = Array.from(document.querySelectorAll('a, button')).filter(el => {
        const rect = el.getBoundingClientRect();
        return rect.width < 44 || rect.height < 44;
      });

      return {
        hasViewport,
        hasMobileViewport,
        viewportContent,
        smallClickTargetsCount: smallClickTargets.length
      };
    });
  }

  /**
   * Enhanced content extraction
   */
  async extractContent() {
    return await this.page.evaluate(() => {
      const mainContent = document.querySelector('main') || 
                         document.querySelector('[role="main"]') || 
                         document.querySelector('article') ||
                         document.body;
      
      const textContent = mainContent.innerText || '';
      const words = textContent.split(/\s+/).filter(word => word.length > 0);
      
      // Extract all headings with hierarchy
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => ({
        level: parseInt(h.tagName.substring(1)),
        tag: h.tagName,
        text: h.innerText.trim(),
        id: h.id || null
      }));

      // Extract paragraphs
      const paragraphs = Array.from(document.querySelectorAll('p')).map(p => 
        p.innerText.trim()
      ).filter(text => text.length > 0);

      return {
        wordCount: words.length,
        characterCount: textContent.length,
        paragraphCount: paragraphs.length,
        headings,
        readingTime: Math.ceil(words.length / 200), // Average reading speed
        textPreview: textContent.substring(0, 500) + (textContent.length > 500 ? '...' : ''),
        languages: document.documentElement.lang ? [document.documentElement.lang] : []
      };
    });
  }

  /**
   * Enhanced form analysis
   */
  async analyzeForms() {
    return await this.page.evaluate(() => {
      const forms = Array.from(document.querySelectorAll('form')).map((form, index) => {
        const inputs = Array.from(form.querySelectorAll('input, textarea, select')).map(input => ({
          type: input.type || input.tagName.toLowerCase(),
          name: input.name,
          id: input.id,
          required: input.required,
          placeholder: input.placeholder,
          value: input.value,
          disabled: input.disabled
        }));

        const submitButtons = form.querySelectorAll('input[type="submit"], button[type="submit"], button:not([type])');

        return {
          index,
          action: form.action,
          method: form.method || 'GET',
          target: form.target,
          enctype: form.enctype,
          inputCount: inputs.length,
          submitButtonCount: submitButtons.length,
          inputs,
          hasRequiredFields: inputs.some(input => input.required)
        };
      });

      return {
        count: forms.length,
        forms
      };
    });
  }

  /**
   * Enhanced link extraction
   */
  async extractLinks() {
    return await this.page.evaluate(() => {
      const currentOrigin = window.location.origin;
      const links = Array.from(document.querySelectorAll('a[href]')).map(link => {
        const href = link.href;
        const isExternal = !href.startsWith(currentOrigin) && !href.startsWith('/') && !href.startsWith('#');
        const isEmail = href.startsWith('mailto:');
        const isTel = href.startsWith('tel:');
        const isDownload = !!link.download;
        
        return {
          href,
          text: link.innerText.trim(),
          title: link.title,
          target: link.target,
          rel: link.rel,
          isExternal,
          isEmail,
          isTel,
          isDownload,
          hasNofollow: link.rel.includes('nofollow')
        };
      });

      const categorized = {
        internal: links.filter(link => !link.isExternal && !link.isEmail && !link.isTel),
        external: links.filter(link => link.isExternal),
        email: links.filter(link => link.isEmail),
        telephone: links.filter(link => link.isTel),
        download: links.filter(link => link.isDownload)
      };

      return {
        total: links.length,
        internal: categorized.internal.length,
        external: categorized.external.length,
        email: categorized.email.length,
        telephone: categorized.telephone.length,
        download: categorized.download.length,
        brokenLinks: 0, // Would need additional checking
        links: links.slice(0, 100) // Limit output
      };
    });
  }

  /**
   * Enhanced image analysis
   */
  async extractImages() {
    return await this.page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img')).map(img => {
        const isLazy = img.loading === 'lazy' || img.dataset.src || img.classList.contains('lazy');
        const isResponsive = !!img.srcset || !!img.sizes;
        
        return {
          src: img.src,
          alt: img.alt || '',
          title: img.title,
          width: img.naturalWidth || img.width,
          height: img.naturalHeight || img.height,
          isLazy,
          isResponsive,
          hasAlt: !!img.alt,
          fileSize: 0 // Would need additional checking
        };
      });

      const stats = {
        total: images.length,
        withAlt: images.filter(img => img.hasAlt).length,
        withoutAlt: images.filter(img => !img.hasAlt).length,
        lazy: images.filter(img => img.isLazy).length,
        responsive: images.filter(img => img.isResponsive).length
      };

      return {
        ...stats,
        images: images.slice(0, 50) // Limit output
      };
    });
  }

  /**
   * Enhanced technology detection
   */
  async detectTechnologies() {
    return await this.page.evaluate(() => {
      const technologies = [];

      // JavaScript frameworks
      if (window.React || document.querySelector('[data-reactroot]')) technologies.push('React');
      if (window.Vue) technologies.push('Vue.js');
      if (window.angular) technologies.push('Angular');
      if (window.jQuery || window.$) technologies.push('jQuery');
      
      // CSS frameworks
      if (document.querySelector('link[href*="bootstrap"]') || 
          document.querySelector('class*="bootstrap"')) technologies.push('Bootstrap');
      if (document.querySelector('link[href*="tailwind"]') ||
          document.querySelector('class*="tw-"')) technologies.push('Tailwind CSS');
      
      // Analytics and tracking
      if (window.gtag || window.ga || window.dataLayer) technologies.push('Google Analytics');
      if (window.fbq) technologies.push('Facebook Pixel');
      if (window._gaq) technologies.push('Google Analytics (Legacy)');
      
      // CMS and generators
      const generator = document.querySelector('meta[name="generator"]');
      if (generator) {
        technologies.push(`Generator: ${generator.content}`);
      }

      // E-commerce platforms
      if (window.Shopify) technologies.push('Shopify');
      if (window.WooCommerce) technologies.push('WooCommerce');
      
      // CDNs and services
      const scripts = Array.from(document.querySelectorAll('script[src]'));
      const links = Array.from(document.querySelectorAll('link[href]'));
      
      [...scripts, ...links].forEach(element => {
        const src = element.src || element.href;
        if (src.includes('googleapis.com')) technologies.push('Google APIs');
        if (src.includes('cloudflare.com')) technologies.push('Cloudflare');
        if (src.includes('jsdelivr.net')) technologies.push('JSDelivr CDN');
        if (src.includes('unpkg.com')) technologies.push('Unpkg CDN');
        if (src.includes('cdnjs.cloudflare.com')) technologies.push('Cdnjs');
      });

      return [...new Set(technologies)];
    });
  }

  /**
   * Take optimized screenshot for Docker environment
   */
  async takeScreenshot(filename = null) {
    if (!filename) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      filename = `docker-screenshot-${timestamp}.png`;
    }
    
    const filepath = path.join(this.options.screenshotsDir, filename);
    
    try {
      await this.page.screenshot({ 
        path: filepath, 
        fullPage: true,
        type: 'png',
        quality: 80
      });
      
      console.log(`📸 Docker screenshot saved: ${filepath}`);
      return filepath;
    } catch (error) {
      console.error(`❌ Screenshot failed: ${error.message}`);
      return null;
    }
  }

  /**
   * Save analysis report
   */
  async saveReport(analysis, filename = null) {
    if (!filename) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const domain = new URL(analysis.url).hostname.replace(/[^a-zA-Z0-9]/g, '-');
      filename = `docker-analysis-${domain}-${timestamp}.json`;
    }
    
    const filepath = path.join(this.options.reportsDir, filename);
    
    try {
      await fs.writeFile(filepath, JSON.stringify(analysis, null, 2));
      console.log(`📊 Docker analysis report saved: ${filepath}`);
      return filepath;
    } catch (error) {
      console.error(`❌ Report save failed: ${error.message}`);
      return null;
    }
  }
}

// Export for use as module
export { DockerWebsiteAnalyzer };

// CLI usage for Docker
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
🐳 Docker Website Analyzer

Usage: node docker-website-analyzer.js <url> [options]

Options:
  --screenshot       Take screenshot
  --report           Save analysis report
  --timeout=30000    Set timeout in milliseconds

Examples:
  node docker-website-analyzer.js https://example.com
  node docker-website-analyzer.js https://example.com --screenshot --report
  node docker-website-analyzer.js https://example.com --timeout=60000
    `);
    process.exit(1);
  }

  const url = args[0];
  const takeScreenshot = args.includes('--screenshot');
  const saveReport = args.includes('--report');
  const timeoutArg = args.find(arg => arg.startsWith('--timeout='));
  const timeout = timeoutArg ? parseInt(timeoutArg.split('=')[1]) : 30000;

  const analyzer = new DockerWebsiteAnalyzer({ timeout });
  
  (async () => {
    try {
      await analyzer.init();
      
      const analysis = await analyzer.analyzeWebsite(url);
      
      console.log('\n🎉 Docker Analysis Complete!');
      console.log(`📈 Load time: ${analysis.loadTime}ms`);
      console.log(`📝 Word count: ${analysis.content.wordCount}`);
      console.log(`🔗 Links: ${analysis.links.total} (${analysis.links.external} external)`);
      console.log(`🖼️ Images: ${analysis.images.total} (${analysis.images.withoutAlt} without alt)`);
      console.log(`⚠️ SEO issues: ${analysis.seo.issues.length}`);
      console.log(`🔒 Security: ${analysis.security.isHTTPS ? 'HTTPS ✅' : 'HTTP ⚠️'}`);
      
      if (takeScreenshot) {
        await analyzer.takeScreenshot();
      }
      
      if (saveReport) {
        await analyzer.saveReport(analysis);
      }
      
    } catch (error) {
      console.error('❌ Docker Analysis Error:', error.message);
      process.exit(1);
    } finally {
      await analyzer.close();
    }
  })();
}