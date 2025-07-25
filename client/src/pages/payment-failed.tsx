import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  XCircle, 
  AlertCircle, 
  RefreshCw, 
  ArrowLeft,
  HelpCircle,
  MessageSquare
} from 'lucide-react';
import AppHeader from '@/components/app-header';
import AppFooter from '@/components/app-footer';

export default function PaymentFailed() {
  const [, setLocation] = useLocation();
  const [showSupport, setShowSupport] = useState(false);
  
  // Get error details from URL params if available
  const params = new URLSearchParams(window.location.search);
  const errorCode = params.get('error') || 'unknown';
  const method = params.get('method') || 'unknown';

  const getErrorMessage = () => {
    switch (errorCode) {
      case 'insufficient_funds':
        return "Kartangizda mablag' yetarli emas";
      case 'card_declined':
        return "Kartangiz rad etildi";
      case 'invalid_card':
        return "Karta ma'lumotlari noto'g'ri";
      case 'timeout':
        return "To'lov vaqti tugadi";
      case 'cancelled':
        return "To'lov bekor qilindi";
      default:
        return "To'lovda xatolik yuz berdi";
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader />
      
      <main className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
        <Card className="max-w-2xl w-full border-4 border-red-600 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <CardContent className="p-8 sm:p-12">
            {/* Error Icon */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full mb-6">
                <XCircle className="h-16 w-16 text-red-600" />
              </div>
              
              <h1 className="font-black text-foreground mb-2" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
                TO'LOV AMALGA OSHMADI
              </h1>
              
              <p className="text-xl text-muted-foreground font-bold">
                {getErrorMessage()}
              </p>
            </div>

            {/* Error Details */}
            <Alert className="mb-8 border-2 border-muted">
              <AlertCircle className="h-5 w-5" />
              <AlertDescription className="font-medium">
                <strong>Sabab:</strong> {getErrorMessage()}<br />
                <strong>To'lov usuli:</strong> {method.toUpperCase()}<br />
                <strong>Vaqt:</strong> {new Date().toLocaleString('uz-UZ')}
              </AlertDescription>
            </Alert>

            {/* Common Solutions */}
            <Card className="border-2 border-muted mb-8 bg-yellow-50">
              <CardContent className="p-6">
                <h3 className="font-black text-lg mb-4 flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  MUMKIN BO'LGAN YECHIMLAR:
                </h3>
                <ul className="space-y-3 text-left">
                  <li className="flex items-start gap-3">
                    <span className="font-black text-muted-foreground">1.</span>
                    <span className="font-medium">Kartangizda yetarli mablag' borligini tekshiring</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="font-black text-muted-foreground">2.</span>
                    <span className="font-medium">Internet aloqangiz barqaror ekanligini tekshiring</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="font-black text-muted-foreground">3.</span>
                    <span className="font-medium">Boshqa to'lov usulini sinab ko'ring</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="font-black text-muted-foreground">4.</span>
                    <span className="font-medium">Bank bilan bog'laning (karta bloklangan bo'lishi mumkin)</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-4">
              <Button
                onClick={() => setLocation('/payment')}
                size="lg"
                className="w-full font-black text-lg border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all min-h-[48px]"
              >
                <RefreshCw className="mr-2 h-5 w-5" />
                QAYTA URINIB KO'RISH
              </Button>
              
              <Button
                onClick={() => setLocation('/')}
                variant="outline"
                size="lg"
                className="w-full font-black text-lg border-2 border-foreground min-h-[48px]"
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                BOSH SAHIFAGA QAYTISH
              </Button>
            </div>

            {/* Support Section */}
            <div className="mt-8 pt-8 border-t border-muted">
              <button
                onClick={() => setShowSupport(!showSupport)}
                className="w-full text-center text-muted-foreground hover:text-foreground transition-colors font-bold flex items-center justify-center gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                Yordam kerakmi?
              </button>
              
              {showSupport && (
                <Alert className="mt-4 border-2 border-muted">
                  <AlertDescription>
                    <strong>Qo'llab-quvvatlash:</strong><br />
                    📧 Email: support@p57.uz<br />
                    📱 Telegram: @protokol57_support<br />
                    🕐 Ish vaqti: 9:00 - 18:00 (Dush-Jum)
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      <AppFooter />
    </div>
  );
}