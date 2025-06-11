const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5001';

async function runSimpleTest() {
  console.log('🚀 Starting Simple Dark Mode Test...');
  
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768 });
  
  // Create screenshots directory
  const screenshotsDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }
  
  try {
    console.log('📱 Navigating to home page...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Mock login for admin user
    console.log('🔐 Simulating admin login...');
    await page.evaluate(() => {
      const userData = {
        id: 1,
        email: 'hurshidbey@gmail.com',
        name: 'Admin User'
      };
      localStorage.setItem('auth-user', JSON.stringify(userData));
    });
    
    await page.reload({ waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test Light Theme
    console.log('🌞 Testing Light Theme...');
    await page.evaluate(() => {
      localStorage.setItem('protokol57-theme', 'light');
      const root = document.documentElement;
      root.classList.remove('dark');
      root.classList.add('light');
    });
    await new Promise(resolve => setTimeout(resolve, 1000));
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'home-light-mode.png'), 
      fullPage: true 
    });
    console.log('📸 Light mode screenshot saved');
    
    // Test Dark Theme
    console.log('🌙 Testing Dark Theme...');
    await page.evaluate(() => {
      localStorage.setItem('protokol57-theme', 'dark');
      const root = document.documentElement;
      root.classList.remove('light');
      root.classList.add('dark');
    });
    await new Promise(resolve => setTimeout(resolve, 1000));
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'home-dark-mode.png'), 
      fullPage: true 
    });
    console.log('📸 Dark mode screenshot saved');
    
    // Check if admin navigation is visible
    console.log('👑 Checking admin navigation...');
    const adminNavVisible = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a, button')).some(el => 
        el.textContent.includes('Boshqaruv')
      );
    });
    console.log(`Admin navigation visible: ${adminNavVisible ? '✅ YES' : '❌ NO'}`);
    
    // Test protocol detail page
    console.log('📄 Testing protocol detail page...');
    await page.goto(`${BASE_URL}/protocols/1`, { waitUntil: 'networkidle2' });
    
    // Light mode protocol detail
    await page.evaluate(() => {
      localStorage.setItem('protokol57-theme', 'light');
      const root = document.documentElement;
      root.classList.remove('dark');
      root.classList.add('light');
    });
    await new Promise(resolve => setTimeout(resolve, 1000));
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'protocol-detail-light.png'), 
      fullPage: true 
    });
    
    // Dark mode protocol detail
    await page.evaluate(() => {
      localStorage.setItem('protokol57-theme', 'dark');
      const root = document.documentElement;
      root.classList.remove('light');
      root.classList.add('dark');
    });
    await new Promise(resolve => setTimeout(resolve, 1000));
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'protocol-detail-dark.png'), 
      fullPage: true 
    });
    console.log('📸 Protocol detail screenshots saved');
    
    // Test theme persistence
    console.log('💾 Testing theme persistence...');
    await page.reload({ waitUntil: 'networkidle2' });
    const persistedTheme = await page.evaluate(() => {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    });
    console.log(`Theme persisted after reload: ${persistedTheme}`);
    
    console.log('\n✅ Test completed successfully!');
    console.log(`📸 Screenshots saved in: ${screenshotsDir}`);
    
    // Test regular user (no admin nav)
    console.log('\n👤 Testing regular user...');
    await page.evaluate(() => {
      const userData = {
        id: 2,
        email: 'test@example.com', 
        name: 'Regular User'
      };
      localStorage.setItem('auth-user', JSON.stringify(userData));
    });
    
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const adminNavVisibleRegular = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a, button')).some(el => 
        el.textContent.includes('Boshqaruv')
      );
    });
    
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'regular-user-no-admin-nav.png'), 
      fullPage: true 
    });
    
    console.log(`Regular user sees admin nav: ${adminNavVisibleRegular ? '❌ YES (ERROR!)' : '✅ NO (CORRECT)'}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

runSimpleTest().catch(console.error);