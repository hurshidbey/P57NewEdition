import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { notificationService } from '../services/notification-service';
import { logger } from '../utils/logger';

const router = Router();

// Validation schemas
const createNotificationSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(2000),
  targetAudience: z.enum(['all', 'free', 'paid']),
  isActive: z.boolean().optional(),
  showAsPopup: z.boolean().optional(),
  priority: z.number().min(0).max(100).optional(),
  ctaText: z.string().max(50).optional(),
  ctaUrl: z.string().url().optional(),
  expiresAt: z.string().datetime().optional(),
});

const updateNotificationSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).max(2000).optional(),
  targetAudience: z.enum(['all', 'free', 'paid']).optional(),
  isActive: z.boolean().optional(),
  showAsPopup: z.boolean().optional(),
  priority: z.number().min(0).max(100).optional(),
  ctaText: z.string().max(50).optional().nullable(),
  ctaUrl: z.string().url().optional().nullable(),
  expiresAt: z.string().datetime().optional().nullable(),
});

/**
 * GET /api/admin/notifications
 * List all notifications with analytics
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const notifications = await notificationService.getAllNotificationsWithStats();
    
    res.json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    logger.error('Failed to get notifications', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notifications',
    });
  }
});

/**
 * POST /api/admin/notifications
 * Create a new notification
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validatedData = createNotificationSchema.parse(req.body);
    
    // Get admin email from auth
    const adminEmail = req.user?.email || 'admin';

    // Create notification
    const notification = await notificationService.createNotification({
      ...validatedData,
      createdBy: adminEmail,
      expiresAt: validatedData.expiresAt ? new Date(validatedData.expiresAt) : undefined,
    });

    logger.info('Admin created notification', {
      notificationId: notification.id,
      adminEmail,
      title: notification.title,
    });

    res.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input',
        errors: error.errors,
      });
    }

    logger.error('Failed to create notification', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create notification',
    });
  }
});

/**
 * PUT /api/admin/notifications/:id
 * Update an existing notification
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid notification ID',
      });
    }

    // Validate request body
    const validatedData = updateNotificationSchema.parse(req.body);

    // Update notification
    const notification = await notificationService.updateNotification(id, {
      ...validatedData,
      expiresAt: validatedData.expiresAt === null 
        ? null 
        : validatedData.expiresAt 
          ? new Date(validatedData.expiresAt) 
          : undefined,
    });

    logger.info('Admin updated notification', {
      notificationId: id,
      adminEmail: req.user?.email,
    });

    res.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input',
        errors: error.errors,
      });
    }

    logger.error('Failed to update notification', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update notification',
    });
  }
});

/**
 * DELETE /api/admin/notifications/:id
 * Soft delete a notification
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid notification ID',
      });
    }

    await notificationService.deleteNotification(id);

    logger.info('Admin deleted notification', {
      notificationId: id,
      adminEmail: req.user?.email,
    });

    res.json({
      success: true,
      message: 'Notification deleted successfully',
    });
  } catch (error) {
    logger.error('Failed to delete notification', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
    });
  }
});

/**
 * GET /api/admin/notifications/:id/analytics
 * Get detailed analytics for a notification
 */
router.get('/:id/analytics', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid notification ID',
      });
    }

    const analytics = await notificationService.getNotificationAnalytics(id);

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    logger.error('Failed to get notification analytics', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notification analytics',
    });
  }
});

export default router;