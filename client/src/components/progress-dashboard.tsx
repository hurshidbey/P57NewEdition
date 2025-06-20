import { useProgress } from "@/hooks/use-progress";
import { useUserTier } from "@/hooks/use-user-tier";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, BookOpen, CheckCircle2, Crown, Lock, ArrowRight } from "lucide-react";
import { Link } from "wouter";

interface ProgressDashboardProps {
  totalProtocols: number;
}

export default function ProgressDashboard({ totalProtocols }: ProgressDashboardProps) {
  const { getProgressData } = useProgress();
  const { tier, getTierStatus } = useUserTier();
  const { completionPercentage, completedProtocols } = getProgressData(totalProtocols);
  const completedCount = completedProtocols.size;
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
    <Card className="border-border bg-card shadow-sm dark:bg-card">
      <CardContent className="p-8">
        {/* Header Section - 8pt Grid Spacing */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-accent/10 rounded-xl">
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
          
          {tier === 'free' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4 dark:bg-blue-900/20 dark:border-blue-800">
              <div className="flex items-start gap-2">
                <Lock className="w-4 h-4 text-blue-600 mt-0.5 dark:text-blue-400" />
                <div className="text-sm">
                  <p className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                    {54} ta qo'shimcha protokol Premium rejimda
                  </p>
                  <p className="text-blue-700 dark:text-blue-300">
                    Barcha 57 protokolga kirish uchun Premium obunani oling
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}