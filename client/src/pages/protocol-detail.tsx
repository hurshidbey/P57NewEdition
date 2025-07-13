import { useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Protocol } from "@shared/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, CheckCircle, XCircle, Lock, Crown, ArrowRight, Copy, CheckIcon, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import AppHeader from "@/components/app-header";
import AppFooter from "@/components/app-footer";
import PromptPractice from "@/components/prompt-practice";
import ProtocolNavigation from "@/components/protocol-navigation";
import { UpgradeCTA } from "@/components/upgrade-cta";
import { useProgress } from "@/hooks/use-progress";
import { useProtocolAccess, useUserTier } from "@/hooks/use-user-tier";
import { BrutalButton } from "@/components/brutal-button";

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
  const { isProtocolCompleted, markProtocolCompleted, toggleProtocolCompleted } = useProgress();
  const { tier, getAccessedProtocolsCount, canAccessNewProtocol } = useUserTier();
  const [copiedGood, setCopiedGood] = useState(false);

  const {
    data: protocol,
    isLoading,
    error,
  } = useQuery<Protocol>({
    queryKey: [`/api/protocols/${id}`],
    enabled: !!id,
  });

  // Access control
  const protocolId = id ? parseInt(id) : 0;
  const { canAccess, isLocked, requiresUpgrade } = useProtocolAccess(
    protocolId, 
    protocol?.isFreeAccess || false
  );

  // Enhanced access control for tier limits
  const hasCompletedThis = isProtocolCompleted(protocolId);
  const accessedCount = getAccessedProtocolsCount();
  const canAccessNewOne = canAccessNewProtocol();
  
  // Show upgrade reason specific to tier limits
  const getUpgradeReason = () => {
    if (tier === 'paid') return '';
    
    if (!protocol?.isFreeAccess) {
      return 'Bu protokol Premium foydalanuvchilar uchun';
    }
    
    if (!canAccessNewOne && !hasCompletedThis) {
      return `Siz maksimal ${accessedCount}/3 bepul protokolga kirdingiz`;
    }
    
    return '';
  };

  const upgradeReason = getUpgradeReason();
  const shouldShowUpgrade = tier === 'free' && upgradeReason && !hasCompletedThis;

  const copyGoodExample = async () => {
    if (!protocol?.goodExample) return;
    try {
      await navigator.clipboard.writeText(protocol.goodExample);
      setCopiedGood(true);
      setTimeout(() => setCopiedGood(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8">
          <section className="pt-8 pb-12">
            <div className="animate-pulse">
              <div className="flex items-start gap-6 mb-12">
                <div className="w-20 h-20 bg-gray-200 border-2 border-gray-400"></div>
                <div className="flex-1">
                  <div className="h-8 bg-gray-200 border border-gray-400 mb-3"></div>
                  <div className="h-4 bg-gray-200 border border-gray-400 w-40"></div>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-8">
                  <div className="h-6 bg-gray-200 border border-gray-400 w-32"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-300 border border-gray-400"></div>
                    <div className="h-4 bg-gray-300 border border-gray-400"></div>
                    <div className="h-4 bg-muted-foreground/20 rounded w-3/4"></div>
                  </div>
                </div>
                <div className="lg:col-span-1">
                  <div className="bg-gray-200 border-2 border-gray-400 p-6">
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
              <h2 className="text-2xl font-black text-foreground uppercase mb-4 leading-tight">
                Protokol topilmadi
              </h2>
              <p className="text-base text-foreground mb-8 leading-relaxed">
                Siz qidirayotgan protokol mavjud emas yoki o'chirilgan bo'lishi mumkin.
              </p>
              <Link href="/">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase px-6 py-2 h-[44px] border-2 border-black transition-all hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
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

  // Don't block access - show everything but blur locked content

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
                <div className={`w-24 h-24 flex items-center justify-center font-black text-3xl border-2 border-theme ${
                  isProtocolCompleted(protocol.id) 
                    ? 'bg-accent text-black' 
                    : 'bg-card text-black dark:text-white'
                }`}>
                  {protocol.number.toString().padStart(2, "0")}
                </div>
                <div className="flex-1">
                  {/* Difficulty Level Badge */}
                  {protocol.difficultyLevel && (
                    <div className="mb-3">
                      <span className={`inline-block px-3 py-1 text-xs font-bold uppercase border-2 ${
                        protocol.difficultyLevel === 'BEGINNER' 
                          ? 'bg-accent text-black border-theme'
                          : protocol.difficultyLevel === 'O\'RTA DARAJA'
                          ? 'bg-card text-foreground border-theme'
                          : 'bg-primary text-primary-foreground border-theme'
                      }`}>
                        {protocol.difficultyLevel === 'BEGINNER' ? 'Boshlang\'ich' : 
                         protocol.difficultyLevel === 'O\'RTA DARAJA' ? 'O\'rta daraja' : 'Yuqori daraja'}
                      </span>
                    </div>
                  )}
                  <h1 className="text-3xl font-black text-foreground uppercase leading-tight mb-3">
                    {protocol.title}
                  </h1>
                  <div className="flex items-center gap-4">
                    <span className="text-base text-foreground font-bold uppercase">
                      Protokol №{protocol.number}
                    </span>
                    {tier === 'free' && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase bg-secondary text-foreground px-2 py-1 border border-theme">
                          {accessedCount}/3 protokol ishlatilgan
                        </span>
                        {!protocol.isFreeAccess && (
                          <span className="text-xs font-bold uppercase bg-primary text-primary-foreground px-2 py-1 border border-theme flex items-center gap-1">
                            <Crown className="w-3 h-3" />
                            Premium
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex-shrink-0">
                <BrutalButton
                  checked={isProtocolCompleted(protocol.id)}
                  onChange={() => toggleProtocolCompleted(protocol.id, 70)}
                  checkedText="Takrorlash"
                  uncheckedText="O'rgandim"
                  showConfetti={true}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Content Layout - Single Column for Better Focus */}
        <div className="max-w-4xl mx-auto pb-20">
          
          {/* Single Combined Card */}
          <div className="mb-16 relative">
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
                <>
                  <div className={`bg-card border-2 border-theme p-8 space-y-8 shadow-brutal-lg ${shouldShowUpgrade ? 'filter blur-sm' : ''}`}>
                    {parsedContent.problemStatement && (
                      <div>
                        <h2 className="text-xl font-black text-foreground uppercase mb-4">
                          {parsedContent.problemStatement}
                        </h2>
                      </div>
                    )}

                    {parsedContent.whyExplanation && (
                      <div>
                        <h3 className="text-lg font-black text-foreground uppercase mb-3">
                          Nega bunday bo'ladi?
                        </h3>
                        <p className="text-base text-foreground leading-relaxed">
                          {parsedContent.whyExplanation}
                        </p>
                      </div>
                    )}

                    {parsedContent.solutionApproach && (
                      <div>
                        <h3 className="text-lg font-black text-foreground uppercase mb-3">
                          Yechim.
                        </h3>
                        <p className="text-base text-foreground leading-relaxed">
                          {parsedContent.solutionApproach}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* Enhanced Premium Overlay for Locked Content */}
                  {shouldShowUpgrade && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <UpgradeCTA
                        variant="modal"
                        title={accessedCount >= 3 ? 'Limit tugadi' : 'Premium protokol'}
                        description={upgradeReason}
                        reason={tier === 'free' ? `Hozirgi holat: ${accessedCount}/3 bepul protokol ishlatilgan` : undefined}
                        showFeatures={true}
                      />
                    </div>
                  )}
                </>
              );
            })()}
          </div>

          {/* Examples Section */}
          <section className={`space-y-6 mb-16 ${shouldShowUpgrade ? 'filter blur-sm' : ''}`}>
            
            {/* Bad Example */}
            {protocol.badExample && (
              <div className="bg-card border-2 border-theme p-6 hover:shadow-brutal transition-all">
                <h3 className="text-sm font-black uppercase text-foreground mb-4 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  Yomon misol
                </h3>
                <div className="bg-secondary border border-theme p-4">
                  <p className="text-foreground text-base leading-relaxed font-mono">
                    {protocol.badExample}
                  </p>
                </div>
              </div>
            )}

            {/* Good Example */}
            {protocol.goodExample && (
              <div className="bg-card border-2 border-theme p-6 hover:shadow-brutal transition-all">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-black uppercase text-foreground flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-accent" />
                    Yaxshi misol
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyGoodExample}
                    className="gap-2 font-bold uppercase border border-black h-[32px] hover:bg-primary hover:text-primary-foreground transition-all rounded-none"
                  >
                    {copiedGood ? (
                      <>
                        <CheckIcon className="w-3 h-3" />
                        Nusxalandi
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        Nusxalash
                      </>
                    )}
                  </Button>
                </div>
                <div className="bg-secondary border border-theme p-4">
                  <p className="text-foreground text-base leading-relaxed font-mono">
                    {protocol.goodExample}
                  </p>
                </div>
                <div className="mt-4">
                  <a
                    href={`https://chat.openai.com/?q=${encodeURIComponent(protocol.goodExample)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex"
                  >
                    <Button 
                      variant="outline" 
                      className="gap-2 font-bold uppercase border-2 border-black hover:bg-accent hover:text-black transition-all rounded-none hover:shadow-brutal-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      ChatGPT'da sinab ko'rish
                    </Button>
                  </a>
                </div>
              </div>
            )}
          </section>

          {/* Practice Section */}
          <section className={shouldShowUpgrade ? 'filter blur-sm pointer-events-none' : ''}>
            <PromptPractice protocol={protocol} />
          </section>

          {/* Notes Section */}
          {protocol.notes && (
            <section className="bg-card border-2 border-theme p-8 mb-12 shadow-brutal">
              <h3 className="text-lg font-black text-foreground uppercase mb-4">Eslatmalar</h3>
              <p className="text-foreground leading-relaxed">{protocol.notes}</p>
            </section>
          )}

          {/* Protocol Navigation */}
          <ProtocolNavigation currentProtocolId={protocol.id} />

          {/* Back Button */}
          <section className="text-center mt-8 mb-8 px-4">
            <Link href="/">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase px-6 py-2 h-[44px] border-2 border-theme transition-all touch-manipulation hover:shadow-brutal">
                <ArrowLeft className="w-4 h-4 mr-2 flex-shrink-0" />
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
