import { useState } from 'react';
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
  Smartphone
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import AppHeader from '@/components/app-header';
import AppFooter from '@/components/app-footer';

export default function Payment() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState<'atmos' | 'click' | null>(null);
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
    try {
      // Create transaction and get payment URL
      const response = await fetch('/api/click/create-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: finalPrice,
          userId: user?.id || 'guest',
          couponCode: appliedCoupon?.code
        })
      });

      const data = await response.json();
      
      if (data.success && data.paymentUrl) {
        // Redirect to Click.uz payment page
        window.location.href = data.paymentUrl;
      } else {
        alert('To\'lov tizimiga ulanishda xatolik. Iltimos qayta urinib ko\'ring.');
        setSelectedMethod(null);
      }
    } catch (error) {
      console.error('Click payment error:', error);
      alert('To\'lov tizimiga ulanishda xatolik. Iltimos qayta urinib ko\'ring.');
      setSelectedMethod(null);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader />
      
      <main className="flex-1 container mx-auto px-4 py-6 sm:py-8 max-w-4xl">
        {/* Price Display - HUGE and CLEAR */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-black mb-2">PREMIUM TO'LOV</h1>
          <div className="inline-block">
            {appliedCoupon ? (
              <div className="space-y-2">
                <div className="text-muted-foreground">
                  <span className="line-through text-2xl">{basePrice.toLocaleString('uz-UZ')} UZS</span>
                </div>
                <div className="text-4xl sm:text-5xl font-black text-foreground">
                  {finalPrice.toLocaleString('uz-UZ')} UZS
                </div>
                <Badge className="bg-green-600 text-white text-sm">
                  {appliedCoupon.discountPercent}% CHEGIRMA
                </Badge>
              </div>
            ) : (
              <div className="text-4xl sm:text-5xl font-black text-foreground">
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
                    className="font-mono text-lg border-2 border-foreground uppercase"
                  />
                  {!appliedCoupon ? (
                    <Button
                      onClick={validateCoupon}
                      disabled={couponValidating || !couponCode.trim()}
                      className="font-black border-2 border-foreground"
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
                      className="font-black"
                    >
                      BEKOR
                    </Button>
                  )}
                </div>
                {couponError && (
                  <p className="text-red-600 text-sm mt-2 font-bold">{couponError}</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Payment Method Selection - BIG CARDS */}
        <div className="space-y-4 mb-8">
          <h2 className="text-xl font-black text-center mb-6">TO'LOV USULINI TANLANG</h2>
          
          {/* ATMOS Card */}
          <button
            onClick={() => handlePaymentSelect('atmos')}
            disabled={selectedMethod !== null}
            className="w-full transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Card className={`border-4 ${selectedMethod === 'atmos' ? 'border-green-600 bg-green-50' : 'border-foreground hover:border-foreground/80'} shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]`}>
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
            className="w-full transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Card className={`border-4 ${selectedMethod === 'click' ? 'border-green-600 bg-green-50' : 'border-foreground hover:border-foreground/80'} shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]`}>
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