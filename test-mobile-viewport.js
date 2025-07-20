// Mobile Viewport Testing Script
// Run with: node test-mobile-viewport.js

const puppeteer = require('puppeteer');

const devices = [
    { name: 'iPhone 12', width: 390, height: 844, deviceScaleFactor: 3, hasTouch: true, isMobile: true },
    { name: 'Pixel 5', width: 393, height: 851, deviceScaleFactor: 2.75, hasTouch: true, isMobile: true },
    { name: 'iPad', width: 768, height: 1024, deviceScaleFactor: 2, hasTouch: true, isMobile: true }
];

async function testMobileViewports() {
    console.log('🏃 Starting mobile viewport tests...\n');
    
    for (const device of devices) {
        console.log(`📱 Testing ${device.name} (${device.width}x${device.height})`);
        
        const browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();
        
        // Set viewport
        await page.setViewport({
            width: device.width,
            height: device.height,
            deviceScaleFactor: device.deviceScaleFactor,
            hasTouch: device.hasTouch,
            isMobile: device.isMobile
        });
        
        // Add user agent
        await page.setUserAgent('Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36');
        
        try {
            // Test main page
            await page.goto('https://app.p57.uz', { waitUntil: 'networkidle2' });
            await page.screenshot({ path: `screenshots/${device.name}-home.png`, fullPage: true });
            
            // Check if mobile menu exists
            const mobileMenu = await page.$('[data-mobile-menu]');
            console.log(`  ✓ Mobile menu: ${mobileMenu ? 'Found' : 'Not found'}`);
            
            // Check tap targets
            const buttons = await page.$$eval('button', buttons => 
                buttons.map(btn => ({
                    text: btn.innerText.substring(0, 20),
                    width: btn.offsetWidth,
                    height: btn.offsetHeight
                }))
            );
            
            const smallButtons = buttons.filter(btn => btn.width < 44 || btn.height < 44);
            if (smallButtons.length > 0) {
                console.log(`  ⚠️  ${smallButtons.length} buttons smaller than 44x44px`);
            } else {
                console.log(`  ✓ All buttons meet 44x44px minimum`);
            }
            
            // Test protocol page
            await page.goto('https://app.p57.uz/protocols/1', { waitUntil: 'networkidle2' });
            await page.screenshot({ path: `screenshots/${device.name}-protocol.png` });
            
            // Check horizontal scroll
            const hasHorizontalScroll = await page.evaluate(() => {
                return document.documentElement.scrollWidth > window.innerWidth;
            });
            
            console.log(`  ${hasHorizontalScroll ? '❌ Has horizontal scroll' : '✓ No horizontal scroll'}`);
            
            // Test payment page
            await page.goto('https://app.p57.uz/atmos-payment', { waitUntil: 'networkidle2' });
            await page.screenshot({ path: `screenshots/${device.name}-payment.png` });
            
            console.log(`  ✓ Screenshots saved\n`);
            
        } catch (error) {
            console.log(`  ❌ Error: ${error.message}\n`);
        }
        
        await browser.close();
    }
    
    console.log('✅ Mobile viewport tests complete!');
    console.log('📸 Check screenshots/ folder for results');
}

// Create screenshots directory
const fs = require('fs');
if (!fs.existsSync('screenshots')) {
    fs.mkdirSync('screenshots');
}

testMobileViewports().catch(console.error);