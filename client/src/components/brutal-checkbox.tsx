import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";

interface BrutalCheckboxProps {
  checked: boolean;
  onChange: () => void;
  className?: string;
}

export function BrutalCheckbox({ checked, onChange, className = "" }: BrutalCheckboxProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // If we're checking the box, trigger confetti
    if (!checked) {
      // Get button position for confetti origin
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;

      // Trigger confetti animation
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { x, y },
        colors: ['#1bffbb', '#000000', '#ffffff'],
        disableForReducedMotion: true,
        ticks: 200,
        gravity: 0.8,
        scalar: 0.8
      });

      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 600);
    }
    
    onChange();
  };

  return (
    <button
      onClick={handleClick}
      className={`
        relative w-12 h-12 border-4 border-black dark:border-white
        transition-all duration-300 transform
        ${checked 
          ? 'bg-accent shadow-brutal rotate-3 scale-110' 
          : 'bg-background hover:shadow-brutal hover:scale-105'
        }
        ${isAnimating ? 'animate-bounce' : ''}
        ${className}
      `}
      style={{ 
        backgroundColor: checked ? '#1bffbb' : undefined,
        borderWidth: '4px'
      }}
    >
      {checked ? (
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Custom brutal checkmark */}
          <svg 
            width="32" 
            height="32" 
            viewBox="0 0 32 32" 
            fill="none"
            className="transform rotate-6"
          >
            <path 
              d="M6 16L12 22L26 8" 
              stroke="black" 
              strokeWidth="5" 
              strokeLinecap="square"
              strokeLinejoin="miter"
            />
          </svg>
        </div>
      ) : (
        <div className="absolute inset-1 border-2 border-black dark:border-white bg-white dark:bg-gray-900" />
      )}
      
      {/* Brutal shadow effect on hover */}
      {!checked && (
        <div className="absolute -bottom-1 -right-1 w-full h-full border-4 border-black dark:border-white -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </button>
  );
}