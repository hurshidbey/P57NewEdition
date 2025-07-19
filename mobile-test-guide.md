# Mobile Testing Guide for Protokol57

## Chrome DevTools (Quickest)

1. Open Chrome
2. Go to https://p57.birfoiz.uz
3. Press F12 (or Cmd+Option+I on Mac)
4. Click device toggle icon (or Ctrl+Shift+M)
5. Select from dropdown:
   - Pixel 7
   - Samsung Galaxy S20
   - iPad Pro
   - iPhone 14 Pro

## Test These Critical Areas:

### 1. Protocol Cards
- [ ] Cards display properly in grid
- [ ] Touch/click works on cards
- [ ] Protocol number visible (black on white)
- [ ] Checkboxes are tappable

### 2. Navigation
- [ ] Mobile menu works
- [ ] Back buttons accessible
- [ ] Breadcrumbs visible

### 3. Payment Page
- [ ] Form fields accessible
- [ ] Buttons large enough to tap
- [ ] Error messages visible
- [ ] Atmos payment loads

### 4. Text Readability
- [ ] Font size readable (min 16px)
- [ ] Line length comfortable
- [ ] Contrast sufficient
- [ ] No horizontal scroll

## Online Testing Tools

### LambdaTest (Free)
https://www.lambdatest.com/
- 1 free parallel test
- Real device cloud
- 10 minute sessions

### Sauce Labs (Trial)
https://saucelabs.com/
- Real device testing
- 14-day free trial
- Touch gestures support

### BrowserStack (Best)
https://www.browserstack.com/
- Most reliable
- 30 min free trial
- Real devices

## Quick Chrome Test Commands

```javascript
// Paste in Chrome Console to simulate touch
// Test touch events
document.addEventListener('touchstart', (e) => {
    console.log('Touch detected at:', e.touches[0].clientX, e.touches[0].clientY);
});

// Check viewport
console.log('Viewport:', window.innerWidth, 'x', window.innerHeight);

// Test if mobile styles loaded
console.log('Mobile styles active:', window.innerWidth <= 768);
```

## Responsive Breakpoints to Test

- 320px - iPhone SE
- 375px - iPhone 12/13
- 390px - iPhone 14 Pro  
- 412px - Pixel 7
- 768px - iPad
- 1024px - iPad Pro

## Critical Mobile Issues to Check

1. **Tap Targets**: Min 44x44px
2. **Text Input**: Zooms on focus?
3. **Modals**: Closeable on mobile?
4. **Images**: Load properly?
5. **Performance**: Under 3s load?