import puppeteer from 'puppeteer';

async function takeScreenshot() {
  if (process.argv.length < 3) {
    console.log('Usage: node screenshot-url.js <url> [filename]');
    process.exit(1);
  }

  const url = process.argv[2];
  const filename = process.argv[3] || 'screenshot.png';

  console.log(`Taking screenshot of: ${url}`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({ width: 1280, height: 720 });
    
    // Navigate to the URL
    await page.goto(url, { 
      waitUntil: 'networkidle2',
      timeout: 10000 
    });
    
    // Wait a bit for any dynamic content
    await new Promise(resolve => setTimeout(resolve, 2000));
    
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

takeScreenshot();