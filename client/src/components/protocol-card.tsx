import { Protocol } from "@shared/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Lock, ArrowRight, Crown } from "lucide-react";
import { Link } from "wouter";
import { useProgress } from "@/hooks/use-progress";
import { useProtocolAccess } from "@/hooks/use-user-tier";

interface ProtocolCardProps {
  protocol: Protocol;
}

export default function ProtocolCard({ protocol }: ProtocolCardProps) {
  const { isProtocolCompleted, getProtocolProgress, markProtocolCompleted } = useProgress();
  const { canAccess, isLocked, requiresUpgrade } = useProtocolAccess(protocol.id, protocol.isFreeAccess);
  const isCompleted = isProtocolCompleted(protocol.id);
  const progress = getProtocolProgress(protocol.id);

  const handleMarkCompleted = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    markProtocolCompleted(protocol.id, 70);
  };
  
  const getCardStyles = () => {
    if (isLocked) {
      return 'border-gray-300 bg-gray-50/50 hover:border-gray-400 hover:shadow-md dark:border-gray-600 dark:bg-gray-800/30';
    }
    if (isCompleted) {
      return 'border-green-400 hover:border-green-500 shadow-sm dark:border-green-500/50 dark:hover:border-green-400';
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
              <Lock className="w-5 h-5 text-gray-500" />
            </div>
          ) : isCompleted ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : null}
        </div>
        
        <Link href={isLocked ? '#' : `/protocols/${protocol.id}`} className={`block ${isLocked ? 'pointer-events-none' : ''}`}>
          {/* Protocol Number */}
          <div className="mb-4">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-black text-lg shadow-sm ${
              isLocked
                ? 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                : isCompleted 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' 
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
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                  : protocol.difficultyLevel === 'O\'RTA DARAJA'
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
              }`}>
                {protocol.difficultyLevel === 'BEGINNER' ? 'Boshlang\'ich' : 
                 protocol.difficultyLevel === 'O\'RTA DARAJA' ? 'O\'rta daraja' : 'Yuqori daraja'}
              </span>
            </div>
          )}
          
          {/* Title - Hide for free users to prevent revealing protocol content */}
          <h3 className={`text-lg font-bold mb-3 leading-tight pr-6 line-height-[1.4] ${
            isLocked ? 'text-gray-500 dark:text-gray-400' : 'text-foreground'
          }`}>
            {isLocked ? 'Premium Protokol' : protocol.title}
          </h3>
          
          {/* Problem Statement - Hide content for free users */}
          <p className={`leading-relaxed line-clamp-3 mb-4 text-sm line-height-[1.5] ${
            isLocked ? 'text-gray-400 dark:text-gray-500' : 'text-muted-foreground'
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
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 h-8 text-xs font-medium"
                >
                  <Crown className="w-3 h-3 mr-1" />
                  Premium olish
                </Button>
              </Link>
              <div className="flex items-center justify-center gap-1 py-1 text-xs text-gray-500">
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
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 h-8 text-xs font-medium"
                  >
                    O'rgandim
                  </Button>
                ) : (
                  <Button 
                    onClick={handleMarkCompleted}
                    size="sm"
                    variant="outline"
                    className="flex-1 border-green-600 text-green-600 hover:bg-green-50 dark:border-green-500 dark:text-green-400 dark:hover:bg-green-900/20 px-3 py-2 h-8 text-xs font-medium"
                  >
                    Qayta mashq
                  </Button>
                )}
                
                <Link href={`/protocols/${protocol.id}`} className="flex-1">
                  <Button size="sm" variant="outline" className="w-full px-3 py-2 h-8 text-xs font-medium">
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
