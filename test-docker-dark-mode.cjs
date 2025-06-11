const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5001';

async function testDockerDarkMode() {
  console.log('🚀 Starting Docker Dark Mode Test...');
  
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1366, height: 768 }
  });
  
  const screenshotsDir = path.join(__dirname, 'docker-screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }
  
  try {
    const page = await browser.newPage();
    
    // First, let's check if the app is loading properly
    console.log('📱 Testing Docker app loading...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Wait for the app to fully load
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Take initial screenshot
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'docker-initial-load.png'), 
      fullPage: true 
    });
    console.log('📸 Initial load screenshot saved');
    
    // Check if we're redirected to auth
    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);
    
    // If we're at auth page, let's test dark mode there
    if (currentUrl.includes('/auth')) {
      console.log('📱 Testing Auth Page Dark Mode...');
      
      // Set light theme first
      await page.evaluate(() => {
        localStorage.setItem('protokol57-theme', 'light');
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      });
      await new Promise(resolve => setTimeout(resolve, 1000));
      await page.screenshot({ 
        path: path.join(screenshotsDir, 'docker-auth-light.png'), 
        fullPage: true 
      });
      console.log('📸 Auth light mode saved');
      
      // Switch to dark theme
      await page.evaluate(() => {
        localStorage.setItem('protokol57-theme', 'dark');
        document.documentElement.classList.remove('light');
        document.documentElement.classList.add('dark');
      });
      await new Promise(resolve => setTimeout(resolve, 1000));
      await page.screenshot({ 
        path: path.join(screenshotsDir, 'docker-auth-dark.png'), 
        fullPage: true 
      });
      console.log('📸 Auth dark mode saved');
    }
    
    // Let's also test by navigating directly to home with auth
    console.log('🏠 Testing Home Page with Auth...');
    
    // Set authentication
    await page.evaluate(() => {
      localStorage.setItem('auth-user', JSON.stringify({
        id: 1,
        email: 'hurshidbey@gmail.com',
        name: 'Admin User'
      }));
    });
    
    // Navigate to home
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Test light theme
    await page.evaluate(() => {
      localStorage.setItem('protokol57-theme', 'light');
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    });
    await new Promise(resolve => setTimeout(resolve, 1000));
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'docker-home-light.png'), 
      fullPage: true 
    });
    console.log('📸 Home light mode saved');
    
    // Test dark theme
    await page.evaluate(() => {
      localStorage.setItem('protokol57-theme', 'dark');
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    });
    await new Promise(resolve => setTimeout(resolve, 1000));
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'docker-home-dark.png'), 
      fullPage: true 
    });
    console.log('📸 Home dark mode saved');
    
    // Check for admin navigation
    const adminNavVisible = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a, button')).some(el => 
        el.textContent && el.textContent.includes('Boshqaruv')
      );
    });
    console.log(`Admin navigation visible: ${adminNavVisible ? '✅ YES' : '❌ NO'}`);
    
    // Check for theme toggle button
    const themeToggleExists = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('button')).some(btn => 
        btn.querySelector('svg') && (btn.getAttribute('aria-label')?.includes('theme') || 
        btn.className?.includes('theme'))
      );
    });
    console.log(`Theme toggle button exists: ${themeToggleExists ? '✅ YES' : '❌ NO'}`);
    
    // Test with regular user
    console.log('👤 Testing Regular User...');
    await page.evaluate(() => {
      localStorage.setItem('auth-user', JSON.stringify({
        id: 2,
        email: 'test@example.com',
        name: 'Regular User'
      }));
    });
    
    await page.reload({ waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const regularUserAdminNav = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a, button')).some(el => 
        el.textContent && el.textContent.includes('Boshqaruv')
      );
    });
    
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'docker-regular-user.png'), 
      fullPage: true 
    });
    console.log(`Regular user sees admin nav: ${regularUserAdminNav ? '❌ YES (ERROR!)' : '✅ NO (CORRECT)'}`);
    
    // Check console errors
    const consoleMessages = [];
    page.on('console', msg => consoleMessages.push(msg.text()));
    
    console.log('\n🎉 Docker Dark Mode Test Summary:');
    console.log('================================');
    console.log(`✅ Docker app is running on port 5001`);
    console.log(`✅ Screenshots saved: ${fs.readdirSync(screenshotsDir).length} files`);
    console.log(`${adminNavVisible ? '✅' : '❌'} Admin navigation for admin user`);
    console.log(`${!regularUserAdminNav ? '✅' : '❌'} Admin navigation hidden for regular user`);
    console.log(`${themeToggleExists ? '✅' : '❌'} Theme toggle button present`);
    
    if (consoleMessages.length > 0) {
      console.log('\n⚠️  Console messages:');
      consoleMessages.slice(-5).forEach(msg => console.log(`  - ${msg}`));
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
  }
}

testDockerDarkMode().catch(console.error);