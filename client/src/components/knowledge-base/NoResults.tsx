import React from "react";
import { AiIcon } from "@/components/ai-icon";
import { Card, CardContent } from "@/components/ui/card";

interface NoResultsProps {
  searchQuery: string;
  suggestions?: Array<{
    categoryId: string;
    sectionId: string;
    title: string;
  }>;
  onSuggestionClick?: (categoryId: string, sectionId: string) => void;
}

export function NoResults({ searchQuery, suggestions, onSuggestionClick }: NoResultsProps) {
  return (
    <Card className="border-2 border-black">
      <CardContent className="p-8 text-center">
        <AiIcon name="search" size={48} className="mx-auto mb-4 text-gray-400" />
        <h3 className="text-xl font-bold mb-2">HECH NARSA TOPILMADI</h3>
        <p className="text-gray-700 mb-6">
          "{searchQuery}" bo'yicha hech qanday natija topilmadi.
        </p>
        
        {suggestions && suggestions.length > 0 && (
          <div className="mt-6">
            <p className="text-sm text-gray-600 mb-3">Quyidagilarni ko'rib chiqing:</p>
            <div className="space-y-2">
              {suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => onSuggestionClick?.(suggestion.categoryId, suggestion.sectionId)}
                  className="block w-full p-3 text-left border-2 border-gray-300 hover:border-black hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold">{suggestion.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-6 text-sm text-gray-600">
          <p>Maslahatlar:</p>
          <ul className="mt-2 space-y-1 text-left max-w-md mx-auto">
            <li>• Imlo xatolarini tekshiring</li>
            <li>• Umumiyroq so'zlarni ishlating</li>
            <li>• Kamroq so'zlar bilan qidiring</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}