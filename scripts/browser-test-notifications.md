# 🧪 Browser Console Test Scripts for Notifications

Open your browser console (F12) while logged in as admin and run these scripts to test the notification system.

## 1. Create Test Notifications

```javascript
// Get auth token
const session = await (await fetch('/.auth/session')).json();
const token = session?.access_token;

// Create a popup notification for free users
const popup = await fetch('/api/admin/notifications', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    title: "🎉 50% chegirma - Faqat bugun!",
    content: "Barcha 57 ta protokolga kirish uchun 50% chegirma. Premium a'zolikni 149,500 so'm o'rniga atigi 74,750 so'mga oling! Bu chegirma faqat 24 soat amal qiladi.",
    targetAudience: "free",
    isActive: true,
    showAsPopup: true,
    priority: 100,
    ctaText: "Chegirmani olish",
    ctaUrl: "/payment",
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  })
});
console.log('Popup notification created:', await popup.json());

// Create a regular notification for all users
const regular = await fetch('/api/admin/notifications', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    title: "📚 Yangi AI vositalari qo'shildi",
    content: "Platformamizga 3 ta yangi AI vositalari qo'shildi: Claude, Perplexity va Midjourney. Hoziroq tekshirib ko'ring!",
    targetAudience: "all",
    isActive: true,
    showAsPopup: false,
    priority: 50,
    ctaText: "Ko'rish",
    ctaUrl: "/ai-tools"
  })
});
console.log('Regular notification created:', await regular.json());

// Create a paid-only notification
const paidOnly = await fetch('/api/admin/notifications', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    title: "🏆 Premium foydalanuvchilar uchun eksklyuziv",
    content: "Siz uchun maxsus 10 ta qo'shimcha prompt shablonlari tayyorladik. Ular faqat premium foydalanuvchilar uchun mavjud.",
    targetAudience: "paid",
    isActive: true,
    showAsPopup: false,
    priority: 60
  })
});
console.log('Paid-only notification created:', await paidOnly.json());
```

## 2. List All Notifications (Admin)

```javascript
const session = await (await fetch('/.auth/session')).json();
const token = session?.access_token;

const response = await fetch('/api/admin/notifications', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const notifications = await response.json();
console.table(notifications.data);
```

## 3. Test User Notifications View

```javascript
// As a logged-in user, fetch your notifications
const session = await (await fetch('/.auth/session')).json();
const token = session?.access_token;

const response = await fetch('/api/notifications', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const notifications = await response.json();
console.log('My notifications:', notifications.data);
```

## 4. Test Popup Notifications

```javascript
// Get only popup notifications
const session = await (await fetch('/.auth/session')).json();
const token = session?.access_token;

const response = await fetch('/api/notifications?popup=true', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const popups = await response.json();
console.log('Popup notifications:', popups.data);
```

## 5. Mark Notification as Viewed

```javascript
const notificationId = 1; // Replace with actual ID
const session = await (await fetch('/.auth/session')).json();
const token = session?.access_token;

const response = await fetch(`/api/notifications/${notificationId}/view`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
console.log('Marked as viewed:', await response.json());
```

## 6. Dismiss Notification

```javascript
const notificationId = 1; // Replace with actual ID
const session = await (await fetch('/.auth/session')).json();
const token = session?.access_token;

const response = await fetch(`/api/notifications/${notificationId}/dismiss`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
console.log('Dismissed:', await response.json());
```

## 7. Track CTA Click

```javascript
const notificationId = 1; // Replace with actual ID
const session = await (await fetch('/.auth/session')).json();
const token = session?.access_token;

const response = await fetch(`/api/notifications/${notificationId}/click`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
console.log('Click tracked:', await response.json());
```

## 8. Get Analytics for a Notification (Admin)

```javascript
const notificationId = 1; // Replace with actual ID
const session = await (await fetch('/.auth/session')).json();
const token = session?.access_token;

const response = await fetch(`/api/admin/notifications/${notificationId}/analytics`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const analytics = await response.json();
console.log('Analytics:', analytics.data);
```

## 9. Update Notification (Admin)

```javascript
const notificationId = 1; // Replace with actual ID
const session = await (await fetch('/.auth/session')).json();
const token = session?.access_token;

const response = await fetch(`/api/admin/notifications/${notificationId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    title: "Updated Title",
    priority: 90
  })
});
console.log('Updated:', await response.json());
```

## 10. Delete Notification (Admin)

```javascript
const notificationId = 1; // Replace with actual ID
const session = await (await fetch('/.auth/session')).json();
const token = session?.access_token;

const response = await fetch(`/api/admin/notifications/${notificationId}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
console.log('Deleted:', await response.json());
```

## 11. Clear Shown Popups (Reset for Testing)

```javascript
// Get current user ID
const session = await (await fetch('/.auth/session')).json();
const userId = session?.user?.id;

// Clear shown popups from localStorage
if (userId) {
  localStorage.removeItem(`protokol57_shown_popups_${userId}`);
  console.log('Cleared shown popups. Logout and login to see popups again.');
} else {
  console.log('No user ID found');
}
```

## 12. Check Current Shown Popups

```javascript
const session = await (await fetch('/.auth/session')).json();
const userId = session?.user?.id;

if (userId) {
  const shownPopups = localStorage.getItem(`protokol57_shown_popups_${userId}`);
  console.log('Shown popup IDs:', shownPopups ? JSON.parse(shownPopups) : []);
}
```