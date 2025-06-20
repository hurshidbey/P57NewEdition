import React from 'react';
import { useUserTier } from '@/hooks/use-user-tier';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Crown, ArrowRight, Star, Zap, Shield } from 'lucide-react';
import { Link } from 'wouter';

interface PremiumPromptLockProps {
  variant?: 'modal' | 'inline' | 'card' | 'banner';
  title?: string;
  description?: string;
  showBenefits?: boolean;
  onClose?: () => void;
}

export function PremiumPromptLock({ 
  variant = 'modal', 
  title = 'Premium prompt',
  description = 'Bu promptni ko\'rish uchun Premium obuna kerak',
  showBenefits = true,
  onClose 
}: PremiumPromptLockProps) {
  const { tier } = useUserTier();

  // Don't show if user is already premium
  if (tier === 'paid') return null;

  const benefits = [
    {
      icon: Crown,
      title: 'Premium promptlar',
      description: '50+ maxsus tayyorlangan professional promptlar'
    },
    {
      icon: Zap,
      title: 'Cheksiz AI baholash',
      description: 'Har qanday promptni cheksiz test qiling'
    },
    {
      icon: Shield,
      title: 'Barcha protokollar',
      description: 'Barcha 57 protokolga to\'liq kirish'
    },
    {
      icon: Star,
      title: 'Yangi kontentlar',
      description: 'Doimiy yangi promptlar va protokollar'
    }
  ];

  if (variant === 'banner') {
    return (
      <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200 mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-full">
                <Crown className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-foreground">{title}</h3>
                <p className="text-muted-foreground">{description}</p>
              </div>
            </div>
            <Link href="/atmos-payment">
              <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                Premium olish
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'inline') {
    return (
      <div className="flex items-center justify-center p-8 bg-muted/30 rounded-lg border-2 border-dashed border-muted-foreground/20">
        <div className="text-center max-w-sm">
          <Lock className="w-12 h-12 text-orange-500 mx-auto mb-3" />
          <h3 className="font-semibold text-foreground mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground mb-4">{description}</p>
          <Link href="/atmos-payment">
            <Button className="bg-orange-600 hover:bg-orange-700 text-white">
              <Crown className="w-4 h-4 mr-2" />
              Premium olish
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 rounded-full bg-orange-100">
            <Crown className="h-8 w-8 text-orange-600" />
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {showBenefits && (
            <div className="space-y-4">
              <p className="font-medium text-sm text-foreground">Premium rejada:</p>
              <div className="grid grid-cols-1 gap-3">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="p-2 bg-orange-50 rounded-lg">
                      <benefit.icon className="w-4 h-4 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{benefit.title}</p>
                      <p className="text-xs text-muted-foreground">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Link href="/atmos-payment" className="block">
              <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                <Crown className="w-4 h-4 mr-2" />
                Premium olish - 5,000 UZS/oy
              </Button>
            </Link>
            {onClose && (
              <Button variant="outline" className="w-full" onClick={onClose}>
                Yopish
              </Button>
            )}
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Har qanday vaqt bekor qilishingiz mumkin
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Modal variant (default)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-background rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="mx-auto mb-4 p-4 rounded-full bg-orange-100">
              <Crown className="h-10 w-10 text-orange-600" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>
            <p className="text-muted-foreground">{description}</p>
          </div>

          {showBenefits && (
            <div className="mb-6">
              <h3 className="font-semibold text-foreground mb-4">Premium rejada:</h3>
              <div className="grid grid-cols-1 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-4 p-3 bg-muted/30 rounded-lg">
                    <div className="p-2 bg-orange-100 rounded-lg flex-shrink-0">
                      <benefit.icon className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{benefit.title}</h4>
                      <p className="text-sm text-muted-foreground">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Link href="/atmos-payment" className="block">
              <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white text-lg py-6">
                <Crown className="w-5 h-5 mr-2" />
                Premium olish - 5,000 UZS/oy
              </Button>
            </Link>
            {onClose && (
              <Button variant="outline" className="w-full" onClick={onClose}>
                Yopish
              </Button>
            )}
          </div>

          <div className="text-center mt-4">
            <p className="text-xs text-muted-foreground">
              ✓ Har qanday vaqt bekor qilish • ✓ Darhol faollashtirish • ✓ 24/7 qo'llab-quvvatlash
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PremiumPromptLock;