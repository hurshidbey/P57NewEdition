import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, ArrowRight, Lock, Zap } from 'lucide-react';
import { Link } from 'wouter';
import { trackTierSystemEvent } from '@/utils/analytics';

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
  
  // Track when upgrade CTA is shown
  React.useEffect(() => {
    const context = variant === 'modal' ? 'protocol_detail' : 
                   variant === 'banner' ? 'banner' : 'evaluation_limit';
    trackTierSystemEvent.upgradePromptShown(context as any);
  }, [variant]);

  const handleUpgradeClick = () => {
    const context = `upgrade_cta_${variant}`;
    trackTierSystemEvent.upgradePromptClicked(context);
  };
  
  const features = [
    'Barcha 57 protokolga kirish',
    'Har protokolni 5 marta baholash',
    'Premium promptlar',
    'Progress tracking'
  ];

  const getIcon = () => {
    switch (variant) {
      case 'modal':
        return <Lock className="w-16 h-16 text-foreground mx-auto mb-4" />;
      case 'banner':
        return <Crown className="w-6 h-6 text-accent" />;
      default:
        return <Crown className="w-8 h-8 text-accent mx-auto mb-3" />;
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
      <Card className={`bg-card border-2 border-theme shadow-brutal rounded-none ${className}`}>
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3">
              <div className="p-2 sm:p-3 bg-primary flex-shrink-0">
                {getIcon()}
              </div>
              <div className="flex-1">
                <CardTitle className="text-base sm:text-lg font-black uppercase">{title || getDefaultTitle()}</CardTitle>
                <CardDescription className="text-sm mt-1">
                  {description || getDefaultDescription()}
                </CardDescription>
                {reason && (
                  <p className="text-xs sm:text-sm text-foreground mt-1 font-bold">{reason}</p>
                )}
              </div>
            </div>
            <Link href="/atmos-payment" className="w-full sm:w-auto">
              <Button 
                className="bg-accent hover:bg-accent/90 text-black font-bold uppercase border-2 border-theme h-[44px] hover:shadow-brutal-sm w-full sm:w-auto text-sm"
                onClick={handleUpgradeClick}
              >
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
      <div className={`bg-card border-2 border-theme p-6 sm:p-8 max-w-md text-center shadow-brutal-lg ${className}`}>
        {getIcon()}
        <h3 className="text-lg sm:text-xl font-black uppercase text-foreground mb-2">
          {title || getDefaultTitle()}
        </h3>
        <p className="text-sm sm:text-base text-foreground mb-4">
          {description || getDefaultDescription()}
        </p>
        {reason && (
          <div className="bg-secondary border-2 border-theme p-2 sm:p-3 mb-4 sm:mb-6">
            <p className="text-xs sm:text-sm text-foreground font-bold">
              {reason}
            </p>
          </div>
        )}

        {showFeatures && (
          <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
            <p className="text-xs sm:text-sm font-bold uppercase text-foreground">Premium rejada:</p>
            <ul className="text-xs sm:text-sm text-foreground space-y-1 text-left">
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
              className="bg-accent hover:bg-accent/90 text-black font-bold uppercase px-4 sm:px-6 py-2 sm:py-3 text-sm w-full border-2 border-theme h-[44px] sm:h-[48px] hover:shadow-brutal-sm"
              onClick={handleUpgradeClick}
            >
              <Crown className="w-4 h-4 mr-2" />
              Premium olish
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={`flex items-center gap-3 p-4 bg-card border-2 border-theme shadow-brutal-sm ${className}`}>
        <Crown className="w-5 h-5 text-accent flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-bold uppercase text-foreground">
            {title || 'Premium funksiya'}
          </p>
          {(description || reason) && (
            <p className="text-xs text-foreground">
              {description || reason}
            </p>
          )}
        </div>
        <Link href="/atmos-payment">
          <Button 
            size="sm" 
            className="bg-accent hover:bg-accent/90 text-black font-bold uppercase border-2 border-theme h-[40px] hover:shadow-brutal-sm"
            onClick={handleUpgradeClick}
          >
            Upgrade
          </Button>
        </Link>
      </div>
    );
  }

  // Default card variant
  return (
    <Card className={`text-center bg-card border-2 border-theme shadow-brutal rounded-none ${className}`}>
      <CardContent className="p-4 sm:p-6">
        {getIcon()}
        <h3 className="text-base sm:text-lg font-black uppercase text-foreground mb-2">
          {title || getDefaultTitle()}
        </h3>
        <p className="text-sm sm:text-base text-foreground mb-4">
          {description || getDefaultDescription()}
        </p>
        {reason && (
          <div className="bg-secondary border-2 border-theme p-2 sm:p-3 mb-4">
            <p className="text-xs sm:text-sm text-foreground font-bold">
              {reason}
            </p>
          </div>
        )}

        {showFeatures && (
          <div className="space-y-2 mb-4">
            <p className="text-xs sm:text-sm font-bold uppercase text-foreground">Premium rejada:</p>
            <ul className="text-xs sm:text-sm text-foreground space-y-1 text-left">
              {features.map((feature, index) => (
                <li key={index}>• {feature}</li>
              ))}
            </ul>
          </div>
        )}

        <Link href="/atmos-payment">
          <Button 
            className="bg-accent hover:bg-accent/90 text-black font-bold uppercase w-full border-2 border-theme h-[44px] hover:shadow-brutal-sm text-sm"
            onClick={handleUpgradeClick}
          >
            <Crown className="w-4 h-4 mr-2" />
            Premium olish
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

export default UpgradeCTA;