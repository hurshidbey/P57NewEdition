import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import AppHeader from '@/components/app-header';
import AppFooter from '@/components/app-footer';

export default function PaymentProcessing() {
  const [, setLocation] = useLocation();
  const { refreshUser } = useAuth();
  const [status, setStatus] = useState('Toʻlov tekshirilmoqda...');
  
  useEffect(() => {
    const processPayment = async () => {
      // Get order ID from URL params
      const params = new URLSearchParams(window.location.search);
      const orderId = params.get('orderId');
      const method = params.get('method');
      
      if (!orderId) {
        console.error('No order ID provided');
        setLocation('/payment?error=invalid_order');
        return;
      }
      
      console.log(`Processing payment for order: ${orderId}`);
      setStatus('Toʻlov tasdiqlanmoqda...');
      
      try {
        // Wait for payment to be processed
        const response = await fetch(`/api/click/wait-payment/${orderId}`);
        const result = await response.json();
        
        if (result.success) {
          setStatus('Toʻlov tasdiqlandi! Premium faollashtirilmoqda...');
          
          // Force refresh user session
          await refreshUser();
          
          // Small delay for UX
          setTimeout(() => {
            setLocation('/payment/success?method=' + method);
          }, 500);
        } else {
          setStatus('Toʻlov hali qayta ishlanmoqda...');
          
          // Try refreshing anyway in case payment went through
          await refreshUser();
          
          setTimeout(() => {
            setLocation('/payment/success?method=' + method);
          }, 2000);
        }
      } catch (error) {
        console.error('Error processing payment:', error);
        setLocation('/payment?error=processing_failed');
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