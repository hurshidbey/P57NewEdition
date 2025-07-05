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
        <h3 className="text-sm font-black uppercase text-foreground mb-3">Qiyinlik darajasi</h3>
        <div className="flex flex-wrap justify-center gap-2">
          <Button
            onClick={() => onDifficultyChange(null)}
            className={`px-6 py-3 min-h-[44px] text-sm font-black uppercase transition-all border-2 hover:shadow-brutal-sm touch-manipulation ${
              selectedDifficulty === null
                ? "bg-accent text-black border-theme hover:bg-accent/90"
                : "bg-card text-foreground border-theme hover:bg-secondary"
            }`}
          >
            Barcha darajalar
          </Button>
          <Button
            onClick={() => onDifficultyChange("BEGINNER")}
            className={`px-6 py-3 min-h-[44px] text-sm font-black uppercase transition-all border-2 hover:shadow-brutal-sm touch-manipulation ${
              selectedDifficulty === "BEGINNER"
                ? "bg-accent text-black border-theme hover:bg-accent/90"
                : "bg-card text-foreground border-theme hover:bg-secondary"
            }`}
          >
            Boshlang'ich (1-20)
          </Button>
          <Button
            onClick={() => onDifficultyChange("ORTA DARAJA")}
            className={`px-6 py-3 min-h-[44px] text-sm font-black uppercase transition-all border-2 hover:shadow-brutal-sm touch-manipulation ${
              selectedDifficulty === "ORTA DARAJA"
                ? "bg-accent text-black border-theme hover:bg-accent/90"
                : "bg-card text-foreground border-theme hover:bg-secondary"
            }`}
          >
            O'rta daraja (21-40)
          </Button>
          <Button
            onClick={() => onDifficultyChange("YUQORI DARAJA")}
            className={`px-6 py-3 min-h-[44px] text-sm font-black uppercase transition-all border-2 hover:shadow-brutal-sm touch-manipulation ${
              selectedDifficulty === "YUQORI DARAJA"
                ? "bg-accent text-black border-theme hover:bg-accent/90"
                : "bg-card text-foreground border-theme hover:bg-secondary"
            }`}
          >
            Yuqori daraja (41-57)
          </Button>
        </div>
      </div>
    </div>
  );
}
