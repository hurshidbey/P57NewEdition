# Theme Migration Guide

## 🎨 Color Replacement Map

### Background Colors
| Old Class | New Class | Notes |
|-----------|-----------|-------|
| `bg-black` | `bg-primary` or `bg-theme-inverse` | Use primary for main elements |
| `bg-white` | `bg-background` or `bg-theme-primary` | Default background |
| `bg-gray-50` | `bg-secondary` or `bg-theme-secondary` | Secondary backgrounds |
| `bg-gray-100` | `bg-muted` or `bg-theme-tertiary` | Muted backgrounds |

### Text Colors
| Old Class | New Class | Notes |
|-----------|-----------|-------|
| `text-white` | `text-primary-foreground` or `text-theme-inverse` | On dark backgrounds |
| `text-black` | `text-foreground` or `text-theme-primary` | Primary text |
| `text-gray-600` | `text-muted-foreground` or `text-theme-secondary` | Secondary text |
| `text-gray-400` | `text-theme-tertiary` | Tertiary text |
| `text-gray-900` | `text-foreground` | Main content text |

### Border Colors
| Old Class | New Class |
|-----------|-----------|
| `border-black` | `border-primary` or `border-theme-accent` |
| `border-gray-200` | `border-border` or `border-theme-primary` |
| `border-gray-300` | `border-theme-secondary` |

## 📝 Migration Examples

### Before (Hardcoded Colors):
```jsx
<div className="bg-black text-white p-8">
  <h1 className="text-3xl font-bold">Welcome</h1>
  <p className="text-gray-400">Description text</p>
  <button className="bg-white text-black px-4 py-2">
    Click Me
  </button>
</div>
```

### After (Theme-Aware):
```jsx
<div className="bg-primary text-primary-foreground p-8">
  <h1 className="text-3xl font-bold">Welcome</h1>
  <p className="text-muted-foreground">Description text</p>
  <button className="bg-background text-foreground px-4 py-2">
    Click Me
  </button>
</div>
```

### Alternative with Custom Theme Classes:
```jsx
<div className="bg-theme-inverse text-theme-inverse p-8">
  <h1 className="text-3xl font-bold">Welcome</h1>
  <p className="text-theme-secondary">Description text</p>
  <button className="bg-interactive-primary hover-brutal px-4 py-2">
    Click Me
  </button>
</div>
```

## 🔧 Component-Specific Fixes

### Landing Pages
Replace:
```jsx
<div className="min-h-screen bg-black text-white">
```

With:
```jsx
<div className="min-h-screen bg-primary text-primary-foreground">
// or
<div className="min-h-screen landing-hero">
```

### Form Inputs
Remove all `!important` overrides and use:
```jsx
<input 
  type="text" 
  className="bg-background text-foreground border-border 
             focus:border-accent focus:ring-accent"
/>
```

### Cards
Replace:
```jsx
<Card className="bg-white border-gray-200">
```

With:
```jsx
<Card className="bg-card border-border">
// or
<Card className="theme-card">
```

## 🧪 Testing Checklist

### Components to Test in Both Themes:
- [ ] Navigation header
- [ ] Form inputs and textareas
- [ ] Code blocks and syntax highlighting
- [ ] Cards and modals
- [ ] Buttons (all variants)
- [ ] Landing pages
- [ ] Knowledge base content
- [ ] Tables and lists
- [ ] Alert and toast notifications
- [ ] Dropdown menus

### Contrast Ratios to Verify:
- [ ] Primary text on background: WCAG AA (4.5:1)
- [ ] Secondary text on background: WCAG AA (4.5:1)
- [ ] Interactive elements: WCAG AA (3:1)
- [ ] Accent color usage: Ensure visibility in both themes

### Common Issues to Check:
- [ ] Invisible text (white on white, black on black)
- [ ] Poor contrast on accent backgrounds
- [ ] Missing hover states in dark mode
- [ ] Hardcoded shadows that don't work in dark mode
- [ ] Images that need different treatments per theme