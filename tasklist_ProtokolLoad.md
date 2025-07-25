# Task List: Protocol Loading Performance Optimization

## Overview
We need to fix a performance issue where the app makes too many requests and reads from localStorage when loading protocols. Currently, each protocol card (20+ on the page) creates its own hooks and fetches data independently. This causes lag and console spam.

## Current Problem
- When a user logs in, they see 20+ protocol cards
- Each card runs its own `useProgress()`, `useUserTier()`, and `useProtocolAccess()` hooks
- This means 20+ localStorage reads and potential API calls
- The console gets spammed with debug messages
- The app becomes slow and unresponsive

## Solution Architecture
We'll create shared contexts that load data once and share it with all components.

---

## Phase 1: Create Progress Context Provider ⏳

### Task 1.1: Create progress-context.tsx file
**What to do:**
- Create a new file: `/client/src/contexts/progress-context.tsx`
- This will be a React Context that manages all progress data in one place

**Why:** Instead of each card loading progress data separately, we load it once and share it.

**Steps:**
1. Create the context file
2. Define the ProgressContext interface with all progress-related data
3. Create ProgressProvider component that wraps children
4. Move all logic from `useProgress` hook into this provider
5. Export a `useProgressContext` hook for components to use

**Key points for junior dev:**
- Context is like a global store that any component can access
- Provider wraps your app and makes data available to all children
- This prevents duplicate data fetching

### Task 1.2: Move progress logic to context
**What to do:**
- Copy all the logic from `/client/src/hooks/use-progress.ts`
- Adapt it to work in the context provider
- Remove console.log debug statements
- Ensure localStorage is read only once

**Code structure example:**
```typescript
// What we're moving from:
export function useProgress() {
  // Logic here runs for EACH component
}

// To this:
export function ProgressProvider({ children }) {
  // Logic here runs ONCE for entire app
  return <ProgressContext.Provider value={...}>{children}</ProgressContext.Provider>
}
```

### Task 1.3: Add loading and error states
**What to do:**
- Add `loading` boolean to show when data is being fetched
- Add `error` state to handle failures gracefully
- Provide these in the context value

**Why:** Users should see loading spinners instead of broken UI.

---

## Phase 2: Create Protocols Context Provider ⏳

### Task 2.1: Create protocols-context.tsx
**What to do:**
- Create `/client/src/contexts/protocols-context.tsx`
- This will manage protocol access logic and tier checking

**What goes in this context:**
- User tier information (free/paid)
- Protocol access checking logic
- Methods to check if a protocol is locked
- Cached access decisions

### Task 2.2: Optimize access checking
**What to do:**
- Move `useUserTier` and `useProtocolAccess` logic into the context
- Pre-calculate which protocols are accessible
- Create a Map or Set for O(1) lookup performance

**Example structure:**
```typescript
interface ProtocolsContextValue {
  userTier: 'free' | 'paid';
  isProtocolLocked: (protocolId: number) => boolean;
  canAccessProtocol: (protocolId: number) => boolean;
  // Pre-calculated for performance
  lockedProtocolIds: Set<number>;
}
```

---

## Phase 3: Update Components ⏳

### Task 3.1: Update ProtocolCard component
**What to do:**
- Remove all direct hook usage (`useProgress`, `useUserTier`, `useProtocolAccess`)
- Accept data as props instead
- Simplify the component

**Before (current - BAD):**
```typescript
function ProtocolCard({ protocol }) {
  const { isProtocolCompleted } = useProgress(); // ❌ Runs for each card
  const { canAccess } = useProtocolAccess(); // ❌ Runs for each card
  // ... component logic
}
```

**After (new - GOOD):**
```typescript
function ProtocolCard({ protocol, isCompleted, isLocked, onToggleComplete }) {
  // ✅ Just use props, no hooks!
  // ... component logic
}
```

### Task 3.2: Create ProtocolCardContainer
**What to do:**
- Create a wrapper component that connects context to ProtocolCard
- This keeps ProtocolCard pure and testable

**Example:**
```typescript
function ProtocolCardContainer({ protocol }) {
  const { isProtocolCompleted, toggleProtocolCompleted } = useProgressContext();
  const { isProtocolLocked } = useProtocolsContext();
  
  return (
    <ProtocolCard
      protocol={protocol}
      isCompleted={isProtocolCompleted(protocol.id)}
      isLocked={isProtocolLocked(protocol.id)}
      onToggleComplete={() => toggleProtocolCompleted(protocol.id)}
    />
  );
}
```

### Task 3.3: Update Home page
**What to do:**
- Wrap the page with both providers
- Use ProtocolCardContainer instead of ProtocolCard
- Remove any duplicate data fetching

**Structure:**
```typescript
function Home() {
  return (
    <ProgressProvider>
      <ProtocolsProvider>
        {/* Page content here */}
        {protocols.map(p => (
          <ProtocolCardContainer key={p.id} protocol={p} />
        ))}
      </ProtocolsProvider>
    </ProgressProvider>
  );
}
```

---

## Phase 4: Performance Optimizations ⏳

### Task 4.1: Add React.memo to ProtocolCard
**What to do:**
- Wrap ProtocolCard with React.memo
- This prevents re-renders when props haven't changed

**How:**
```typescript
export default React.memo(ProtocolCard);
```

### Task 4.2: Remove all console.log statements
**What to do:**
- Search for all console.log statements in:
  - use-progress.ts
  - use-user-tier.ts
  - protocol-card.tsx
- Remove or comment them out

**Why:** Debug logs slow down the app and spam the console.

### Task 4.3: Implement request deduplication
**What to do:**
- Ensure API calls are made only once
- Use React Query's deduplication features
- Cache results appropriately

---

## Phase 5: Testing & Verification ⏳

### Task 5.1: Test single data load
**What to do:**
- Open browser dev tools
- Clear localStorage and refresh
- Verify only ONE request to `/api/progress/[userId]`
- Check localStorage is read only once

**Expected console output:**
```
✅ Loading progress for user: xxx (once only)
❌ NOT: Loading progress... (repeated 20+ times)
```

### Task 5.2: Performance testing
**What to do:**
- Use React DevTools Profiler
- Measure render time before and after
- Should see 50-90% improvement

### Task 5.3: User experience testing
**What to do:**
- Test with slow network (Chrome DevTools throttling)
- Verify loading states work properly
- Check that toggling completion is still responsive

---

## Success Criteria ✅

1. **Console is clean** - No spam messages
2. **Single API call** - Only one progress request per page load
3. **Fast rendering** - Page loads smoothly without lag
4. **Maintains functionality** - All features still work
5. **Better architecture** - Code is more maintainable

## Common Pitfalls to Avoid ⚠️

1. **Don't forget error handling** - Network requests can fail
2. **Don't break existing features** - Test thoroughly
3. **Don't over-optimize** - Focus on the main performance issues first
4. **Don't skip loading states** - Users need feedback

## Resources for Junior Developers 📚

- [React Context API Guide](https://react.dev/learn/passing-data-deeply-with-context)
- [React.memo Documentation](https://react.dev/reference/react/memo)
- [React Performance Optimization](https://react.dev/learn/render-and-commit)

---

## Progress Tracking

- [x] Phase 1: Create Progress Context Provider
  - [x] Task 1.1: Create progress-context.tsx file
  - [x] Task 1.2: Move progress logic to context
  - [x] Task 1.3: Add loading and error states

- [x] Phase 2: Create Protocols Context Provider
  - [x] Task 2.1: Create protocols-context.tsx
  - [x] Task 2.2: Optimize access checking

- [x] Phase 3: Update Components
  - [x] Task 3.1: Update ProtocolCard component (created protocol-card-pure.tsx)
  - [x] Task 3.2: Create ProtocolCardContainer
  - [x] Task 3.3: Update Home page

- [x] Phase 4: Performance Optimizations
  - [x] Task 4.1: Add React.memo to ProtocolCard
  - [x] Task 4.2: Remove all console.log statements
  - [x] Task 4.3: Implement request deduplication (achieved through context)

- [ ] Phase 5: Testing & Verification
  - [ ] Task 5.1: Test single data load
  - [ ] Task 5.2: Performance testing
  - [ ] Task 5.3: User experience testing

---

## Review Section: Changes Summary

### What Was Done

1. **Created Context Providers** (Phase 1 & 2)
   - Created `/client/src/contexts/progress-context.tsx` - Manages all progress data in one place
   - Created `/client/src/contexts/protocols-context.tsx` - Manages user tier and protocol access logic
   - Both contexts load data once and share it with all components

2. **Refactored Components** (Phase 3)
   - Created `/client/src/components/protocol-card-pure.tsx` - A pure component that only uses props
   - Created `/client/src/components/protocol-card-container.tsx` - Container that connects contexts to pure component
   - Updated `/client/src/pages/home.tsx` to wrap with providers and use ProtocolCardContainer
   - Updated hooks to be simple wrappers for backward compatibility

3. **Performance Optimizations** (Phase 4)
   - Added React.memo to ProtocolCardPure component
   - Removed all console.log debug statements from App.tsx and analytics.ts
   - Request deduplication achieved through context (data loaded once, shared everywhere)

### Key Benefits

1. **Single Data Load**: Progress and user tier data is now loaded ONCE per page load instead of 20+ times
2. **Optimized Re-renders**: React.memo prevents unnecessary re-renders when props haven't changed
3. **Clean Console**: No more spam from debug messages
4. **Better Architecture**: Clear separation between data logic (contexts) and presentation (pure components)
5. **O(1) Access Checks**: Pre-calculated locked protocols for instant lookup

### Next Steps

- Test the application to verify performance improvements
- Use React DevTools Profiler to measure actual performance gains
- Monitor network tab to confirm only single API requests are made
- Ensure all functionality still works correctly (toggling completion, access control, etc.)