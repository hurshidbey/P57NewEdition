const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5001';

async function verifyDockerApp() {
  console.log('🚀 Verifying Docker App Status...');
  
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1366, height: 768 }
  });
  
  const screenshotsDir = path.join(__dirname, 'docker-verification');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }
  
  try {
    const page = await browser.newPage();
    
    // Monitor console messages
    const consoleMessages = [];
    page.on('console', msg => {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text()
      });
    });
    
    // Monitor errors
    const pageErrors = [];
    page.on('error', err => {
      pageErrors.push(err.toString());
    });
    
    console.log('📱 Loading app...');
    const response = await page.goto(BASE_URL, { 
      waitUntil: 'networkidle2', 
      timeout: 30000 
    });
    
    console.log(`HTTP Status: ${response.status()}`);
    
    // Wait for app to settle
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Take screenshot
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'app-loaded.png'), 
      fullPage: true 
    });
    
    // Check current URL
    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);
    
    // Check page title
    const pageTitle = await page.title();
    console.log(`Page Title: ${pageTitle}`);
    
    // Check if main content exists
    const hasMainContent = await page.evaluate(() => {
      return document.querySelector('main') !== null || 
             document.querySelector('#root') !== null ||
             document.querySelector('[class*="container"]') !== null;
    });
    
    // Check for any visible text
    const visibleText = await page.evaluate(() => {
      const body = document.body;
      return body ? body.innerText.substring(0, 100) : 'No body content';
    });
    
    console.log('\n📊 App Status Report:');
    console.log('====================');
    console.log(`✅ App is reachable at ${BASE_URL}`);
    console.log(`✅ HTTP Status: ${response.status()}`);
    console.log(`📄 Current URL: ${currentUrl}`);
    console.log(`📄 Page Title: ${pageTitle || '(no title)'}`);
    console.log(`${hasMainContent ? '✅' : '❌'} Main content container found`);
    console.log(`📄 Visible text preview: ${visibleText.substring(0, 50)}...`);
    
    if (pageErrors.length > 0) {
      console.log('\n❌ Page Errors:');
      pageErrors.forEach(err => console.log(`  - ${err}`));
    }
    
    if (consoleMessages.filter(m => m.type === 'error').length > 0) {
      console.log('\n⚠️  Console Errors:');
      consoleMessages
        .filter(m => m.type === 'error')
        .forEach(msg => console.log(`  - ${msg.text}`));
    }
    
    console.log(`\n📸 Screenshot saved to: ${path.join(screenshotsDir, 'app-loaded.png')}`);
    
    // Test dark mode if app loaded successfully
    if (hasMainContent && response.status() === 200) {
      console.log('\n🌙 Testing Dark Mode...');
      
      // Set dark theme
      await page.evaluate(() => {
        localStorage.setItem('protokol57-theme', 'dark');
        document.documentElement.classList.remove('light');
        document.documentElement.classList.add('dark');
      });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      await page.screenshot({ 
        path: path.join(screenshotsDir, 'app-dark-mode.png'), 
        fullPage: true 
      });
      
      console.log('✅ Dark mode screenshot saved');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await browser.close();
  }
}

verifyDockerApp().catch(console.error);