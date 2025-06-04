import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Protocol } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { Link } from "wouter";
import AppHeader from "@/components/app-header";

export default function ProtocolDetail() {
  const { id } = useParams<{ id: string }>();

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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-16 h-16 bg-gray-200 rounded-xl"></div>
              <div className="flex-1">
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded w-48"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !protocol) {
    return (
      <div className="min-h-screen bg-white">
        <AppHeader />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Protokol topilmadi
            </h2>
            <p className="text-gray-600 mb-6">
              Siz qidirayotgan protokol mavjud emas.
            </p>
            <Link href="/">
              <Button className="bg-accent text-white hover:bg-accent/90">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Protokollarga qaytish
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <AppHeader />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-accent text-white rounded-xl flex items-center justify-center font-black text-2xl">
              {protocol.number.toString().padStart(2, "0")}
            </div>
            <div>
              <h1 className="text-3xl font-black text-black leading-tight">
                {protocol.title}
              </h1>
              <span className="text-sm text-gray-500">
                Protokol №{protocol.number}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-black mb-4">Tavsif</h2>
          <p className="text-gray-700 text-lg leading-relaxed">
            {protocol.description}
          </p>
        </div>

        {/* Examples Section */}
        <div className="space-y-8 mb-8">
          {/* Bad Example */}
          {protocol.badExample && (
            <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-r-xl">
              <h3 className="text-lg font-bold text-red-800 mb-3 flex items-center">
                <XCircle className="w-5 h-5 mr-2" />
                Yomon misol
              </h3>
              <p className="text-red-700 font-medium">
                "{protocol.badExample}"
              </p>
            </div>
          )}

          {/* Good Example */}
          {protocol.goodExample && (
            <div className="bg-green-50 border-l-4 border-green-400 p-6 rounded-r-xl">
              <h3 className="text-lg font-bold text-green-800 mb-3 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Yaxshi misol
              </h3>
              <p className="text-green-700 font-medium">
                "{protocol.goodExample}"
              </p>
            </div>
          )}
        </div>

        {/* Notes */}
        {protocol.notes && (
          <div className="mb-8">
            <h3 className="text-lg font-bold text-black mb-3">Eslatmalar</h3>
            <p className="text-gray-700 leading-relaxed">{protocol.notes}</p>
          </div>
        )}

        {/* Back Button */}
        <div className="pt-6 border-t border-gray-200">
          <Link href="/">
            <Button className="bg-gray-100 text-gray-700 hover:bg-gray-200 font-semibold">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Protokollarga
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
