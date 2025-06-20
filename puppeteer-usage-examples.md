# Puppeteer Website Analysis and Automation Examples

This project now includes comprehensive Puppeteer-based website analysis and automation tools. Here are the available utilities and usage examples:

## 🛠️ Available Tools

### 1. Standard Website Analyzer (`scripts/website-analyzer.js`)
General-purpose website analyzer for local development and testing.

### 2. Docker Website Analyzer (`scripts/docker-website-analyzer.js`)
Optimized for container environments with Chrome/Chromium configuration for Docker.

## 📖 Usage Examples

### Basic Website Analysis

```bash
# Analyze a website
node scripts/website-analyzer.js https://example.com

# Take screenshot and save report
node scripts/website-analyzer.js https://example.com --screenshot --report

# Run in non-headless mode (see browser)
node scripts/website-analyzer.js https://example.com --headless=false
```

### Docker Environment Analysis

```bash
# Docker-optimized analysis
node scripts/docker-website-analyzer.js https://example.com

# With screenshot and report
node scripts/docker-website-analyzer.js https://example.com --screenshot --report

# Custom timeout
node scripts/docker-website-analyzer.js https://example.com --timeout=60000
```

### Advanced Programmatic Usage

```javascript
import { WebsiteAnalyzer } from './scripts/website-analyzer.js';

const analyzer = new WebsiteAnalyzer({
  headless: false,
  viewport: { width: 1280, height: 720 },
  screenshotsDir: './custom-screenshots',
  reportsDir: './custom-reports'
});

await analyzer.init();

// Comprehensive analysis
const analysis = await analyzer.analyzeWebsite('https://your-site.com');

// Form automation
await analyzer.fillForm('form#contact', {
  'input[name="email"]': 'test@example.com',
  'input[name="name"]': 'Test User',
  'textarea[name="message"]': 'Hello world'
});

// Click and wait for navigation
await analyzer.clickAndWait('button[type="submit"]', true);

// Extract specific text
const headlines = await analyzer.extractText('h1, h2, h3');

// Take screenshot
await analyzer.takeScreenshot('custom-screenshot.png');

// Save comprehensive report
await analyzer.saveReport(analysis, 'detailed-analysis.json');

await analyzer.close();
```

## 🔍 Analysis Features

### 1. **Performance Metrics**
- Page load times
- First paint / First contentful paint
- DOM metrics (elements, memory usage)
- Transfer sizes

### 2. **SEO Analysis**
- Title and meta description validation
- Heading structure analysis
- Image alt text checking
- Canonical URLs

### 3. **Accessibility Checks**
- Missing alt attributes
- Form label associations
- Heading hierarchy
- Basic WCAG compliance

### 4. **Security Assessment**
- HTTPS usage
- Mixed content detection
- Inline script analysis

### 5. **Content Extraction**
- Text content and word counts
- Heading hierarchy
- Link analysis (internal/external)
- Image inventory

### 6. **Technology Detection**
- JavaScript frameworks (React, Vue, Angular)
- CSS frameworks (Bootstrap, Tailwind)
- Analytics tools (Google Analytics, Facebook Pixel)
- CMS platforms and generators

### 7. **Mobile Readiness**
- Viewport meta tag validation
- Touch-friendly element sizing
- Responsive design indicators

## 🐳 Docker Integration

The Docker-optimized analyzer includes:
- Chrome launch arguments optimized for containers
- Resource usage optimization
- Headless operation by default
- Container-friendly file paths

### Running in Your Docker Environment

```dockerfile
# Add to your Dockerfile
RUN apt-get update && apt-get install -y \
    chromium-browser \
    --no-install-recommends

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

```bash
# Run analysis inside Docker container
docker exec -it your-container node scripts/docker-website-analyzer.js https://example.com
```

## 📊 Output Examples

### Console Output
```
🔍 Analyzing website: https://example.com
🎉 Analysis complete!
📈 Load time: 1956ms
📝 Word count: 28
🔗 Links: 1 (1 external)
🖼️ Images: 0 (0 without alt text)
⚠️ Accessibility issues: 0
📸 Screenshot saved: screenshots/screenshot-2025-06-19.png
📊 Analysis report saved: reports/analysis-example.com-2025-06-19.json
```

### Report Structure
```json
{
  "url": "https://example.com",
  "loadTime": 1956,
  "timestamp": "2025-06-19T11:25:34.325Z",
  "title": "Example Domain",
  "meta": {
    "description": "Example domain description",
    "viewport": "width=device-width, initial-scale=1"
  },
  "performance": {
    "domContentLoaded": 1200,
    "firstContentfulPaint": 800
  },
  "seo": {
    "issues": [],
    "warnings": ["Title too short"]
  },
  "security": {
    "isHTTPS": true,
    "securityIssues": []
  },
  "content": {
    "wordCount": 28,
    "headings": [
      {"level": 1, "text": "Example Domain"}
    ]
  }
}
```

## 🎯 Use Cases

1. **Website Auditing**: Comprehensive site analysis for SEO, performance, and accessibility
2. **Automated Testing**: Form submission testing and user journey automation
3. **Content Scraping**: Extract structured data from websites
4. **Performance Monitoring**: Regular site performance checks
5. **Screenshot Generation**: Automated visual documentation
6. **Security Scanning**: Basic security issue detection

## 🚀 Integration with Your Project

Since Puppeteer is already installed in your project, you can:

1. Import the analyzers as modules in your existing code
2. Add custom analysis logic for your specific use cases
3. Integrate with your Docker workflow using the Docker-optimized version
4. Extend the analyzers with additional features specific to your domain

The tools are designed to work seamlessly with your existing Protokol57 infrastructure and can be easily integrated into your testing or monitoring workflows.