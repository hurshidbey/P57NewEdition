import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { uz } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

interface NotificationFormData {
  title: string;
  content: string;
  targetAudience: 'all' | 'free' | 'paid';
  isActive: boolean;
  showAsPopup: boolean;
  priority: number;
  ctaText: string;
  ctaUrl: string;
  expiresAt: Date | null;
}

interface NotificationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notification?: any; // For editing
  onSuccess: () => void;
}

export default function NotificationForm({ 
  open, 
  onOpenChange, 
  notification, 
  onSuccess 
}: NotificationFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<NotificationFormData>({
    title: '',
    content: '',
    targetAudience: 'all',
    isActive: true,
    showAsPopup: false,
    priority: 0,
    ctaText: '',
    ctaUrl: '',
    expiresAt: null,
  });

  // Reset form when dialog opens/closes or notification changes
  useEffect(() => {
    if (open) {
      if (notification) {
        // Editing existing notification
        setFormData({
          title: notification.title || '',
          content: notification.content || '',
          targetAudience: notification.target_audience || 'all',
          isActive: notification.is_active ?? true,
          showAsPopup: notification.show_as_popup ?? false,
          priority: notification.priority || 0,
          ctaText: notification.cta_text || '',
          ctaUrl: notification.cta_url || '',
          expiresAt: notification.expires_at ? new Date(notification.expires_at) : null,
        });
      } else {
        // Creating new notification
        setFormData({
          title: '',
          content: '',
          targetAudience: 'all',
          isActive: true,
          showAsPopup: false,
          priority: 0,
          ctaText: '',
          ctaUrl: '',
          expiresAt: null,
        });
      }
    }
  }, [open, notification]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "Xatolik",
        description: "Sarlavha va matn kiritilishi shart",
        variant: "destructive",
      });
      return;
    }

    // Validate CTA - both or neither
    if ((formData.ctaText && !formData.ctaUrl) || (!formData.ctaText && formData.ctaUrl)) {
      toast({
        title: "Xatolik",
        description: "CTA tugmasi uchun ham matn, ham havola kiritilishi kerak",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      
      const url = notification 
        ? `/api/admin/notifications/${notification.id}`
        : '/api/admin/notifications';
      
      const method = notification ? 'PUT' : 'POST';
      
      const payload = {
        title: formData.title,
        content: formData.content,
        target_audience: formData.targetAudience,
        is_active: formData.isActive,
        show_as_popup: formData.showAsPopup,
        priority: formData.priority,
        expires_at: formData.expiresAt?.toISOString() || null,
        // Clear empty strings
        cta_text: formData.ctaText || null,
        cta_url: formData.ctaUrl || null,
      };
      
      console.log('Sending notification payload:', payload);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Notification creation failed:', {
          status: response.status,
          error: error,
          payload: payload,
        });
        
        // Show detailed error in development
        if (error.details && Array.isArray(error.details)) {
          const fieldErrors = error.details.map((d: any) => `${d.field}: ${d.message}`).join(', ');
          throw new Error(`Validation failed: ${fieldErrors}`);
        }
        
        throw new Error(error.message || error.error || 'Xatolik yuz berdi');
      }

      toast({
        title: "Muvaffaqiyat",
        description: notification 
          ? "Bildirishnoma yangilandi" 
          : "Bildirishnoma yaratildi",
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Xatolik",
        description: error.message || "Bildirishnomani saqlashda xatolik",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {notification ? 'Bildirishnomani tahrirlash' : 'Yangi bildirishnoma'}
            </DialogTitle>
            <DialogDescription>
              Foydalanuvchilarga ko'rsatiladigan bildirishnoma yarating
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Title */}
            <div className="grid gap-2">
              <Label htmlFor="title">Sarlavha *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Masalan: 50% chegirma!"
                maxLength={200}
                required
              />
              <p className="text-sm text-muted-foreground">
                {formData.title.length}/200
              </p>
            </div>

            {/* Content */}
            <div className="grid gap-2">
              <Label htmlFor="content">Matn *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Bildirishnoma matni..."
                rows={4}
                maxLength={2000}
                required
              />
              <p className="text-sm text-muted-foreground">
                {formData.content.length}/2000
              </p>
            </div>

            {/* Target Audience */}
            <div className="grid gap-2">
              <Label>Maqsadli auditoriya</Label>
              <RadioGroup
                value={formData.targetAudience}
                onValueChange={(value: any) => setFormData({ ...formData, targetAudience: value })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="all" />
                  <Label htmlFor="all">Barcha foydalanuvchilar</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="free" id="free" />
                  <Label htmlFor="free">Faqat bepul foydalanuvchilar</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="paid" id="paid" />
                  <Label htmlFor="paid">Faqat pullik foydalanuvchilar</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Active Status */}
            <div className="flex items-center justify-between">
              <Label htmlFor="active">Faol holat</Label>
              <Switch
                id="active"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>

            {/* Show as Popup */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="popup">Popup sifatida ko'rsatish</Label>
                <p className="text-sm text-muted-foreground">
                  Foydalanuvchi tizimga kirganda ko'rsatiladi
                </p>
              </div>
              <Switch
                id="popup"
                checked={formData.showAsPopup}
                onCheckedChange={(checked) => setFormData({ ...formData, showAsPopup: checked })}
              />
            </div>

            {/* Priority */}
            <div className="grid gap-2">
              <Label htmlFor="priority">
                Muhimlik darajasi: {formData.priority}
              </Label>
              <Slider
                id="priority"
                min={0}
                max={100}
                step={1}
                value={[formData.priority]}
                onValueChange={(value) => setFormData({ ...formData, priority: value[0] })}
                className="w-full"
              />
              <p className="text-sm text-muted-foreground">
                Yuqori raqam = yuqori muhimlik (0-100)
              </p>
            </div>

            {/* CTA Button (Optional) */}
            <div className="space-y-4 border rounded-lg p-4">
              <h4 className="font-medium">Harakat tugmasi (ixtiyoriy)</h4>
              
              <div className="grid gap-2">
                <Label htmlFor="ctaText">Tugma matni</Label>
                <Input
                  id="ctaText"
                  value={formData.ctaText}
                  onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                  placeholder="Masalan: Hozir sotib oling"
                  maxLength={50}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="ctaUrl">Havola</Label>
                <Input
                  id="ctaUrl"
                  type="url"
                  value={formData.ctaUrl}
                  onChange={(e) => setFormData({ ...formData, ctaUrl: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>
            </div>

            {/* Expiration Date (Optional) */}
            <div className="grid gap-2">
              <Label>Amal qilish muddati (ixtiyoriy)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !formData.expiresAt && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.expiresAt ? (
                      format(formData.expiresAt, "d MMMM yyyy", { locale: uz })
                    ) : (
                      "Muddat tanlang"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.expiresAt || undefined}
                    onSelect={(date) => setFormData({ ...formData, expiresAt: date || null })}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {formData.expiresAt && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setFormData({ ...formData, expiresAt: null })}
                >
                  Muddatni o'chirish
                </Button>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Bekor qilish
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {notification ? 'Yangilash' : 'Yaratish'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}