import React from "react";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";

interface BrutalButtonProps {
  checked: boolean;
  onChange: () => void;
  checkedText: string;
  uncheckedText: string;
  className?: string;
  showConfetti?: boolean;
  disabled?: boolean;
}

export function BrutalButton({ 
  checked, 
  onChange, 
  checkedText, 
  uncheckedText, 
  className = "",
  showConfetti = true,
  disabled = false
}: BrutalButtonProps) {
  
  const handleClick = () => {
    if (disabled) return;
    
    // Trigger confetti only when marking as complete (unchecked to checked)
    if (!checked && showConfetti) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#1bffbb', '#000000', '#ffffff'],
        disableForReducedMotion: true,
        ticks: 200,
        gravity: 1,
        scalar: 1.2
      });
    }
    onChange();
  };

  return (
    <Button 
      onClick={handleClick}
      disabled={disabled}
      className={`font-black uppercase px-8 py-3 h-[56px] border-4 border-theme transition-all duration-300 transform touch-manipulation ${
        disabled 
          ? 'opacity-50 cursor-not-allowed'
          : checked
            ? 'bg-background hover:bg-secondary text-foreground hover:shadow-brutal hover:scale-105 hover:-rotate-1'
            : 'bg-accent text-accent-foreground hover:shadow-brutal hover:scale-105 hover:rotate-1'
      } ${className}`}
      style={{ 
        backgroundColor: disabled ? '#ccc' : (checked ? undefined : '#1bffbb'),
        borderWidth: '4px'
      }}
    >
      {checked ? (
        <span className="flex items-center gap-2">
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none"
            className="transform -rotate-12"
          >
            <path 
              d="M4 4L20 20M20 4L4 20" 
              stroke="currentColor" 
              strokeWidth="4" 
              strokeLinecap="square"
            />
          </svg>
          {checkedText}
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 32 32" 
            fill="none"
            className="transform rotate-6"
          >
            <path 
              d="M6 16L12 22L26 8" 
              stroke="currentColor" 
              strokeWidth="5" 
              strokeLinecap="square"
              strokeLinejoin="miter"
            />
          </svg>
          {uncheckedText}
        </span>
      )}
    </Button>
  );
}