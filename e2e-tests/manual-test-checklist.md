# P57 Tier System - Manual Testing Checklist

## Pre-Testing Setup
- [ ] Application is running at: https://p57.birfoiz.uz
- [ ] Admin account available: hurshidbey@gmail.com
- [ ] Test free user account available
- [ ] Test premium user account available

## Phase 6.3: End-to-End Testing Checklist

### 🔐 Admin User Access Tests
**Expected**: Admin should have unlimited access to all protocols

**Test Steps**:
1. [ ] Login with admin account (hurshidbey@gmail.com)
2. [ ] Verify tier badge shows "Admin" with purple styling
3. [ ] Count total visible protocols (should be all 57)
4. [ ] Verify no lock icons on any protocols
5. [ ] Verify no upgrade CTAs displayed
6. [ ] Access any protocol detail page
7. [ ] Verify evaluation counter shows "5 baholash" (admin gets premium limits)

**Results**:
- Total protocols visible: ___
- Admin badge present: ___
- Lock icons present: ___
- Evaluation limit: ___

---

### 🆓 Free User Access Tests
**Expected**: Free users limited to 3 protocols, 1 evaluation per protocol

**Test Steps**:
1. [ ] Create or login with free user account
2. [ ] Verify tier badge shows "Bepul" (or no badge)
3. [ ] Check progress dashboard shows "X/3 protokol ishlatilgan"
4. [ ] Count accessible (non-locked) protocols
5. [ ] Navigate to a free protocol detail page
6. [ ] Verify evaluation counter shows "0/1 baholash"
7. [ ] Use evaluation once
8. [ ] Verify counter updates to "1/1 baholash" 
9. [ ] Verify "Limit tugadi" message appears
10. [ ] Complete 3 protocols total
11. [ ] Verify upgrade CTA appears for new protocols

**Results**:
- Free protocols accessible: ___
- Protocol limit enforced: ___
- Evaluation limit enforced: ___
- Upgrade CTAs shown: ___

---

### 👑 Premium User Access Tests  
**Expected**: Premium users unlimited access, 5 evaluations per protocol

**Test Steps**:
1. [ ] Create or login with premium user account
2. [ ] Verify tier badge shows "Premium" with crown icon
3. [ ] Count total visible protocols (should be all 57)
4. [ ] Verify no lock icons or upgrade CTAs
5. [ ] Navigate to any protocol detail page
6. [ ] Verify evaluation counter shows "0/5 baholash"
7. [ ] Use evaluation multiple times
8. [ ] Verify counter increments properly

**Results**:
- Total protocols visible: ___
- Premium badge present: ___
- Evaluation limit per protocol: ___
- Access restrictions: ___

---

### 🎨 UI/UX Validation Tests

#### Protocol Card Layout
**Expected**: No button overlapping, proper spacing

**Test Steps**:
1. [ ] Load home page
2. [ ] Inspect protocol cards visually
3. [ ] Verify buttons are vertically stacked
4. [ ] Verify no visual overlapping
5. [ ] Check on different screen sizes

**Results**: ___

#### Locked Protocol Display
**Expected**: Protocol titles hidden, generic messaging

**Test Steps** (as free user):
1. [ ] Find a locked protocol card
2. [ ] Verify title shows "Premium Protokol" instead of actual title
3. [ ] Verify description shows generic premium message
4. [ ] Verify lock icon present
5. [ ] Verify "Premium olish" button present

**Results**: ___

#### Responsive Design
**Expected**: Works on mobile and desktop

**Test Steps**:
1. [ ] Test on desktop (1200px+ width)
2. [ ] Test on tablet (768px-1024px width)  
3. [ ] Test on mobile (< 768px width)
4. [ ] Verify cards stack properly
5. [ ] Verify buttons remain clickable

**Results**: ___

---

### 🔄 State Management Tests

#### Progress Persistence
**Expected**: Progress saves across sessions

**Test Steps**:
1. [ ] Complete a protocol
2. [ ] Refresh page
3. [ ] Verify protocol shows as completed
4. [ ] Clear browser cache
5. [ ] Login again
6. [ ] Verify progress restored from server

**Results**: ___

#### Evaluation Count Persistence  
**Expected**: Per-protocol evaluation counts persist

**Test Steps**:
1. [ ] Use evaluation on Protocol #1
2. [ ] Navigate to Protocol #2
3. [ ] Navigate back to Protocol #1
4. [ ] Verify evaluation count maintained
5. [ ] Refresh page
6. [ ] Verify count still maintained

**Results**: ___

---

### ⚡ Performance Tests

#### Page Load Speed
**Expected**: < 3 seconds initial load

**Test Steps**:
1. [ ] Clear browser cache
2. [ ] Load https://p57.birfoiz.uz
3. [ ] Time until fully interactive
4. [ ] Check DevTools Network tab
5. [ ] Verify no failed requests

**Results**:
- Load time: ___
- Failed requests: ___

#### API Response Times  
**Expected**: API calls < 1 second

**Test Steps**:
1. [ ] Open DevTools Network tab
2. [ ] Navigate through app
3. [ ] Check API call timing
4. [ ] Note any slow endpoints

**Results**: ___

---

### 🚨 Error Handling Tests

#### Network Failures
**Expected**: Graceful degradation

**Test Steps**:
1. [ ] Disconnect internet
2. [ ] Try to use app
3. [ ] Verify appropriate error messages
4. [ ] Reconnect internet
5. [ ] Verify app recovers

**Results**: ___

#### Invalid URLs
**Expected**: Proper 404 handling

**Test Steps**:
1. [ ] Visit https://p57.birfoiz.uz/invalid-page
2. [ ] Verify appropriate error message
3. [ ] Verify navigation still works

**Results**: ___

---

### 📊 Database Consistency Tests

#### Protocol Data Integrity
**Expected**: All protocols load correctly

**Test Steps**:
1. [ ] Navigate through all accessible protocols
2. [ ] Verify content displays properly
3. [ ] Verify no missing examples
4. [ ] Verify proper categorization

**Results**:
- Protocols with missing content: ___
- Protocols with broken formatting: ___

#### User Data Persistence
**Expected**: User progress syncs with database

**Test Steps**:
1. [ ] Login on different browser
2. [ ] Verify same progress shown
3. [ ] Complete action on browser 1
4. [ ] Refresh browser 2
5. [ ] Verify action synced

**Results**: ___

---

## Test Summary

### ✅ Passed Tests:
- [ ] Admin access works correctly
- [ ] Free user limits enforced
- [ ] Premium user unlimited access  
- [ ] UI layout fixed (no overlapping)
- [ ] Protocol names hidden for locked content
- [ ] Evaluation limits work per-protocol
- [ ] Progress persists correctly
- [ ] Performance acceptable
- [ ] Error handling graceful

### ❌ Failed Tests:
_List any failed tests and issues found_

### 🔧 Issues to Fix:
_List any bugs or improvements needed_

---

## Sign-off

**Tester**: ___________________  
**Date**: ___________________  
**Overall Status**: [ ] PASS [ ] FAIL [ ] CONDITIONAL PASS  
**Notes**: ___________________