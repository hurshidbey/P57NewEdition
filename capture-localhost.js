const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Set viewport to capture full page
  await page.setViewport({ width: 1440, height: 900 });
  
  // Navigate to localhost:5001
  await page.goto('http://localhost:5001', { waitUntil: 'networkidle2' });
  
  // Wait for content to load
  await page.waitForSelector('.protokol-card', { timeout: 5000 }).catch(() => {});
  
  // Get page HTML
  const html = await page.content();
  
  // Get all CSS
  const styles = await page.evaluate(() => {
    const styleSheets = Array.from(document.styleSheets);
    let css = '';
    styleSheets.forEach(sheet => {
      try {
        const rules = Array.from(sheet.cssRules || sheet.rules);
        rules.forEach(rule => {
          css += rule.cssText + '\n';
        });
      } catch (e) {
        // Handle cross-origin stylesheets
      }
    });
    return css;
  });
  
  // Check for brutal design elements
  const brutalCheck = await page.evaluate(() => {
    const elements = document.querySelectorAll('*');
    let hasCyan = false;
    let has6pxShadow = false;
    let hasBlackBorder = false;
    
    elements.forEach(el => {
      const style = window.getComputedStyle(el);
      if (style.backgroundColor === 'rgb(27, 255, 187)' || style.backgroundColor === '#1bffbb') {
        hasCyan = true;
      }
      if (style.boxShadow && style.boxShadow.includes('6px 6px')) {
        has6pxShadow = true;
      }
      if (style.border && style.border.includes('rgb(0, 0, 0)')) {
        hasBlackBorder = true;
      }
    });
    
    return {
      hasCyan,
      has6pxShadow,
      hasBlackBorder,
      cyanElements: document.querySelectorAll('[style*="1bffbb"]').length,
      shadowElements: document.querySelectorAll('[style*="6px 6px"]').length
    };
  });
  
  console.log('Brutal Design Check:', brutalCheck);
  
  // Take screenshot
  await page.screenshot({ path: 'localhost-5001-current.png', fullPage: true });
  
  await browser.close();
  
  console.log('Screenshot saved as localhost-5001-current.png');
})();