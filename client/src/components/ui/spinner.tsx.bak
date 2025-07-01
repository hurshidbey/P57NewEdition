import { cn } from "@/lib/utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Spinner({ size = "md", className }: SpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4"
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-black border-t-transparent",
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="Yuklanmoqda"
    >
      <span className="sr-only">Yuklanmoqda...</span>
    </div>
  );
}

export function FullPageSpinner() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-90">
      <div className="text-center">
        <Spinner size="lg" className="mx-auto" />
        <p className="mt-4 text-lg font-semibold">Yuklanmoqda...</p>
      </div>
    </div>
  );
}