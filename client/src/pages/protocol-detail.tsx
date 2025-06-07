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
      <div className="min-h-screen bg-white">
        <AppHeader />
        <main className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8">
          <section className="pt-8 pb-12">
            <div className="animate-pulse">
              <div className="flex items-start gap-6 mb-12">
                <div className="w-20 h-20 bg-gray-200 rounded-xl"></div>
                <div className="flex-1">
                  <div className="h-8 bg-gray-200 rounded mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-40"></div>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-8">
                  <div className="h-6 bg-gray-200 rounded w-32"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
                <div className="lg:col-span-1">
                  <div className="bg-gray-100 rounded-xl p-6">
                    <div className="h-5 bg-gray-200 rounded w-24 mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-4/5"></div>
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
      <div className="min-h-screen bg-white">
        <AppHeader />
        <main className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8">
          <section className="pt-16 pb-16">
            <div className="text-center max-w-md mx-auto">
              <h2 className="text-scale-2xl font-bold text-red-600 mb-4 leading-tight">
                Protokol topilmadi
              </h2>
              <p className="text-scale-base text-gray-600 mb-8 leading-relaxed">
                Siz qidirayotgan protokol mavjud emas yoki o'chirilgan bo'lishi mumkin.
              </p>
              <Link href="/">
                <Button className="bg-accent text-white hover:bg-accent/90 px-6 py-3 h-auto font-semibold">
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
    <div className="min-h-screen bg-white">
      <AppHeader />

      {/* Main Container - 8pt Grid System */}
      <main className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hero Section - 8pt Grid Spacing */}
        <section className="pt-8 pb-12">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
            <div className="flex items-start gap-6">
              <div className={`w-20 h-20 rounded-xl flex items-center justify-center font-black text-2xl shadow-lg ${
                isProtocolCompleted(protocol.id) 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-accent text-white'
              }`}>
                {protocol.number.toString().padStart(2, "0")}
              </div>
              <div className="flex-1">
                <h1 className="text-scale-2xl font-black text-black leading-tight mb-2">
                  {protocol.title}
                </h1>
                <span className="text-sm text-gray-500 font-medium">
                  Protokol №{protocol.number}
                </span>
              </div>
            </div>
            
            <div className="flex-shrink-0">
              {!isProtocolCompleted(protocol.id) ? (
                <Button 
                  onClick={() => markProtocolCompleted(protocol.id, 70)}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 h-auto font-semibold"
                >
                  O'rgandim
                </Button>
              ) : (
                <Button 
                  onClick={() => markProtocolCompleted(protocol.id, 70)}
                  variant="outline"
                  className="border-green-600 text-green-600 hover:bg-green-50 px-6 py-3 h-auto font-semibold"
                >
                  Qayta mashq qilish
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* Content Layout - Two Column on Large Screens */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pb-16">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Description Section */}
            <section>
              <h2 className="text-scale-xl font-bold text-black mb-4 leading-tight">Tavsif</h2>
              <p className="text-scale-base text-gray-700 leading-relaxed">
                {protocol.description}
              </p>
            </section>

            {/* Examples Section */}
            <section className="space-y-6">
              <h2 className="text-scale-xl font-bold text-black mb-6 leading-tight">Misollar</h2>
              
              {/* Bad Example */}
              {protocol.badExample && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                  <h3 className="text-scale-lg font-bold text-red-800 mb-4 flex items-center">
                    <XCircle className="w-5 h-5 mr-3" />
                    Yomon misol
                  </h3>
                  <div className="bg-white border border-red-200 rounded-lg p-4">
                    <p className="text-red-700 font-medium text-scale-base leading-relaxed">
                      "{protocol.badExample}"
                    </p>
                  </div>
                </div>
              )}

              {/* Good Example */}
              {protocol.goodExample && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                  <h3 className="text-scale-lg font-bold text-green-800 mb-4 flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3" />
                    Yaxshi misol
                  </h3>
                  <div className="bg-white border border-green-200 rounded-lg p-4">
                    <p className="text-green-700 font-medium text-scale-base leading-relaxed">
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

          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-8">
              
              {/* Notes */}
              {protocol.notes && (
                <section className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                  <h3 className="text-scale-lg font-bold text-black mb-4 leading-tight">Eslatmalar</h3>
                  <p className="text-scale-sm text-gray-700 leading-relaxed">{protocol.notes}</p>
                </section>
              )}

              {/* Back Button */}
              <section>
                <Link href="/">
                  <Button className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200 font-semibold px-4 py-3 h-auto">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Protokollarga qaytish
                  </Button>
                </Link>
              </section>

            </div>
          </div>

        </div>
      </main>
      <AppFooter />
    </div>
  );
}
