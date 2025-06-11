import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Protocol } from "@shared/schema";
import AppHeader from "@/components/app-header";
import AppFooter from "@/components/app-footer";
import ProtocolCard from "@/components/protocol-card";
import ProgressDashboard from "@/components/progress-dashboard";
import DifficultyFilters from "@/components/difficulty-filters";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [allProtocols, setAllProtocols] = useState<Protocol[]>([]);

  const { data: protocols, isLoading, error } = useQuery<Protocol[]>({
    queryKey: ["/api/protocols", { 
      limit: 20, 
      offset: (currentPage - 1) * 20,
      difficulty: selectedDifficulty
    }],
  });

  // Update allProtocols when new data comes in
  useEffect(() => {
    if (protocols && currentPage === 1) {
      setAllProtocols(protocols);
    } else if (protocols && currentPage > 1) {
      setAllProtocols(prev => [...prev, ...protocols]);
    }
  }, [protocols, currentPage]);

  const finalProtocols = allProtocols;

  const handleLoadMore = () => {
    setCurrentPage(prev => prev + 1);
  };

  const handleDifficultyFilter = (difficulty: string | null) => {
    setSelectedDifficulty(difficulty);
    setCurrentPage(1);
    setAllProtocols([]);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Protokollarni yuklashda xatolik</h2>
            <p className="text-muted-foreground">Iltimos, internet aloqangizni tekshiring va qayta urinib ko'ring.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      {/* Main Container - 8pt Grid System */}
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Section - 32px top padding, 40px bottom margin */}
        <section className="pt-8 pb-10">
          <ProgressDashboard totalProtocols={57} />
        </section>

        {/* Difficulty Filters Section */}
        <section className="pb-8">
          <DifficultyFilters
            selectedDifficulty={selectedDifficulty}
            onDifficultyChange={handleDifficultyFilter}
          />
        </section>

        {/* Content Section */}
        <section className="pb-16">
          {isLoading && currentPage === 1 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-muted rounded-xl p-6 animate-pulse">
                  <div className="w-12 h-12 bg-muted-foreground/20 rounded-xl mb-4"></div>
                  <div className="h-6 bg-muted-foreground/20 rounded mb-3"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted-foreground/20 rounded"></div>
                    <div className="h-4 bg-muted-foreground/20 rounded w-4/5"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {finalProtocols.length === 0 ? (
                <div className="text-center py-20">
                  <div className="max-w-md mx-auto">
                    <h3 className="text-xl font-semibold text-muted-foreground mb-3">Protokollar topilmadi</h3>
                    <p className="text-muted-foreground leading-relaxed">Qidiruv yoki filtr sozlamalarini o'zgartirib ko'ring.</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                  {finalProtocols.map((protocol) => (
                    <ProtocolCard key={protocol.id} protocol={protocol} />
                  ))}
                </div>
              )}

              {protocols && protocols.length === 20 && (
                <div className="text-center pt-8 pb-12">
                  <Button
                    onClick={handleLoadMore}
                    disabled={isLoading}
                    className="px-8 py-3 bg-accent text-accent-foreground hover:bg-accent/90 font-semibold rounded-lg"
                  >
                    {isLoading ? "Yuklanmoqda..." : "Ko'proq protokollar yuklash"}
                  </Button>
                </div>
              )}
            </>
          )}
        </section>
      </main>
      <AppFooter />
    </div>
  );
}
