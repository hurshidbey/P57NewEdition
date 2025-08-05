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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const hasFetchedRef = useRef(false);
  const mountedRef = useRef(true);
  
  useEffect(() => {
    console.log('NotificationSection MOUNTED');
    mountedRef.current = true;
    return () => {
      console.log('NotificationSection UNMOUNTING');
      mountedRef.current = false;
    };
  }, []);

  const fetchNotifications = useCallback(async () => {
    // Prevent duplicate fetches or fetch if unmounted
    if (isFetching || !mountedRef.current) {
      console.log('Already fetching or unmounted, skipping...');
      return;
    }
    
    console.log('fetchNotifications called - user:', user?.email, 'tier:', tier);
    setIsFetching(true);
    
    try {
      // Get the current session directly from Supabase
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user || !mountedRef.current) {
        console.log('No session found or unmounted, skipping notification fetch');
        if (mountedRef.current) {
          setNotifications([]);
          setLoading(false);
        }
        return;
      }
      
      const token = session.access_token;
      if (!token) {
        console.warn('No authentication token available');
        if (mountedRef.current) {
          setNotifications([]);
        }
        return;
      }
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout
      
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
          if (mountedRef.current) {
            setNotifications([]);
          }
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Notification API response:', data);
      
      // Ensure we always set an array, even if data.data is null/undefined
      const notificationData = data?.data || [];
      const validNotifications = Array.isArray(notificationData) ? notificationData : [];
      
      if (mountedRef.current) {
        setNotifications(validNotifications);
        console.log('Set notifications:', validNotifications.length, 'items');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      
      // Only update state if still mounted
      if (mountedRef.current) {
        setNotifications([]);
        
        // Only show toast for real errors, not timeouts or network issues
        if (error instanceof Error && error.name !== 'AbortError' && !error.message.includes('fetch')) {
          toast({
            title: "Bildirishnoma xatosi",
            description: "Bildirishnomalarni yuklashda muammo yuz berdi",
            variant: "destructive",
          });
        }
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        setIsFetching(false);
      }
    }
  }, [user?.email, tier, isFetching]); // Stable dependencies only

  useEffect(() => {
    // Only fetch if we have a user and haven't fetched yet
    if (!user || hasFetchedRef.current) {
      console.log('useEffect: No user or already fetched, skipping');
      return;
    }
    
    console.log('useEffect: About to fetch notifications for the first time');
    hasFetchedRef.current = true;
    
    // Small delay to prevent race conditions
    const timeoutId = setTimeout(() => {
      if (mountedRef.current) {
        fetchNotifications();
      }
    }, 100);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [user?.id, fetchNotifications]); // Only depend on user ID and the memoized fetch function

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
    // Skip if still loading or no notifications
    if (loading || !notifications || notifications.length === 0) {
      return;
    }
    
    try {
      const unreadIds = notifications
        .filter(n => n && n.id && !n.isRead)
        .map(n => n.id);
      
      if (unreadIds.length > 0) {
        console.log('markAsViewed: Found unread notifications:', unreadIds.length);
        debouncedMarkAsViewed(unreadIds);
      }
    } catch (error) {
      console.error('Error processing notifications for markAsViewed:', error);
    }
  }, [notifications, debouncedMarkAsViewed, loading]); // Minimal dependencies

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

  // Simple render logic without excessive logging
  if (!notifications || notifications.length === 0) {
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-black uppercase">Bildirishnomalar</h2>
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          <span className="text-sm font-medium">{notifications.length} ta</span>
        </div>
      </div>
      
      <div className="space-y-4">
        {notifications
          .filter(notification => notification && notification.id)
          .map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onDismiss={handleDismiss}
              onCTAClick={handleCTAClick}
            />
          ))}
      </div>
    </div>
  );
}

// Memoize the component to prevent unnecessary re-renders
export default React.memo(NotificationSection);