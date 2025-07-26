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
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [selectedMethod, setSelectedMethod] = useState<'atmos' | 'click' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCoupon, setShowCoupon] = useState(true); // Show coupon by default
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
        finalPrice: finalPrice,
        couponCode: appliedCoupon?.code,
        is100PercentDiscount: finalPrice === 0
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
        if (refreshUser) {
          await refreshUser();
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
      
      <main className="flex-1 container mx-auto px-4 py-6 sm:py-8 max-w-2xl">
        {/* Header with P57 logo */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center mb-4 sm:mb-6">
            <img src="/p57-black-logo.svg" alt="P57" className="h-12 sm:h-16 w-auto" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black mb-3 sm:mb-4 leading-tight">
            Sun'iy intellekt davri keldi.<br className="hidden sm:block" />
            Endi u har qadamingizda uchraydi.
          </h1>
          <p className="text-xl sm:text-2xl text-muted-foreground mb-3">
            O'rganishning ayni vaqti.<br />
            Keyin kech bo'ladi.
          </p>
          <p className="text-lg sm:text-xl italic text-muted-foreground">
            Hoziroq Sotib Oling!<br />
            Bir umrlik ilm bo'ladi.
          </p>
        </div>

        {/* Price and What's Included */}
        <div className="mb-6 sm:mb-8">
          <Card className="border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
            <div className="bg-black text-white p-4 sm:p-5">
              <h3 className="font-bold text-base sm:text-lg mb-3 uppercase tracking-wider">Nimalar kiradi:</h3>
              <ul className="space-y-4 text-base">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                  <div>
                    <span className="font-bold">57 ta prompt texnikasi</span>
                    <p className="text-gray-300 text-sm mt-1 leading-relaxed">Tanqidiy fikrlash va prompt yozishni o'rgatadigan 57 ta mini dars. Har bir protokolni sun'iy intellekt bilan sinashingiz mumkin bo'ladi. Bu 57 ta protokol hayotda va sun'iy intellekt uchun o'zgarmas! Ular OpenAI (ChatGPT), Claude va boshqa yirik gigantlarning ilmiy maqolalari va darslari yordamida tayyorlangan.</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                  <div>
                    <span className="font-bold">50+ Premium Promptlar</span>
                    <p className="text-gray-300 text-sm mt-1 leading-relaxed">Biznes, Marketing, Dasturlash va boshqa ko'plab sohalarda qo'llash uchun yuqori mukammallik asosida ishlab chiqilgan tayyor promptlar. (Har biri $20 lik qiymatga ega PromptBase da) Umumiy qiymati $1000.</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                  <div>
                    <span className="font-bold">O'quv bazasi</span>
                    <p className="text-gray-300 text-sm mt-1 leading-relaxed">Boshlang'ich va murakkab AI (Sun'iy Intellektni) o'rganish uchun bilim bazasi. Qolgan joyingizdan davom ettirib ketsangiz bo'ladi.</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                  <div>
                    <span className="font-bold">Sun'iy intellekt bilan mashq qilish <Badge className="ml-1 bg-green-500 text-black hover:bg-green-500 text-xs px-1.5 py-0">BONUS</Badge></span>
                    <p className="text-gray-300 text-sm mt-1 leading-relaxed">O'z natijangizni OpenAI ning yuqori aniqlikdagi modellari orqali sinab ko'rish imkoniyati.</p>
                  </div>
                </li>
              </ul>
            </div>
            
            {/* Price Display */}
            <div className="bg-white p-6 sm:p-8">
              <div className="text-center">
                {appliedCoupon ? (
                  <div className="space-y-2">
                    <div className="text-gray-500 line-through text-2xl sm:text-3xl">
                      {basePrice.toLocaleString('uz-UZ')} so'm
                    </div>
                    <div className="text-green-600 font-black text-4xl sm:text-5xl">
                      {finalPrice.toLocaleString('uz-UZ')} so'm
                    </div>
                    <div className="text-base sm:text-lg text-green-600 font-medium mt-2">
                      {appliedCoupon.discountPercent}% chegirma qo'llanildi!
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="font-black text-4xl sm:text-5xl">
                      {basePrice.toLocaleString('uz-UZ')} so'm
                    </div>
                    <div className="text-base sm:text-lg text-muted-foreground mt-2">
                      Bir martalik to'lov
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Promo Code Section */}
        <div className="mb-6 sm:mb-8">
          <Card className="border border-gray-200 overflow-hidden">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-3">
                <Tag className="h-5 w-5 text-muted-foreground" />
                <label className="text-base font-medium text-foreground">Promokod bormi?</label>
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value.toUpperCase());
                      setCouponError(null);
                    }}
                    placeholder="PROMOKODNI KIRITING"
                    disabled={couponValidating || !!appliedCoupon}
                    className={`font-mono text-base sm:text-lg border-2 ${
                      appliedCoupon 
                        ? 'border-green-500 bg-green-50 text-green-700' 
                        : couponError 
                          ? 'border-red-500 focus:border-red-500' 
                          : 'border-gray-300'
                    } uppercase h-10 sm:h-12 pr-10 transition-colors`}
                    type="text"
                    autoComplete="off"
                  />
                  {appliedCoupon && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                  )}
                </div>
                {!appliedCoupon ? (
                  <Button
                    onClick={validateCoupon}
                    disabled={couponValidating || !couponCode.trim()}
                    className="bg-foreground hover:bg-foreground/90 text-background font-bold h-10 sm:h-12 px-4 sm:px-6 min-w-[100px] sm:min-w-[120px] transition-all"
                  >
                    {couponValidating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "QO'LLASH"
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      setAppliedCoupon(null);
                      setCouponCode('');
                    }}
                    variant="outline"
                    className="font-bold h-10 sm:h-12 px-4 sm:px-6 min-w-[100px] sm:min-w-[120px] border-2 hover:bg-gray-50"
                  >
                    BEKOR
                  </Button>
                )}
              </div>
              {couponError && (
                <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                  <span className="text-xs">⚠</span>
                  {couponError}
                </p>
              )}
            </CardContent>
          </Card>
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
          <div className="mb-8">
            {/* Security Badge */}
            <div className="flex items-center justify-center gap-2 mb-4 text-base">
              <Shield className="h-4 w-4 text-green-500" />
              <span className="font-medium text-muted-foreground">Havfsiz to'lov tizimi</span>
            </div>
            
            {/* Payment Method Section */}
            <div className="space-y-4">
              <h3 className="text-center text-base sm:text-lg font-medium text-muted-foreground mb-3">
                To'lov usulini tanlang:
              </h3>
              
              {/* Payment Method Buttons - Properly sized */}
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                {/* Click Button */}
                <button
                  onClick={() => handlePaymentSelect('click')}
                  disabled={selectedMethod !== null}
                  className="relative flex-1 group transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded-xl"
                >
                  <div className="relative bg-white border-2 border-gray-200 rounded-xl p-4 sm:p-6 hover:border-green-500 hover:shadow-lg transition-all">
                    <div className="flex flex-col items-center space-y-3">
                      <div className="h-16 sm:h-20 flex items-center justify-center">
                        <img 
                          src="/pay-with-click.png" 
                          alt="Click" 
                          className="h-full w-auto object-contain max-w-[160px] sm:max-w-[200px]"
                        />
                      </div>
                      <span className="text-sm sm:text-base font-medium text-gray-600">Tez va oson to'lov</span>
                    </div>
                    {selectedMethod === 'click' && (
                      <div className="absolute inset-0 bg-green-500/10 rounded-xl flex items-center justify-center">
                        <div className="bg-white rounded-full p-2 shadow-lg">
                          <CheckCircle className="h-8 w-8 text-green-500" />
                        </div>
                      </div>
                    )}
                  </div>
                </button>

                {/* ATMOS Button */}
                <button
                  onClick={() => handlePaymentSelect('atmos')}
                  disabled={selectedMethod !== null}
                  className="relative flex-1 group transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded-xl"
                >
                  <div className="relative bg-white border-2 border-gray-200 rounded-xl p-4 sm:p-6 hover:border-green-500 hover:shadow-lg transition-all">
                    <div className="flex flex-col items-center space-y-3">
                      <div className="h-16 sm:h-20 flex items-center justify-center">
                        <img 
                          src="/pay-with-atmos.png" 
                          alt="ATMOS" 
                          className="h-full w-auto object-contain max-w-[160px] sm:max-w-[200px]"
                        />
                      </div>
                      <span className="text-sm sm:text-base font-medium text-gray-600">Bank kartasi orqali</span>
                    </div>
                    {selectedMethod === 'atmos' && (
                      <div className="absolute inset-0 bg-green-500/10 rounded-xl flex items-center justify-center">
                        <div className="bg-white rounded-full p-2 shadow-lg">
                          <CheckCircle className="h-8 w-8 text-green-500" />
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center justify-center gap-4 mt-6 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Smartphone className="h-3 w-3" />
                  <span>Mobile optimized</span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  <span>Tezkor to'lov</span>
                </div>
                <div className="flex items-center gap-1">
                  <CreditCard className="h-3 w-3" />
                  <span>256-bit shifrlash</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      <AppFooter />
    </div>
  );
}