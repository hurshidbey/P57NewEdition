import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Protocol } from "@shared/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Lightbulb, RefreshCw, Send, AlertTriangle, Crown, Lock } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useProtocolEvaluation } from "@/hooks/use-protocol-evaluation";
import { useProgress } from "@/hooks/use-progress";
import { useUserTier } from "@/hooks/use-user-tier";
import { useConfetti } from "@/hooks/use-confetti";
import { Link } from "wouter";

interface PromptEvaluation {
  score: number;
  strengths: string[];
  improvements: string[];
  rewrittenPrompt: string;
  explanation: string;
}

interface PromptPracticeProps {
  protocol: Protocol;
}

export default function PromptPractice({ protocol }: PromptPracticeProps) {
  const [userPrompt, setUserPrompt] = useState("");
  const [evaluation, setEvaluation] = useState<PromptEvaluation | null>(null);
  const { toast } = useToast();
  const { evaluationCount, evaluationLimit, canEvaluate, getRemainingEvaluations, getUsagePercentage, incrementEvaluation, tier } = useProtocolEvaluation(protocol.id);
  const { markProtocolCompleted, getProtocolProgress } = useProgress();
  const protocolProgress = getProtocolProgress(protocol.id);
  const { trigger: triggerConfetti, ConfettiRenderer } = useConfetti();
  
  const isLimitReached = !canEvaluate() && tier === 'free';
  const shouldBlur = isLimitReached && !evaluation;

  const evaluationMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const response = await apiRequest(
        "POST",
        `/api/protocols/${protocol.id}/evaluate`,
        { 
          context: protocol.description,
          userPrompt: prompt 
        }
      );
      const result = await response.json();
      return result.evaluation as PromptEvaluation;
    },
    onSuccess: (data) => {
      setEvaluation(data);
      incrementEvaluation();
      
      // Mark protocol as completed if score is good enough (70+)
      if (data.score >= 70) {
        markProtocolCompleted(protocol.id, data.score);
        // Trigger confetti for excellent scores!
        triggerConfetti();
      }
      
      toast({
        title: "Prompt baholandi!",
        description: `Sizning ball: ${data.score}/100`,
        duration: data.score >= 70 ? 5000 : 3000, // Show longer for good scores
      });
    },
    onError: (error) => {
      toast({
        title: "Xatolik yuz berdi",
        description: "Promptni baholashda xatolik. Qaytadan urinib ko'ring.",
        variant: "destructive",
      });

    },
  });

  const handleSubmit = () => {
    if (!canEvaluate()) {
      const limitText = tier === 'paid' ? '5 marta' : '1 marta';
      toast({
        title: "Baholash limiti tugadi",
        description: `Har bir protokolni ${limitText} baholash mumkin. ${tier === 'free' ? 'Premium obuna oling va 5 marta baholang.' : 'Siz allaqachon maksimal baholash soniga yetdingiz.'}`,
        variant: "destructive",
      });
      return;
    }

    if (!userPrompt.trim()) {
      toast({
        title: "Prompt kerak",
        description: "Iltimos, baholanishi uchun prompt yozing.",
        variant: "destructive",
      });
      return;
    }

    if (userPrompt.length > 300) {
      toast({
        title: "Prompt juda uzun",
        description: "Prompt 300 belgidan uzun bo'lmasligi kerak.",
        variant: "destructive",
      });
      return;
    }

    evaluationMutation.mutate(userPrompt.trim());
  };

  const handleReset = () => {
    setUserPrompt("");
    setEvaluation(null);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-accent";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "A'lo";
    if (score >= 80) return "Yaxshi";
    if (score >= 70) return "Qoniqarli";
    if (score >= 60) return "O'rtacha";
    return "Yaxshilanishi kerak";
  };

  return (
    <div className="space-y-6">
      <Card className={`bg-card border-2 border-theme shadow-brutal rounded-none ${shouldBlur ? "relative" : ""}`}>
        {shouldBlur && (
          <div className="absolute inset-0 bg-background/90 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="text-center p-6 max-w-sm">
              <div className="bg-foreground w-16 h-16 flex items-center justify-center mx-auto mb-4 border-2 border-theme">
                <Crown className="h-8 w-8 text-background" />
              </div>
              <h3 className="text-lg font-black uppercase mb-2">Premium xususiyat</h3>
              <p className="text-foreground text-sm mb-4">
                Har bir protokolni ko'proq marta baholash va AI tahlil olish uchun Premium obuna oling
              </p>
              <Link href="/payment">
                <Button className="bg-foreground hover:bg-foreground/90 text-background font-bold uppercase border-2 border-theme hover:shadow-brutal-sm">
                  <Crown className="h-4 w-4 mr-2" />
                  Premium olish
                </Button>
              </Link>
            </div>
          </div>
        )}
        <CardHeader className={shouldBlur ? "blur-sm" : ""}>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-accent" />
              Protokolni mashq qiling
            </div>
            <div className="flex items-center gap-2">
              {protocolProgress && (
                <Badge variant="secondary" className="font-bold uppercase bg-accent text-accent-foreground border-2 border-theme">
                  O'rganilgan
                </Badge>
              )}
              <Badge variant="outline" className="text-xs font-bold uppercase border-2 border-theme">
                {evaluationCount}/{evaluationLimit} baholash
              </Badge>
            </div>
          </CardTitle>
          <CardDescription>
            Ushbu protokol asosida o'z promptingizni yozing va AI baholashini oling
          </CardDescription>
        </CardHeader>
        <CardContent className={`space-y-4 ${shouldBlur ? "blur-sm" : ""}`}>
          {tier === 'free' && evaluationCount === 0 && evaluationLimit === 1 && (
            <div className="bg-yellow-100 dark:bg-yellow-900/20 border-2 border-theme p-3 mb-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-bold text-foreground mb-1">
                    Sizda 1 ta bepul baholash bor
                  </p>
                  <p className="text-foreground">
                    Ko'proq baholash uchun Premium obuna oling va har bir protokolni 5 marta baholang
                  </p>
                </div>
              </div>
            </div>
          )}
          <div>
            <label htmlFor="user-prompt" className="text-sm font-bold uppercase mb-2 block">
              Sizning promptingiz:
            </label>
            <Textarea
              id="user-prompt"
              placeholder={`${protocol.title} protokoli asosida prompt yozing...`}
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              className="min-h-[120px] resize-none bg-background text-foreground border-2 border-theme focus:border-theme focus:ring-0"
              disabled={evaluationMutation.isPending}
            />
            <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground font-bold">
              <span>{userPrompt.length}/300 belgi</span>
              <span>
                {userPrompt.length > 300 && (
                  <span className="text-red-500">Juda uzun!</span>
                )}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSubmit}
              disabled={!userPrompt.trim() || evaluationMutation.isPending || userPrompt.length > 300}
              className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground font-bold uppercase border-2 border-theme h-[44px] hover:shadow-brutal-sm"
            >
              {evaluationMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Baholanmoqda...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Baholash
                </>
              )}
            </Button>
            {evaluation && (
              <Button variant="outline" onClick={handleReset} className="border-2 border-theme hover:bg-secondary font-bold uppercase h-[44px] hover:shadow-brutal-sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Tozalash
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {evaluation && (
        <Card className="bg-card border-2 border-theme shadow-brutal rounded-none">
          <CardHeader>
            <CardTitle className="flex items-center justify-between font-black uppercase">
              <span>Baholash natijalari</span>
              <div className="flex items-center gap-2">
                <span className={`text-2xl font-bold ${getScoreColor(evaluation.score)}`}>
                  {evaluation.score}/100
                </span>
                <Badge variant={evaluation.score >= 70 ? "default" : evaluation.score >= 50 ? "secondary" : "destructive"} className="font-bold uppercase border-2 border-theme">
                  {getScoreLabel(evaluation.score)}
                </Badge>
              </div>
            </CardTitle>
            <CardDescription>{evaluation.explanation}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Progress value={evaluation.score} className="h-3" />
            </div>

          </CardContent>
        </Card>
      )}
      <ConfettiRenderer />
    </div>
  );
}