import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

interface TelegramLoginButtonProps {
  children: React.ReactNode;
}

export function TelegramLoginButton({ children }: TelegramLoginButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { signInWithTelegram } = useAuth(); // This will be created later
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ref.current === null) return;

    const botUsername = import.meta.env.VITE_TELEGRAM_BOT_USERNAME;

    if (!botUsername) {
      console.error('Telegram bot username is not configured.');
      toast({
        title: 'Konfiguratsiya xatosi',
        description: 'Telegram bot sozlanmagan',
        variant: 'destructive',
      });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.async = true;
    script.setAttribute('data-telegram-login', botUsername);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-radius', '8');

    // The key part: define a global callback function
    (window as any).onTelegramAuth = async (user: TelegramUser) => {
      setLoading(true);
      try {
        // We will implement signInWithTelegram later
        // It will call our backend to verify the hash and log the user in
        await signInWithTelegram(user);
        toast({
          title: 'Muvaffaqiyat!',
          description: 'Telegram orqali tizimga kirildi',
        });
      } catch (error: any) {
        toast({
          title: 'Xatolik',
          description: error.message || 'Telegram orqali kirishda xatolik yuz berdi',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    script.setAttribute('data-onauth', 'onTelegramAuth(user)');

    ref.current.appendChild(script);

    return () => {
      // Cleanup the global function
      delete (window as any).onTelegramAuth;
    };
  }, [ref, signInWithTelegram, toast]);

  return (
    <div className="w-full">
      {loading ? (
        <Button variant="outline" disabled className="w-full">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Iltimos kuting...
        </Button>
      ) : (
        <div ref={ref} />
      )}
    </div>
  );
}
