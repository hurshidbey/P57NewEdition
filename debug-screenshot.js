import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Set desktop viewport
  await page.setViewport({ width: 1920, height: 1080 });
  
  // Force reload with cache bypass using extra headers
  await page.goto('https://p57.uz?' + Date.now(), { 
    waitUntil: 'networkidle2',
    timeout: 30000
  });
  
  // Wait a bit more for any late-loading content
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Take full page screenshot
  await page.screenshot({ 
    path: '/Users/xb21/P57/desktop-current.png',
    fullPage: true
  });
  
  // Check what CSS version is actually loaded
  const cssVersion = await page.evaluate(() => {
    const link = document.querySelector('link[rel="stylesheet"]');
    return link ? link.href : 'No CSS link found';
  });
  
  console.log('CSS Version Loading:', cssVersion);
  
  // Check hero section padding
  const heroStyles = await page.evaluate(() => {
    const hero = document.querySelector('.hero');
    if (!hero) return 'Hero section not found';
    const styles = window.getComputedStyle(hero);
    return {
      paddingTop: styles.paddingTop,
      paddingBottom: styles.paddingBottom,
      fontSize: styles.fontSize
    };
  });
  
  console.log('Hero Section Styles:', heroStyles);
  
  // Check hero title font size
  const titleStyles = await page.evaluate(() => {
    const title = document.querySelector('.hero-content h1');
    if (!title) return 'Title not found';
    const styles = window.getComputedStyle(title);
    return {
      fontSize: styles.fontSize,
      fontWeight: styles.fontWeight,
      marginBottom: styles.marginBottom
    };
  });
  
  console.log('Title Styles:', titleStyles);
  
  await browser.close();
})();