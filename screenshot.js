import puppeteer from 'puppeteer';

async function takeScreenshot() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  // Set viewport size for consistent screenshots
  await page.setViewport({ width: 1200, height: 800 });
  
  // Navigate to the ATMOS payment page
  await page.goto('http://localhost:5001/atmos', { waitUntil: 'networkidle2' });
  
  // Login if needed
  const isLoginPage = await page.$('input[type="email"]');
  if (isLoginPage) {
    console.log('Login page detected, logging in...');
    
    // Fill in login credentials
    await page.type('input[type="email"]', 'hurshidbey@gmail.com');
    await page.type('input[type="password"]', '20031000a');
    
    // Click login button
    await page.click('button[type="submit"]');
    
    // Wait for redirect or error message
    try {
      await page.waitForSelector('[class*="grid"]', { timeout: 8000 });
      console.log('Login completed, navigating to protocol details...');
      
      // Navigate to protocol details page
      await page.goto('http://localhost:5001/protocols/1', { waitUntil: 'networkidle2' });
      
    } catch (e) {
      console.log('Login might have failed, taking screenshot anyway...');
    }
  }
  
  // Take screenshot of ATMOS payment page
  await page.screenshot({ 
    path: 'atmos-payment-screenshot.png',
    fullPage: true 
  });
  
  console.log('Screenshot saved as atmos-payment-screenshot.png');
  
  await browser.close();
}

takeScreenshot().catch(console.error);