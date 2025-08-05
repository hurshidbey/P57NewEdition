import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Eye, Users, MousePointer, X, TrendingUp, Bell } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale'; // Using Russian locale as Uzbek not available

interface NotificationAnalyticsProps {
  notification: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function NotificationAnalytics({ 
  notification, 
  open, 
  onOpenChange 
}: NotificationAnalyticsProps) {
  // Calculate engagement metrics
  const viewRate = notification.uniqueUserCount > 0 
    ? Math.round((notification.viewCount / notification.uniqueUserCount) * 100) 
    : 0;
  
  const dismissRate = notification.viewCount > 0
    ? Math.round((notification.dismissCount / notification.viewCount) * 100)
    : 0;
  
  const clickRate = notification.viewCount > 0 && notification.ctaText
    ? Math.round((notification.clickCount / notification.viewCount) * 100)
    : 0;

  const getEngagementLevel = () => {
    if (clickRate > 10) return { level: 'Ajoyib', color: 'text-green-600' };
    if (clickRate > 5) return { level: 'Yaxshi', color: 'text-blue-600' };
    if (clickRate > 2) return { level: "O'rtacha", color: 'text-yellow-600' };
    return { level: 'Past', color: 'text-red-600' };
  };

  const engagement = getEngagementLevel();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Bildirishnoma analitikasi</DialogTitle>
          <DialogDescription>
            {notification.title}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Ko'rishlar soni
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{notification.viewCount}</p>
                <p className="text-sm text-muted-foreground">
                  O'rtacha {viewRate}% qayta ko'rish
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Foydalanuvchilar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{notification.uniqueUserCount}</p>
                <p className="text-sm text-muted-foreground">
                  Unikal foydalanuvchilar
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <MousePointer className="h-4 w-4" />
                  CTA bosilishi
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {notification.ctaText ? notification.clickCount : '-'}
                </p>
                {notification.ctaText && (
                  <p className="text-sm text-muted-foreground">
                    {clickRate}% konversiya
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Engagement Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Faollik ko'rsatkichlari</span>
                {notification.ctaText && (
                  <span className={`text-sm font-normal ${engagement.color}`}>
                    <TrendingUp className="h-4 w-4 inline mr-1" />
                    {engagement.level} natija
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* View Progress */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Ko'rishlar</span>
                  <span>{notification.viewCount} marta</span>
                </div>
                <Progress value={100} className="h-2" />
              </div>

              {/* Dismiss Progress */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Yopilgan</span>
                  <span>{dismissRate}%</span>
                </div>
                <Progress value={dismissRate} className="h-2" />
              </div>

              {/* Click Progress (if CTA exists) */}
              {notification.ctaText && (
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>CTA bosilgan</span>
                    <span>{clickRate}%</span>
                  </div>
                  <Progress value={clickRate} className="h-2" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notification Details */}
          <Card>
            <CardHeader>
              <CardTitle>Bildirishnoma tafsilotlari</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Maqsadli auditoriya:</span>
                <span className="font-medium">
                  {notification.targetAudience === 'all' && 'Barcha foydalanuvchilar'}
                  {notification.targetAudience === 'free' && 'Bepul foydalanuvchilar'}
                  {notification.targetAudience === 'paid' && 'Pullik foydalanuvchilar'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ko'rsatish turi:</span>
                <span className="font-medium flex items-center gap-1">
                  {notification.showAsPopup ? (
                    <>
                      <Bell className="h-3 w-3" />
                      Popup
                    </>
                  ) : (
                    'Oddiy bildirishnoma'
                  )}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Muhimlik darajasi:</span>
                <span className="font-medium">{notification.priority}/100</span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Yaratilgan:</span>
                <span className="font-medium">
                  {format(new Date(notification.createdAt), 'd MMMM yyyy', { locale: ru })}
                </span>
              </div>

              {notification.expiresAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tugash muddati:</span>
                  <span className="font-medium">
                    {format(new Date(notification.expiresAt), 'd MMMM yyyy', { locale: ru })}
                  </span>
                </div>
              )}

              {notification.ctaText && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">CTA tugmasi:</span>
                    <span className="font-medium">{notification.ctaText}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">CTA havolasi:</span>
                    <a 
                      href={notification.ctaUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-medium text-primary hover:underline text-right"
                    >
                      {notification.ctaUrl}
                    </a>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}