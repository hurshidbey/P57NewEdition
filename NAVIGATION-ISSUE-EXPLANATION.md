# Navigation Components Missing in Production - Root Cause Analysis

## The Problem
The `ProtocolNavigation` component and `useProtocolNavigation` hook are not included in the production JavaScript bundle, despite being properly implemented and working in development.

## Root Cause
Vite's production build uses aggressive tree-shaking optimization. Since the `ProtocolDetail` page (which uses the navigation components) is only rendered for authenticated users via conditional rendering:

```tsx
<Route path="/protocols/:id">
  {isAuthenticated ? <ProtocolDetail /> : <AuthPage />}
</Route>
```

Vite's optimizer determines that unauthenticated users will never see this component and removes it from the bundle to reduce size.

## Why This Happens
1. **Conditional Rendering**: The component is behind an authentication check
2. **Static Analysis**: Vite analyzes code statically and can't determine runtime conditions
3. **Tree Shaking**: Unused code paths are removed in production builds
4. **Bundle Optimization**: Results in smaller bundles but missing functionality

## Solutions

### Option 1: Dynamic Imports (Recommended)
Convert authenticated routes to use dynamic imports that load on demand:

```tsx
const ProtocolDetail = lazy(() => import("@/pages/protocol-detail"));

// In routes:
<Route path="/protocols/:id">
  <Suspense fallback={<Loading />}>
    {isAuthenticated ? <ProtocolDetail /> : <AuthPage />}
  </Suspense>
</Route>
```

### Option 2: Force Include Components
Add a dummy reference to force Vite to include components:

```tsx
// At the top of App.tsx
if (false) {
  // Forces Vite to include these in the bundle
  import("@/pages/protocol-detail");
  import("@/components/protocol-navigation");
}
```

### Option 3: Disable Tree Shaking (Not Recommended)
Configure Vite to be less aggressive with optimization:

```ts
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      treeshake: false // Disables tree shaking entirely
    }
  }
});
```

### Option 4: Static Route Definition
Use static route definitions without conditional logic:

```tsx
<Route path="/protocols/:id" component={ProtocolDetail} />
// Handle auth check inside the component
```

## Current Workaround
The navigation components work when:
1. User is authenticated
2. JavaScript bundle is loaded while authenticated
3. No hard refresh occurs on the protocol detail page

## Long-term Fix
The best solution is to implement Option 1 (dynamic imports) which:
- Preserves tree-shaking benefits
- Loads components only when needed
- Works with authentication flows
- Maintains small initial bundle size

## Deployment Notes
After implementing any fix:
1. Clear all Docker caches
2. Force rebuild with `--no-cache`
3. Verify new bundle hash is generated
4. Test both authenticated and unauthenticated flows