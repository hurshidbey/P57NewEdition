import React from "react";
import { Protocol } from "@shared/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Lock, ArrowRight, Crown } from "lucide-react";
import { Link } from "wouter";
import { useProgress } from "@/hooks/use-progress";
import { useProtocolAccess, useUserTier } from "@/hooks/use-user-tier";
import { trackTierSystemEvent } from "@/utils/analytics";

interface ProtocolCardProps {
  protocol: Protocol;
}

export default function ProtocolCard({ protocol }: ProtocolCardProps) {
  const { isProtocolCompleted, getProtocolProgress, markProtocolCompleted, toggleProtocolCompleted } = useProgress();
  const { canAccess, isLocked, requiresUpgrade } = useProtocolAccess(protocol.id, protocol.isFreeAccess);
  const { tier } = useUserTier();
  const isCompleted = isProtocolCompleted(protocol.id);
  const progress = getProtocolProgress(protocol.id);

  // Track protocol access attempt
  React.useEffect(() => {
    if (isLocked) {
      const reason = !protocol.isFreeAccess ? 'premium_only' : 'limit_reached';
      trackTierSystemEvent.protocolBlocked(protocol.id, reason);
    } else {
      trackTierSystemEvent.protocolAccess(protocol.id, tier, true);
    }
  }, [protocol.id, isLocked, protocol.isFreeAccess, tier]);

  const handleToggleCompleted = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleProtocolCompleted(protocol.id, 70);
  };

  const handleUpgradeClick = () => {
    trackTierSystemEvent.upgradePromptClicked('protocol_card');
  };

  // Track upgrade prompt shown when locked protocol is displayed
  React.useEffect(() => {
    if (isLocked) {
      trackTierSystemEvent.upgradePromptShown('protocol_card');
    }
  }, [isLocked]);
  
  const getCardStyles = () => {
    if (isLocked) {
      return 'opacity-50';
    }
    return '';
  };

  return (
    <Card className={`relative bg-card border-2 border-theme transition-all duration-200 group h-full min-h-[320px] hover:shadow-brutal rounded-none flex flex-col ${getCardStyles()}`}>
      <CardContent className="!p-5 flex flex-col h-full relative">
        {/* Content wrapper with flex-grow to push buttons down */}
        <div className="flex-grow flex flex-col">
          {/* Lock or Checkmark Toggle */}
          <div className="absolute top-5 right-5 z-10">
          {isLocked ? (
            <div className="flex items-center gap-1">
              <Lock className="w-5 h-5 text-muted-foreground" />
            </div>
          ) : (
            <button
              onClick={handleToggleCompleted}
              className={`w-12 h-12 border-2 border-theme transition-all hover:shadow-brutal flex items-center justify-center ${
                isCompleted 
                  ? 'bg-accent text-black' 
                  : 'bg-white text-black hover:bg-gray-100'
              }`}
              style={{ backgroundColor: isCompleted ? '#1bffbb' : '#ffffff' }}
            >
              {isCompleted ? (
                <CheckCircle className="w-8 h-8 text-black" />
              ) : (
                <div className="w-6 h-6 border-2 border-theme bg-background"></div>
              )}
            </button>
          )}
          </div>
          
          <Link href={isLocked ? '#' : `/protocols/${protocol.id}`} className={`block h-full flex flex-col ${isLocked ? 'pointer-events-none' : ''}`}>
            {/* Protocol Number */}
            <div className="mb-3">
            <div className={`w-14 h-14 flex items-center justify-center font-black text-xl border-2 ${
              isLocked
                ? 'bg-muted text-muted-foreground border-theme'
                : isCompleted 
                ? 'bg-accent text-black border-theme' 
                : 'bg-background text-foreground border-theme'
            }`}>
              {protocol.number.toString().padStart(2, '0')}
            </div>
            </div>
            
            {/* Difficulty Level Badge */}
            <div className="mb-3 h-7">
              {protocol.difficultyLevel && (
                <span className={`inline-block px-3 py-1 text-xs font-bold uppercase border-2 ${
                  protocol.difficultyLevel === 'BEGINNER' 
                    ? 'bg-accent text-black border-theme'
                    : protocol.difficultyLevel === 'O\'RTA DARAJA'
                    ? 'bg-background text-foreground border-theme'
                    : 'bg-primary text-primary-foreground border-theme'
                }`}>
                  {protocol.difficultyLevel === 'BEGINNER' ? 'Boshlang\'ich' : 
                   protocol.difficultyLevel === 'O\'RTA DARAJA' ? 'O\'rta daraja' : 'Yuqori daraja'}
                </span>
              )}
            </div>
          
            {/* Content area with consistent height */}
            <div className="flex-grow">
              {/* Title - Hide for free users to prevent revealing protocol content */}
              <h3 className={`text-lg font-bold mb-2 leading-tight pr-8 ${
                isLocked ? 'text-muted-foreground' : 'text-foreground'
              }`}>
                {isLocked ? 'Premium Protokol' : protocol.title}
              </h3>
              
              {/* Problem Statement - Hide content for free users */}
              <p className={`leading-relaxed line-clamp-3 text-sm ${
                isLocked ? 'text-muted-foreground/60' : 'text-muted-foreground'
              }`}>
                {isLocked ? 'Bu protokol Premium foydalanuvchilar uchun mo\'ljallangan. Barcha 57 protokolga kirish uchun Premium obuna oling.' : (protocol.problemStatement || protocol.description)}
              </p>
            </div>
          </Link>
        </div>
        
        {/* Action buttons - Always at bottom with consistent spacing */}
        <div className="flex flex-col gap-2 mt-4">
          {isLocked ? (
            <div className="grid grid-cols-1 gap-2">
              <Link href="/atmos-payment" className="w-full">
                <Button 
                  size="sm"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground border-2 border-theme px-4 py-2 h-[44px] text-sm font-bold uppercase touch-manipulation hover:shadow-brutal-sm"
                  onClick={handleUpgradeClick}
                >
                  <Crown className="w-3 h-3 mr-1" />
                  Premium olish
                </Button>
              </Link>
              <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                <Lock className="w-3 h-3" />
                <span>Premium protokol</span>
              </div>
            </div>
          ) : (
            <Link href={`/protocols/${protocol.id}`}>
              <Button size="sm" variant="outline" className="w-full px-3 py-2 h-[44px] text-sm font-bold uppercase border-2 border-theme hover:bg-primary hover:text-primary-foreground touch-manipulation hover:shadow-brutal-sm">
                Ko'rish
              </Button>
            </Link>
          )}
        </div>
        
      </CardContent>
    </Card>
  );
}
