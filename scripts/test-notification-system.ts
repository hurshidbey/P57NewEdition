import { db } from '../server/db';
import { notifications, notificationInteractions } from '../shared/schema';
import { eq } from 'drizzle-orm';

/**
 * Manual test script for the notification system
 * Run with: npx tsx scripts/test-notification-system.ts
 */

async function testNotificationSystem() {
  console.log('🧪 Testing Notification System...\n');

  try {
    // 1. Create test notifications
    console.log('1️⃣ Creating test notifications...');
    
    const testNotifications = [
      {
        title: "🎉 50% chegirma barcha protokollarga!",
        content: "Faqat bugun! Barcha 57 ta protokolga kirish uchun 50% chegirma. Premium a'zolikni 149,500 so'm o'rniga atigi 74,750 so'mga oling!",
        targetAudience: 'free' as const,
        isActive: true,
        showAsPopup: true,
        priority: 100,
        ctaText: "Chegirmani olish",
        ctaUrl: "/payment",
        createdBy: "test@admin.com",
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Expires in 24 hours
      },
      {
        title: "📚 Yangi protokollar qo'shildi",
        content: "Platformamizga 5 ta yangi AI prompting protokollari qo'shildi. Premium foydalanuvchilar uchun darhol mavjud!",
        targetAudience: 'paid' as const,
        isActive: true,
        showAsPopup: false,
        priority: 50,
        ctaText: "Ko'rish",
        ctaUrl: "/protocols",
        createdBy: "test@admin.com",
      },
      {
        title: "🔧 Tizim yangilanishi",
        content: "Ertaga soat 10:00-11:00 oralig'ida texnik ishlar olib boriladi. Bu vaqtda platforma vaqtincha ishlamasligi mumkin.",
        targetAudience: 'all' as const,
        isActive: true,
        showAsPopup: false,
        priority: 80,
        createdBy: "test@admin.com",
      },
    ];

    const createdNotifications = [];
    for (const notification of testNotifications) {
      const [created] = await db.insert(notifications).values(notification).returning();
      createdNotifications.push(created);
      console.log(`✅ Created notification: "${created.title}" (ID: ${created.id})`);
    }

    // 2. Test listing notifications
    console.log('\n2️⃣ Listing active notifications...');
    const activeNotifications = await db
      .select()
      .from(notifications)
      .where(eq(notifications.isActive, true));
    
    console.log(`Found ${activeNotifications.length} active notifications`);

    // 3. Test interaction recording
    console.log('\n3️⃣ Testing interaction recording...');
    const testUserId = 'test-user-123';
    const notificationId = createdNotifications[0].id;

    // Record view
    await db.insert(notificationInteractions).values({
      notificationId,
      userId: testUserId,
      viewedAt: new Date(),
    });
    console.log('✅ Recorded view interaction');

    // Update to record dismiss
    await db
      .update(notificationInteractions)
      .set({ dismissedAt: new Date() })
      .where(eq(notificationInteractions.notificationId, notificationId));
    console.log('✅ Recorded dismiss interaction');

    // 4. Test filtering by target audience
    console.log('\n4️⃣ Testing audience filtering...');
    const freeUserNotifications = activeNotifications.filter(
      n => n.targetAudience === 'all' || n.targetAudience === 'free'
    );
    const paidUserNotifications = activeNotifications.filter(
      n => n.targetAudience === 'all' || n.targetAudience === 'paid'
    );

    console.log(`Free users see: ${freeUserNotifications.length} notifications`);
    console.log(`Paid users see: ${paidUserNotifications.length} notifications`);

    // 5. Test popup filtering
    console.log('\n5️⃣ Testing popup notifications...');
    const popupNotifications = activeNotifications.filter(n => n.showAsPopup);
    console.log(`Found ${popupNotifications.length} popup notifications`);
    
    if (popupNotifications.length > 0) {
      const highestPriority = popupNotifications.reduce((prev, current) => 
        current.priority > prev.priority ? current : prev
      );
      console.log(`Highest priority popup: "${highestPriority.title}" (Priority: ${highestPriority.priority})`);
    }

    // 6. Test expiration
    console.log('\n6️⃣ Testing expiration logic...');
    const now = new Date();
    const expiredNotifications = activeNotifications.filter(
      n => n.expiresAt && new Date(n.expiresAt) < now
    );
    const activeNonExpired = activeNotifications.filter(
      n => !n.expiresAt || new Date(n.expiresAt) >= now
    );

    console.log(`Expired notifications: ${expiredNotifications.length}`);
    console.log(`Active non-expired: ${activeNonExpired.length}`);

    console.log('\n✅ All tests completed successfully!\n');

    // Cleanup option
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('Do you want to clean up test data? (y/n): ', async (answer: string) => {
      if (answer.toLowerCase() === 'y') {
        console.log('\n🧹 Cleaning up test data...');
        
        // Delete test interactions
        await db
          .delete(notificationInteractions)
          .where(eq(notificationInteractions.userId, testUserId));
        
        // Delete test notifications
        for (const notification of createdNotifications) {
          await db
            .delete(notifications)
            .where(eq(notifications.id, notification.id));
        }
        
        console.log('✅ Test data cleaned up');
      }
      
      rl.close();
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testNotificationSystem();