import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Loader2, CheckCircle, XCircle, RefreshCw, Shield, Info, AlertCircle, Crown, FileText, BookOpen, Brain, Zap, Tag } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import AppHeader from '@/components/app-header';
import AppFooter from '@/components/app-footer';

interface AtmosPaymentStep {
  step: 'card-details' | 'otp' | 'processing' | 'success' | 'error';
  transactionId?: number;
  message?: string;
}

export default function AtmosPayment() {
  const [, setLocation] = useLocation();
  const { user, loading: authLoading } = useAuth();
  const [paymentState, setPaymentState] = useState<AtmosPaymentStep>({ step: 'card-details' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      console.warn('🚫 Payment page accessed without authentication');
      setLocation('/auth/login?redirect=/atmos-payment');
    }
  }, [user, authLoading, setLocation]);
  
  // Form data
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [otpCode, setOtpCode] = useState('');
  
  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [couponValidating, setCouponValidating] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    id: number;
    code: string;
    originalAmount: number;
    discountAmount: number;
    finalAmount: number;
    discountPercent: number;
  } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    // Remove all non-digits and limit to 16 digits
    const v = value.replace(/\D/g, '').substring(0, 16);
    
    // Add space every 4 digits
    return v.replace(/(.{4})/g, '$1 ').trim();
  };

  // Format expiry date (MM/YY)
  const formatExpiry = (value: string) => {
    const v = value.replace(/\D/g, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  // Validate and apply coupon
  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Kupon kodi kiritilmagan');
      return;
    }

    setCouponValidating(true);
    setCouponError(null);

    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code: couponCode.trim(),
          amount: 1425000 // Original price
        })
      });

      let result;
      const responseText = await response.text();
      
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON parsing error:', parseError);
        console.error('Response text:', responseText);
        setCouponError('Server javobi noto\'g\'ri. Iltimos qayta urinib ko\'ring.');
        setAppliedCoupon(null);
        setCouponValidating(false);
        return;
      }

      if (!response.ok || !result.valid) {
        setCouponError(result.message || 'Kupon kodi noto\'g\'ri');
        setAppliedCoupon(null);
        return;
      }

      // Successfully validated
      setAppliedCoupon(result.coupon);
      setCouponError(null);
    } catch (error) {
      console.error('Coupon validation error:', error);
      setCouponError('Kupon kodini tekshirishda xatolik');
      setAppliedCoupon(null);
    } finally {
      setCouponValidating(false);
    }
  };

  // Remove applied coupon
  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError(null);
  };

  // Step 1: Submit card details
  const handleCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Clean card number (remove spaces)
      const cleanCardNumber = cardNumber.replace(/\s/g, '');
      
      // Validate inputs
      if (cleanCardNumber.length !== 16) {
        throw new Error('Karta raqami 16 raqamdan iborat bo\'lishi kerak');
      }
      
      if (!expiry.match(/^\d{2}\/\d{2}$/)) {
        throw new Error('Amal qilish muddati MM/YY formatida bo\'lishi kerak');
      }

      // Create transaction with coupon if applied
      const createResponse = await fetch('/api/atmos/create-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: appliedCoupon ? appliedCoupon.originalAmount * 100 : 142500000, // Convert to tiins
          description: 'Protokol 57 - Premium Access',
          couponCode: appliedCoupon ? appliedCoupon.code : null
        })
      });

      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        throw new Error(errorData.message || 'Tranzaksiya yaratishda xatolik');
      }

      const createResult = await createResponse.json();
      const transactionId = createResult.transaction_id;

      if (!transactionId) {
        throw new Error('Transaction ID not received');
      }

      // Pre-apply transaction with card details
      const preApplyResponse = await fetch('/api/atmos/pre-apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId,
          cardNumber: cleanCardNumber,
          expiry: expiry.replace('/', '') // Remove slash for API
        })
      });

      // Handle response with better error checking
      let preApplyData;
      const responseText = await preApplyResponse.text();
      
      try {
        preApplyData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Pre-apply response parsing error:', parseError);
        console.error('Response text:', responseText);
        
        // Check for common error patterns
        if (responseText.includes('Too many') || responseText.includes('rate limit')) {
          throw new Error('Juda ko\'p urinish. Iltimos biroz kuting va qayta urinib ko\'ring.');
        } else if (responseText.includes('401') || responseText.includes('Unauthorized')) {
          throw new Error('Avtorizatsiya xatosi. Iltimos keyinroq urinib ko\'ring.');
        } else if (responseText.includes('Token') || responseText.includes('credentials')) {
          throw new Error('To\'lov tizimi vaqtincha ishlamayapti. Iltimos keyinroq urinib ko\'ring.');
        } else {
          throw new Error('Server xatosi. Iltimos qayta urinib ko\'ring.');
        }
      }

      if (!preApplyResponse.ok) {
        throw new Error(preApplyData.message || preApplyData.details || 'Karta ma\'lumotlarini yuborishda xatolik');
      }

      // Move to OTP step
      setPaymentState({ 
        step: 'otp', 
        transactionId,
        message: 'SMS kod kartangizga bog\'langan telefon raqamiga yuborildi'
      });

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Submit OTP
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!otpCode || otpCode.length !== 6) {
        throw new Error('SMS kod 6 raqamdan iborat bo\'lishi kerak');
      }

      // Get auth token for user tier upgrade
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL!,
        import.meta.env.VITE_SUPABASE_ANON_KEY!
      );
      
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const response = await fetch('/api/atmos/confirm', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          transactionId: paymentState.transactionId,
          otpCode,
          // Pass coupon info if applied
          couponInfo: appliedCoupon ? {
            couponId: appliedCoupon.id,
            originalAmount: appliedCoupon.originalAmount,
            discountAmount: appliedCoupon.discountAmount,
            finalAmount: appliedCoupon.finalAmount
          } : null
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'SMS kodni tasdiqlashda xatolik');
      }

      const result = await response.json();
      
      if (result.success) {
        setPaymentState({ 
          step: 'success',
          message: 'To\'lov muvaffaqiyatli amalga oshirildi!'
        });
        
        // CRITICAL: Force complete session refresh after payment
        console.log('🎯 Payment successful - forcing complete session refresh...');
        
        try {
          const { createClient } = await import('@supabase/supabase-js');
          const supabase = createClient(
            import.meta.env.VITE_SUPABASE_URL!,
            import.meta.env.VITE_SUPABASE_ANON_KEY!
          );
          
          // Wait longer for backend to complete tier update
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          // Multiple refresh attempts to ensure updated metadata
          for (let i = 0; i < 3; i++) {
            console.log(`🔄 Session refresh attempt ${i + 1}/3`);
            
            const { data, error: refreshError } = await supabase.auth.refreshSession();
            if (!refreshError && data.session?.user) {
              console.log(`✅ Session refreshed - User tier: ${data.session.user.user_metadata?.tier || 'unknown'}`);
              
              // If tier is now 'paid', break out of loop
              if (data.session.user.user_metadata?.tier === 'paid') {
                console.log('✅ Tier upgrade confirmed in session!');
                break;
              }
            } else if (refreshError) {
              console.error(`❌ Refresh attempt ${i + 1} failed:`, refreshError);
            }
            
            // Wait between attempts
            if (i < 2) await new Promise(resolve => setTimeout(resolve, 1000));
          }
          
          // Force auth context to refresh
          localStorage.setItem('tier_upgrade_trigger', Date.now().toString());
          // Dispatch storage event manually since same window won't trigger automatically
          window.dispatchEvent(new StorageEvent('storage', {
            key: 'tier_upgrade_trigger',
            newValue: Date.now().toString()
          }));
          
          // Don't reload here - we'll redirect instead
          console.log('✅ Session refresh complete, preparing redirect...');

        } catch (error) {
          console.error('❌ Error in session refresh process:', error);
          // Continue with redirect anyway - user can refresh later
        }
        
        // Redirect to home after 2 seconds with payment success flag
        setTimeout(() => {
          console.log('🚀 Redirecting to home page...');
          // Use window.location for a full page refresh to ensure new session is loaded
          window.location.href = '/?payment=success';
        }, 2000);
      } else {
        throw new Error(result.message || 'To\'lovni tasdiqlashda xatolik');
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/atmos/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId: paymentState.transactionId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'SMS kodni qayta yuborishda xatolik');
      }

      setError(null);
      alert('SMS kod qayta yuborildi');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderCardDetailsForm = () => (
    <div className="space-y-6">
      {/* Coupon Section */}
      <Card className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-none">
        <CardHeader className="bg-muted border-b-2 border-black">
          <div className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            <CardTitle className="text-lg font-black uppercase">Kupon kodi</CardTitle>
          </div>
          <CardDescription className="font-bold">
            Chegirma kodingiz bo'lsa, bu yerga kiriting
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Kupon kodini kiriting"
                value={couponCode}
                onChange={(e) => {
                  setCouponCode(e.target.value.toUpperCase());
                  setCouponError(null);
                }}
                disabled={couponValidating || !!appliedCoupon}
                className="font-mono text-lg border-2 border-foreground focus:border-foreground focus:ring-0 uppercase"
              />
              {!appliedCoupon ? (
                <Button
                  type="button"
                  onClick={validateCoupon}
                  disabled={couponValidating || !couponCode.trim()}
                  className="bg-foreground text-background hover:bg-foreground/90 font-bold uppercase border-2 border-foreground min-w-[120px]"
                >
                  {couponValidating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'QO\'LLASH'
                  )}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={removeCoupon}
                  variant="destructive"
                  className="font-bold uppercase border-2 border-red-600 min-w-[120px]"
                >
                  BEKOR QILISH
                </Button>
              )}
            </div>
            
            {couponError && (
              <Alert className="bg-red-50 border-2 border-red-600">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-600 font-bold">
                  {couponError}
                </AlertDescription>
              </Alert>
            )}
            
            {appliedCoupon && (
              <Alert className="bg-green-50 border-2 border-green-600">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-600 font-bold">
                  {appliedCoupon.discountPercent}% chegirma qo'llanildi!
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
      <div className="space-y-3">
        <Label htmlFor="cardNumber" className="text-lg font-black text-foreground">KARTA RAQAMI</Label>
        <Input
          id="cardNumber"
          type="tel"
          inputMode="numeric"
          placeholder="0000 0000 0000 0000"
          value={cardNumber}
          onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
          maxLength={19}
          className="text-lg sm:text-xl tracking-wider font-mono border-2 border-foreground focus:border-foreground focus:ring-0 p-4 bg-background min-h-[56px]"
          required
        />
        <div className="text-sm font-bold text-muted-foreground">
          UzCard (8600...) yoki Humo (9860...) kartalari qabul qilinadi
        </div>
      </div>

      <div className="space-y-3">
        <Label htmlFor="expiry" className="text-lg font-black text-foreground">AMAL QILISH MUDDATI</Label>
        <Input
          id="expiry"
          type="tel"
          inputMode="numeric"
          placeholder="MM/YY"
          value={expiry}
          onChange={(e) => setExpiry(formatExpiry(e.target.value))}
          maxLength={5}
          className="text-lg sm:text-xl font-mono border-2 border-foreground focus:border-foreground focus:ring-0 p-4 bg-background min-h-[56px]"
          required
        />
      </div>

      <div className="bg-muted/30 border-2 border-muted p-4 mt-6">
        <div className="text-sm font-bold text-foreground">
          <p className="font-black mb-2">MUHIM SHARTLAR:</p>
          <ul className="space-y-1 font-bold">
            <li>• SMS xizmati yoqilgan bo'lishi kerak</li>
            <li>• Kartada yetarli mablag' bo'lishi kerak</li>
            <li>• Karta muddati tugamagan bo'lishi kerak</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderOtpForm = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <p className="text-lg font-black text-foreground mb-4">SMS KOD YUBORILDI</p>
        <p className="font-bold text-muted-foreground">{paymentState.message}</p>
      </div>

      <div className="space-y-3">
        <Label htmlFor="otp" className="text-lg font-black text-foreground">SMS KOD</Label>
        <Input
          id="otp"
          type="tel"
          inputMode="numeric"
          placeholder="000000"
          value={otpCode}
          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          maxLength={6}
          className="text-2xl sm:text-3xl text-center tracking-wider font-mono border-2 border-foreground focus:border-foreground focus:ring-0 p-4 bg-background min-h-[64px]"
          required
          autoFocus
        />
        <p className="text-sm font-bold text-muted-foreground text-center">
          6 raqamli kodni kiriting
        </p>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="text-center space-y-4">
      <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
      <h3 className="text-xl font-semibold text-green-700">Muvaffaqiyat!</h3>
      <p className="text-muted-foreground">{paymentState.message}</p>
      <p className="text-sm text-muted-foreground">2 soniyadan keyin bosh sahifaga yo'naltirilasiz...</p>
      <div className="mt-4">
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-green-500" />
      </div>
    </div>
  );

  const renderError = () => (
    <div className="text-center space-y-4">
      <XCircle className="mx-auto h-16 w-16 text-red-500" />
      <h3 className="text-xl font-semibold text-red-700">Xatolik yuz berdi</h3>
      <p className="text-muted-foreground">{paymentState.message}</p>
      <Button 
        onClick={() => setPaymentState({ step: 'card-details' })}
        className="bg-[#FF4F30] hover:bg-[#E63E20] text-white"
      >
        Qayta urinish
      </Button>
    </div>
  );

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p className="text-muted-foreground">Autentifikatsiya tekshirilmoqda...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error if user is not authenticated (backup check)
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <AlertCircle className="h-12 w-12 text-orange-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Autentifikatsiya talab qilinadi</h3>
            <p className="text-muted-foreground text-center mb-4">
              To'lovni amalga oshirish uchun tizimga kiring
            </p>
            <Button onClick={() => setLocation('/auth/login?redirect=/atmos-payment')}>
              Tizimga kirish
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-black text-foreground mb-4 sm:mb-6">
              PREMIUM TO'LOV
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
            {/* Left Column - Payment Form - Full width on mobile */}
            <div className="order-2 lg:order-1 lg:col-span-2">
              <div className="bg-card border-2 border-foreground shadow-lg">
                {/* Payment Form */}
                <div className="p-6 border-b-2 border-foreground">
                  <h2 className="text-xl font-black text-foreground mb-6">TO'LOV MA'LUMOTLARI</h2>
                  
                  {error && (
                    <div className="bg-destructive/10 border-2 border-destructive/20 p-4 mb-6">
                      <p className="text-destructive font-bold">XATOLIK: {error}</p>
                    </div>
                  )}

                  {paymentState.step === 'card-details' && renderCardDetailsForm()}
                  {paymentState.step === 'otp' && renderOtpForm()}
                  {paymentState.step === 'success' && (
                    <div className="text-center">
                      <h3 className="text-xl font-black text-foreground mb-4">TO'LOV MUVAFFAQIYATLI</h3>
                      <p className="font-bold text-foreground">Rahmat! Premium dostup faollashtirildi.</p>
                    </div>
                  )}
                  {paymentState.step === 'error' && (
                    <div className="text-center">
                      <h3 className="text-xl font-black text-foreground mb-4">TO'LOVDA XATOLIK</h3>
                      <p className="mb-4 text-foreground">{paymentState.message}</p>
                      <Button 
                        onClick={() => setPaymentState({ step: 'card-details' })}
                        className="bg-foreground text-background font-bold py-3 px-6 border-2 border-foreground hover:bg-foreground/90"
                      >
                        QAYTA URINISH
                      </Button>
                    </div>
                  )}
                </div>

                {/* Footer with Payment Button */}
                <div className="p-6 text-center">
                  {paymentState.step === 'card-details' && (
                    <form onSubmit={handleCardSubmit}>
                      <Button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-foreground text-background font-black text-lg py-4 border-2 border-foreground hover:bg-foreground/90 mb-6"
                      >
                        {loading ? (
                          "TEKSHIRILMOQDA..."
                        ) : (
                          "TO'LOVNI DAVOM ETTIRISH"
                        )}
                      </Button>
                    </form>
                  )}
                  
                  {paymentState.step === 'otp' && (
                    <form onSubmit={handleOtpSubmit} className="space-y-4 mb-6">
                      <Button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-foreground text-background font-black text-lg py-4 border-2 border-foreground hover:bg-foreground/90"
                      >
                        {loading ? "TASDIQLANMOQDA..." : "TO'LOVNI TASDIQLASH"}
                      </Button>
                      
                      <div className="flex gap-4">
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={() => setPaymentState({ step: 'card-details' })}
                          className="flex-1 font-bold border-2 border-foreground text-foreground hover:bg-muted"
                          disabled={loading}
                        >
                          ORQAGA
                        </Button>
                        
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={handleResendOtp}
                          className="flex-1 font-bold border-2 border-foreground text-foreground hover:bg-muted"
                          disabled={loading}
                        >
                          QAYTA YUBORISH
                        </Button>
                      </div>
                    </form>
                  )}
                  
                  <p className="text-sm font-bold text-muted-foreground">XAVFSIZ TO'LOV ATMOS ORQALI</p>
                </div>
              </div>
            </div>

            {/* Right Column - Product Details - Shows first on mobile */}
            <div className="order-1 lg:order-2 lg:col-span-3">
              <div className="bg-card border-2 border-foreground shadow-lg">
                {/* Features */}
                <div className="border-b-2 border-foreground p-6">
                  <h2 className="text-xl font-black text-foreground mb-4">MAHSULOT TAFSILOTLARI</h2>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-bold text-foreground">57 ta protokol</span>
                      <span className="text-muted-foreground">KIRITILGAN</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold text-foreground">50+ Premium promptlar</span>
                      <span className="text-muted-foreground">KIRITILGAN</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold text-foreground">Promptlash asoslari</span>
                      <span className="text-muted-foreground">KIRITILGAN</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold text-foreground">Sun'iy-Intellekt asoslari</span>
                      <span className="text-muted-foreground">KIRITILGAN</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold text-foreground">(BETA) S.I. bilan mashq</span>
                      <span className="text-muted-foreground">KIRITILGAN</span>
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div className="border-b-2 border-foreground p-6">
                  {appliedCoupon ? (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-muted-foreground">
                        <span className="font-bold">Asl narx</span>
                        <span className="line-through">{appliedCoupon.originalAmount.toLocaleString('uz-UZ')} UZS</span>
                      </div>
                      <div className="flex justify-between items-center text-green-600">
                        <span className="font-bold">Chegirma ({appliedCoupon.discountPercent}%)</span>
                        <span className="font-bold">-{appliedCoupon.discountAmount.toLocaleString('uz-UZ')} UZS</span>
                      </div>
                      <div className="border-t-2 border-black pt-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xl font-black text-foreground">JAMI SUMMA</span>
                          <span className="text-2xl font-black text-foreground">{appliedCoupon.finalAmount.toLocaleString('uz-UZ')} UZS</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className="bg-green-600 text-white hover:bg-green-700 font-bold">
                            {appliedCoupon.code}
                          </Badge>
                          <span className="text-sm text-muted-foreground">kupon qo'llanildi</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-black text-foreground">JAMI SUMMA</span>
                        <span className="text-2xl font-black text-foreground">1,425,000 UZS</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Bir martalik to'lov</p>
                    </>
                  )}
                </div>

                {/* User Info */}
                {user && (
                  <div className="p-6 bg-muted/30">
                    <h3 className="text-lg font-black text-foreground mb-2">MIJOZ MA'LUMOTLARI</h3>
                    <p className="font-bold text-foreground">{user.email}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <AppFooter />
    </div>
  );
}
