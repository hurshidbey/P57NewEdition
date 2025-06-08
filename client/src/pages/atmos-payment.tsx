import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CreditCard, Loader2, CheckCircle, XCircle } from 'lucide-react';

interface AtmosPaymentStep {
  step: 'card-details' | 'otp' | 'processing' | 'success' | 'error';
  transactionId?: string;
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
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
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
          amount: 14900000, // 149,000 UZS in tiins
          description: 'Protokol 57 - AI Prompt Mastery Platform'
        })
      });

      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        throw new Error(errorData.message || 'Tranzaksiya yaratishda xatolik');
      }

      const createResult = await createResponse.json();
      const transactionId = createResult.result.transaction_id;

      // Pre-apply transaction with card details
      const preApplyResponse = await fetch('/api/atmos/pre-apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId,
          cardNumber: cleanCardNumber,
          expiry: expiry.replace('/', '')
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
        message: 'SMS kod kartangizga yuborildi'
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
          className="text-lg tracking-wider"
          required
        />
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
          className="text-lg text-center tracking-wider"
          required
        />
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
        
        <Button 
          type="button" 
          variant="outline"
          onClick={() => setPaymentState({ step: 'card-details' })}
          className="w-full"
        >
          Orqaga qaytish
        </Button>
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
              <p className="text-sm font-medium text-blue-800">
                To'lov miqdori: 149,000 UZS
              </p>
              <p className="text-xs text-blue-600">
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

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                Xavfsiz to'lov ATMOS orqali
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}