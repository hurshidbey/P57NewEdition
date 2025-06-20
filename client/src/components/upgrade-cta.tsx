import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, ArrowRight, Lock, Zap } from 'lucide-react';
import { Link } from 'wouter';

interface UpgradeCTAProps {
  variant?: 'banner' | 'modal' | 'card' | 'inline';
  title?: string;
  description?: string;
  reason?: string;
  showFeatures?: boolean;
  className?: string;
}

export function UpgradeCTA({ 
  variant = 'card', 
  title, 
  description, 
  reason,
  showFeatures = true,
  className = ''
}: UpgradeCTAProps) {
  
  const features = [
    'Barcha 57 protokolga kirish',
    'Har protokolni 5 marta baholash',
    'Premium promptlar',
    'Progress tracking'
  ];

  const getIcon = () => {
    switch (variant) {
      case 'modal':
        return <Lock className="w-16 h-16 text-orange-500 mx-auto mb-4" />;
      case 'banner':
        return <Crown className="w-6 h-6 text-orange-600" />;
      default:
        return <Crown className="w-8 h-8 text-orange-500 mx-auto mb-3" />;
    }
  };

  const getDefaultTitle = () => {
    switch (variant) {
      case 'banner':
        return 'Premium Protokollarga kirish';
      case 'modal':
        return 'Premium kerak';
      default:
        return 'Premium obuna oling';
    }
  };

  const getDefaultDescription = () => {
    switch (variant) {
      case 'banner':
        return 'Barcha protokollar va premium funksiyalar bilan ishlash samaradorligingizni oshiring';
      case 'modal':
        return 'Bu funksiya Premium foydalanuvchilar uchun mavjud';
      default:
        return 'Barcha protokollar va premium funksiyalarga kirish oling';
    }
  };

  if (variant === 'banner') {
    return (
      <Card className={`bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200 ${className}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 rounded-full">
                {getIcon()}
              </div>
              <div>
                <CardTitle className="text-lg">{title || getDefaultTitle()}</CardTitle>
                <CardDescription>
                  {description || getDefaultDescription()}
                </CardDescription>
                {reason && (
                  <p className="text-sm text-orange-700 mt-1 font-medium">{reason}</p>
                )}
              </div>
            </div>
            <Link href="/atmos-payment">
              <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                Premium olish
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardHeader>
      </Card>
    );
  }

  if (variant === 'modal') {
    return (
      <div className={`bg-white dark:bg-gray-900 rounded-xl p-8 max-w-md text-center shadow-xl ${className}`}>
        {getIcon()}
        <h3 className="text-xl font-bold text-foreground mb-2">
          {title || getDefaultTitle()}
        </h3>
        <p className="text-muted-foreground mb-4">
          {description || getDefaultDescription()}
        </p>
        {reason && (
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 mb-6">
            <p className="text-sm text-orange-800 dark:text-orange-400 font-medium">
              {reason}
            </p>
          </div>
        )}

        {showFeatures && (
          <div className="space-y-3 mb-6">
            <p className="text-sm font-medium text-foreground">Premium rejada:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              {features.map((feature, index) => (
                <li key={index}>• {feature}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex gap-2">
          <Link href="/atmos-payment" className="flex-1">
            <Button 
              size="lg"
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 text-sm font-semibold w-full"
            >
              <Crown className="w-4 h-4 mr-2" />
              Premium olish
            </Button>
          </Link>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          5,000 UZS/oy - Har qanday vaqt bekor qilishingiz mumkin
        </p>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={`flex items-center gap-3 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800 ${className}`}>
        <Crown className="w-5 h-5 text-orange-600 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
            {title || 'Premium funksiya'}
          </p>
          {(description || reason) && (
            <p className="text-xs text-orange-700 dark:text-orange-300">
              {description || reason}
            </p>
          )}
        </div>
        <Link href="/atmos-payment">
          <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white">
            Upgrade
          </Button>
        </Link>
      </div>
    );
  }

  // Default card variant
  return (
    <Card className={`text-center ${className}`}>
      <CardContent className="pt-6">
        {getIcon()}
        <h3 className="text-lg font-bold text-foreground mb-2">
          {title || getDefaultTitle()}
        </h3>
        <p className="text-muted-foreground mb-4">
          {description || getDefaultDescription()}
        </p>
        {reason && (
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 mb-4">
            <p className="text-sm text-orange-800 dark:text-orange-400 font-medium">
              {reason}
            </p>
          </div>
        )}

        {showFeatures && (
          <div className="space-y-2 mb-4">
            <p className="text-sm font-medium text-foreground">Premium rejada:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              {features.map((feature, index) => (
                <li key={index}>• {feature}</li>
              ))}
            </ul>
          </div>
        )}

        <Link href="/atmos-payment">
          <Button className="bg-orange-600 hover:bg-orange-700 text-white w-full">
            <Crown className="w-4 h-4 mr-2" />
            Premium olish
          </Button>
        </Link>
        <p className="text-xs text-muted-foreground mt-2">
          5,000 UZS/oy
        </p>
      </CardContent>
    </Card>
  );
}

export default UpgradeCTA;