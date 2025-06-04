import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Category } from "@shared/schema";

interface SearchFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: number | null;
  onCategoryChange: (categoryId: number | null) => void;
  categories: Category[];
}

export default function SearchFilters({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
}: SearchFiltersProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(localSearch);
  };

  const handleSearchInput = (value: string) => {
    setLocalSearch(value);
    // Debounce the search
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      onSearchChange(value);
    }, 300);
  };

  let searchTimeout: NodeJS.Timeout;

  return (
    <div className="mb-12 space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-4xl sm:text-5xl font-black text-black leading-tight">
          AI Protokollarini O'rganing
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Tizimli protokollar orqali AI modellaridan yaxshi natijalar olishning isbotlangan usullarini o'rganing.
        </p>
      </div>
      
      {/* Search Input */}
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Input
            type="text"
            placeholder="Protokollarni sarlavha yoki tavsif bo'yicha qidiring..."
            value={localSearch}
            onChange={(e) => handleSearchInput(e.target.value)}
            className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-accent pr-12 h-auto"
          />
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <Search className="w-6 h-6 text-gray-400" />
          </div>
        </form>
      </div>

      {/* Category Filter Chips */}
      <div className="flex flex-wrap justify-center gap-3">
        <Button
          onClick={() => onCategoryChange(null)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === null
              ? "bg-accent text-white hover:bg-accent/90"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Barcha kategoriyalar
        </Button>
        {categories.map((category) => (
          <Button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === category.id
                ? "bg-accent text-white hover:bg-accent/90"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {category.name}
          </Button>
        ))}
      </div>
    </div>
  );
}
