/**
 * Theme-aware class mappings for consistent dark mode support
 * Use these instead of hardcoded color classes
 */

export const themeClasses = {
  // Backgrounds
  bgPrimary: 'bg-background',          // Instead of bg-white
  bgSecondary: 'bg-secondary',         // Instead of bg-gray-100
  bgCard: 'bg-card',                   // For card backgrounds
  bgInverse: 'bg-primary',             // Instead of bg-black
  bgMuted: 'bg-muted',                 // Instead of bg-gray-50
  
  // Text
  textPrimary: 'text-foreground',      // Instead of text-black
  textSecondary: 'text-muted-foreground', // Instead of text-gray-600
  textInverse: 'text-primary-foreground',  // Instead of text-white
  
  // Borders
  borderPrimary: 'border-border',      // Instead of border-black
  borderSecondary: 'border-secondary', // Instead of border-gray-200
  
  // Interactive states
  hoverBg: 'hover:bg-secondary',       // Instead of hover:bg-gray-100
  hoverText: 'hover:text-foreground',  // Instead of hover:text-black
} as const;

// Utility function to replace hardcoded classes
export function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ');
}