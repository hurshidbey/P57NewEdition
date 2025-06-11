import { useProgress } from "@/hooks/use-progress";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, BookOpen, CheckCircle2 } from "lucide-react";

interface ProgressDashboardProps {
  totalProtocols: number;
}

export default function ProgressDashboard({ totalProtocols }: ProgressDashboardProps) {
  const { getProgressData } = useProgress();
  const { completionPercentage, completedProtocols } = getProgressData(totalProtocols);
  const completedCount = completedProtocols.size;

  const getMotivationalMessage = () => {
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
  };

  return (
    <Card className="border-border bg-card shadow-sm dark:bg-card">
      <CardContent className="p-8">
        {/* Header Section - 8pt Grid Spacing */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-accent/10 rounded-xl">
              {completionPercentage === 100 ? (
                <Trophy className="h-6 w-6 text-accent" />
              ) : (
                <BookOpen className="h-6 w-6 text-accent" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-xl leading-tight">O'rganish Jarayoni</h3>
              <p className="text-base text-muted-foreground mt-1 leading-relaxed">
                {completedCount} / {totalProtocols} protokol o'rganildi
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center gap-2 text-base text-muted-foreground">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">{completionPercentage}%</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">bajarildi</p>
          </div>
        </div>

        {/* Progress Section - 8pt Grid Spacing */}
        <div className="space-y-4">
          <Progress 
            value={completionPercentage} 
            className="h-4" 
          />
          <p className="text-base text-center text-muted-foreground font-medium leading-relaxed">
            {getMotivationalMessage()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}