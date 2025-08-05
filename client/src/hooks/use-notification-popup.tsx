import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

interface PopupNotification {
  id: number;
  title: string;
  content: string;
  ctaText?: string;
  ctaUrl?: string;
  priority: number;
}

export function useNotificationPopup() {
  const { user } = useAuth();
  const [popupNotification, setPopupNotification] = useState<PopupNotification | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Check for popup notifications when user logs in
  const checkForPopupNotifications = useCallback(async () => {
    if (!user?.id) return;

    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      
      if (!token) {
        console.warn('No auth token available for popup notifications');
        return;
      }
      
      // Get user's tier from metadata
      const userTier = user.tier || 'free';
      
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      // Fetch notifications with popup flag
      const response = await fetch('/api/notifications?popup=true', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 404) {
          // Notifications endpoint not available - silently skip
          return;
        }
        throw new Error(`Failed to fetch popup notifications: ${response.status}`);
      }

      const data = await response.json();
      const notifications = Array.isArray(data.data) ? data.data : [];

      // Get list of shown popup IDs from localStorage  
      const shownPopupsKey = `protokol57_shown_popups_${user.id}`;
      let shownPopupIds: number[] = [];
      
      try {
        shownPopupIds = JSON.parse(localStorage.getItem(shownPopupsKey) || '[]');
        if (!Array.isArray(shownPopupIds)) shownPopupIds = [];
      } catch (e) {
        console.warn('Error parsing shown popup IDs from localStorage');
        shownPopupIds = [];
      }

      // Filter out already shown popups
      const unshownPopups = notifications.filter((n: PopupNotification) => 
        n && typeof n.id === 'number' && !shownPopupIds.includes(n.id)
      );

      if (unshownPopups.length > 0) {
        // Get highest priority popup
        const highestPriorityPopup = unshownPopups.reduce((prev: PopupNotification, current: PopupNotification) => 
          (current.priority || 0) > (prev.priority || 0) ? current : prev
        );

        // Show popup after a delay
        const timeoutHandle = setTimeout(() => {
          setPopupNotification(highestPriorityPopup);
          setIsOpen(true);
          
          // Mark as viewed
          markAsViewed(highestPriorityPopup.id).catch(err => 
            console.warn('Failed to mark popup as viewed:', err)
          );
        }, 2000); // 2 second delay after login
        
        // Cleanup timeout if component unmounts
        return () => clearTimeout(timeoutHandle);
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn('Popup notification fetch timed out');
      } else {
        console.error('Error checking for popup notifications:', error);
      }
    }
  }, [user?.id]);

  const markAsViewed = async (notificationId: number) => {
    if (!user?.id || !notificationId) return;

    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      
      if (!token) return;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      await fetch(`/api/notifications/${notificationId}/view`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
    } catch (error) {
      if (!(error instanceof Error && error.name === 'AbortError')) {
        console.error('Error marking notification as viewed:', error);
      }
    }
  };

  const handleDismiss = useCallback(async (notificationId: number) => {
    if (!user) return;

    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      
      // Mark as dismissed
      await fetch(`/api/notifications/${notificationId}/dismiss`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      // Add to shown popups list
      const shownPopupsKey = `protokol57_shown_popups_${user.id}`;
      const shownPopupIds = JSON.parse(localStorage.getItem(shownPopupsKey) || '[]');
      shownPopupIds.push(notificationId);
      localStorage.setItem(shownPopupsKey, JSON.stringify(shownPopupIds));

      // Close popup
      setIsOpen(false);
      setPopupNotification(null);
    } catch (error) {
      console.error('Error dismissing notification:', error);
      // Still close popup even if API call fails
      setIsOpen(false);
      setPopupNotification(null);
    }
  }, [user]);

  const handleCTAClick = useCallback(async (notificationId: number, url: string) => {
    if (!user) return;

    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      
      // Track click
      await fetch(`/api/notifications/${notificationId}/click`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      // Add to shown popups list
      const shownPopupsKey = `protokol57_shown_popups_${user.id}`;
      const shownPopupIds = JSON.parse(localStorage.getItem(shownPopupsKey) || '[]');
      if (!shownPopupIds.includes(notificationId)) {
        shownPopupIds.push(notificationId);
        localStorage.setItem(shownPopupsKey, JSON.stringify(shownPopupIds));
      }

      // Open URL in new tab
      window.open(url, '_blank', 'noopener,noreferrer');
      
      // Close popup
      setIsOpen(false);
      setPopupNotification(null);
    } catch (error) {
      console.error('Error tracking CTA click:', error);
      // Still open URL even if tracking fails
      window.open(url, '_blank', 'noopener,noreferrer');
      setIsOpen(false);
      setPopupNotification(null);
    }
  }, [user]);

  // Check for popups when user logs in
  useEffect(() => {
    if (user) {
      checkForPopupNotifications();
    }
  }, [user?.id]); // Only re-run when user ID changes (login/logout)

  return {
    popupNotification,
    isOpen,
    handleDismiss,
    handleCTAClick,
  };
}