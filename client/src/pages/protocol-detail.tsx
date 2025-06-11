import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Protocol } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { Link } from "wouter";
import AppHeader from "@/components/app-header";
import AppFooter from "@/components/app-footer";
import PromptPractice from "@/components/prompt-practice";
import { useProgress } from "@/hooks/use-progress";

// Helper function to parse the combined description into separate components
function parseProtocolDescription(description: string) {
  if (!description) return { problemStatement: null, whyExplanation: null, solutionApproach: null };
  
  // Pattern: Problem (ends with !) + Explanation (middle) + Solution (rest)
  // Split by exclamation first to get the problem
  const exclamationSplit = description.split('!');
  
  if (exclamationSplit.length >= 2) {
    const problemStatement = exclamationSplit[0].trim() + '!';
    const remaining = exclamationSplit.slice(1).join('!').trim();
    
    // Split the remaining text by periods to separate explanation and solution
    const sentences = remaining.split('.').filter(s => s.trim());
    
    if (sentences.length >= 2) {
      const whyExplanation = sentences[0].trim() + '.';
      const solutionApproach = sentences.slice(1).join('.').trim();
      
      return {
        problemStatement,
        whyExplanation,
        solutionApproach: solutionApproach.endsWith('.') ? solutionApproach : solutionApproach + '.'
      };
    }
    
    // If only one sentence after exclamation, treat it as explanation
    return {
      problemStatement,
      whyExplanation: remaining.endsWith('.') ? remaining : remaining + '.',
      solutionApproach: null
    };
  }
  
  // Fallback: If no exclamation mark, split by periods
  const sentences = description.split('.').filter(s => s.trim());
  if (sentences.length >= 3) {
    return {
      problemStatement: sentences[0].trim() + '.',
      whyExplanation: sentences[1].trim() + '.',
      solutionApproach: sentences.slice(2).join('.').trim() + '.'
    };
  }
  
  // Final fallback: return the whole description as problem statement
  return {
    problemStatement: description,
    whyExplanation: null,
    solutionApproach: null
  };
}

export default function ProtocolDetail() {
  const { id } = useParams<{ id: string }>();
  const { isProtocolCompleted, markProtocolCompleted } = useProgress();

  const {
    data: protocol,
    isLoading,
    error,
  } = useQuery<Protocol>({
    queryKey: [`/api/protocols/${id}`],
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8">
          <section className="pt-8 pb-12">
            <div className="animate-pulse">
              <div className="flex items-start gap-6 mb-12">
                <div className="w-20 h-20 bg-muted rounded-xl"></div>
                <div className="flex-1">
                  <div className="h-8 bg-muted rounded mb-3"></div>
                  <div className="h-4 bg-muted rounded w-40"></div>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-8">
                  <div className="h-6 bg-muted rounded w-32"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-muted-foreground/20 rounded"></div>
                    <div className="h-4 bg-muted-foreground/20 rounded"></div>
                    <div className="h-4 bg-muted-foreground/20 rounded w-3/4"></div>
                  </div>
                </div>
                <div className="lg:col-span-1">
                  <div className="bg-muted rounded-xl p-6">
                    <div className="h-5 bg-muted-foreground/20 rounded w-24 mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted-foreground/20 rounded"></div>
                      <div className="h-3 bg-muted-foreground/20 rounded w-4/5"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  }

  if (error || !protocol) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8">
          <section className="pt-16 pb-16">
            <div className="text-center max-w-md mx-auto">
              <h2 className="text-scale-2xl font-bold text-red-600 mb-4 leading-tight">
                Protokol topilmadi
              </h2>
              <p className="text-scale-base text-muted-foreground mb-8 leading-relaxed">
                Siz qidirayotgan protokol mavjud emas yoki o'chirilgan bo'lishi mumkin.
              </p>
              <Link href="/">
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90 px-6 py-3 h-auto font-semibold">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Protokollarga qaytish
                </Button>
              </Link>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      {/* Main Container - 8pt Grid System */}
      <main className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hero Section - 8pt Grid Spacing */}
        <section className="pt-8 pb-16">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-8">
              <div className="flex items-start gap-6">
                <div className={`w-24 h-24 rounded-2xl flex items-center justify-center font-inter font-black text-3xl shadow-lg ${
                  isProtocolCompleted(protocol.id) 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' 
                    : 'bg-accent text-accent-foreground'
                }`}>
                  {protocol.number.toString().padStart(2, "0")}
                </div>
                <div className="flex-1">
                  {/* Difficulty Level Badge */}
                  {protocol.difficultyLevel && (
                    <div className="mb-3">
                      <span className={`inline-block px-4 py-2 rounded-full text-sm font-inter font-medium ${
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
                  <h1 className="font-inter text-3xl font-black text-foreground leading-tight mb-3">
                    {protocol.title}
                  </h1>
                  <span className="font-inter text-base text-muted-foreground font-medium">
                    Protokol №{protocol.number}
                  </span>
                </div>
              </div>
              
              <div className="flex-shrink-0">
                {!isProtocolCompleted(protocol.id) ? (
                  <Button 
                    onClick={() => markProtocolCompleted(protocol.id, 70)}
                    className="bg-green-600 hover:bg-green-700 text-white font-inter font-semibold px-8 py-4 rounded-xl h-auto"
                  >
                    O'rgandim
                  </Button>
                ) : (
                  <Button 
                    onClick={() => markProtocolCompleted(protocol.id, 70)}
                    variant="outline"
                    className="border-green-600 text-green-600 hover:bg-green-50 font-inter font-semibold px-8 py-4 rounded-xl h-auto"
                  >
                    Qayta mashq qilish
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Content Layout - Single Column for Better Focus */}
        <div className="max-w-4xl mx-auto pb-20">
          
          {/* Single Combined Card */}
          <div className="mb-16">
            {(() => {
              // Parse the description if separate fields are not available
              const parsedContent = protocol.problemStatement && protocol.whyExplanation && protocol.solutionApproach
                ? {
                    problemStatement: protocol.problemStatement,
                    whyExplanation: protocol.whyExplanation,
                    solutionApproach: protocol.solutionApproach
                  }
                : parseProtocolDescription(protocol.description || '');
              
              return (
                <div className="bg-card border-2 border-accent rounded-2xl p-8 space-y-8">
                  {parsedContent.problemStatement && (
                    <div>
                      <h2 className="font-inter text-xl font-bold text-foreground mb-4">
                        {parsedContent.problemStatement}
                      </h2>
                    </div>
                  )}

                  {parsedContent.whyExplanation && (
                    <div>
                      <h3 className="font-inter text-lg font-semibold text-foreground mb-3">
                        Nega bunday bo'ladi?
                      </h3>
                      <p className="font-inter text-base text-muted-foreground leading-relaxed">
                        {parsedContent.whyExplanation}
                      </p>
                    </div>
                  )}

                  {parsedContent.solutionApproach && (
                    <div>
                      <h3 className="font-inter text-lg font-semibold text-foreground mb-3">
                        Yechim.
                      </h3>
                      <p className="font-inter text-base text-muted-foreground leading-relaxed">
                        {parsedContent.solutionApproach}
                      </p>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Examples Section */}
          <section className="space-y-6 mb-16">
            
            {/* Bad Example */}
            {protocol.badExample && (
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="font-inter text-sm font-medium text-red-600 mb-4">
                  Yomon misol
                </h3>
                <div className="bg-muted/50 rounded-xl p-4">
                  <p className="font-inter text-foreground text-base leading-relaxed">
                    "{protocol.badExample}"
                  </p>
                </div>
              </div>
            )}

            {/* Good Example */}
            {protocol.goodExample && (
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="font-inter text-sm font-medium text-green-600 mb-4">
                  Yaxshi misol
                </h3>
                <div className="bg-muted/50 rounded-xl p-4">
                  <p className="font-inter text-foreground text-base leading-relaxed">
                    "{protocol.goodExample}"
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* Practice Section */}
          <section>
            <PromptPractice protocol={protocol} />
          </section>

          {/* Notes Section */}
          {protocol.notes && (
            <section className="bg-muted/50 border border-border/50 rounded-2xl p-8 mb-12">
              <h3 className="font-inter text-lg font-bold text-foreground mb-4">Eslatmalar</h3>
              <p className="font-inter text-muted-foreground leading-relaxed">{protocol.notes}</p>
            </section>
          )}

          {/* Back Button */}
          <section className="text-center">
            <Link href="/">
              <Button className="bg-muted text-muted-foreground hover:bg-muted/80 font-inter font-semibold px-8 py-4 rounded-xl">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Protokollarga qaytish
              </Button>
            </Link>
          </section>

        </div>
      </main>
      <AppFooter />
    </div>
  );
}
