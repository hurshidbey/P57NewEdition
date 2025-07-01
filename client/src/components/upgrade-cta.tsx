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
      <Card className={`bg-card border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none ${className}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary">
                {getIcon()}
              </div>
              <div>
                <CardTitle className="text-lg font-black uppercase">{title || getDefaultTitle()}</CardTitle>
                <CardDescription>
                  {description || getDefaultDescription()}
                </CardDescription>
                {reason && (
                  <p className="text-sm text-foreground mt-1 font-bold">{reason}</p>
                )}
              </div>
            </div>
            <Link href="/atmos-payment">
              <Button 
                className="bg-accent hover:bg-accent/90 text-black font-bold uppercase border-2 border-black h-[44px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
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
      <div className={`bg-card border-2 border-black p-8 max-w-md text-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] ${className}`}>
        {getIcon()}
        <h3 className="text-xl font-black uppercase text-foreground mb-2">
          {title || getDefaultTitle()}
        </h3>
        <p className="text-foreground mb-4">
          {description || getDefaultDescription()}
        </p>
        {reason && (
          <div className="bg-secondary border-2 border-black p-3 mb-6">
            <p className="text-sm text-foreground font-bold">
              {reason}
            </p>
          </div>
        )}

        {showFeatures && (
          <div className="space-y-3 mb-6">
            <p className="text-sm font-bold uppercase text-foreground">Premium rejada:</p>
            <ul className="text-sm text-foreground space-y-1">
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
              className="bg-accent hover:bg-accent/90 text-black font-bold uppercase px-6 py-3 text-sm w-full border-2 border-black h-[52px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              onClick={handleUpgradeClick}
            >
              <Crown className="w-4 h-4 mr-2" />
              Premium olish
            </Button>
          </Link>
        </div>
        <p className="text-xs text-foreground font-bold mt-3">
          5,000 UZS/oy - Har qanday vaqt bekor qilishingiz mumkin
        </p>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={`flex items-center gap-3 p-4 bg-card border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${className}`}>
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
            className="bg-accent hover:bg-accent/90 text-black font-bold uppercase border-2 border-black h-[40px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
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
    <Card className={`text-center bg-card border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none ${className}`}>
      <CardContent className="pt-6">
        {getIcon()}
        <h3 className="text-lg font-black uppercase text-foreground mb-2">
          {title || getDefaultTitle()}
        </h3>
        <p className="text-foreground mb-4">
          {description || getDefaultDescription()}
        </p>
        {reason && (
          <div className="bg-secondary border-2 border-black p-3 mb-4">
            <p className="text-sm text-foreground font-bold">
              {reason}
            </p>
          </div>
        )}

        {showFeatures && (
          <div className="space-y-2 mb-4">
            <p className="text-sm font-bold uppercase text-foreground">Premium rejada:</p>
            <ul className="text-sm text-foreground space-y-1">
              {features.map((feature, index) => (
                <li key={index}>• {feature}</li>
              ))}
            </ul>
          </div>
        )}

        <Link href="/atmos-payment">
          <Button 
            className="bg-accent hover:bg-accent/90 text-black font-bold uppercase w-full border-2 border-black h-[44px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            onClick={handleUpgradeClick}
          >
            <Crown className="w-4 h-4 mr-2" />
            Premium olish
          </Button>
        </Link>
        <p className="text-xs text-foreground font-bold mt-2">
          5,000 UZS/oy
        </p>
      </CardContent>
    </Card>
  );
}

export default UpgradeCTA;