import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion } from "framer-motion";
import { 
  CreditCard, 
  Shield, 
  CheckCircle, 
  ArrowRight, 
  Zap,
  Star,
  Users,
  BookOpen,
  Target
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import AppHeader from "@/components/app-header";
import AppFooter from "@/components/app-footer";

export default function PaymentPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const handleAtmosPayment = () => {
    if (!user) {
      setError("Iltimos, avval tizimga kiring");
      return;
    }
    window.location.href = '/atmos-payment';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <AppHeader />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 bg-accent/10 text-accent border-accent/20">
            Premium Access
          </Badge>
          <h1 className="text-4xl font-black text-black mb-4">
            Protokol 57 Premium
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            AI bilan professional ishlashni o'rganish platformasiga to'liq kirish
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Features */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-2 border-gray-100 shadow-medium h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Star className="w-6 h-6 text-accent" />
                  Premium imkoniyatlar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <BookOpen className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <h3 className="font-semibold">57 ta AI Protokol</h3>
                      <p className="text-sm text-gray-600">Barcha professional AI texnikalariga kirish</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Target className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <h3 className="font-semibold">AI Baholash Tizimi</h3>
                      <p className="text-sm text-gray-600">Promptlaringizni real vaqtda baholash</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-purple-500 mt-0.5" />
                    <div>
                      <h3 className="font-semibold">Progress Tracking</h3>
                      <p className="text-sm text-gray-600">O'rganish jarayonini kuzatish</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-yellow-500 mt-0.5" />
                    <div>
                      <h3 className="font-semibold">Unlimited Access</h3>
                      <p className="text-sm text-gray-600">Cheksiz foydalanish imkoniyati</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-accent/5 to-accent/10 rounded-none p-4 border border-accent/20">
                  <p className="text-sm font-medium text-accent">
                    💡 AI bilan professional ishlash ko'nikmalarini rivojlantiring
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Payment */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-2 border-gray-100 shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <CreditCard className="w-6 h-6 text-accent" />
                  To'lov
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Price */}
                <div className="text-center py-6 bg-gray-50 rounded-none">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-4xl font-black text-black">149,000</span>
                    <span className="text-lg text-gray-600">so'm</span>
                  </div>
                  <p className="text-sm text-gray-600">Bir martalik to'lov</p>
                </div>

                {/* Security Badge */}
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-green-50 p-3 rounded-none border border-green-200">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span>ATMOS orqali xavfsiz to'lov</span>
                </div>

                {/* Error Display */}
                {error && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-700">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Payment Button */}
                <div className="space-y-3">
                  <Button
                    onClick={handleAtmosPayment}
                    disabled={!user}
                    className="w-full h-14 bg-accent hover:bg-gray-800 text-white font-semibold text-lg group"
                  >
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      ATMOS orqali to'lash (UzCard/Humo)
                      <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </Button>
                </div>

                {!user && (
                  <Alert className="border-blue-200 bg-blue-50">
                    <AlertDescription className="text-blue-700">
                      To'lov qilish uchun tizimga kirish kerak
                    </AlertDescription>
                  </Alert>
                )}

                {/* Features List */}
                <div className="space-y-2 pt-4 border-t border-gray-200">
                  <h4 className="font-semibold text-sm">To'lovga kiradi:</h4>
                  {[
                    "57 ta AI protokolga kirish",
                    "AI prompt baholash tizimi",
                    "Progress tracking",
                    "Unlimited access",
                    "Professional texnikalar"
                  ].map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center"
        >
          <div className="bg-white rounded-none p-6 shadow-soft border border-gray-100">
            <h3 className="font-semibold mb-4">Xavfsiz to'lov</h3>
            <div className="flex items-center justify-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-500" />
                <span>SSL shifrlash</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-500" />
                <span>ATMOS himoyasi</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Darhol kirish</span>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
      
      <AppFooter />
    </div>
  );
}