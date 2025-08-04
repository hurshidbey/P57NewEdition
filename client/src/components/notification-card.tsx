import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Bell, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { uz } from 'date-fns/locale';

interface NotificationData {
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
}

interface NotificationCardProps {
  notification: NotificationData;
  onDismiss: (id: number) => void;
  onCTAClick?: (id: number, url: string) => void;
  className?: string;
}

export default function NotificationCard({ 
  notification, 
  onDismiss, 
  onCTAClick,
  className = ''
}: NotificationCardProps) {
  const handleCTAClick = () => {
    if (notification.ctaUrl && onCTAClick) {
      onCTAClick(notification.id, notification.ctaUrl);
    }
  };

  const isExpiringSoon = () => {
    if (!notification.expiresAt) return false;
    const expiresAt = new Date(notification.expiresAt);
    const now = new Date();
    const hoursUntilExpiry = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntilExpiry > 0 && hoursUntilExpiry <= 24;
  };

  return (
    <Card className={`relative border-2 border-black shadow-brutal transition-all hover:shadow-brutal-lg ${
      !notification.isRead ? 'bg-yellow-50' : ''
    } ${className}`}>
      {/* Unread indicator */}
      {!notification.isRead && (
        <div className="absolute -top-1 -left-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
      )}

      {/* Dismiss button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-8 w-8 hover:bg-gray-100"
        onClick={() => onDismiss(notification.id)}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Yopish</span>
      </Button>

      <CardHeader className="pr-12 pb-3 sm:pb-4">
        <div className="flex items-start gap-2 sm:gap-3">
          <Bell className="h-4 w-4 sm:h-5 sm:w-5 mt-0.5 flex-shrink-0" />
          <div className="space-y-1 flex-1 min-w-0">
            <CardTitle className="text-base sm:text-lg leading-tight break-words">
              {notification.title}
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <span>
                {formatDistanceToNow(new Date(notification.createdAt), {
                  addSuffix: true,
                  locale: uz
                })}
              </span>
              {isExpiringSoon() && (
                <Badge variant="destructive" className="text-xs">
                  Tez tugaydi
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
          {notification.content}
        </p>
      </CardContent>

      {notification.ctaText && notification.ctaUrl && (
        <CardFooter>
          <Button 
            onClick={handleCTAClick}
            className="w-full bg-black text-white hover:bg-gray-800 group"
          >
            {notification.ctaText}
            <ExternalLink className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}