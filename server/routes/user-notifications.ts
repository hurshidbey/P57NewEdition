import { Router, Request, Response } from 'express';
import { notificationService } from '../services/notification-service';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /api/notifications
 * Get active notifications for current user
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
    }

    // Get user tier - check both places for compatibility
    const userTier = user.tier || user.user_metadata?.tier || user.supabaseUser?.user_metadata?.tier || 'free';
    
    logger.info('Getting notifications for user', {
      userId: user.id,
      userTier,
      userEmail: user.email,
      tierSources: {
        direct: user.tier,
        metadata: user.user_metadata?.tier,
        supabase: user.supabaseUser?.user_metadata?.tier
      }
    });

    // Get notifications for user
    let notifications = await notificationService.getNotificationsForUser(
      user.id,
      userTier as 'free' | 'paid'
    );

    // Transform snake_case to camelCase for frontend compatibility
    const transformedNotifications = notifications.map(n => ({
      id: n.id,
      title: n.title,
      content: n.content,
      targetAudience: n.target_audience,
      showAsPopup: n.show_as_popup,
      priority: n.priority,
      ctaText: n.cta_text,
      ctaUrl: n.cta_url,
      createdAt: n.created_at,
      expiresAt: n.expires_at,
      isRead: false, // We'll implement read tracking later
      isDismissed: false, // We'll implement dismiss tracking later
    }));

    // Filter for popup notifications if requested
    let filteredNotifications = transformedNotifications;
    if (req.query.popup === 'true') {
      filteredNotifications = transformedNotifications.filter(n => n.showAsPopup);
    }

    res.json({
      success: true,
      data: filteredNotifications,
    });
  } catch (error) {
    logger.error('Failed to get user notifications', { 
      userId: req.user?.id, 
      error 
    });
    res.status(500).json({
      success: false,
      message: 'Failed to get notifications',
    });
  }
});

/**
 * POST /api/notifications/:id/view
 * Mark notification as viewed
 */
router.post('/:id/view', async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
    }

    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid notification ID',
      });
    }

    await notificationService.recordInteraction(id, user.id, 'view');

    res.json({
      success: true,
      message: 'Notification marked as viewed',
    });
  } catch (error) {
    logger.error('Failed to mark notification as viewed', { 
      notificationId: req.params.id,
      userId: req.user?.id, 
      error 
    });
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as viewed',
    });
  }
});

/**
 * POST /api/notifications/:id/dismiss
 * Mark notification as dismissed
 */
router.post('/:id/dismiss', async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
    }

    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid notification ID',
      });
    }

    await notificationService.recordInteraction(id, user.id, 'dismiss');

    res.json({
      success: true,
      message: 'Notification dismissed',
    });
  } catch (error) {
    logger.error('Failed to dismiss notification', { 
      notificationId: req.params.id,
      userId: req.user?.id, 
      error 
    });
    res.status(500).json({
      success: false,
      message: 'Failed to dismiss notification',
    });
  }
});

/**
 * POST /api/notifications/:id/click
 * Track CTA click
 */
router.post('/:id/click', async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
    }

    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid notification ID',
      });
    }

    await notificationService.recordInteraction(id, user.id, 'click');

    res.json({
      success: true,
      message: 'Click tracked',
    });
  } catch (error) {
    logger.error('Failed to track notification click', { 
      notificationId: req.params.id,
      userId: req.user?.id, 
      error 
    });
    res.status(500).json({
      success: false,
      message: 'Failed to track click',
    });
  }
});

/**
 * GET /api/notifications/popup
 * Get unread popup notifications for current user
 */
router.get('/popup', async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
    }

    // Get user tier - check both places for compatibility
    const userTier = user.tier || user.user_metadata?.tier || user.supabaseUser?.user_metadata?.tier || 'free';

    // Get unread popup notifications
    const popupNotifications = await notificationService.getUnreadPopupNotifications(
      user.id,
      userTier as 'free' | 'paid'
    );

    // Transform snake_case to camelCase for frontend compatibility
    const transformedNotifications = popupNotifications.map(n => ({
      id: n.id,
      title: n.title,
      content: n.content,
      targetAudience: n.target_audience,
      showAsPopup: n.show_as_popup,
      priority: n.priority,
      ctaText: n.cta_text,
      ctaUrl: n.cta_url,
      createdAt: n.created_at,
      expiresAt: n.expires_at,
      isRead: false,
      isDismissed: false,
    }));

    res.json({
      success: true,
      data: transformedNotifications,
    });
  } catch (error) {
    logger.error('Failed to get popup notifications', { 
      userId: req.user?.id, 
      error 
    });
    res.status(500).json({
      success: false,
      message: 'Failed to get popup notifications',
    });
  }
});

export default router;