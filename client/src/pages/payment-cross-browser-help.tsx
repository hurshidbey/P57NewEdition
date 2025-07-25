import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, Smartphone, Globe } from 'lucide-react';
import AppHeader from '@/components/app-header';
import AppFooter from '@/components/app-footer';
import { useLocation } from 'wouter';

export default function PaymentCrossBrowserHelp() {
  const [, setLocation] = useLocation();
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader />
      
      <main className="flex-1 container mx-auto px-4 py-8 sm:py-12">
        <Card className="max-w-2xl mx-auto border-4 border-green-600 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto mb-4">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
            <CardTitle className="font-black" style={{ fontSize: 'clamp(1.25rem, 3.5vw, 2rem)' }}>
              TO'LOV MUVAFFAQIYATLI AMALGA OSHIRILDI!
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6 pb-24 sm:pb-6">
            <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-4">
              <p className="font-bold text-lg mb-2 flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Muhim eslatma:
              </p>
              <p className="text-muted-foreground">
                Click ilovasi boshqa brauzerni ochdi. Premium dostupni ko'rish uchun 
                ro'yxatdan o'tgan brauzeringizga qayting.
              </p>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-bold text-lg">Quyidagi bosqichlarni bajaring:</h3>
              
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-accent text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <p className="font-bold">Asl brauzeringizni oching</p>
                    <p className="text-sm text-muted-foreground">
                      Ro'yxatdan o'tgan brauzeringizga qayting
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-accent text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <p className="font-bold">app.p57.uz sahifasini yangilang</p>
                    <p className="text-sm text-muted-foreground">
                      Sahifani yangilash tugmasini bosing yoki F5 tugmasini bosing
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-accent text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <p className="font-bold">Premium protokollarga kiring</p>
                    <p className="text-sm text-muted-foreground">
                      Endi barcha 57 protokolga to'liq dostup ochiq!
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
              <p className="text-green-800 font-bold">
                ✅ To'lovingiz muvaffaqiyatli qabul qilindi va hisobingizga Premium status berildi!
              </p>
            </div>
            
            {/* Mobile-optimized sticky CTA */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t-2 border-foreground shadow-[0_-4px_0px_0px_rgba(0,0,0,1)] sm:relative sm:bottom-auto sm:p-0 sm:bg-transparent sm:border-0 sm:shadow-none">
              <Button
                onClick={() => window.open('https://app.p57.uz', '_blank')}
                className="w-full font-black text-lg border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                size="lg"
              >
                <Globe className="mr-2 h-5 w-5" />
                YANGI OYNADA OCHISH
              </Button>
              
              <p className="text-center text-sm text-muted-foreground mt-3">
                yoki qo'lda kiriting: <strong>app.p57.uz</strong>
              </p>
            </div>
            
            <div className="border-t pt-4">
              <p className="text-sm text-muted-foreground text-center">
                Savollar bo'lsa, bizga murojaat qiling: support@p57.uz
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
      
      <AppFooter />
    </div>
  );
}