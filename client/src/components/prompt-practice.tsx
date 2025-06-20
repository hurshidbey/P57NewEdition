import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Protocol } from "@shared/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Lightbulb, RefreshCw, Send, AlertTriangle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useProtocolEvaluation } from "@/hooks/use-protocol-evaluation";
import { useProgress } from "@/hooks/use-progress";
import { useUserTier } from "@/hooks/use-user-tier";

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

  const evaluationMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const response = await apiRequest(
        "POST",
        `/api/protocols/${protocol.id}/evaluate`,
        { prompt }
      );
      return response.json() as Promise<PromptEvaluation>;
    },
    onSuccess: (data) => {
      setEvaluation(data);
      incrementEvaluation();
      
      // Mark protocol as completed if score is good enough (70+)
      if (data.score >= 70) {
        markProtocolCompleted(protocol.id, data.score);
      }
      
      toast({
        title: "Prompt baholandi!",
        description: `Sizning ball: ${data.score}/100`,
      });
    },
    onError: (error) => {
      toast({
        title: "Xatolik yuz berdi",
        description: "Promptni baholashda xatolik. Qaytadan urinib ko'ring.",
        variant: "destructive",
      });
      console.error("Evaluation error:", error);
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
    if (score >= 80) return "text-green-600";
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-accent" />
              Protokolni mashq qiling
            </div>
            <div className="flex items-center gap-2">
              {protocolProgress && (
                <Badge variant="secondary" className="font-normal">
                  O'rganilgan
                </Badge>
              )}
              <Badge variant="outline" className="text-xs">
                {evaluationCount}/{evaluationLimit} baholash
              </Badge>
            </div>
          </CardTitle>
          <CardDescription>
            Ushbu protokol asosida o'z promptingizni yozing va AI baholashini oling
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="user-prompt" className="text-sm font-medium mb-2 block">
              Sizning promptingiz:
            </label>
            <Textarea
              id="user-prompt"
              placeholder={`${protocol.title} protokoli asosida prompt yozing...`}
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              className="min-h-[120px] resize-none"
              disabled={evaluationMutation.isPending}
            />
            <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
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
              className="flex-1"
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
              <Button variant="outline" onClick={handleReset}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Tozalash
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {evaluation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Baholash natijalari</span>
              <div className="flex items-center gap-2">
                <span className={`text-2xl font-bold ${getScoreColor(evaluation.score)}`}>
                  {evaluation.score}/100
                </span>
                <Badge variant={evaluation.score >= 70 ? "default" : evaluation.score >= 50 ? "secondary" : "destructive"}>
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
    </div>
  );
}