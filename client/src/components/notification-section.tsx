import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useUserTier } from '@/hooks/use-user-tier';
import { supabase } from '@/lib/supabase';
import NotificationCard from './notification-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Bell, BellOff } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/use-debounce';

interface Notification {
  id: number;
  title: string;
  content: string;
  targetAudience: 'all' | 'free' | 'paid';
  showAsPopup: boolean;
  priority: number;
  ctaText?: string;
  ctaUrl?: string;
  createdAt: string;
  expiresAt?: string;
  isRead?: boolean;
  isDismissed?: boolean;
}

function NotificationSection() {
  console.log('NotificationSection RENDERING');
  
  const { user } = useAuth();
  const { tier } = useUserTier();
  const [notifications, setNotificationsRaw] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const hasFetchedRef = useRef(false);
  const notificationsRef = useRef<Notification[]>([]);
  
  useEffect(() => {
    console.log('NotificationSection MOUNTED');
    return () => {
      console.log('NotificationSection UNMOUNTING');
    };
  }, []);
  
  // Single wrapper to track ALL setNotifications calls
  const setNotifications = (value: Notification[] | ((prev: Notification[]) => Notification[])) => {
    if (typeof value === 'function') {
      setNotificationsRaw(prev => {
        const result = value(prev);
        console.log('SET_NOTIFICATIONS (function):', {
          prevLength: prev?.length,
          newLength: result?.length,
          isEmpty: !result || result.length === 0,
          caller: new Error().stack?.split('\n')[2]
        });
        notificationsRef.current = result || [];
        return result;
      });
    } else {
      console.log('SET_NOTIFICATIONS (direct):', {
        newLength: value?.length,
        isEmpty: !value || value.length === 0,
        value: value,
        caller: new Error().stack?.split('\n')[2]
      });
      notificationsRef.current = value || [];
      setNotificationsRaw(value);
    }
  };

  const fetchNotifications = async () => {
    // Prevent duplicate fetches
    if (isFetching) {
      console.log('Already fetching notifications, skipping...');
      return;
    }
    
    console.log('fetchNotifications called - user:', user, 'tier:', tier);
    setIsFetching(true);
    
    // Get the current session directly from Supabase
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.log('No session found, skipping notification fetch');
      setLoading(false);
      setIsFetching(false);
      return;
    }
    
    console.log('Using session user:', session.user.email, 'id:', session.user.id);
    
    try {
      const token = session.access_token;
      
      if (!token) {
        console.warn('No authentication token available');
        setNotifications([]);
        return;
      }
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
      
      const response = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 404) {
          // Notifications endpoint not available - this is not an error
          setNotifications([]);
          return;
        }
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Notification API response:', data);
      console.log('User tier:', tier);
      console.log('User:', user);
      
      // Ensure we always set an array, even if data.data is null/undefined
      if (!data || typeof data !== 'object') {
        console.warn('Invalid API response format:', data);
        setNotifications([]);
        return;
      }
      
      const notificationData = data?.data || [];
      const validNotifications = Array.isArray(notificationData) ? notificationData : [];
      console.log('Setting notifications:', validNotifications);
      
      // Add stack trace to understand who is calling this
      if (validNotifications.length === 0) {
        console.log('WARNING: Setting empty notifications array - Stack trace:', new Error().stack);
      }
      
      setNotifications(validNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      
      // Don't show toast for AbortError (timeout)
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn('Notification fetch timed out');
        setNotifications([]);
        return;
      }
      
      // Set empty array on error to prevent crashes
      setNotifications([]);
      
      // Only show error toast for non-network errors
      if (error instanceof Error && !error.message.includes('fetch')) {
        toast({
          title: "Bildirishnoma xatosi",
          description: "Bildirishnomalarni yuklashda muammo yuz berdi",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
      setIsFetching(false);
    }
  };

  useEffect(() => {
    // Prevent double fetch in React StrictMode
    if (hasFetchedRef.current) {
      console.log('useEffect: Already fetched, skipping');
      return;
    }
    
    let isMounted = true;
    
    const loadNotifications = async () => {
      if (isMounted && !hasFetchedRef.current) {
        console.log('useEffect: About to fetch notifications for the first time');
        hasFetchedRef.current = true;
        await fetchNotifications();
      }
    };
    
    // Add a small delay to prevent race conditions with lazy loading
    const timeoutId = setTimeout(() => {
      loadNotifications();
    }, 100);
    
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, []); // Only fetch once on mount

  const handleDismiss = async (notificationId: number) => {
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      
      if (!token) {
        throw new Error('No authentication token available');
      }
      
      const response = await fetch(`/api/notifications/${notificationId}/dismiss`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to dismiss notification');
      }

      // Remove from local state with optimistic update
      setNotifications(prev => (prev || []).filter(n => n.id !== notificationId));
      
      toast({
        title: "Muvaffaqiyat",
        description: "Bildirishnoma yopildi",
      });
    } catch (error) {
      console.error('Error dismissing notification:', error);
      
      // Restore notification on error
      await fetchNotifications();
      
      toast({
        title: "Xatolik",
        description: "Bildirishnomani yopishda xatolik. Qaytadan urinib ko'ring",
        variant: "destructive",
      });
    }
  };

  const handleCTAClick = async (notificationId: number, url: string) => {
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      
      // Validate URL before opening
      try {
        const urlObj = new URL(url, window.location.origin);
        // Ensure it's a safe URL
        if (!['http:', 'https:'].includes(urlObj.protocol)) {
          throw new Error('Invalid URL protocol');
        }
      } catch (urlError) {
        console.error('Invalid URL:', url);
        toast({
          title: "Xatolik",
          description: "Havola noto'g'ri",
          variant: "destructive",
        });
        return;
      }
      
      // Track click (don't wait for response)
      if (token) {
        fetch(`/api/notifications/${notificationId}/click`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }).catch(error => console.error('Error tracking click:', error));
      }

      // Open URL in new tab
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Error in CTA click:', error);
      // Still try to open the URL as fallback
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // Create stable markAsViewed function with useCallback
  const markAsViewed = useCallback(async (notificationIds: number[]) => {
    if (notificationIds.length === 0) return;

    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      
      if (!token) return;
      
      // Mark notifications as viewed in parallel but limit concurrency
      const batchSize = 3;
      for (let i = 0; i < notificationIds.length; i += batchSize) {
        const batch = notificationIds.slice(i, i + batchSize);
        await Promise.all(
          batch.map(id =>
            fetch(`/api/notifications/${id}/view`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            }).catch(err => console.error(`Failed to mark notification ${id} as viewed:`, err))
          )
        );
      }
    } catch (error) {
      console.error('Error marking notifications as viewed:', error);
    }
  }, []); // Empty dependency array - function doesn't depend on any props/state

  // Debounced version of markAsViewed
  const debouncedMarkAsViewed = useDebounce(markAsViewed, 1000);

  // Track which notifications need to be marked as viewed
  useEffect(() => {
    // Add a guard to prevent running during initial load
    if (loading || isFetching) {
      console.log('markAsViewed: Skipping during loading state');
      return;
    }
    
    // Defensive checks with detailed logging
    if (!notifications) {
      console.log('markAsViewed: notifications is null/undefined');
      return;
    }
    
    if (!Array.isArray(notifications)) {
      console.error('markAsViewed: notifications is not an array:', typeof notifications, notifications);
      return;
    }
    
    if (notifications.length === 0) {
      console.log('marked/viewed: no notifications to process - CURRENT ARRAY LENGTH:', notifications?.length);
      return;
    }
    
    console.log('markAsViewed: Processing notifications array with length:', notifications.length);
    
    try {
      const unreadIds = notifications
        .filter(n => n && typeof n === 'object' && n.id && !n.isRead)
        .map(n => n.id);
      
      console.log('markAsViewed: unread notification IDs:', unreadIds);
      
      if (unreadIds.length > 0) {
        console.log('markAsViewed: Calling debouncedMarkAsViewed with IDs:', unreadIds);
        debouncedMarkAsViewed(unreadIds);
      }
    } catch (error) {
      console.error('Error processing notifications for markAsViewed:', error);
    }
  }, [notifications, debouncedMarkAsViewed, loading, isFetching]); // Added loading/fetching to dependencies

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-black uppercase mb-4">Bildirishnomalar</h2>
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  // Debug log before render decision
  console.log('RENDER CHECK - notifications:', notifications, 'length:', notifications?.length, 'loading:', loading);
  
  // Ensure notifications is an array before checking length
  if (!notifications || notifications.length === 0) {
    console.log('RENDERING EMPTY STATE because notifications:', notifications);
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-black uppercase mb-4">Bildirishnomalar</h2>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <BellOff className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">Hozircha yangi bildirishnomalar yo'q</p>
        </div>
      </div>
    );
  }

  // Memoize notification count for performance
  const notificationCount = useMemo(() => notifications?.length || 0, [notifications]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-black uppercase">Bildirishnomalar</h2>
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          <span className="text-sm font-medium">{notificationCount} ta</span>
        </div>
      </div>
      
      <div className="space-y-4">
        {(notifications || [])
          .filter(notification => notification && typeof notification === 'object' && notification.id)
          .map((notification) => {
            try {
              return (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onDismiss={handleDismiss}
                  onCTAClick={handleCTAClick}
                />
              );
            } catch (error) {
              console.error('Error rendering notification:', notification, error);
              return null;
            }
          })
          .filter(Boolean)}
      </div>
    </div>
  );
}

// Memoize the component to prevent unnecessary re-renders
export default React.memo(NotificationSection);