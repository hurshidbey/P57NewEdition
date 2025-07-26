import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import AppHeader from '@/components/app-header';
import AppFooter from '@/components/app-footer';

export default function PaymentProcessing() {
  const [, setLocation] = useLocation();
  const { refreshUser, user } = useAuth();
  const [status, setStatus] = useState('Toʻlov tekshirilmoqda...');
  
  useEffect(() => {
    const processPayment = async () => {
      // Get parameters from URL
      const params = new URLSearchParams(window.location.search);
      const orderId = params.get('orderId');
      const method = params.get('method');
      const isMobile = params.get('mobile') === 'true';
      
      console.log(`Processing payment - Order: ${orderId}, Mobile: ${isMobile}`);
      setStatus('Toʻlov tasdiqlanmoqda...');
      
      try {
        // For mobile or when order ID is "check", use a different approach
        if (isMobile || orderId === 'check' || !orderId) {
          console.log('Mobile payment flow - checking user upgrade status directly');
          
          // Get current auth token
          const { supabase } = await import('@/lib/supabase');
          const { data: { session } } = await supabase.auth.getSession();
          
          if (!session?.access_token) {
            console.error('No auth session - likely cross-browser redirect');
            // For cross-browser scenarios, show a message
            setStatus('To\'lov tasdiqlandi! Iltimos, asl brauzeringizga qayting.');
            
            // Just go to home page with a message
            setTimeout(() => {
              setLocation('/');
            }, 3000);
            return;
          }
          
          // Poll for upgrade status (max 20 seconds for mobile)
          let attempts = 0;
          const maxAttempts = 20;
          
          while (attempts < maxAttempts) {
            const response = await fetch('/api/click/check-upgrade', {
              headers: {
                'Authorization': `Bearer ${session.access_token}`
              }
            });
            
            const result = await response.json();
            
            if (result.success && result.upgraded) {
              console.log('✅ User upgraded successfully!');
              setStatus('Toʻlov tasdiqlandi! Premium faollashtirilmoqda...');
              
              // Force refresh user session
              await refreshUser();
              
              // Go directly to home - no success page needed
              setLocation('/');
              return;
            }
            
            attempts++;
            setStatus(`Toʻlov tekshirilmoqda... (${attempts}/${maxAttempts})`);
            
            // Wait 1 second before next check
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
          
          // After timeout, refresh and go to home
          // User might have paid but callback is delayed
          console.log('Timeout reached, refreshing user and redirecting...');
          await refreshUser();
          setLocation('/');
          
        } else {
          // Desktop flow with order ID
          const response = await fetch(`/api/click/wait-payment/${orderId}`);
          const result = await response.json();
          
          if (result.success) {
            setStatus('Toʻlov tasdiqlandi! Premium faollashtirilmoqda...');
            await refreshUser();
            // Go directly to home
            setLocation('/');
          } else {
            setStatus('Toʻlov hali qayta ishlanmoqda...');
            await refreshUser();
            // Go to home after refresh
            setLocation('/');
          }
        }
      } catch (error) {
        console.error('Error processing payment:', error);
        // On error, still try to refresh and go home
        await refreshUser();
        setLocation('/');
      }
    };
    
    processPayment();
  }, [refreshUser, setLocation]);
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader />
      
      <main className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
        <Card className="max-w-md w-full border-4 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <Loader2 className="h-16 w-16 animate-spin text-accent mx-auto" />
            </div>
            <h2 className="text-2xl font-black mb-4">TOʻLOV QAYTA ISHLANMOQDA</h2>
            <p className="text-muted-foreground font-bold mb-6">
              {status}
            </p>
            <p className="text-sm text-muted-foreground">
              Iltimos kuting, bu bir necha soniya vaqt olishi mumkin...
            </p>
          </CardContent>
        </Card>
      </main>
      
      <AppFooter />
    </div>
  );
}