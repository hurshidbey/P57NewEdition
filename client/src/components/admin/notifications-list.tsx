import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Edit, Trash2, MoreHorizontal, BarChart, Eye, Users, MousePointer, Bell } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale'; // Using Russian locale as Uzbek not available
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import NotificationAnalytics from './notification-analytics';

interface NotificationWithStats {
  id: number;
  title: string;
  content: string;
  target_audience: 'all' | 'free' | 'paid';
  is_active: boolean;
  show_as_popup: boolean;
  priority: number;
  cta_text?: string;
  cta_url?: string;
  created_by: string;
  created_at: string;
  expires_at?: string;
  viewCount: number;
  dismissCount: number;
  clickCount: number;
  uniqueUserCount: number;
}

interface NotificationsListProps {
  onEdit: (notification: NotificationWithStats) => void;
  refreshTrigger?: number;
}

export default function NotificationsList({ onEdit, refreshTrigger }: NotificationsListProps) {
  const [notifications, setNotifications] = useState<NotificationWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState<NotificationWithStats | null>(null);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      
      const response = await fetch('/api/admin/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();
      setNotifications(data.data || []);
    } catch (error) {
      toast({
        title: "Xatolik",
        description: "Bildirishnomalarni yuklashda xatolik",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [refreshTrigger]);

  const handleDelete = async (id: number) => {
    if (!confirm('Haqiqatan ham o\'chirmoqchimisiz?')) return;

    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      
      const response = await fetch(`/api/admin/notifications/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete notification');
      }

      toast({
        title: "Muvaffaqiyat",
        description: "Bildirishnoma o'chirildi",
      });

      fetchNotifications();
    } catch (error) {
      toast({
        title: "Xatolik",
        description: "Bildirishnomani o'chirishda xatolik",
        variant: "destructive",
      });
    }
  };

  const getAudienceBadge = (audience: string) => {
    switch (audience) {
      case 'all':
        return <Badge variant="default">Barcha</Badge>;
      case 'free':
        return <Badge variant="secondary">Bepul</Badge>;
      case 'paid':
        return <Badge className="bg-yellow-100 text-yellow-800">Pullik</Badge>;
      default:
        return null;
    }
  };

  const getStatusBadge = (notification: NotificationWithStats) => {
    const now = new Date();
    const expiresAt = notification.expires_at ? new Date(notification.expires_at) : null;
    
    if (!notification.is_active) {
      return <Badge variant="secondary">Nofaol</Badge>;
    } else if (expiresAt && expiresAt < now) {
      return <Badge variant="destructive">Muddati tugagan</Badge>;
    } else {
      return <Badge className="bg-green-100 text-green-800">Faol</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sarlavha</TableHead>
              <TableHead>Auditoriya</TableHead>
              <TableHead>Holat</TableHead>
              <TableHead>Muhimlik</TableHead>
              <TableHead className="text-center">
                <Eye className="h-4 w-4 inline mr-1" />
                Ko'rishlar
              </TableHead>
              <TableHead className="text-center">
                <Users className="h-4 w-4 inline mr-1" />
                Foydalanuvchilar
              </TableHead>
              <TableHead className="text-center">
                <MousePointer className="h-4 w-4 inline mr-1" />
                Bosildi
              </TableHead>
              <TableHead>Yaratilgan</TableHead>
              <TableHead className="text-right">Amallar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notifications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground">
                  Hozircha bildirishnomalar yo'q
                </TableCell>
              </TableRow>
            ) : (
              notifications.map((notification) => (
                <TableRow key={notification.id}>
                  <TableCell className="font-medium">
                    <div>
                      <p className="line-clamp-1">{notification.title}</p>
                      {notification.show_as_popup && (
                        <Badge variant="outline" className="mt-1">
                          <Bell className="h-3 w-3 mr-1" />
                          Popup
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getAudienceBadge(notification.target_audience)}</TableCell>
                  <TableCell>{getStatusBadge(notification)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${notification.priority}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {notification.priority}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {notification.viewCount}
                  </TableCell>
                  <TableCell className="text-center">
                    {notification.uniqueUserCount}
                  </TableCell>
                  <TableCell className="text-center">
                    {notification.ctaText && notification.clickCount > 0 ? (
                      <span className="text-green-600 font-medium">
                        {notification.clickCount}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{format(new Date(notification.created_at), 'd MMM', { locale: ru })}</p>
                      <p className="text-muted-foreground">
                        {notification.created_by.split('@')[0]}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Menyu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedNotification(notification);
                            setAnalyticsOpen(true);
                          }}
                        >
                          <BarChart className="mr-2 h-4 w-4" />
                          Analitika
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(notification)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Tahrirlash
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(notification.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          O'chirish
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Analytics Dialog */}
      {selectedNotification && (
        <NotificationAnalytics
          notification={selectedNotification}
          open={analyticsOpen}
          onOpenChange={setAnalyticsOpen}
        />
      )}
    </>
  );
}