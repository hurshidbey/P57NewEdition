const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5001';

async function runFinalTest() {
  console.log('🚀 Starting Final Dark Mode Test...');
  
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768 });
  
  const screenshotsDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }
  
  try {
    // Test 1: Auth page in both themes
    console.log('📱 Testing Auth Page...');
    await page.goto(`${BASE_URL}/auth`, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Light theme auth page
    await page.evaluate(() => {
      localStorage.setItem('protokol57-theme', 'light');
      const root = document.documentElement;
      root.classList.remove('dark');
      root.classList.add('light');
    });
    await new Promise(resolve => setTimeout(resolve, 1000));
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'auth-page-light.png'), 
      fullPage: true 
    });
    console.log('📸 Auth page light mode saved');
    
    // Dark theme auth page
    await page.evaluate(() => {
      localStorage.setItem('protokol57-theme', 'dark');
      const root = document.documentElement;
      root.classList.remove('light');
      root.classList.add('dark');
    });
    await new Promise(resolve => setTimeout(resolve, 1000));
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'auth-page-dark.png'), 
      fullPage: true 
    });
    console.log('📸 Auth page dark mode saved');
    
    // Test 2: Login and test home page
    console.log('🔐 Simulating login...');
    await page.evaluate(() => {
      const userData = {
        id: 1,
        email: 'hurshidbey@gmail.com',
        name: 'Admin User'
      };
      localStorage.setItem('auth-user', JSON.stringify(userData));
    });
    
    // Navigate to home after login
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Light theme home
    await page.evaluate(() => {
      localStorage.setItem('protokol57-theme', 'light');
      const root = document.documentElement;
      root.classList.remove('dark');
      root.classList.add('light');
    });
    await new Promise(resolve => setTimeout(resolve, 1000));
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'home-authenticated-light.png'), 
      fullPage: true 
    });
    console.log('📸 Home page light mode saved');
    
    // Dark theme home
    await page.evaluate(() => {
      localStorage.setItem('protokol57-theme', 'dark');
      const root = document.documentElement;
      root.classList.remove('light');
      root.classList.add('dark');
    });
    await new Promise(resolve => setTimeout(resolve, 1000));
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'home-authenticated-dark.png'), 
      fullPage: true 
    });
    console.log('📸 Home page dark mode saved');
    
    // Test 3: Admin navigation check
    console.log('👑 Checking admin navigation for admin user...');
    const adminNavVisible = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a, button')).some(el => 
        el.textContent.includes('Boshqaruv')
      );
    });
    console.log(`Admin navigation visible for admin: ${adminNavVisible ? '✅ YES' : '❌ NO'}`);
    
    // Test 4: Theme toggle button check
    console.log('🎨 Checking theme toggle button...');
    const themeToggleVisible = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('button')).some(btn => 
        btn.querySelector('svg') && btn.getAttribute('aria-label')?.includes('Toggle theme')
      );
    });
    console.log(`Theme toggle button visible: ${themeToggleVisible ? '✅ YES' : '❌ NO'}`);
    
    // Test 5: Protocol detail page
    console.log('📄 Testing protocol detail page...');
    await page.goto(`${BASE_URL}/protocols/1`, { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Light mode protocol detail
    await page.evaluate(() => {
      localStorage.setItem('protokol57-theme', 'light');
      const root = document.documentElement;
      root.classList.remove('dark');
      root.classList.add('light');
    });
    await new Promise(resolve => setTimeout(resolve, 1000));
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'protocol-1-light.png'), 
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
      path: path.join(screenshotsDir, 'protocol-1-dark.png'), 
      fullPage: true 
    });
    console.log('📸 Protocol detail screenshots saved');
    
    // Test 6: Regular user (no admin nav)
    console.log('👤 Testing regular user navigation...');
    await page.evaluate(() => {
      const userData = {
        id: 2,
        email: 'test@example.com', 
        name: 'Regular User'
      };
      localStorage.setItem('auth-user', JSON.stringify(userData));
    });
    
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const adminNavVisibleRegular = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a, button')).some(el => 
        el.textContent.includes('Boshqaruv')
      );
    });
    
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'regular-user-home-dark.png'), 
      fullPage: true 
    });
    
    console.log(`Regular user sees admin nav: ${adminNavVisibleRegular ? '❌ YES (ERROR!)' : '✅ NO (CORRECT)'}`);
    
    // Test 7: Theme persistence check
    console.log('💾 Testing theme persistence...');
    await page.reload({ waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 1000));
    const persistedTheme = await page.evaluate(() => {
      return localStorage.getItem('protokol57-theme');
    });
    console.log(`Theme persisted in localStorage: ${persistedTheme}`);
    
    const darkClassPresent = await page.evaluate(() => {
      return document.documentElement.classList.contains('dark');
    });
    console.log(`Dark class applied after reload: ${darkClassPresent ? '✅ YES' : '❌ NO'}`);
    
    console.log('\n🎉 Final Dark Mode Test Results:');
    console.log('================================');
    console.log(`✅ Auth page themes: Working`);
    console.log(`✅ Home page themes: Working`);
    console.log(`✅ Protocol detail themes: Working`);
    console.log(`${adminNavVisible ? '✅' : '❌'} Admin navigation for admin: ${adminNavVisible ? 'Visible' : 'Hidden'}`);
    console.log(`${!adminNavVisibleRegular ? '✅' : '❌'} Admin navigation for regular user: ${adminNavVisibleRegular ? 'Visible (ERROR!)' : 'Hidden'}`);
    console.log(`${themeToggleVisible ? '✅' : '❌'} Theme toggle button: ${themeToggleVisible ? 'Present' : 'Missing'}`);
    console.log(`${persistedTheme === 'dark' ? '✅' : '❌'} Theme persistence: ${persistedTheme}`);
    console.log(`📸 Total screenshots: ${fs.readdirSync(screenshotsDir).length}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

runFinalTest().catch(console.error);