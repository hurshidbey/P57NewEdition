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
      return 'border-muted bg-muted/50 hover:border-muted-foreground hover:shadow-md';
    }
    if (isCompleted) {
      return 'border-success hover:border-success shadow-sm';
    }
    return 'border-border hover:border-accent hover:shadow-lg';
  };

  return (
    <Card className={`bg-card border-2 transition-all duration-200 group h-full ${getCardStyles()}`}>
      <CardContent className="p-6 relative">
        {/* Lock or Progress indicator */}
        <div className="absolute top-4 right-4">
          {isLocked ? (
            <div className="flex items-center gap-1">
              <Lock className="w-5 h-5 text-muted-foreground" />
            </div>
          ) : isCompleted ? (
            <CheckCircle className="w-5 h-5 text-success" />
          ) : null}
        </div>
        
        <Link href={isLocked ? '#' : `/protocols/${protocol.id}`} className={`block ${isLocked ? 'pointer-events-none' : ''}`}>
          {/* Protocol Number */}
          <div className="mb-4">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-black text-lg shadow-sm ${
              isLocked
                ? 'bg-muted text-muted-foreground'
                : isCompleted 
                ? 'bg-success/20 text-success' 
                : 'bg-accent text-accent-foreground'
            }`}>
              {protocol.number.toString().padStart(2, '0')}
            </div>
          </div>
          
          {/* Difficulty Level Badge */}
          {protocol.difficultyLevel && (
            <div className="mb-2">
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                protocol.difficultyLevel === 'BEGINNER' 
                  ? 'bg-success/20 text-success'
                  : protocol.difficultyLevel === 'O\'RTA DARAJA'
                  ? 'bg-warning/20 text-warning'
                  : 'bg-destructive/20 text-destructive'
              }`}>
                {protocol.difficultyLevel === 'BEGINNER' ? 'Boshlang\'ich' : 
                 protocol.difficultyLevel === 'O\'RTA DARAJA' ? 'O\'rta daraja' : 'Yuqori daraja'}
              </span>
            </div>
          )}
          
          {/* Title - Hide for free users to prevent revealing protocol content */}
          <h3 className={`text-lg font-bold mb-3 leading-tight pr-6 line-height-[1.4] ${
            isLocked ? 'text-muted-foreground' : 'text-foreground'
          }`}>
            {isLocked ? 'Premium Protokol' : protocol.title}
          </h3>
          
          {/* Problem Statement - Hide content for free users */}
          <p className={`leading-relaxed line-clamp-3 mb-4 text-sm line-height-[1.5] ${
            isLocked ? 'text-muted-foreground/60' : 'text-muted-foreground'
          }`}>
            {isLocked ? 'Bu protokol Premium foydalanuvchilar uchun mo\'ljallangan. Barcha 57 protokolga kirish uchun Premium obuna oling.' : (protocol.problemStatement || protocol.description)}
          </p>
        </Link>
        
        {/* Action buttons - Fixed layout and spacing */}
        <div className="flex flex-col gap-2 pt-2">
          {isLocked ? (
            <>
              <Link href="/atmos-payment" className="w-full">
                <Button 
                  size="sm"
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground px-4 py-3 min-h-[44px] text-sm font-medium touch-manipulation"
                  onClick={handleUpgradeClick}
                >
                  <Crown className="w-3 h-3 mr-1" />
                  Premium olish
                </Button>
              </Link>
              <div className="flex items-center justify-center gap-1 py-1 text-xs text-muted-foreground">
                <Lock className="w-3 h-3" />
                <span>Premium protokol</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex gap-2">
                {!isCompleted ? (
                  <Button 
                    onClick={handleMarkCompleted}
                    size="sm"
                    className="flex-1 bg-success hover:bg-success/90 text-success-foreground px-3 py-3 min-h-[44px] text-sm font-medium touch-manipulation"
                  >
                    O'rgandim
                  </Button>
                ) : (
                  <Button 
                    onClick={handleMarkCompleted}
                    size="sm"
                    variant="outline"
                    className="flex-1 border-success text-success hover:bg-success/20 px-3 py-3 min-h-[44px] text-sm font-medium touch-manipulation"
                  >
                    Qayta mashq
                  </Button>
                )}
                
                <Link href={`/protocols/${protocol.id}`} className="flex-1">
                  <Button size="sm" variant="outline" className="w-full px-3 py-3 min-h-[44px] text-sm font-medium touch-manipulation">
                    Ko'rish
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
        
      </CardContent>
    </Card>
  );
}
