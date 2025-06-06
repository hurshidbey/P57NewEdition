import { useProgress } from "@/hooks/use-progress";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, BookOpen, CheckCircle2, Flame, Target } from "lucide-react";

interface ProgressDashboardProps {
  totalProtocols: number;
}

export default function ProgressDashboard({ totalProtocols }: ProgressDashboardProps) {
  const { getProgressData } = useProgress();
  const { completionPercentage, completedProtocols, currentStreak, lastStudiedDate } = getProgressData(totalProtocols);
  const completedCount = completedProtocols.size;

  const getMotivationalMessage = () => {
    if (completionPercentage === 0) {
      return "Birinchi protokolni o'rganishni boshlang! 🚀";
    } else if (completionPercentage < 25) {
      return "Ajoyib boshladingiz! Davom eting 💪";
    } else if (completionPercentage < 50) {
      return "Zo'r! Yarim yo'lni bosib o'tdingiz 🎯";
    } else if (completionPercentage < 75) {
      return "Mukammal! Ko'p narsani o'rgandingiz 🌟";
    } else if (completionPercentage < 100) {
      return "Deyarli tamom! Oxirigacha davom eting 🏆";
    } else {
      return "Tabriklaymiz! Barcha protokollarni o'rgandingiz! 🎉";
    }
  };

  const getProgressColor = () => {
    if (completionPercentage < 25) return "bg-red-500";
    if (completionPercentage < 50) return "bg-yellow-500";
    if (completionPercentage < 75) return "bg-blue-500";
    return "bg-green-500";
  };

  return (
    <div className="space-y-4 mb-6">
      {/* Main Progress Card */}
      <Card className="border-accent/20 bg-gradient-to-r from-slate-50 to-gray-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-accent/10 rounded-lg">
                {completionPercentage === 100 ? (
                  <Trophy className="h-4 w-4 text-accent" />
                ) : (
                  <BookOpen className="h-4 w-4 text-accent" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-sm">O'rganish Jarayoni</h3>
                <p className="text-xs text-muted-foreground">
                  {completedCount} / {totalProtocols} protokol o'rganildi
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                <CheckCircle2 className="h-3 w-3" />
                {completionPercentage}% bajarildi
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Progress 
              value={completionPercentage} 
              className="h-2" 
            />
            <p className="text-xs text-center text-muted-foreground font-medium">
              {getMotivationalMessage()}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Streak Card */}
        <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-white">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Kunlik ketma-ketlik</p>
                <p className="text-xl font-bold text-orange-600">{currentStreak}</p>
              </div>
              <Flame className={`h-5 w-5 ${currentStreak > 0 ? 'text-orange-500' : 'text-gray-300'}`} />
            </div>
          </CardContent>
        </Card>

        {/* Next Goal Card */}
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Keyingi maqsad</p>
                <p className="text-xl font-bold text-blue-600">
                  {completedCount < totalProtocols ? completedCount + 1 : "✓"}
                </p>
              </div>
              <Target className="h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}