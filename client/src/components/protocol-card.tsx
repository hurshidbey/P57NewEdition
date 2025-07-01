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
  const { isProtocolCompleted, getProtocolProgress, markProtocolCompleted } = useProgress();
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

  const handleMarkCompleted = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    markProtocolCompleted(protocol.id, 70);
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
    <Card className={`bg-white border-2 border-black transition-all duration-200 group h-full min-h-[320px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none flex flex-col ${getCardStyles()}`}>
      <CardContent className="!p-5 flex flex-col h-full">
        {/* Content wrapper with flex-grow to push buttons down */}
        <div className="flex-grow flex flex-col">
          {/* Lock or Progress indicator */}
          <div className="absolute top-5 right-5">
          {isLocked ? (
            <div className="flex items-center gap-1">
              <Lock className="w-5 h-5 text-muted-foreground" />
            </div>
          ) : isCompleted ? (
            <CheckCircle className="w-5 h-5 text-black" />
          ) : null}
          </div>
          
          <Link href={isLocked ? '#' : `/protocols/${protocol.id}`} className={`block h-full flex flex-col ${isLocked ? 'pointer-events-none' : ''}`}>
            {/* Protocol Number */}
            <div className="mb-3">
            <div className={`w-14 h-14 flex items-center justify-center font-black text-xl border-2 ${
              isLocked
                ? 'bg-gray-100 text-gray-400 border-gray-400'
                : isCompleted 
                ? 'bg-[#1bffbb] text-black border-black' 
                : 'bg-white text-black border-black'
            }`}>
              {protocol.number.toString().padStart(2, '0')}
            </div>
            </div>
            
            {/* Difficulty Level Badge */}
            <div className="mb-3 h-7">
              {protocol.difficultyLevel && (
                <span className={`inline-block px-3 py-1 text-xs font-bold uppercase border-2 ${
                  protocol.difficultyLevel === 'BEGINNER' 
                    ? 'bg-[#1bffbb] text-black border-black'
                    : protocol.difficultyLevel === 'O\'RTA DARAJA'
                    ? 'bg-white text-black border-black'
                    : 'bg-black text-white border-black'
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
                  className="w-full bg-black hover:bg-gray-900 text-white border-2 border-black px-4 py-2 h-[44px] text-sm font-bold uppercase touch-manipulation hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
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
            <div className="grid grid-cols-2 gap-2">
                {!isCompleted ? (
                  <Button 
                    onClick={handleMarkCompleted}
                    size="sm"
                    className="w-full bg-[#1bffbb] hover:bg-[#00e6a0] text-black border-2 border-black px-3 py-2 h-[44px] text-sm font-bold uppercase touch-manipulation hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  >
                    O'rgandim
                  </Button>
                ) : (
                  <Button 
                    disabled
                    size="sm"
                    variant="outline"
                    className="w-full border-2 border-black text-black bg-gray-100 px-3 py-2 h-[44px] text-sm font-bold uppercase cursor-default"
                  >
                    O'rganilgan
                  </Button>
                )}
                
                <Link href={`/protocols/${protocol.id}`}>
                  <Button size="sm" variant="outline" className="w-full px-3 py-2 h-[44px] text-sm font-bold uppercase border-2 border-black hover:bg-black hover:text-white touch-manipulation hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    Ko'rish
                  </Button>
                </Link>
            </div>
          )}
        </div>
        
      </CardContent>
    </Card>
  );
}
