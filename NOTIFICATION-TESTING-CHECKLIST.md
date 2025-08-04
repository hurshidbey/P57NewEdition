# 🧪 Notification System Testing Checklist

## 📋 Pre-Testing Setup

- [ ] Ensure you're logged in as admin (hurshidbey@gmail.com or mustafaabdurahmonov7777@gmail.com)
- [ ] Have at least one free user account for testing
- [ ] Have at least one paid user account for testing
- [ ] Clear browser localStorage to reset shown popups

## 🔧 Admin Panel Testing

### 1. Creating Notifications
- [ ] Navigate to Admin Panel → Bildirishnomalar tab
- [ ] Click "Yangi bildirishnoma" button
- [ ] Test creating notification with:
  - [ ] Title and content (required fields)
  - [ ] Different target audiences (all/free/paid)
  - [ ] Toggle "Faol holat" on/off
  - [ ] Toggle "Popup sifatida ko'rsatish" on/off
  - [ ] Set priority (0-100)
  - [ ] Add CTA button (optional)
  - [ ] Set expiration date (optional)
- [ ] Verify form validation:
  - [ ] Cannot submit without title/content
  - [ ] CTA requires both text and URL
- [ ] Submit and verify success toast

### 2. Notifications List
- [ ] Verify all created notifications appear in table
- [ ] Check table displays:
  - [ ] Title with popup badge if applicable
  - [ ] Target audience badge (Barcha/Bepul/Pullik)
  - [ ] Status badge (Faol/Nofaol/Muddati tugagan)
  - [ ] Priority bar visualization
  - [ ] View/User/Click counts
  - [ ] Created date and creator
- [ ] Test action menu:
  - [ ] Analytics - opens detailed stats
  - [ ] Edit - pre-fills form correctly
  - [ ] Delete - shows confirmation and soft deletes

### 3. Analytics View
- [ ] Click analytics for a notification
- [ ] Verify displays:
  - [ ] Total views count
  - [ ] Unique users count
  - [ ] Dismiss rate percentage
  - [ ] CTA click rate (if applicable)
  - [ ] Engagement level indicator
  - [ ] All notification details

### 4. Editing Notifications
- [ ] Edit existing notification
- [ ] Change all fields
- [ ] Save changes
- [ ] Verify updates reflected in list

## 👤 User Experience Testing

### 1. Profile Page Notifications

#### Free User Testing
- [ ] Login as free user
- [ ] Navigate to profile page
- [ ] Verify only sees notifications targeted to "all" or "free"
- [ ] Check notification cards display:
  - [ ] Yellow background for unread
  - [ ] Title and content
  - [ ] Time ago (e.g., "2 daqiqa oldin")
  - [ ] "Tez tugaydi" badge if expiring soon
  - [ ] CTA button if configured
  - [ ] Dismiss (X) button
- [ ] Test dismiss functionality:
  - [ ] Click X button
  - [ ] Verify notification removed
  - [ ] Verify success toast
  - [ ] Refresh page - notification should not reappear
- [ ] Test CTA click:
  - [ ] Click CTA button
  - [ ] Verify opens in new tab
  - [ ] Check click tracked in admin analytics

#### Paid User Testing
- [ ] Login as paid user
- [ ] Navigate to profile page
- [ ] Verify sees notifications for "all" or "paid"
- [ ] Perform same tests as free user

### 2. Popup Notifications

#### First Login Test
- [ ] Clear localStorage (F12 → Application → Clear Storage)
- [ ] Create notification with:
  - [ ] "Popup sifatida ko'rsatish" enabled
  - [ ] High priority (90-100)
  - [ ] Target your test user type
- [ ] Logout and login again
- [ ] Wait 2 seconds after login
- [ ] Verify popup appears with:
  - [ ] "Muhim E'lon!" header
  - [ ] Yellow bell icon
  - [ ] Notification title and content
  - [ ] Cannot close by clicking outside
  - [ ] CTA button + "Keyinroq" button (if CTA exists)
  - [ ] Or single "Tushunarli" button (if no CTA)

#### Popup Interaction Test
- [ ] Test "Keyinroq"/dismiss:
  - [ ] Click dismiss button
  - [ ] Popup should close
  - [ ] Login again - same popup should NOT appear
- [ ] Test CTA click:
  - [ ] Create new popup with CTA
  - [ ] Clear localStorage and login
  - [ ] Click CTA button
  - [ ] Verify opens URL in new tab
  - [ ] Popup should close
  - [ ] Login again - popup should NOT appear

#### Multiple Popups Test
- [ ] Create 3 popup notifications with different priorities (30, 60, 90)
- [ ] Clear localStorage and login
- [ ] Verify only highest priority (90) popup shows
- [ ] Dismiss it and login again
- [ ] Next highest (60) should now show
- [ ] Continue until all shown

### 3. Empty States
- [ ] Delete/deactivate all notifications for a user
- [ ] Check profile page shows "Hozircha yangi bildirishnomalar yo'q"
- [ ] Verify bell icon with "0 ta" count

## 🔄 Integration Testing

### 1. Real-time Updates
- [ ] Have two browser windows open
- [ ] Window 1: Admin creates notification
- [ ] Window 2: User refreshes profile
- [ ] New notification should appear immediately

### 2. Expiration Testing
- [ ] Create notification expiring in 1 minute
- [ ] Wait for expiration
- [ ] Refresh user profile
- [ ] Expired notification should not appear
- [ ] Check admin panel shows "Muddati tugagan" status

### 3. Tier Transition Testing
- [ ] Login as free user with notifications
- [ ] Upgrade to paid (through payment flow)
- [ ] Return to profile
- [ ] Should now see paid-only notifications too

## 📱 Responsive Design Testing

### Mobile (320px - 768px)
- [ ] Admin panel:
  - [ ] Table scrolls horizontally
  - [ ] Form fields stack vertically
  - [ ] Action menus work on touch
- [ ] User profile:
  - [ ] Notification cards full width
  - [ ] Text remains readable
  - [ ] Buttons easily tappable
  - [ ] Popup fits screen

### Tablet (768px - 1024px)
- [ ] Admin panel table readable
- [ ] Forms maintain good layout
- [ ] Popups centered properly

### Desktop (1024px+)
- [ ] Full experience works as designed
- [ ] No unexpected layout breaks

## 🚨 Error Handling Testing

### 1. Network Errors
- [ ] Disable network (F12 → Network → Offline)
- [ ] Try to load notifications
- [ ] Should show error toast
- [ ] Re-enable network
- [ ] Refresh should work

### 2. Invalid Data
- [ ] Try to create notification with:
  - [ ] Empty required fields
  - [ ] Invalid URL in CTA
  - [ ] Past expiration date
- [ ] All should show appropriate errors

### 3. Permission Errors
- [ ] Try to access /admin/notifications as non-admin
- [ ] Should redirect to auth page
- [ ] API calls should return 401/403

## ⚡ Performance Testing

### 1. Load Testing
- [ ] Create 50+ notifications
- [ ] Check admin list performance:
  - [ ] Page loads quickly
  - [ ] Scrolling is smooth
  - [ ] Actions remain responsive
- [ ] Check user profile:
  - [ ] Notifications load quickly
  - [ ] No lag when dismissing

### 2. Memory Leaks
- [ ] Open profile with notifications
- [ ] Dismiss multiple notifications
- [ ] Check browser memory usage
- [ ] Should not continuously increase

## 🚀 Production Deployment Checklist

### Pre-Deployment
- [ ] All tests above pass locally
- [ ] No TypeScript errors (npm run check)
- [ ] Database migrations ready
- [ ] Environment variables confirmed

### Deployment Steps
1. [ ] Push code to production
2. [ ] Run database migrations:
   ```bash
   npx tsx migrations/add_notifications_table.sql
   npx tsx migrations/add_notification_interactions_table.sql
   ```
3. [ ] Rebuild and restart application
4. [ ] Test core functionality on production
5. [ ] Monitor error logs

### Post-Deployment Verification
- [ ] Admin can access notification panel
- [ ] Can create test notification
- [ ] Users see notifications
- [ ] Popups work after login
- [ ] Analytics tracking works
- [ ] No console errors
- [ ] Performance acceptable

## 🐛 Known Issues & Workarounds

1. **Popup doesn't show**: Clear localStorage and try again
2. **Old notifications appearing**: Check expiration dates
3. **Wrong user tier**: Verify user metadata in Supabase
4. **Analytics not updating**: Wait a moment and refresh

## 📊 Success Criteria

The notification system is considered fully functional when:
- ✅ Admins can create/edit/delete notifications
- ✅ Users see only relevant notifications
- ✅ Popups appear once per notification
- ✅ All interactions are tracked
- ✅ System handles errors gracefully
- ✅ Performance remains good with many notifications
- ✅ Works on all device sizes
- ✅ No security vulnerabilities