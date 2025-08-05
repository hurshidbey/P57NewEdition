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
  target_audience: 'all' | 'free' | 'paid';
  is_active?: boolean;
  show_as_popup?: boolean;
  priority?: number;
  cta_text?: string;
  cta_url?: string;
  created_by: string;
  expires_at?: Date;
}

export interface UpdateNotificationInput {
  title?: string;
  content?: string;
  target_audience?: 'all' | 'free' | 'paid';
  is_active?: boolean;
  show_as_popup?: boolean;
  priority?: number;
  cta_text?: string;
  cta_url?: string;
  expires_at?: Date | null;
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
          target_audience: data.target_audience,
          is_active: data.is_active ?? true,
          show_as_popup: data.show_as_popup ?? false,
          priority: data.priority ?? 0,
          cta_text: data.cta_text,
          cta_url: data.cta_url,
          created_by: data.created_by,
          expires_at: data.expires_at,
        })
        .select()
        .single();

      if (error) {
        logger.error('Supabase insert error', {
          error: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          data: data,
        });
        throw error;
      }

      if (!notification) {
        throw new Error('No notification returned from database');
      }

      logger.info('Created notification', { 
        notificationId: notification.id,
        title: notification.title,
        target_audience: notification.target_audience 
      });

      return notification;
    } catch (error) {
      logger.error('Failed to create notification', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error instanceof Error ? error : new Error('Failed to create notification');
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
        .eq('is_active', true)
        .in('target_audience', ['all', userTier])
        .or(`expires_at.is.null,expires_at.gte.${now}`)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

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
          ...(data.title !== undefined && { title: data.title }),
          ...(data.content !== undefined && { content: data.content }),
          ...(data.target_audience !== undefined && { target_audience: data.target_audience }),
          ...(data.is_active !== undefined && { is_active: data.is_active }),
          ...(data.show_as_popup !== undefined && { show_as_popup: data.show_as_popup }),
          ...(data.priority !== undefined && { priority: data.priority }),
          ...(data.cta_text !== undefined && { cta_text: data.cta_text }),
          ...(data.cta_url !== undefined && { cta_url: data.cta_url }),
          ...(data.expires_at !== undefined && { expires_at: data.expires_at === null ? null : data.expires_at }),
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
        .update({ is_active: false })
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
        .from('notification_interactions')
        .select('*')
        .eq('notification_id', notificationId)
        .eq('user_id', userId)
        .single();

      const now = new Date().toISOString();
      const updateData: any = {};

      switch (type) {
        case 'view':
          updateData.viewed_at = now;
          break;
        case 'dismiss':
          updateData.dismissed_at = now;
          break;
        case 'click':
          updateData.clicked_at = now;
          break;
      }

      if (existing) {
        // Update existing record
        const { error } = await this.supabase
          .from('notification_interactions')
          .update(updateData)
          .eq('id', existing.id);
          
        if (error) throw error;
      } else {
        // Create new record
        const { error } = await this.supabase
          .from('notification_interactions')
          .insert({
            notification_id: notificationId,
            user_id: userId,
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
        .from('notification_interactions')
        .select('*')
        .eq('notification_id', id);

      if (error) throw error;

      const interactionsList = interactions || [];
      
      // Calculate stats
      const viewCount = interactionsList.filter(i => i.viewed_at).length;
      const dismissCount = interactionsList.filter(i => i.dismissed_at).length;
      const clickCount = interactionsList.filter(i => i.clicked_at).length;
      const uniqueUserCount = new Set(interactionsList.map(i => i.user_id)).size;

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
      // Get all notifications (including soft-deleted for admin view)
      const { data: allNotifications, error } = await this.supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

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
      const popupOnly = popupNotifications.filter(n => n.show_as_popup);

      if (popupOnly.length === 0) {
        return [];
      }

      // Check which ones have been viewed
      const { data: interactions, error } = await this.supabase
        .from('notification_interactions')
        .select('*')
        .eq('user_id', userId)
        .in('notification_id', popupOnly.map(n => n.id))
        .not('viewed_at', 'is', null);

      if (error) throw error;

      const viewedIds = new Set((interactions || []).map(i => i.notification_id));
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