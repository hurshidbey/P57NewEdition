# P57 Landing Page

Professional landing page for the P57 AI Prompting Course platform.

## 🚀 Quick Deployment

```bash
# Deploy landing page changes (30 seconds)
scp -i ~/.ssh/protokol57_ed25519 /Users/xb21/P57/landing_page/index.html root@69.62.126.73:/tmp/index_new.html
scp -i ~/.ssh/protokol57_ed25519 /Users/xb21/P57/landing_page/style.css root@69.62.126.73:/tmp/style_new.css
ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 "docker cp /tmp/index_new.html landing_page-p57-landing-1:/usr/share/nginx/html/index.html && docker cp /tmp/style_new.css landing_page-p57-landing-1:/usr/share/nginx/html/style.css"
```

## 📁 File Structure

```
landing_page/
├── index.html          # Main landing page
├── style.css           # Vercel-inspired styles with desktop optimization
├── assets/             # Static assets
│   ├── hero.png        # Hero section image
│   ├── logo.png        # P57 logo
│   ├── platforpeak.png # Platform screenshot
│   └── Partnerlogos/   # Partner logo images (1.png - 9.png)
└── README.md           # This file
```

## 🎨 Design System

### Typography Standards
- **Hero Title**: `clamp(1.5rem, 4vw, 2.75rem)` (max 44px on desktop)
- **Section Headers**: `clamp(1.875rem, 4vw, 3.5rem)` 
- **Body Text**: `clamp(1rem, 1.5vw, 1.125rem)` (max 18px)
- **Reading Width**: 24ch for headlines, 45ch for body text

### Spacing (8pt Grid System)
```css
--space-1: 4px    --space-7: 40px
--space-2: 8px    --space-8: 48px
--space-3: 12px   --space-9: 64px
--space-4: 16px   --space-10: 80px
--space-5: 24px   --space-11: 96px
--space-6: 32px   --space-12: 128px
```

### Color Palette
```css
--primary-color: #000000     /* Black */
--text-secondary: #666666    /* Gray */
--accent-color: #0070f3      /* Blue */
--background-color: #ffffff   /* White */
--border-color: #eaeaea      /* Light gray */
```

## 📱 Responsive Breakpoints

| Breakpoint | Range | Description |
|------------|-------|-------------|
| Mobile | ≤768px | Mobile-first base styles |
| Tablet | 769px-1023px | Tablet layouts |
| Desktop | 1024px-1439px | Standard desktop |
| Large Desktop | ≥1440px | 4K and ultra-wide |

## 🔧 Development Workflow

### Making Changes

1. **Edit Files Locally**:
   ```bash
   # Edit /Users/xb21/P57/landing_page/index.html
   # Edit /Users/xb21/P57/landing_page/style.css
   ```

2. **Update Cache Buster** (for CSS changes):
   ```html
   <!-- Increment version number -->
   <link rel="stylesheet" href="style.css?v=13&t=1734648400">
   ```

3. **Deploy to Live Site**:
   ```bash
   # Use the quick deployment command above
   ```

4. **Verify Changes**:
   ```bash
   # Check live site
   curl -I https://p57.uz
   ```

### Testing Desktop Responsiveness

```javascript
// Use Puppeteer to debug
import puppeteer from 'puppeteer';

const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080 });
await page.goto('https://p57.uz');

// Check computed styles
const titleStyles = await page.evaluate(() => {
  const title = document.querySelector('.hero-content h1');
  const styles = window.getComputedStyle(title);
  return { fontSize: styles.fontSize, fontWeight: styles.fontWeight };
});
```

## ⚠️ Common Issues & Solutions

### CSS Changes Not Showing
```bash
# 1. Check what's actually served
curl -s "https://p57.uz/style.css?v=X" | head -10

# 2. Update version number in index.html
# 3. Clear browser cache (Cmd+Shift+R)
```

### 404 Error After Deployment
```bash
# Check container files
ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 "docker exec landing_page-p57-landing-1 ls -la /usr/share/nginx/html/"

# If files missing, redeploy
```

### Typography Too Large on Desktop
```bash
# Check for conflicting media queries
curl -s "https://p57.uz/style.css" | grep -A 5 -B 5 "hero-content h1"
```

## 🎯 Performance Standards

- **Hero title max size**: 44px (2.75rem)
- **Section padding**: 48px (var(--space-8))
- **Header padding**: 12px (var(--space-3))
- **Logo carousel**: 60s animation, 90s on hover
- **Touch targets**: Minimum 44px for mobile

## 🔗 Live URLs

- **Primary**: https://p57.uz
- **Backup**: https://srv852801.hstgr.cloud

## 📊 Container Info

- **Container Name**: `landing_page-p57-landing-1`
- **Web Root**: `/usr/share/nginx/html/`
- **Technology**: nginx + static HTML/CSS/JS
- **Port**: 80 (internal)

## 🚨 Critical Notes

1. **NEVER** use `docker cp /dev/stdin` - it creates broken symlinks
2. **ALWAYS** copy to `/tmp/` first, then to container
3. **SEPARATE** from main platform (`p57.birfoiz.uz`)
4. **UPDATE** cache buster version for CSS changes
5. **CHECK** all media queries when fixing typography