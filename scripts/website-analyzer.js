#!/usr/bin/env node

import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';

/**
 * Comprehensive Website Analyzer using Puppeteer
 * Provides website analysis, automation, and data extraction capabilities
 */
class WebsiteAnalyzer {
  constructor(options = {}) {
    this.options = {
      headless: options.headless !== false, // Default to headless
      viewport: options.viewport || { width: 1920, height: 1080 },
      timeout: options.timeout || 30000,
      screenshotsDir: options.screenshotsDir || './screenshots',
      reportsDir: options.reportsDir || './reports',
      ...options
    };
    this.browser = null;
    this.page = null;
  }

  async init() {
    this.browser = await puppeteer.launch({
      headless: this.options.headless,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.page = await this.browser.newPage();
    await this.page.setViewport(this.options.viewport);
    await this.page.setDefaultTimeout(this.options.timeout);
    
    // Ensure directories exist
    await fs.mkdir(this.options.screenshotsDir, { recursive: true });
    await fs.mkdir(this.options.reportsDir, { recursive: true });
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  /**
   * Navigate to a URL and perform basic analysis
   */
  async analyzeWebsite(url) {
    console.log(`🔍 Analyzing website: ${url}`);
    
    const startTime = Date.now();
    await this.page.goto(url, { waitUntil: 'networkidle2' });
    const loadTime = Date.now() - startTime;

    const analysis = {
      url,
      loadTime,
      timestamp: new Date().toISOString(),
      title: await this.page.title(),
      meta: await this.extractMetadata(),
      performance: await this.getPerformanceMetrics(),
      accessibility: await this.checkAccessibility(),
      content: await this.extractContent(),
      forms: await this.analyzeForms(),
      links: await this.extractLinks(),
      images: await this.extractImages(),
      technologies: await this.detectTechnologies()
    };

    return analysis;
  }

  /**
   * Take screenshot of the website
   */
  async takeScreenshot(filename = null) {
    if (!filename) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      filename = `screenshot-${timestamp}.png`;
    }
    
    const filepath = path.join(this.options.screenshotsDir, filename);
    await this.page.screenshot({ 
      path: filepath, 
      fullPage: true,
      type: 'png'
    });
    
    console.log(`📸 Screenshot saved: ${filepath}`);
    return filepath;
  }

  /**
   * Extract metadata from the page
   */
  async extractMetadata() {
    return await this.page.evaluate(() => {
      const getMeta = (name) => {
        const meta = document.querySelector(`meta[name="${name}"]`) || 
                     document.querySelector(`meta[property="${name}"]`);
        return meta ? meta.getAttribute('content') : null;
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
        twitterCard: getMeta('twitter:card'),
        canonical: document.querySelector('link[rel="canonical"]')?.href,
        charset: document.characterSet,
        lang: document.documentElement.lang
      };
    });
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics() {
    const metrics = await this.page.metrics();
    
    const perfTiming = await this.page.evaluate(() => {
      const timing = performance.timing;
      return {
        domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
        loadComplete: timing.loadEventEnd - timing.navigationStart,
        firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByType('paint')[1]?.startTime || 0
      };
    });

    return {
      ...metrics,
      ...perfTiming
    };
  }

  /**
   * Basic accessibility checks
   */
  async checkAccessibility() {
    return await this.page.evaluate(() => {
      const issues = [];
      
      // Check for images without alt text
      const imagesWithoutAlt = document.querySelectorAll('img:not([alt])');
      if (imagesWithoutAlt.length > 0) {
        issues.push(`${imagesWithoutAlt.length} images without alt text`);
      }

      // Check for form inputs without labels
      const inputsWithoutLabels = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
      const unlabeledInputs = Array.from(inputsWithoutLabels).filter(input => {
        const label = document.querySelector(`label[for="${input.id}"]`);
        return !label && input.type !== 'hidden' && input.type !== 'submit';
      });
      if (unlabeledInputs.length > 0) {
        issues.push(`${unlabeledInputs.length} form inputs without proper labels`);
      }

      // Check for heading structure
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const hasH1 = document.querySelector('h1');
      if (!hasH1) {
        issues.push('No H1 heading found');
      }

      return {
        issues,
        headingCount: headings.length,
        imageCount: document.querySelectorAll('img').length,
        linkCount: document.querySelectorAll('a[href]').length
      };
    });
  }

  /**
   * Extract text content from the page
   */
  async extractContent() {
    return await this.page.evaluate(() => {
      // Get main content text
      const mainContent = document.querySelector('main') || 
                         document.querySelector('[role="main"]') || 
                         document.body;
      
      const textContent = mainContent.innerText || '';
      const wordCount = textContent.split(/\s+/).filter(word => word.length > 0).length;

      // Extract headings
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => ({
        level: h.tagName,
        text: h.innerText.trim()
      }));

      return {
        wordCount,
        headings,
        textPreview: textContent.substring(0, 500) + (textContent.length > 500 ? '...' : '')
      };
    });
  }

  /**
   * Analyze forms on the page
   */
  async analyzeForms() {
    return await this.page.evaluate(() => {
      const forms = Array.from(document.querySelectorAll('form')).map(form => {
        const inputs = Array.from(form.querySelectorAll('input, textarea, select')).map(input => ({
          type: input.type || input.tagName.toLowerCase(),
          name: input.name,
          id: input.id,
          required: input.required,
          placeholder: input.placeholder
        }));

        return {
          action: form.action,
          method: form.method || 'GET',
          inputCount: inputs.length,
          inputs
        };
      });

      return forms;
    });
  }

  /**
   * Extract all links from the page
   */
  async extractLinks() {
    return await this.page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href]')).map(link => ({
        href: link.href,
        text: link.innerText.trim(),
        isExternal: !link.href.startsWith(window.location.origin),
        hasTarget: !!link.target
      }));

      const external = links.filter(link => link.isExternal);
      const internal = links.filter(link => !link.isExternal);

      return {
        total: links.length,
        external: external.length,
        internal: internal.length,
        links: links.slice(0, 50) // Limit to first 50 links
      };
    });
  }

  /**
   * Extract image information
   */
  async extractImages() {
    return await this.page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img')).map(img => ({
        src: img.src,
        alt: img.alt || '',
        width: img.naturalWidth,
        height: img.naturalHeight,
        hasAlt: !!img.alt
      }));

      const withoutAlt = images.filter(img => !img.hasAlt);

      return {
        total: images.length,
        withoutAlt: withoutAlt.length,
        images: images.slice(0, 20) // Limit to first 20 images
      };
    });
  }

  /**
   * Detect technologies used on the website
   */
  async detectTechnologies() {
    return await this.page.evaluate(() => {
      const technologies = [];

      // Check for common frameworks and libraries
      if (window.React) technologies.push('React');
      if (window.Vue) technologies.push('Vue.js');
      if (window.angular) technologies.push('Angular');
      if (window.jQuery || window.$) technologies.push('jQuery');
      if (window.bootstrap) technologies.push('Bootstrap');
      
      // Check for analytics
      if (window.gtag || window.ga) technologies.push('Google Analytics');
      if (window.fbq) technologies.push('Facebook Pixel');
      
      // Check for common CMS patterns
      const generator = document.querySelector('meta[name="generator"]');
      if (generator) {
        technologies.push(`Generator: ${generator.content}`);
      }

      // Check for common CDNs in script sources
      const scripts = Array.from(document.querySelectorAll('script[src]'));
      scripts.forEach(script => {
        const src = script.src;
        if (src.includes('googleapis.com')) technologies.push('Google APIs');
        if (src.includes('cloudflare.com')) technologies.push('Cloudflare');
        if (src.includes('jsdelivr.net')) technologies.push('JSDelivr CDN');
      });

      return [...new Set(technologies)]; // Remove duplicates
    });
  }

  /**
   * Interact with forms - fill and submit
   */
  async fillForm(selector, formData) {
    console.log(`📝 Filling form: ${selector}`);
    
    for (const [fieldSelector, value] of Object.entries(formData)) {
      await this.page.locator(fieldSelector).fill(value);
      await this.page.waitForTimeout(100); // Small delay between fields
    }
  }

  /**
   * Click an element and wait for navigation if needed
   */
  async clickAndWait(selector, waitForNavigation = false) {
    console.log(`🖱️ Clicking: ${selector}`);
    
    if (waitForNavigation) {
      await Promise.all([
        this.page.waitForNavigation({ waitUntil: 'networkidle2' }),
        this.page.locator(selector).click()
      ]);
    } else {
      await this.page.locator(selector).click();
    }
  }

  /**
   * Extract text from specific elements
   */
  async extractText(selector) {
    const elements = await this.page.locator(selector).all();
    const texts = [];
    
    for (const element of elements) {
      const text = await element.evaluate(el => el.innerText);
      if (text.trim()) {
        texts.push(text.trim());
      }
    }
    
    return texts;
  }

  /**
   * Wait for element to appear
   */
  async waitForElement(selector, timeout = 5000) {
    try {
      await this.page.waitForSelector(selector, { timeout });
      return true;
    } catch (error) {
      console.log(`⏰ Element not found within ${timeout}ms: ${selector}`);
      return false;
    }
  }

  /**
   * Save analysis report
   */
  async saveReport(analysis, filename = null) {
    if (!filename) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const domain = new URL(analysis.url).hostname;
      filename = `analysis-${domain}-${timestamp}.json`;
    }
    
    const filepath = path.join(this.options.reportsDir, filename);
    await fs.writeFile(filepath, JSON.stringify(analysis, null, 2));
    
    console.log(`📊 Analysis report saved: ${filepath}`);
    return filepath;
  }
}

// CLI usage example
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
Usage: node website-analyzer.js <url> [options]

Options:
  --headless=false    Run in non-headless mode
  --screenshot       Take screenshot
  --report           Save analysis report

Examples:
  node website-analyzer.js https://example.com
  node website-analyzer.js https://example.com --screenshot --report
  node website-analyzer.js https://example.com --headless=false
    `);
    process.exit(1);
  }

  const url = args[0];
  const takeScreenshot = args.includes('--screenshot');
  const saveReport = args.includes('--report');
  const headless = !args.includes('--headless=false');

  const analyzer = new WebsiteAnalyzer({ headless });
  
  try {
    await analyzer.init();
    
    const analysis = await analyzer.analyzeWebsite(url);
    console.log('🎉 Analysis complete!');
    console.log(`📈 Load time: ${analysis.loadTime}ms`);
    console.log(`📝 Word count: ${analysis.content.wordCount}`);
    console.log(`🔗 Links: ${analysis.links.total} (${analysis.links.external} external)`);
    console.log(`🖼️ Images: ${analysis.images.total} (${analysis.images.withoutAlt} without alt text)`);
    console.log(`⚠️ Accessibility issues: ${analysis.accessibility.issues.length}`);
    
    if (takeScreenshot) {
      await analyzer.takeScreenshot();
    }
    
    if (saveReport) {
      await analyzer.saveReport(analysis);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await analyzer.close();
  }
}

// Export for use as module
export { WebsiteAnalyzer };

// Run CLI if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}