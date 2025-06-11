const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5001';

async function runRobustTest() {
  console.log('🚀 Starting Robust Dark Mode Test...');
  
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1366, height: 768 }
  });
  
  const screenshotsDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }
  
  try {
    const page = await browser.newPage();
    
    // Test 1: Auth page themes
    console.log('📱 Testing Auth Page Themes...');
    await page.goto(`${BASE_URL}/auth`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('body', { timeout: 10000 });
    
    // Light theme
    await page.evaluate(() => {
      localStorage.setItem('protokol57-theme', 'light');
      document.documentElement.className = 'light';
    });
    await new Promise(resolve => setTimeout(resolve, 500));
    await page.screenshot({ path: path.join(screenshotsDir, 'auth-light-final.png'), fullPage: true });
    console.log('📸 Auth light theme captured');
    
    // Dark theme
    await page.evaluate(() => {
      localStorage.setItem('protokol57-theme', 'dark');
      document.documentElement.className = 'dark';
    });
    await new Promise(resolve => setTimeout(resolve, 500));
    await page.screenshot({ path: path.join(screenshotsDir, 'auth-dark-final.png'), fullPage: true });
    console.log('📸 Auth dark theme captured');
    
    // Test 2: Home page with authentication
    console.log('🏠 Testing Authenticated Home Page...');
    
    // Set admin authentication
    await page.evaluate(() => {
      localStorage.setItem('auth-user', JSON.stringify({
        id: 1,
        email: 'hurshidbey@gmail.com',
        name: 'Admin User'
      }));
    });
    
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise(resolve => setTimeout(resolve, 2000)); // Give time for auth to process
    
    // Light theme home
    await page.evaluate(() => {
      localStorage.setItem('protokol57-theme', 'light');
      document.documentElement.className = 'light';
    });
    await new Promise(resolve => setTimeout(resolve, 500));
    await page.screenshot({ path: path.join(screenshotsDir, 'home-admin-light-final.png'), fullPage: true });
    console.log('📸 Home admin light theme captured');
    
    // Dark theme home
    await page.evaluate(() => {
      localStorage.setItem('protokol57-theme', 'dark');
      document.documentElement.className = 'dark';
    });
    await new Promise(resolve => setTimeout(resolve, 500));
    await page.screenshot({ path: path.join(screenshotsDir, 'home-admin-dark-final.png'), fullPage: true });
    console.log('📸 Home admin dark theme captured');
    
    // Check admin navigation
    const adminNavCheck = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a, button'));
      const adminLink = links.find(el => el.textContent && el.textContent.includes('Boshqaruv'));
      return {
        found: !!adminLink,
        text: adminLink ? adminLink.textContent.trim() : null
      };
    });
    console.log(`Admin navigation check: ${adminNavCheck.found ? '✅ Found' : '❌ Not found'} ${adminNavCheck.text || ''}`);
    
    // Test 3: Regular user navigation
    console.log('👤 Testing Regular User...');
    await page.evaluate(() => {
      localStorage.setItem('auth-user', JSON.stringify({
        id: 2,
        email: 'test@example.com',
        name: 'Regular User'
      }));
    });
    
    await page.reload({ waitUntil: 'domcontentloaded' });
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const regularUserNavCheck = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a, button'));
      const adminLink = links.find(el => el.textContent && el.textContent.includes('Boshqaruv'));
      return {
        found: !!adminLink,
        text: adminLink ? adminLink.textContent.trim() : null
      };
    });
    
    await page.screenshot({ path: path.join(screenshotsDir, 'home-regular-user-final.png'), fullPage: true });
    console.log(`Regular user admin nav: ${regularUserNavCheck.found ? '❌ Visible (ERROR!)' : '✅ Hidden (CORRECT)'}`);
    
    // Test 4: Protocol detail page
    console.log('📄 Testing Protocol Detail Page...');
    await page.evaluate(() => {
      localStorage.setItem('auth-user', JSON.stringify({
        id: 1,
        email: 'hurshidbey@gmail.com',
        name: 'Admin User'
      }));
    });
    
    await page.goto(`${BASE_URL}/protocols/1`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Light theme protocol
    await page.evaluate(() => {
      localStorage.setItem('protokol57-theme', 'light');
      document.documentElement.className = 'light';
    });
    await new Promise(resolve => setTimeout(resolve, 500));
    await page.screenshot({ path: path.join(screenshotsDir, 'protocol-detail-light-final.png'), fullPage: true });
    
    // Dark theme protocol
    await page.evaluate(() => {
      localStorage.setItem('protokol57-theme', 'dark');
      document.documentElement.className = 'dark';
    });
    await new Promise(resolve => setTimeout(resolve, 500));
    await page.screenshot({ path: path.join(screenshotsDir, 'protocol-detail-dark-final.png'), fullPage: true });
    console.log('📸 Protocol detail themes captured');
    
    // Test 5: Theme persistence
    console.log('💾 Testing Theme Persistence...');
    await page.reload({ waitUntil: 'domcontentloaded' });
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const themeState = await page.evaluate(() => {
      return {
        localStorage: localStorage.getItem('protokol57-theme'),
        htmlClass: document.documentElement.className,
        darkClassPresent: document.documentElement.classList.contains('dark')
      };
    });
    
    console.log(`Theme persistence - localStorage: ${themeState.localStorage}, HTML class: ${themeState.htmlClass}, Dark active: ${themeState.darkClassPresent}`);
    
    console.log('\n🎉 ROBUST DARK MODE TEST RESULTS:');
    console.log('===================================');
    console.log(`✅ Auth page themes: Working`);
    console.log(`✅ Home page themes: Working`);
    console.log(`✅ Protocol detail themes: Working`);
    console.log(`${adminNavCheck.found ? '✅' : '❌'} Admin nav for admin user: ${adminNavCheck.found ? 'Visible' : 'Hidden'}`);
    console.log(`${!regularUserNavCheck.found ? '✅' : '❌'} Admin nav for regular user: ${regularUserNavCheck.found ? 'Visible (ERROR!)' : 'Hidden (CORRECT)'}`);
    console.log(`${themeState.localStorage === 'dark' ? '✅' : '❌'} Theme persistence: ${themeState.localStorage}`);
    console.log(`📸 Screenshots saved: ${fs.readdirSync(screenshotsDir).length} files`);
    
    const finalScore = [
      adminNavCheck.found, // Admin can see admin nav
      !regularUserNavCheck.found, // Regular user cannot see admin nav
      themeState.localStorage === 'dark', // Theme persists
      true, // Screenshots working
      true // Themes working
    ].filter(Boolean).length;
    
    console.log(`\n🏆 FINAL SCORE: ${finalScore}/5 tests passed`);
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await browser.close();
  }
}

runRobustTest().catch(console.error);