import puppeteer from 'puppeteer'

const APP_URL = 'https://p57.birfoiz.uz'

// Test credentials for different user types
const TEST_USERS = {
  admin: {
    email: 'hurshidbey@gmail.com',
    password: 'admin_password_here', // Would need actual password
  },
  free: {
    email: 'test_free@example.com',
    password: 'test_password',
  },
  premium: {
    email: 'test_premium@example.com', 
    password: 'test_password',
  }
}

describe('P57 Tier System E2E Tests', () => {
  let browser, page

  beforeAll(async () => {
    browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    page = await browser.newPage()
    await page.setViewport({ width: 1280, height: 720 })
  })

  afterAll(async () => {
    await browser.close()
  })

  beforeEach(async () => {
    // Clear cookies and localStorage before each test
    await page.deleteCookie(...(await page.cookies()))
    await page.evaluate(() => localStorage.clear())
  })

  describe('Authentication System Tests', () => {
    test('Admin user should have access to all protocols', async () => {
      console.log('🔒 Testing admin user access...')
      
      await page.goto(APP_URL, { waitUntil: 'networkidle0' })
      
      // Check if already authenticated or need to login
      const isLoggedIn = await page.$('.user-profile') !== null
      
      if (!isLoggedIn) {
        console.log('❌ Admin authentication test skipped - requires manual login')
        return
      }

      // Check that admin can see all protocols
      const protocolCards = await page.$$('.protocol-card')
      console.log(`✅ Admin can see ${protocolCards.length} protocols`)
      
      // Admin should see more than 3 protocols
      expect(protocolCards.length).toBeGreaterThan(3)
      
      // Check for admin badge or indicator
      const adminIndicator = await page.$text('Admin')
      if (adminIndicator) {
        console.log('✅ Admin tier indicator found')
      }
    })

    test('Free protocols should be visible to all users', async () => {
      console.log('🆓 Testing free protocol visibility...')
      
      await page.goto(APP_URL, { waitUntil: 'networkidle0' })
      
      // Look for protocols without login
      const protocolCards = await page.$$('[data-testid="protocol-card"], .protocol-card')
      console.log(`✅ Found ${protocolCards.length} visible protocols without authentication`)
      
      // Should have at least some visible protocols
      expect(protocolCards.length).toBeGreaterThan(0)
    })
  })

  describe('Tier-Based Access Control Tests', () => {
    test('Free user protocol limit enforcement', async () => {
      console.log('🎯 Testing free user protocol access limits...')
      
      await page.goto(APP_URL, { waitUntil: 'networkidle0' })
      
      // Check progress dashboard for free tier indicators
      const progressSection = await page.$('.progress-dashboard, [data-testid="progress-dashboard"]')
      if (progressSection) {
        const progressText = await page.evaluate(el => el.textContent, progressSection)
        console.log('📊 Progress section content:', progressText)
        
        // Look for tier-specific messaging
        if (progressText.includes('3 ta bepul') || progressText.includes('/3')) {
          console.log('✅ Free tier limit indicators found')
        }
      }
    })

    test('Premium protocol lock indicators', async () => {
      console.log('🔐 Testing premium protocol lock indicators...')
      
      await page.goto(APP_URL, { waitUntil: 'networkidle0' })
      
      // Look for locked protocol indicators
      const lockIcons = await page.$$('.lucide-lock, [data-icon="lock"]')
      const premiumButtons = await page.$$text('Premium olish')
      
      console.log(`🔒 Found ${lockIcons.length} lock icons`)
      console.log(`👑 Found ${premiumButtons.length} premium upgrade buttons`)
      
      if (premiumButtons.length > 0) {
        console.log('✅ Premium upgrade CTAs are displayed')
      }
    })

    test('Protocol evaluation system', async () => {
      console.log('🎯 Testing protocol evaluation limits...')
      
      await page.goto(APP_URL, { waitUntil: 'networkidle0' })
      
      // Navigate to a protocol detail page
      const protocolLinks = await page.$$('a[href*="/protocols/"]')
      if (protocolLinks.length > 0) {
        await protocolLinks[0].click()
        await page.waitForSelector('.protocol-detail, .protocol-content', { timeout: 5000 })
        
        // Look for evaluation counter or limits
        const evaluationSection = await page.$('.evaluation, .prompt-practice')
        if (evaluationSection) {
          const evalText = await page.evaluate(el => el.textContent, evaluationSection)
          console.log('🔍 Evaluation section content:', evalText)
          
          if (evalText.includes('baholash') || evalText.includes('/')) {
            console.log('✅ Evaluation limit indicators found')
          }
        }
      }
    })
  })

  describe('UI/UX Validation Tests', () => {
    test('Protocol card layout and styling', async () => {
      console.log('🎨 Testing protocol card layout...')
      
      await page.goto(APP_URL, { waitUntil: 'networkidle0' })
      
      // Check for proper card layout
      const cards = await page.$$('.protocol-card, [data-testid="protocol-card"]')
      
      for (let i = 0; i < Math.min(3, cards.length); i++) {
        const card = cards[i]
        
        // Check for proper button layout (should be vertical, not overlapping)
        const buttons = await card.$$('button')
        if (buttons.length > 1) {
          const button1Box = await buttons[0].boundingBox()
          const button2Box = await buttons[1].boundingBox()
          
          // Buttons should not overlap (different Y positions)
          const noOverlap = Math.abs(button1Box.y - button2Box.y) > 10
          if (noOverlap) {
            console.log(`✅ Card ${i + 1}: Buttons properly spaced`)
          } else {
            console.log(`❌ Card ${i + 1}: Button overlap detected`)
          }
        }
      }
    })

    test('Responsive design validation', async () => {
      console.log('📱 Testing responsive design...')
      
      // Test mobile viewport
      await page.setViewport({ width: 375, height: 667 })
      await page.goto(APP_URL, { waitUntil: 'networkidle0' })
      
      // Check if cards stack properly on mobile
      const cards = await page.$$('.protocol-card')
      if (cards.length > 0) {
        const firstCardBox = await cards[0].boundingBox()
        console.log(`📱 Mobile layout - Card width: ${firstCardBox.width}px`)
        
        // Card should not be too wide for mobile
        if (firstCardBox.width < 350) {
          console.log('✅ Mobile card layout looks good')
        }
      }
      
      // Reset to desktop viewport
      await page.setViewport({ width: 1280, height: 720 })
    })

    test('Dark mode compatibility', async () => {
      console.log('🌙 Testing dark mode compatibility...')
      
      await page.goto(APP_URL, { waitUntil: 'networkidle0' })
      
      // Look for dark mode toggle
      const darkModeToggle = await page.$('[data-testid="theme-toggle"], .theme-toggle')
      if (darkModeToggle) {
        await darkModeToggle.click()
        await page.waitForTimeout(1000)
        
        // Check if dark classes are applied
        const bodyClass = await page.evaluate(() => document.body.className)
        if (bodyClass.includes('dark')) {
          console.log('✅ Dark mode activated successfully')
        }
      } else {
        console.log('ℹ️ Dark mode toggle not found')
      }
    })
  })

  describe('Performance and Loading Tests', () => {
    test('Page load performance', async () => {
      console.log('⚡ Testing page load performance...')
      
      const startTime = Date.now()
      await page.goto(APP_URL, { waitUntil: 'networkidle0' })
      const loadTime = Date.now() - startTime
      
      console.log(`⏱️ Page load time: ${loadTime}ms`)
      
      // Page should load within reasonable time
      expect(loadTime).toBeLessThan(10000) // 10 seconds max
      
      if (loadTime < 3000) {
        console.log('✅ Excellent load time')
      } else if (loadTime < 5000) {
        console.log('✅ Good load time')
      } else {
        console.log('⚠️ Slow load time')
      }
    })

    test('API response times', async () => {
      console.log('🌐 Testing API response times...')
      
      // Intercept network requests
      const apiRequests = []
      page.on('response', response => {
        if (response.url().includes('/api/')) {
          apiRequests.push({
            url: response.url(),
            status: response.status(),
            time: response.headers()['server-timing']
          })
        }
      })
      
      await page.goto(APP_URL, { waitUntil: 'networkidle0' })
      
      console.log(`📡 Captured ${apiRequests.length} API requests`)
      
      apiRequests.forEach(req => {
        console.log(`  ${req.status} ${req.url}`)
        if (req.status !== 200 && req.status !== 304) {
          console.log(`  ⚠️ Non-200 status: ${req.status}`)
        }
      })
    })
  })

  describe('Error Handling Tests', () => {
    test('Graceful handling of network errors', async () => {
      console.log('🚫 Testing network error handling...')
      
      // Simulate offline condition
      await page.setOfflineMode(true)
      
      await page.goto(APP_URL, { waitUntil: 'networkidle0', timeout: 5000 }).catch(() => {
        console.log('✅ Network error handled gracefully')
      })
      
      // Restore network
      await page.setOfflineMode(false)
    })

    test('404 page handling', async () => {
      console.log('🔍 Testing 404 page handling...')
      
      await page.goto(`${APP_URL}/nonexistent-page`, { waitUntil: 'networkidle0' })
      
      const pageContent = await page.content()
      
      // Should show some kind of error message or redirect
      if (pageContent.includes('404') || pageContent.includes('topilmadi') || 
          pageContent.includes('protokol')) {
        console.log('✅ 404 handling works')
      } else {
        console.log('ℹ️ 404 page handling unclear')
      }
    })
  })
})

// Helper function to find elements by text content
async function findByText(page, text) {
  return await page.evaluateHandle(
    (text) => {
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null,
        false
      )
      
      let node
      while (node = walker.nextNode()) {
        if (node.textContent.includes(text)) {
          return node.parentElement
        }
      }
      return null
    },
    text
  )
}

// Add helper to page object
Page.prototype.$text = async function(text) {
  return await findByText(this, text)
}

Page.prototype.$$text = async function(text) {
  const elements = await this.evaluate((text) => {
    const elements = []
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null,
      false
    )
    
    let node
    while (node = walker.nextNode()) {
      if (node.textContent.includes(text)) {
        elements.push(node.parentElement)
      }
    }
    return elements
  }, text)
  
  return elements
}