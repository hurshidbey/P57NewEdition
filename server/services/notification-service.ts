import { eq, and, or, gte, lt, desc, sql, isNull } from 'drizzle-orm';
import { db } from '../db';
import { 
  notifications, 
  notificationInteractions, 
  type Notification, 
  type NotificationInteraction,
  type InsertNotification 
} from '../../shared/schema';
import { logger } from '../utils/logger';

export interface CreateNotificationInput {
  title: string;
  content: string;
  targetAudience: 'all' | 'free' | 'paid';
  isActive?: boolean;
  showAsPopup?: boolean;
  priority?: number;
  ctaText?: string;
  ctaUrl?: string;
  createdBy: string;
  expiresAt?: Date;
}

export interface UpdateNotificationInput {
  title?: string;
  content?: string;
  targetAudience?: 'all' | 'free' | 'paid';
  isActive?: boolean;
  showAsPopup?: boolean;
  priority?: number;
  ctaText?: string;
  ctaUrl?: string;
  expiresAt?: Date | null;
}

export interface NotificationWithStats extends Notification {
  viewCount: number;
  dismissCount: number;
  clickCount: number;
  uniqueUserCount: number;
}

export class NotificationService {
  /**
   * Create a new notification
   */
  async createNotification(data: CreateNotificationInput): Promise<Notification> {
    try {
      const [notification] = await db
        .insert(notifications)
        .values({
          title: data.title,
          content: data.content,
          targetAudience: data.targetAudience,
          isActive: data.isActive ?? true,
          showAsPopup: data.showAsPopup ?? false,
          priority: data.priority ?? 0,
          ctaText: data.ctaText,
          ctaUrl: data.ctaUrl,
          createdBy: data.createdBy,
          expiresAt: data.expiresAt,
        })
        .returning();

      logger.info('Created notification', { 
        notificationId: notification.id,
        title: notification.title,
        targetAudience: notification.targetAudience 
      });

      return notification;
    } catch (error) {
      logger.error('Failed to create notification', error);
      throw new Error('Failed to create notification');
    }
  }

  /**
   * Get notifications for a specific user based on their tier
   */
  async getNotificationsForUser(userId: string, userTier: 'free' | 'paid'): Promise<Notification[]> {
    try {
      const now = new Date();
      
      // Build query conditions
      const conditions = and(
        eq(notifications.isActive, true),
        or(
          eq(notifications.targetAudience, 'all'),
          eq(notifications.targetAudience, userTier)
        ),
        or(
          isNull(notifications.expiresAt),
          gte(notifications.expiresAt, now)
        )
      );

      // Get notifications ordered by priority and creation date
      const userNotifications = await db
        .select()
        .from(notifications)
        .where(conditions)
        .orderBy(desc(notifications.priority), desc(notifications.createdAt));

      return userNotifications;
    } catch (error) {
      logger.error('Failed to get notifications for user', { userId, error });
      throw new Error('Failed to get notifications');
    }
  }

  /**
   * Get a single notification by ID
   */
  async getNotificationById(id: number): Promise<Notification | null> {
    try {
      const [notification] = await db
        .select()
        .from(notifications)
        .where(eq(notifications.id, id))
        .limit(1);

      return notification || null;
    } catch (error) {
      logger.error('Failed to get notification', { id, error });
      throw new Error('Failed to get notification');
    }
  }

  /**
   * Update an existing notification
   */
  async updateNotification(id: number, data: UpdateNotificationInput): Promise<Notification> {
    try {
      const [updated] = await db
        .update(notifications)
        .set({
          ...data,
          // Handle null for expiresAt
          expiresAt: data.expiresAt === null ? null : data.expiresAt,
        })
        .where(eq(notifications.id, id))
        .returning();

      if (!updated) {
        throw new Error('Notification not found');
      }

      logger.info('Updated notification', { notificationId: id });
      return updated;
    } catch (error) {
      logger.error('Failed to update notification', { id, error });
      throw new Error('Failed to update notification');
    }
  }

  /**
   * Soft delete a notification (set isActive = false)
   */
  async deleteNotification(id: number): Promise<void> {
    try {
      await db
        .update(notifications)
        .set({ isActive: false })
        .where(eq(notifications.id, id));

      logger.info('Soft deleted notification', { notificationId: id });
    } catch (error) {
      logger.error('Failed to delete notification', { id, error });
      throw new Error('Failed to delete notification');
    }
  }

  /**
   * Record user interaction with a notification
   */
  async recordInteraction(
    notificationId: number, 
    userId: string, 
    type: 'view' | 'dismiss' | 'click'
  ): Promise<void> {
    try {
      // Check if interaction record exists
      const [existing] = await db
        .select()
        .from(notificationInteractions)
        .where(
          and(
            eq(notificationInteractions.notificationId, notificationId),
            eq(notificationInteractions.userId, userId)
          )
        )
        .limit(1);

      const now = new Date();
      const updateData: Partial<NotificationInteraction> = {};

      switch (type) {
        case 'view':
          updateData.viewedAt = now;
          break;
        case 'dismiss':
          updateData.dismissedAt = now;
          break;
        case 'click':
          updateData.clickedAt = now;
          break;
      }

      if (existing) {
        // Update existing record
        await db
          .update(notificationInteractions)
          .set(updateData)
          .where(eq(notificationInteractions.id, existing.id));
      } else {
        // Create new record
        await db
          .insert(notificationInteractions)
          .values({
            notificationId,
            userId,
            ...updateData,
          });
      }

      logger.info('Recorded notification interaction', { 
        notificationId, 
        userId, 
        type 
      });
    } catch (error) {
      logger.error('Failed to record interaction', { 
        notificationId, 
        userId, 
        type, 
        error 
      });
      // Don't throw - we don't want to break the flow if tracking fails
    }
  }

  /**
   * Get analytics for a notification
   */
  async getNotificationAnalytics(id: number): Promise<NotificationWithStats> {
    try {
      // Get notification
      const notification = await this.getNotificationById(id);
      if (!notification) {
        throw new Error('Notification not found');
      }

      // Get interaction stats
      const stats = await db
        .select({
          viewCount: sql<number>`COUNT(CASE WHEN viewed_at IS NOT NULL THEN 1 END)`,
          dismissCount: sql<number>`COUNT(CASE WHEN dismissed_at IS NOT NULL THEN 1 END)`,
          clickCount: sql<number>`COUNT(CASE WHEN clicked_at IS NOT NULL THEN 1 END)`,
          uniqueUserCount: sql<number>`COUNT(DISTINCT user_id)`,
        })
        .from(notificationInteractions)
        .where(eq(notificationInteractions.notificationId, id));

      const analyticsData = stats[0] || {
        viewCount: 0,
        dismissCount: 0,
        clickCount: 0,
        uniqueUserCount: 0,
      };

      return {
        ...notification,
        viewCount: Number(analyticsData.viewCount),
        dismissCount: Number(analyticsData.dismissCount),
        clickCount: Number(analyticsData.clickCount),
        uniqueUserCount: Number(analyticsData.uniqueUserCount),
      };
    } catch (error) {
      logger.error('Failed to get notification analytics', { id, error });
      throw new Error('Failed to get notification analytics');
    }
  }

  /**
   * Get all notifications with stats (for admin)
   */
  async getAllNotificationsWithStats(): Promise<NotificationWithStats[]> {
    try {
      // Get all notifications
      const allNotifications = await db
        .select()
        .from(notifications)
        .orderBy(desc(notifications.createdAt));

      // Get stats for each notification
      const notificationsWithStats = await Promise.all(
        allNotifications.map(async (notification) => {
          const stats = await this.getNotificationAnalytics(notification.id);
          return stats;
        })
      );

      return notificationsWithStats;
    } catch (error) {
      logger.error('Failed to get all notifications with stats', error);
      throw new Error('Failed to get notifications');
    }
  }

  /**
   * Check if user has unread popup notifications
   */
  async getUnreadPopupNotifications(userId: string, userTier: 'free' | 'paid'): Promise<Notification[]> {
    try {
      // Get all active popup notifications for user
      const popupNotifications = await this.getNotificationsForUser(userId, userTier);
      const popupOnly = popupNotifications.filter(n => n.showAsPopup);

      if (popupOnly.length === 0) {
        return [];
      }

      // Check which ones have been viewed
      const interactions = await db
        .select()
        .from(notificationInteractions)
        .where(
          and(
            eq(notificationInteractions.userId, userId),
            sql`notification_id IN ${sql.raw(`(${popupOnly.map(n => n.id).join(',')})`)}`,
            sql`viewed_at IS NOT NULL`
          )
        );

      const viewedIds = new Set(interactions.map(i => i.notificationId));
      const unreadPopups = popupOnly.filter(n => !viewedIds.has(n.id));

      return unreadPopups;
    } catch (error) {
      logger.error('Failed to get unread popup notifications', { userId, error });
      return [];
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();