import { Request, Response, NextFunction } from 'express';
import { notificationService } from '../services/notification-service';
import { logger } from '../utils/logger';

/**
 * Middleware to check for unread popup notifications
 * Adds notification data to auth responses
 */
export async function checkNotificationPopups(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Only add to successful auth responses
  const originalJson = res.json;
  
  res.json = function(data: any) {
    // Check if this is an auth success response
    if (data?.user && data?.success !== false) {
      // Get user tier
      const userTier = data.user.user_metadata?.tier || 'free';
      
      // Check for unread popups asynchronously
      notificationService
        .getUnreadPopupNotifications(data.user.id, userTier as 'free' | 'paid')
        .then(popupNotifications => {
          if (popupNotifications.length > 0) {
            // Add highest priority unread popup to response
            const highestPriorityPopup = popupNotifications[0];
            data.popupNotification = highestPriorityPopup;
          }
        })
        .catch(error => {
          logger.error('Failed to check popup notifications', { 
            userId: data.user.id, 
            error 
          });
        });
    }
    
    // Call original json method
    return originalJson.call(this, data);
  };
  
  next();
}

/**
 * Middleware to add notification count to responses
 * Can be used on specific endpoints where you want to include notification info
 */
export async function addNotificationCount(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.user) {
    try {
      const userTier = req.user.user_metadata?.tier || 'free';
      const notifications = await notificationService.getNotificationsForUser(
        req.user.id,
        userTier as 'free' | 'paid'
      );
      
      // Add notification count to request for use in route handlers
      (req as any).notificationCount = notifications.length;
    } catch (error) {
      logger.error('Failed to get notification count', { 
        userId: req.user.id, 
        error 
      });
      (req as any).notificationCount = 0;
    }
  }
  
  next();
}