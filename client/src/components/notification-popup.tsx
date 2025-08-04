import React, { useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Bell, X, ExternalLink } from 'lucide-react';

interface NotificationData {
  id: number;
  title: string;
  content: string;
  ctaText?: string;
  ctaUrl?: string;
  priority: number;
}

interface NotificationPopupProps {
  notification: NotificationData | null;
  open: boolean;
  onDismiss: (notificationId: number) => void;
  onCTAClick?: (notificationId: number, url: string) => void;
}

export default function NotificationPopup({ 
  notification, 
  open, 
  onDismiss,
  onCTAClick
}: NotificationPopupProps) {
  const hasBeenDismissedRef = useRef(false);

  // Reset dismissed state when notification changes
  useEffect(() => {
    if (notification) {
      hasBeenDismissedRef.current = false;
    }
  }, [notification?.id]);

  const handleDismiss = () => {
    if (notification && !hasBeenDismissedRef.current) {
      hasBeenDismissedRef.current = true;
      onDismiss(notification.id);
    }
  };

  const handleCTAClick = () => {
    if (notification?.ctaUrl && notification?.ctaText && onCTAClick) {
      onCTAClick(notification.id, notification.ctaUrl);
      // Also dismiss after CTA click
      handleDismiss();
    }
  };

  // Prevent closing by clicking outside or pressing escape
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && notification) {
      handleDismiss();
    }
  };

  if (!notification) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent 
        className="w-[calc(100vw-2rem)] sm:max-w-lg border-2 sm:border-4 border-black shadow-brutal-xl mx-4"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 sm:p-3 bg-yellow-400 rounded-none">
                <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <DialogTitle className="text-xl sm:text-2xl font-black uppercase">
                Muhim E'lon!
              </DialogTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDismiss}
              className="h-8 w-8 hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Yopish</span>
            </Button>
          </div>
        </DialogHeader>

        <div className="py-4 sm:py-6">
          <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">{notification.title}</h3>
          <DialogDescription className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap text-black">
            {notification.content}
          </DialogDescription>
        </div>

        <DialogFooter className="flex gap-3 sm:flex-col">
          {notification.ctaText && notification.ctaUrl ? (
            <>
              <Button
                onClick={handleCTAClick}
                className="flex-1 bg-black text-white hover:bg-gray-800 h-10 sm:h-12 text-sm sm:text-base font-bold uppercase group"
              >
                {notification.ctaText}
                <ExternalLink className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-0.5 transition-transform" />
              </Button>
              <Button
                variant="outline"
                onClick={handleDismiss}
                className="flex-1 border-2 border-black h-10 sm:h-12 text-sm sm:text-base font-bold uppercase hover:bg-gray-100"
              >
                Keyinroq
              </Button>
            </>
          ) : (
            <Button
              onClick={handleDismiss}
              className="w-full bg-black text-white hover:bg-gray-800 h-10 sm:h-12 text-sm sm:text-base font-bold uppercase"
            >
              Tushunarli
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}