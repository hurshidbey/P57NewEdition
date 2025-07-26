import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  Shield, 
  CheckCircle, 
  Tag,
  ChevronRight,
  Zap,
  Smartphone,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import AppHeader from '@/components/app-header';
import AppFooter from '@/components/app-footer';

export default function Payment() {
  const [, setLocation] = useLocation();
  const { user, refreshAuth } = useAuth();
  const { toast } = useToast();
  const [selectedMethod, setSelectedMethod] = useState<'atmos' | 'click' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCoupon, setShowCoupon] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponValidating, setCouponValidating] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    originalAmount: number;
    discountAmount: number;
    finalAmount: number;
    discountPercent: number;
  } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Check if user already has premium tier
  useEffect(() => {
    if (user && user.tier === 'paid') {
      console.log('User already has premium tier, redirecting to home...');
      setLocation('/');
    }
  }, [user, setLocation]);

  const basePrice = 1425000; // 1,425,000 UZS
  const finalPrice = appliedCoupon ? appliedCoupon.finalAmount : basePrice;

  // Validate coupon
  const validateCoupon = async () => {
    if (!couponCode.trim()) return;

    setCouponValidating(true);
    setCouponError(null);

    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code: couponCode.trim(),
          amount: basePrice
        })
      });

      const result = await response.json();

      if (!response.ok || !result.valid) {
        setCouponError(result.message || 'Kupon kodi noto\'g\'ri');
        setAppliedCoupon(null);
        return;
      }

      setAppliedCoupon(result.coupon);
      setCouponError(null);
    } catch (error) {
      setCouponError('Kupon kodini tekshirishda xatolik');
      setAppliedCoupon(null);
    } finally {
      setCouponValidating(false);
    }
  };

  const handlePaymentSelect = (method: 'atmos' | 'click') => {
    setSelectedMethod(method);
    setIsProcessing(true);
    
    // Small delay for visual feedback
    setTimeout(() => {
      if (method === 'atmos') {
        // Pass coupon information to ATMOS page via URL params
        const params = new URLSearchParams();
        if (appliedCoupon) {
          params.set('coupon', appliedCoupon.code);
          params.set('amount', finalPrice.toString());
        }
        const queryString = params.toString();
        setLocation(`/atmos-payment${queryString ? `?${queryString}` : ''}`);
      } else {
        // For Click, we'll handle the redirect differently
        handleClickPayment();
      }
    }, 300);
  };

  const handleClickPayment = async () => {
    // Validate user is properly authenticated
    if (!user || !user.id || user.id === 'guest' || user.id.includes('_')) {
      // Store payment intent and redirect to auth with return URL
      localStorage.setItem('payment_intent', JSON.stringify({
        method: 'click',
        amount: finalPrice,
        couponCode: appliedCoupon?.code,
        timestamp: Date.now()
      }));
      setLocation('/auth?redirect=/payment&reason=payment');
      return;
    }
    
    // Validate user ID is a proper UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(user.id)) {
      console.error('Invalid user ID format:', user.id);
      toast({
        title: "Autentifikatsiya xatosi",
        description: "Iltimos qayta kiring",
        variant: "destructive",
      });
      setLocation('/auth/login');
      return;
    }
    
    try {
      console.log('🚀 [Click Payment] Creating transaction with:', {
        userId: user.id,
        userEmail: user.email,
        amount: basePrice,
        couponCode: appliedCoupon?.code
      });
      
      // Create transaction and get payment URL
      const response = await fetch('/api/click/create-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: basePrice, // Send original price
          userId: user.id, // Always use authenticated user ID
          userEmail: user.email, // Send email as backup
          couponCode: appliedCoupon?.code // Backend will apply discount
        })
      }).catch(err => {
        console.error('❌ [Click Payment] Network error:', err);
        throw new Error('Network request failed');
      });

      if (!response) {
        throw new Error('No response from server');
      }

      const data = await response.json().catch(err => {
        console.error('❌ [Click Payment] JSON parse error:', err);
        throw new Error('Invalid response format');
      });
      console.log('🎯 [Click Payment] Response:', data);
      
      if (!response.ok) {
        console.error('❌ [Click Payment] API error:', response.status, data);
        toast({
          title: "To'lov xatosi",
          description: data.message || 'To\'lov tizimiga ulanishda xatolik',
          variant: "destructive",
        });
        setIsProcessing(false);
        setSelectedMethod(null);
        return;
      }
      
      if (data.success && data.isFullDiscount) {
        // Handle 100% discount scenario
        console.log('✅ [Click Payment] 100% discount applied, user upgraded!');
        
        // Show success message
        toast({
          title: "Tabriklaymiz! 🎉",
          description: data.message || "Premium kirish muvaffaqiyatli faollashtirildi!",
        });
        
        // Force refresh auth context to update user tier
        if (refreshAuth) {
          await refreshAuth();
        }
        
        // Redirect to premium content after a short delay
        setTimeout(() => {
          setIsProcessing(false);
          setLocation('/'); // Redirect to home or protocols page
        }, 1500);
        
      } else if (data.success && data.paymentUrl) {
        console.log('✅ [Click Payment] Redirecting to:', data.paymentUrl);
        
        // Store order ID for processing page
        if (data.orderId) {
          localStorage.setItem('pending_payment_order', data.orderId);
        }
        
        // Try multiple redirect methods for better compatibility
        try {
          // Method 1: Direct assignment
          window.location.href = data.paymentUrl;
          
          // Method 2: If above doesn't work, try replace
          setTimeout(() => {
            window.location.replace(data.paymentUrl);
          }, 500);
          
          // Method 3: If still here after 2 seconds, open in new tab
          setTimeout(() => {
            console.warn('⚠️ [Click Payment] Redirect failed, opening in new tab');
            window.open(data.paymentUrl, '_blank');
            setIsProcessing(false);
            setSelectedMethod(null);
            toast({
              title: "To'lov sahifasi ochildi",
              description: "To'lov sahifasi yangi oynada ochildi. Agar ochilmasa, qayta urinib ko'ring.",
            });
          }, 2000);
        } catch (err) {
          console.error('❌ [Click Payment] Redirect error:', err);
          setIsProcessing(false);
          setSelectedMethod(null);
          toast({
            title: "Yo'naltirish xatosi",
            description: "To'lov sahifasiga o'tishda xatolik. Iltimos qayta urinib ko'ring.",
            variant: "destructive",
          });
        }
      } else {
        console.error('❌ [Click Payment] No payment URL in response:', data);
        toast({
          title: "To'lov xatosi",
          description: "To'lov tizimiga ulanishda xatolik. Iltimos qayta urinib ko'ring.",
          variant: "destructive",
        });
        setIsProcessing(false);
        setSelectedMethod(null);
      }
    } catch (error) {
      console.error('Click payment error:', error);
      toast({
        title: "To'lov xatosi",
        description: "To'lov tizimiga ulanishda xatolik. Iltimos qayta urinib ko'ring.",
        variant: "destructive",
      });
      setIsProcessing(false);
      setSelectedMethod(null);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader />
      
      {/* Payment Processing Overlay - Optimized for mobile */}
      {isProcessing && (
        <div className="fixed inset-0 bg-background/95 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <Card className="max-w-md w-full border-4 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] my-auto">
            <CardContent className="p-6 sm:p-8 text-center">
              <div className="mb-6">
                <div className="h-16 w-16 mx-auto border-4 border-accent border-t-transparent rounded-full animate-spin-mobile" />
              </div>
              <h2 className="text-2xl font-black mb-2">TO'LOV TIZIMIGA ULANMOQDA</h2>
              <p className="text-muted-foreground font-bold mb-6">
                {selectedMethod === 'click' ? 'Click.uz' : 'ATMOS'} tizimiga yo'naltirilmoqda...
              </p>
              <div className="text-sm text-muted-foreground font-bold">
                <p>Iltimos kuting...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      <main className="flex-1 container mx-auto px-4 py-6 sm:py-8 max-w-4xl">
        {/* Price Display - HUGE and CLEAR */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-2">PREMIUM TO'LOV</h1>
          <div className="inline-block">
            {appliedCoupon ? (
              <div className="space-y-2">
                <div className="text-muted-foreground">
                  <span className="line-through text-2xl">{basePrice.toLocaleString('uz-UZ')} UZS</span>
                </div>
                <div className="font-black text-foreground" style={{ fontSize: 'clamp(1.75rem, 5vw, 3rem)' }}>
                  {finalPrice.toLocaleString('uz-UZ')} UZS
                </div>
                <Badge className="bg-green-600 text-white text-sm">
                  {appliedCoupon.discountPercent}% CHEGIRMA
                </Badge>
              </div>
            ) : (
              <div className="font-black text-foreground" style={{ fontSize: 'clamp(1.75rem, 5vw, 3rem)' }}>
                {basePrice.toLocaleString('uz-UZ')} UZS
              </div>
            )}
            <p className="text-muted-foreground mt-2 font-bold">Bir martalik to'lov</p>
          </div>
        </div>

        {/* Coupon Section - Hidden by default */}
        <div className="mb-8">
          {!showCoupon && !appliedCoupon && (
            <button
              onClick={() => setShowCoupon(true)}
              className="mx-auto flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-bold"
            >
              <Tag className="h-4 w-4" />
              Kupon kodingiz bormi?
            </button>
          )}
          
          {(showCoupon || appliedCoupon) && (
            <Card className="border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <CardContent className="p-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="KUPON KODI"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value.toUpperCase());
                      setCouponError(null);
                    }}
                    disabled={couponValidating || !!appliedCoupon}
                    className="font-mono text-base border-2 border-foreground uppercase min-h-[44px]"
                    type="text"
                    autoComplete="off"
                  />
                  {!appliedCoupon ? (
                    <Button
                      onClick={validateCoupon}
                      disabled={couponValidating || !couponCode.trim()}
                      className="font-black border-2 border-foreground min-h-[44px] min-w-[100px]"
                    >
                      QO'LLASH
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        setAppliedCoupon(null);
                        setCouponCode('');
                        setShowCoupon(false);
                      }}
                      variant="destructive"
                      className="font-black min-h-[44px] min-w-[100px]"
                    >
                      BEKOR
                    </Button>
                  )}
                </div>
                {couponError && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-300 rounded">
                    <p className="text-red-600 text-sm font-bold">{couponError}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Payment Method Selection or Free Premium Button */}
        {finalPrice === 0 && appliedCoupon ? (
          // Show FREE PREMIUM button for 100% discount
          <div className="mb-8">
            <button
              onClick={() => handlePaymentSelect('click')} // Use existing handler
              disabled={isProcessing}
              className="w-full transition-all transform sm:hover:scale-[1.02] active:scale-[0.98] touch-manipulation"
            >
              <Card className="border-4 border-accent bg-accent/10 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <CardContent className="p-8 text-center">
                  <div className="space-y-4">
                    <div className="text-6xl">🎉</div>
                    <h2 className="text-3xl font-black text-accent">WOW! BEPUL PREMIUM!</h2>
                    <p className="text-lg font-bold">100% chegirma qo'llanildi</p>
                    <div className="pt-4">
                      <div className="inline-flex items-center gap-3 text-accent">
                        <CheckCircle className="h-8 w-8" />
                        <span className="text-xl font-black">PREMIUM OLISH</span>
                        <ChevronRight className="h-8 w-8" />
                      </div>
                    </div>
                  </div>
                  {isProcessing && (
                    <div className="mt-4">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </div>
                  )}
                </CardContent>
              </Card>
            </button>
          </div>
        ) : (
          // Show normal payment methods
          <div className="space-y-4 sm:space-y-6 mb-8">
            <h2 className="text-xl font-black text-center mb-6">TO'LOV USULINI TANLANG</h2>
            
            {/* ATMOS Card */}
            <button
              onClick={() => handlePaymentSelect('atmos')}
              disabled={selectedMethod !== null}
              className="w-full transition-all transform sm:hover:scale-[1.02] active:scale-[0.98] touch-manipulation"
            >
              <Card className={`border-4 ${selectedMethod === 'atmos' ? 'border-green-600 bg-green-50' : 'border-foreground sm:hover:border-foreground/80'} shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}>
                <CardContent className="p-6 sm:p-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-foreground text-background p-4 rounded">
                        <CreditCard className="h-8 w-8" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-2xl font-black">ATMOS</h3>
                        <p className="text-muted-foreground font-bold">Bank kartalari orqali</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline" className="font-bold">UzCard</Badge>
                          <Badge variant="outline" className="font-bold">Humo</Badge>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className={`h-8 w-8 ${selectedMethod === 'atmos' ? 'text-green-600' : 'text-muted-foreground'}`} />
                  </div>
                  {selectedMethod === 'atmos' && (
                    <div className="mt-4 flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-bold">Tanlandi</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </button>

            {/* Click Card */}
            <button
              onClick={() => handlePaymentSelect('click')}
              disabled={selectedMethod !== null}
              className="w-full transition-all transform sm:hover:scale-[1.02] active:scale-[0.98] touch-manipulation"
            >
              <Card className={`border-4 ${selectedMethod === 'click' ? 'border-green-600 bg-green-50' : 'border-foreground sm:hover:border-foreground/80'} shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}>
                <CardContent className="p-6 sm:p-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-[#00CEC9] text-white p-4 rounded">
                        <Smartphone className="h-8 w-8" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-2xl font-black">Click.uz</h3>
                        <p className="text-muted-foreground font-bold">Tezkor to'lov tizimi</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Zap className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm font-bold text-muted-foreground">Onlayn to'lov</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className={`h-8 w-8 ${selectedMethod === 'click' ? 'text-green-600' : 'text-muted-foreground'}`} />
                  </div>
                  {selectedMethod === 'click' && (
                    <div className="mt-4 flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-bold">Tanlandi</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </button>
          </div>
        )}

        {/* What's Included */}
        <Card className="border-2 border-muted mb-8">
          <CardContent className="p-6">
            <h3 className="font-black text-lg mb-4">NIMALAR KIRADI:</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="font-bold">57 ta AI protokol - to'liq dostup</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="font-bold">50+ Premium promptlar</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="font-bold">AI bilan amaliy mashqlar</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="font-bold">Umrbod dostup</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Security Badge */}
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Shield className="h-5 w-5" />
          <span className="font-bold">100% xavfsiz to'lov</span>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}