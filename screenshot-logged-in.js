import puppeteer from 'puppeteer';

async function takeScreenshotLoggedIn() {
  if (process.argv.length < 3) {
    console.log('Usage: node screenshot-logged-in.js <url> [filename]');
    process.exit(1);
  }

  const url = process.argv[2];
  const filename = process.argv[3] || 'screenshot-logged-in.png';

  console.log(`Taking screenshot of: ${url} (with login)`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({ width: 1280, height: 720 });
    
    // First go to the main site
    await page.goto('https://srv852801.hstgr.cloud/', { 
      waitUntil: 'networkidle2',
      timeout: 10000 
    });
    
    // Check if we need to login
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Look for login form
    const loginForm = await page.$('form');
    if (loginForm) {
      console.log('Login form detected, logging in...');
      
      // Fill in credentials
      await page.type('input[type="email"], input[name="username"]', 'admin');
      await page.type('input[type="password"], input[name="password"]', 'admin123');
      
      // Click login button
      await page.click('button[type="submit"]');
      
      // Wait for login to complete - just wait for time instead of navigation
      await new Promise(resolve => setTimeout(resolve, 5000));
      console.log('Login completed');
    }
    
    // Now navigate to the target URL
    console.log(`Navigating to: ${url}`);
    await page.goto(url, { 
      waitUntil: 'networkidle2',
      timeout: 10000 
    });
    
    // Wait a bit for any dynamic content
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Take screenshot
    await page.screenshot({ 
      path: filename,
      fullPage: true 
    });
    
    console.log(`Screenshot saved as: ${filename}`);
    
  } catch (error) {
    console.error('Error taking screenshot:', error);
  } finally {
    await browser.close();
  }
}

takeScreenshotLoggedIn();