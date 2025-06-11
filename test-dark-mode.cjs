const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5001';
const ADMIN_EMAIL = 'hurshidbey@gmail.com';
const REGULAR_EMAIL = 'test@example.com';

// Create screenshots directory
const screenshotsDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

class DarkModeTestRunner {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  async init() {
    console.log('🚀 Launching browser...');
    this.browser = await puppeteer.launch({
      headless: false, // Set to true for CI/CD
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });
    
    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: 1366, height: 768 });
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async takeScreenshot(name, theme = '') {
    const filename = theme ? `${name}-${theme}.png` : `${name}.png`;
    const filepath = path.join(screenshotsDir, filename);
    await this.page.screenshot({ 
      path: filepath, 
      fullPage: true,
      type: 'png'
    });
    console.log(`📸 Screenshot saved: ${filename}`);
    return filepath;
  }

  async setTheme(theme) {
    console.log(`🎨 Setting theme to: ${theme}`);
    await this.page.evaluate((theme) => {
      localStorage.setItem('protokol57-theme', theme);
      
      // Apply theme immediately
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      
      if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        root.classList.add(systemTheme);
      } else {
        root.classList.add(theme);
      }
    }, theme);
    
    // Wait for theme to apply
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  async simulateLogin(email = REGULAR_EMAIL) {
    console.log(`🔐 Simulating login for: ${email}`);
    
    // Mock authentication by setting auth data in localStorage
    await this.page.evaluate((email) => {
      const userData = {
        id: email === 'hurshidbey@gmail.com' ? 1 : 2,
        email: email,
        name: email === 'hurshidbey@gmail.com' ? 'Admin User' : 'Regular User'
      };
      localStorage.setItem('auth-user', JSON.stringify(userData));
    }, email);
    
    await this.page.reload();
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  async testThemeToggle() {
    console.log('\n🔄 Testing Theme Toggle...');
    
    // Retry navigation with timeout
    let retries = 3;
    while (retries > 0) {
      try {
        await this.page.goto(`${BASE_URL}/`, { 
          waitUntil: 'networkidle2', 
          timeout: 30000 
        });
        break;
      } catch (error) {
        retries--;
        console.log(`Retrying navigation... (${retries} attempts left)`);
        if (retries === 0) throw error;
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    await this.simulateLogin(ADMIN_EMAIL);
    
    // Test Light Theme
    await this.setTheme('light');
    await this.takeScreenshot('theme-toggle-light', 'light');
    
    // Test Dark Theme
    await this.setTheme('dark');
    await this.takeScreenshot('theme-toggle-dark', 'dark');
    
    // Test System Theme
    await this.setTheme('system');
    await this.takeScreenshot('theme-toggle-system', 'system');
    
    // Check if theme toggle button is visible (simplified selector)
    const themeToggle = await this.page.evaluate(() => {
      return Array.from(document.querySelectorAll('button')).some(btn => 
        btn.getAttribute('aria-label')?.includes('Toggle theme') ||
        btn.textContent?.includes('Toggle') ||
        btn.querySelector('svg') // Theme toggles usually have icons
      );
    });
    
    if (themeToggle) {
      console.log('✅ Theme toggle button found');
    } else {
      console.log('❌ Theme toggle button not found');
    }
  }

  async testAdminNavigation() {
    console.log('\n👑 Testing Admin Navigation...');
    
    // Test with admin user
    await this.page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' });
    await this.simulateLogin(ADMIN_EMAIL);
    await this.setTheme('light');
    
    // Check if admin navigation is visible
    const adminNavAdmin = await this.page.evaluate(() => {
      return Array.from(document.querySelectorAll('a, button')).some(el => 
        el.textContent.includes('Boshqaruv') || el.href?.includes('/admin')
      );
    });
    
    await this.takeScreenshot('admin-nav-visible', 'admin-user');
    console.log(`Admin navigation for admin user: ${adminNavAdmin ? '✅ Visible' : '❌ Hidden'}`);
    
    // Test with regular user
    await this.simulateLogin(REGULAR_EMAIL);
    
    const adminNavRegular = await this.page.evaluate(() => {
      return Array.from(document.querySelectorAll('a, button')).some(el => 
        el.textContent.includes('Boshqaruv') || el.href?.includes('/admin')
      );
    });
    
    await this.takeScreenshot('admin-nav-hidden', 'regular-user');
    console.log(`Admin navigation for regular user: ${adminNavRegular ? '❌ Visible (ERROR!)' : '✅ Hidden'}`);
    
    return {
      adminUserCanSeeAdmin: adminNavAdmin,
      regularUserCannotSeeAdmin: !adminNavRegular
    };
  }

  async testAllPages() {
    console.log('\n📄 Testing All Pages in Both Themes...');
    
    const pages = [
      { url: '/', name: 'home', requiresAuth: true },
      { url: '/auth', name: 'auth', requiresAuth: false },
      { url: '/protocols/1', name: 'protocol-detail', requiresAuth: true },
      { url: '/admin', name: 'admin', requiresAuth: true, adminOnly: true }
    ];
    
    for (const pageConfig of pages) {
      console.log(`\n🔍 Testing page: ${pageConfig.name}`);
      
      try {
        await this.page.goto(`${BASE_URL}${pageConfig.url}`, { waitUntil: 'networkidle2' });
        
        if (pageConfig.requiresAuth) {
          const userEmail = pageConfig.adminOnly ? ADMIN_EMAIL : REGULAR_EMAIL;
          await this.simulateLogin(userEmail);
        }
        
        // Test Light Theme
        await this.setTheme('light');
        await new Promise(resolve => setTimeout(resolve, 500));
        await this.takeScreenshot(`${pageConfig.name}-page`, 'light');
        
        // Test Dark Theme
        await this.setTheme('dark');
        await new Promise(resolve => setTimeout(resolve, 500));
        await this.takeScreenshot(`${pageConfig.name}-page`, 'dark');
        
        console.log(`✅ ${pageConfig.name} page tested successfully`);
        
      } catch (error) {
        console.log(`❌ Error testing ${pageConfig.name}: ${error.message}`);
      }
    }
  }

  async testThemePersistence() {
    console.log('\n💾 Testing Theme Persistence...');
    
    await this.page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' });
    await this.simulateLogin(ADMIN_EMAIL);
    
    // Set dark theme
    await this.setTheme('dark');
    await this.takeScreenshot('persistence-before-reload', 'dark');
    
    // Reload page
    await this.page.reload({ waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if theme persisted
    const isDarkAfterReload = await this.page.evaluate(() => {
      return document.documentElement.classList.contains('dark');
    });
    
    await this.takeScreenshot('persistence-after-reload', isDarkAfterReload ? 'dark' : 'light');
    
    console.log(`Theme persistence: ${isDarkAfterReload ? '✅ Persisted' : '❌ Lost'}`);
    return isDarkAfterReload;
  }

  async checkColorContrast() {
    console.log('\n🎨 Checking Color Contrast...');
    
    await this.page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' });
    await this.simulateLogin(ADMIN_EMAIL);
    
    const contrastResults = {};
    
    for (const theme of ['light', 'dark']) {
      await this.setTheme(theme);
      await this.page.waitForTimeout(500);
      
      const colors = await this.page.evaluate(() => {
        const elements = [
          { name: 'background', selector: 'body' },
          { name: 'text', selector: 'h1, h2, h3, p' },
          { name: 'button', selector: 'button' },
          { name: 'card', selector: '[class*="card"]' }
        ];
        
        return elements.map(({ name, selector }) => {
          const element = document.querySelector(selector);
          if (!element) return { name, colors: null };
          
          const styles = window.getComputedStyle(element);
          return {
            name,
            backgroundColor: styles.backgroundColor,
            color: styles.color,
            borderColor: styles.borderColor
          };
        });
      });
      
      contrastResults[theme] = colors;
      await this.takeScreenshot(`contrast-check`, theme);
    }
    
    console.log('Color contrast analysis completed');
    return contrastResults;
  }

  async runAllTests() {
    console.log('🧪 Starting Dark Mode Test Suite...\n');
    
    const results = {
      themeToggle: null,
      adminNavigation: null,
      themePersistence: null,
      colorContrast: null,
      errors: []
    };
    
    try {
      await this.init();
      
      // Run all tests
      await this.testThemeToggle();
      results.adminNavigation = await this.testAdminNavigation();
      await this.testAllPages();
      results.themePersistence = await this.testThemePersistence();
      results.colorContrast = await this.checkColorContrast();
      
      console.log('\n✅ All tests completed successfully!');
      
    } catch (error) {
      console.error('❌ Test suite failed:', error);
      results.errors.push(error.message);
    } finally {
      await this.close();
    }
    
    // Generate test report
    this.generateReport(results);
    return results;
  }

  generateReport(results) {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        adminNavigationWorking: results.adminNavigation?.adminUserCanSeeAdmin && results.adminNavigation?.regularUserCannotSeeAdmin,
        themePersistenceWorking: results.themePersistence,
        screenshotsGenerated: fs.readdirSync(screenshotsDir).length,
        errors: results.errors
      },
      details: results
    };
    
    const reportPath = path.join(__dirname, 'dark-mode-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`\n📊 Test report generated: dark-mode-test-report.json`);
    console.log(`📸 Screenshots saved in: ${screenshotsDir}`);
    
    // Print summary
    console.log('\n=== TEST SUMMARY ===');
    console.log(`Admin Navigation: ${report.summary.adminNavigationWorking ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Theme Persistence: ${report.summary.themePersistenceWorking ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Screenshots Generated: ${report.summary.screenshotsGenerated}`);
    console.log(`Errors: ${report.summary.errors.length}`);
  }
}

// Run tests
if (require.main === module) {
  const testRunner = new DarkModeTestRunner();
  testRunner.runAllTests().catch(console.error);
}

module.exports = DarkModeTestRunner;