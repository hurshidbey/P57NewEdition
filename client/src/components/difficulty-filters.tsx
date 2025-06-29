import { Button } from "@/components/ui/button";

interface DifficultyFiltersProps {
  selectedDifficulty: string | null;
  onDifficultyChange: (difficulty: string | null) => void;
}

export default function DifficultyFilters({
  selectedDifficulty,
  onDifficultyChange,
}: DifficultyFiltersProps) {

  return (
    <div className="mb-12 space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-4xl sm:text-5xl font-black text-foreground leading-tight">
          AI Protokollarini O'rganing
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Tizimli protokollar orqali AI modellaridan yaxshi natijalar olishning isbotlangan usullarini o'rganing.
        </p>
      </div>

      {/* Difficulty Level Filter */}
      <div className="text-center">
        <h3 className="text-sm font-semibold text-muted-foreground mb-3">Qiyinlik darajasi</h3>
        <div className="flex flex-wrap justify-center gap-2">
          <Button
            onClick={() => onDifficultyChange(null)}
            className={`px-6 py-3 min-h-[44px] rounded-full text-sm font-medium transition-colors touch-manipulation ${
              selectedDifficulty === null
                ? "bg-accent text-accent-foreground hover:bg-accent/90"
                : "bg-muted text-muted-foreground hover:bg-muted/80 dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted/60"
            }`}
          >
            Barcha darajalar
          </Button>
          <Button
            onClick={() => onDifficultyChange("BEGINNER")}
            className={`px-6 py-3 min-h-[44px] rounded-full text-sm font-medium transition-colors touch-manipulation ${
              selectedDifficulty === "BEGINNER"
                ? "bg-green-500 text-white hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
                : "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-900/30"
            }`}
          >
            Boshlang'ich (1-20)
          </Button>
          <Button
            onClick={() => onDifficultyChange("ORTA DARAJA")}
            className={`px-6 py-3 min-h-[44px] rounded-full text-sm font-medium transition-colors touch-manipulation ${
              selectedDifficulty === "ORTA DARAJA"
                ? "bg-orange-500 text-white hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700"
                : "bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800 dark:hover:bg-orange-900/30"
            }`}
          >
            O'rta daraja (21-40)
          </Button>
          <Button
            onClick={() => onDifficultyChange("YUQORI DARAJA")}
            className={`px-6 py-3 min-h-[44px] rounded-full text-sm font-medium transition-colors touch-manipulation ${
              selectedDifficulty === "YUQORI DARAJA"
                ? "bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
                : "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/30"
            }`}
          >
            Yuqori daraja (41-57)
          </Button>
        </div>
      </div>
    </div>
  );
}
