import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CreditCard, Loader2, CheckCircle, XCircle, RefreshCw, Shield, Info } from 'lucide-react';

interface AtmosPaymentStep {
  step: 'card-details' | 'otp' | 'processing' | 'success' | 'error';
  transactionId?: number;
  message?: string;
}

export default function AtmosPayment() {
  const [, setLocation] = useLocation();
  const [paymentState, setPaymentState] = useState<AtmosPaymentStep>({ step: 'card-details' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form data
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [otpCode, setOtpCode] = useState('');

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

      // Create transaction
      const createResponse = await fetch('/api/atmos/create-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 73900000, // 739,000 UZS in tiins (50% early bird discount)
          description: 'Protokol 57 - Premium Access'
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

      if (!preApplyResponse.ok) {
        const errorData = await preApplyResponse.json();
        throw new Error(errorData.message || 'Karta ma\'lumotlarini tekshirishda xatolik');
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

      const response = await fetch('/api/atmos/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId: paymentState.transactionId,
          otpCode
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
        
        // Redirect to home after 3 seconds
        setTimeout(() => {
          setLocation('/');
        }, 3000);
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
    <form onSubmit={handleCardSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="cardNumber">Karta raqami</Label>
        <Input
          id="cardNumber"
          placeholder="0000 0000 0000 0000"
          value={cardNumber}
          onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
          maxLength={19}
          className="text-lg tracking-wider font-mono"
          required
        />
        <div className="text-xs text-gray-600 mt-1">
          UzCard (8600...) yoki Humo (9860...) kartalari qabul qilinadi
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="expiry">Amal qilish muddati (MM/YY)</Label>
        <Input
          id="expiry"
          placeholder="MM/YY"
          value={expiry}
          onChange={(e) => setExpiry(formatExpiry(e.target.value))}
          maxLength={5}
          className="text-lg"
          required
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 text-blue-600 mt-0.5" />
          <div className="text-xs text-blue-700">
            <p className="font-medium mb-1">Muhim ma'lumot:</p>
            <ul className="space-y-1">
              <li>• SMS xizmati yoqilgan bo'lishi kerak</li>
              <li>• Kartada yetarli mablag' bo'lishi kerak</li>
              <li>• Karta muddati tugamagan bo'lishi kerak</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <Button 
          type="submit" 
          disabled={loading}
          className="w-full bg-[#FF4F30] hover:bg-[#E63E20] text-white"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Tekshirilmoqda...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              To'lovni davom ettirish
            </>
          )}
        </Button>
      </div>
    </form>
  );

  const renderOtpForm = () => (
    <form onSubmit={handleOtpSubmit} className="space-y-4">
      <div className="text-center mb-4">
        <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-2" />
        <p className="text-sm text-gray-600">{paymentState.message}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="otp">SMS kod</Label>
        <Input
          id="otp"
          placeholder="000000"
          value={otpCode}
          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          maxLength={6}
          className="text-2xl text-center tracking-wider font-mono"
          required
          autoFocus
        />
        <p className="text-xs text-gray-600 text-center">
          6 raqamli kodni kiriting
        </p>
      </div>

      <div className="pt-4 space-y-3">
        <Button 
          type="submit" 
          disabled={loading}
          className="w-full bg-[#FF4F30] hover:bg-[#E63E20] text-white"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Tasdiqlanmoqda...
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              To'lovni tasdiqlash
            </>
          )}
        </Button>
        
        <div className="flex gap-2">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => setPaymentState({ step: 'card-details' })}
            className="flex-1"
            disabled={loading}
          >
            Orqaga qaytish
          </Button>
          
          <Button 
            type="button" 
            variant="outline"
            onClick={handleResendOtp}
            className="flex-1"
            disabled={loading}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Qayta yuborish
          </Button>
        </div>
      </div>
    </form>
  );

  const renderSuccess = () => (
    <div className="text-center space-y-4">
      <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
      <h3 className="text-xl font-semibold text-green-700">Muvaffaqiyat!</h3>
      <p className="text-gray-600">{paymentState.message}</p>
      <p className="text-sm text-gray-500">3 soniyadan keyin bosh sahifaga yo'naltirilasiz...</p>
    </div>
  );

  const renderError = () => (
    <div className="text-center space-y-4">
      <XCircle className="mx-auto h-16 w-16 text-red-500" />
      <h3 className="text-xl font-semibold text-red-700">Xatolik yuz berdi</h3>
      <p className="text-gray-600">{paymentState.message}</p>
      <Button 
        onClick={() => setPaymentState({ step: 'card-details' })}
        className="bg-[#FF4F30] hover:bg-[#E63E20] text-white"
      >
        Qayta urinish
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Protokol 57</CardTitle>
            <CardDescription>
              AI Prompt Mastery Platform - To'lov
            </CardDescription>
            <div className="mt-2 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-blue-800">
                  To'lov miqdori: 739,000 UZS
                </p>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                  50% chegirma
                </span>
              </div>
              <p className="text-xs text-gray-500 line-through">
                Asl narxi: 1,478,000 UZS
              </p>
              <p className="text-xs text-blue-600 mt-1">
                UzCard va Humo kartalari qabul qilinadi
              </p>
            </div>
          </CardHeader>

          <CardContent>
            {error && (
              <Alert className="mb-4 border-red-200 bg-red-50">
                <XCircle className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-red-700">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {paymentState.step === 'card-details' && renderCardDetailsForm()}
            {paymentState.step === 'otp' && renderOtpForm()}
            {paymentState.step === 'success' && renderSuccess()}
            {paymentState.step === 'error' && renderError()}

            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500">
              <Shield className="h-3 w-3" />
              <span>Xavfsiz to'lov ATMOS orqali</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
