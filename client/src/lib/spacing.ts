/**
 * Consistent spacing utilities for mobile-first design
 * Following 8pt grid system for better visual consistency
 */

export const spacing = {
  // Page padding
  page: {
    mobile: "px-4 py-6",
    tablet: "sm:px-6 sm:py-8", 
    desktop: "lg:px-8 lg:py-10"
  },
  
  // Section spacing
  section: {
    mobile: "py-8",
    tablet: "sm:py-12",
    desktop: "lg:py-16"
  },
  
  // Card/component spacing
  card: {
    padding: "p-4 sm:p-6",
    gap: "gap-4 sm:gap-6"
  },
  
  // Form spacing
  form: {
    gap: "space-y-4 sm:space-y-6",
    inputGap: "space-y-2"
  },
  
  // Minimum touch targets
  touch: {
    min: "min-h-[44px] min-w-[44px]", // iOS minimum
    recommended: "min-h-[48px] min-w-[48px]" // Better for accessibility
  }
} as const;

/**
 * Helper function to combine spacing classes
 */
export function getSpacing(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}