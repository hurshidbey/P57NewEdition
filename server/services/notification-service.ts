import { createClient } from '@supabase/supabase-js';
import { 
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
  private supabase: any;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not found');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }
  /**
   * Create a new notification
   */
  async createNotification(data: CreateNotificationInput): Promise<Notification> {
    try {
      const { data: notification, error } = await this.supabase
        .from('notifications')
        .insert({
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
        .select()
        .single();

      if (error) throw error;

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
      const now = new Date().toISOString();
      
      // Get notifications that are active, match user tier, and not expired
      const { data: userNotifications, error } = await this.supabase
        .from('notifications')
        .select('*')
        .eq('isActive', true)
        .in('targetAudience', ['all', userTier])
        .or(`expiresAt.is.null,expiresAt.gte.${now}`)
        .order('priority', { ascending: false })
        .order('createdAt', { ascending: false });

      if (error) throw error;

      return userNotifications || [];
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
      const { data: notification, error } = await this.supabase
        .from('notifications')
        .select('*')
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = Row not found
      
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
      const { data: updated, error } = await this.supabase
        .from('notifications')
        .update({
          ...data,
          // Handle null for expiresAt
          expiresAt: data.expiresAt === null ? null : data.expiresAt,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
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
      const { error } = await this.supabase
        .from('notifications')
        .update({ isActive: false })
        .eq('id', id);

      if (error) throw error;

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
      const { data: existing } = await this.supabase
        .from('notificationInteractions')
        .select('*')
        .eq('notificationId', notificationId)
        .eq('userId', userId)
        .single();

      const now = new Date().toISOString();
      const updateData: any = {};

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
        const { error } = await this.supabase
          .from('notificationInteractions')
          .update(updateData)
          .eq('id', existing.id);
          
        if (error) throw error;
      } else {
        // Create new record
        const { error } = await this.supabase
          .from('notificationInteractions')
          .insert({
            notificationId,
            userId,
            ...updateData,
          });
          
        if (error) throw error;
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

      // Get all interactions for this notification
      const { data: interactions, error } = await this.supabase
        .from('notificationInteractions')
        .select('*')
        .eq('notificationId', id);

      if (error) throw error;

      const interactionsList = interactions || [];
      
      // Calculate stats
      const viewCount = interactionsList.filter(i => i.viewedAt).length;
      const dismissCount = interactionsList.filter(i => i.dismissedAt).length;
      const clickCount = interactionsList.filter(i => i.clickedAt).length;
      const uniqueUserCount = new Set(interactionsList.map(i => i.userId)).size;

      return {
        ...notification,
        viewCount,
        dismissCount,
        clickCount,
        uniqueUserCount,
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
      const { data: allNotifications, error } = await this.supabase
        .from('notifications')
        .select('*')
        .order('createdAt', { ascending: false });

      if (error) throw error;

      // Get stats for each notification
      const notificationsWithStats = await Promise.all(
        (allNotifications || []).map(async (notification) => {
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
      const { data: interactions, error } = await this.supabase
        .from('notificationInteractions')
        .select('*')
        .eq('userId', userId)
        .in('notificationId', popupOnly.map(n => n.id))
        .not('viewedAt', 'is', null);

      if (error) throw error;

      const viewedIds = new Set((interactions || []).map(i => i.notificationId));
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