import { useProgress } from "@/hooks/use-progress";
import { useUserTier } from "@/hooks/use-user-tier";
import { useProtocolEvaluation } from "@/hooks/use-protocol-evaluation";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, BookOpen, CheckCircle2, Crown, Lock, ArrowRight, Zap } from "lucide-react";
import { Link } from "wouter";

interface ProgressDashboardProps {
  totalProtocols: number;
}

export default function ProgressDashboard({ totalProtocols }: ProgressDashboardProps) {
  const { getProgressData } = useProgress();
  const { tier, getTierStatus, getAccessedProtocolsCount } = useUserTier();
  const { completionPercentage, completedProtocols } = getProgressData(totalProtocols);
  const completedCount = completedProtocols.size;
  const accessedCount = getAccessedProtocolsCount();
  const tierStatus = getTierStatus();
  
  // Calculate tier-specific progress
  const availableProtocols = tier === 'free' ? 3 : totalProtocols;
  const tierCompletionPercentage = tier === 'free' 
    ? Math.round((Math.min(completedCount, 3) / 3) * 100)
    : completionPercentage;

  const getMotivationalMessage = () => {
    if (tier === 'free') {
      if (completedCount === 0) {
        return "Bepul protokollarni o'rganishni boshlang!";
      } else if (completedCount < 3) {
        return `Ajoyib! ${3 - completedCount} ta bepul protokol qoldi`;
      } else {
        return "Bepul protokollarni tugatdingiz! Premium uchun obuna bo'ling";
      }
    } else {
      if (completionPercentage === 0) {
        return "Birinchi protokolni o'rganishni boshlang!";
      } else if (completionPercentage < 25) {
        return "Ajoyib boshladingiz! Davom eting";
      } else if (completionPercentage < 50) {
        return "Zo'r! Yarim yo'lni bosib o'tdingiz";
      } else if (completionPercentage < 75) {
        return "Mukammal! Ko'p narsani o'rgandingiz";
      } else if (completionPercentage < 100) {
        return "Deyarli tamom! Oxirigacha davom eting";
      } else {
        return "Tabriklaymiz! Barcha protokollarni o'rgandingiz!";
      }
    }
  };

  return (
    <Card className="border-theme bg-card shadow-sm dark:bg-card">
      <CardContent className="p-8">
        {/* Header Section - 8pt Grid Spacing */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-accent/10 rounded-none">
              {tierCompletionPercentage === 100 ? (
                <Trophy className="h-6 w-6 text-accent" />
              ) : (
                <BookOpen className="h-6 w-6 text-accent" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-xl leading-tight">O'rganish Jarayoni</h3>
                <Badge className={`${tierStatus.color} text-xs`}>
                  {tier === 'paid' ? (
                    <><Crown className="w-3 h-3 mr-1" /> {tierStatus.displayName}</>
                  ) : (
                    <>{tierStatus.displayName}</>
                  )}
                </Badge>
              </div>
              <p className="text-base text-muted-foreground leading-relaxed">
                {tier === 'free' 
                  ? `${Math.min(completedCount, 3)} / 3 bepul protokol o'rganildi`
                  : `${completedCount} / ${totalProtocols} protokol o'rganildi`
                }
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center gap-2 text-base text-muted-foreground">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">{tierCompletionPercentage}%</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">bajarildi</p>
          </div>
        </div>

        {/* Progress Section - 8pt Grid Spacing */}
        <div className="space-y-4">
          <Progress 
            value={tierCompletionPercentage} 
            className="h-4" 
          />
          <div className="flex items-center justify-between">
            <p className="text-base text-muted-foreground font-medium leading-relaxed">
              {getMotivationalMessage()}
            </p>
            {tier === 'free' && completedCount >= 3 && (
              <Link href="/atmos-payment">
                <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  <Crown className="w-3 h-3 mr-1" />
                  Premium olish
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            )}
          </div>
          
          {/* Usage indicators for free users */}
          {tier === 'free' && (
            <div className="space-y-3 mt-4">
              {/* Protocol access indicator */}
              <div className="bg-blue-50 border border-blue-200 rounded-none p-3 dark:bg-blue-900/20 dark:border-blue-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      Protokol kirishi
                    </span>
                  </div>
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    {accessedCount}/3
                  </span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2 dark:bg-blue-800">
                  <div 
                    className="bg-blue-600 h-2 rounded-full dark:bg-blue-400" 
                    style={{ width: `${Math.min((accessedCount / 3) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Premium protocols info */}
              <div className="bg-orange-50 border border-orange-200 rounded-none p-3 dark:bg-orange-900/20 dark:border-orange-800">
                <div className="flex items-start gap-2">
                  <Crown className="w-4 h-4 text-orange-600 mt-0.5 dark:text-orange-400" />
                  <div className="text-sm">
                    <p className="font-medium text-orange-800 dark:text-orange-200 mb-1">
                      {54} ta qo'shimcha protokol Premium rejimda
                    </p>
                    <p className="text-orange-700 dark:text-orange-300">
                      Barcha protokollar + har birini 5 marta baholash uchun Premium oling
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}