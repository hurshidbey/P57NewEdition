import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  PartyPopper, 
  Sparkles, 
  ArrowRight,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import AppHeader from '@/components/app-header';
import AppFooter from '@/components/app-footer';
import { supabase } from '@/lib/supabase';

export default function PaymentSuccess() {
  const [, setLocation] = useLocation();
  const { refreshUser, user } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(true);
  const [countdown, setCountdown] = useState(5);
  const [showCelebration, setShowCelebration] = useState(false);
  
  useEffect(() => {
    // Refresh user session to get updated tier
    const refreshSession = async () => {
      try {
        await refreshUser();
        // Trigger storage event for cross-tab communication
        localStorage.setItem('tier_upgrade_trigger', Date.now().toString());
      } catch (error) {
        console.error('Failed to refresh user session:', error);
      } finally {
        setIsRefreshing(false);
      }
    };

    // Only trigger celebration if this is a legitimate redirect from payment
    const urlParams = new URLSearchParams(window.location.search);
    const isFromPayment = urlParams.get('method') === 'click' || 
                         urlParams.get('method') === 'atmos' ||
                         urlParams.get('forceRefresh') === 'true';
    const shouldCheckAgain = urlParams.get('checkAgain') === 'true';
    
    if (!isFromPayment) {
      console.log('Not a payment redirect, skipping celebration');
      // Still refresh session but no celebration
      refreshSession();
      return;
    }
    
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (!prefersReducedMotion) {
      // Show CSS-based celebration animation
      setShowCelebration(true);
      
      // Hide celebration after 2 seconds (performance optimization)
      setTimeout(() => {
        setShowCelebration(false);
      }, 2000);
    }
    
    refreshSession();
    
    // Check for pending payments if user is still free tier
    // This is especially important for mobile where callbacks might be delayed
    const paymentCheckInterval = setInterval(async () => {
      if (user?.tier === 'free') {
        console.log('Checking for pending payment completion...');
        
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.access_token) {
            // For mobile/checkAgain cases, use the new endpoint
            if (shouldCheckAgain) {
              const response = await fetch('/api/click/check-upgrade', {
                headers: {
                  'Authorization': `Bearer ${session.access_token}`
                }
              });
              
              if (response.ok) {
                const result = await response.json();
                if (result.success && result.upgraded) {
                  console.log('Payment confirmed via check-upgrade! User upgraded to premium.');
                  await refreshUser();
                  clearInterval(paymentCheckInterval);
                  // Trigger storage event for cross-tab communication
                  localStorage.setItem('tier_upgrade_trigger', Date.now().toString());
                }
              }
            }
            
            // Also check the regular endpoint
            const response = await fetch('/api/payment/check-pending', {
              headers: {
                'Authorization': `Bearer ${session.access_token}`
              }
            });
            
            if (response.ok) {
              const result = await response.json();
              if (result.upgraded) {
                console.log('Payment confirmed! User upgraded to premium.');
                await refreshUser();
                clearInterval(paymentCheckInterval);
              }
            }
          }
        } catch (error) {
          console.error('Error checking payment status:', error);
        }
      } else if (user?.tier === 'paid') {
        // User is already premium, stop checking
        clearInterval(paymentCheckInterval);
      }
    }, 2000); // Check every 2 seconds

    // Clean URL parameters to prevent re-triggering on refresh
    if (isFromPayment) {
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
    
    // Countdown timer for auto-redirect
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          setLocation('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(countdownInterval);
      clearInterval(paymentCheckInterval);
    };
  }, [refreshUser, setLocation, user?.tier]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* CSS-based celebration animation for mobile performance */}
      {showCelebration && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
          {/* Confetti particles using CSS animations */}
          <div className="confetti-container">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className={`confetti confetti-${i % 4}`}
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 1}s`,
                  animationDuration: `${1.5 + Math.random() * 1}s`
                }}
              />
            ))}
          </div>
        </div>
      )}
      
      <AppHeader />
      
      <main className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
        <Card className="max-w-2xl w-full border-4 border-green-600 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <CardContent className="p-8 sm:p-12 text-center">
            {/* Success Icon with Animation */}
            <div className="relative mb-8">
              <div className="animate-bounce">
                <CheckCircle className="h-24 w-24 text-green-600 mx-auto" />
              </div>
              <Sparkles className="absolute top-0 right-1/4 h-8 w-8 text-yellow-500 animate-pulse" />
              <Sparkles className="absolute bottom-0 left-1/4 h-6 w-6 text-yellow-500 animate-pulse delay-150" />
            </div>

            {/* Success Message */}
            <div className="space-y-4 mb-8">
              <h1 className="font-black text-foreground flex items-center justify-center gap-3" style={{ fontSize: 'clamp(1.5rem, 4vw, 3rem)' }}>
                TO'LOV MUVAFFAQIYATLI!
                <PartyPopper className="h-8 w-8 sm:h-10 sm:w-10 text-accent" />
              </h1>
              
              <p className="text-xl text-muted-foreground font-bold">
                Tabriklaymiz! Siz endi PREMIUM foydalanuvchisiz!
              </p>
            </div>

            {/* Premium Benefits */}
            <Card className="border-2 border-muted mb-8 bg-green-50">
              <CardContent className="p-6">
                <h3 className="font-black text-lg mb-4">ENDI SIZGA OCHIQ:</h3>
                <ul className="space-y-3 text-left">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="font-bold">57 ta AI protokolga to'liq dostup</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="font-bold">50+ Premium promptlar va misollar</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="font-bold">AI bilan amaliy mashqlar</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="font-bold">Umrbod yangilanishlar</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Session Refresh Status */}
            {isRefreshing && (
              <div className="mb-6 flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Premium dostup faollashtirilmoqda...</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-4">
              <Button
                onClick={() => setLocation('/')}
                size="lg"
                className="w-full sm:w-auto font-black text-lg border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all min-h-[48px]"
              >
                PROTOKOLLARNI KO'RISH
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <p className="text-sm text-muted-foreground">
                {countdown > 0 ? (
                  <>Avtomatik yo'naltirilmoqda: {countdown} soniya...</>
                ) : (
                  <>Yo'naltirilmoqda...</>
                )}
              </p>
            </div>

            {/* User Info */}
            {user && (
              <div className="mt-8 pt-8 border-t border-muted">
                <p className="text-sm text-muted-foreground">
                  Akkaunt: <span className="font-bold">{user.email}</span>
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Status: <span className={`font-bold ${user.tier === 'paid' ? 'text-green-600' : 'text-orange-600'}`}>
                    {user.tier === 'paid' ? 'PREMIUM' : 'TEKSHIRILMOQDA...'}
                  </span>
                </p>
                {user.tier === 'free' && (
                  <p className="text-xs text-muted-foreground mt-2">
                    To'lovingiz hali tasdiqlanmoqda. Iltimos kuting...
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <AppFooter />
    </div>
  );
}