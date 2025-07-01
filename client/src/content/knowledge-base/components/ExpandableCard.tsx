import React, { useState } from "react";
import { AiIcon } from "@/components/ai-icon";

interface ExpandableCardProps {
  term: string;
  definition: string;
  icon?: React.ReactNode;
  examples?: string[];
}

export function ExpandableCard({ term, definition, icon, examples }: ExpandableCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="border-2 border-black mb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-6 flex items-center justify-between hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset"
        type="button"
        aria-expanded={isExpanded}
        aria-controls={`expandable-content-${term.replace(/\s+/g, '-').toLowerCase()}`}
      >
        <div className="flex items-center gap-4">
          {icon && <div>{icon}</div>}
          <h3 className="text-xl font-bold uppercase">{term}</h3>
        </div>
        <AiIcon name={isExpanded ? 'chevron-up' : 'chevron-down'} size={20} />
      </button>
      
      {isExpanded && (
        <div className="p-6 pt-0" id={`expandable-content-${term.replace(/\s+/g, '-').toLowerCase()}`}>
          <p className="text-lg mb-4">{definition}</p>
          {examples && examples.length > 0 && (
            <div className="mt-4 pt-4 border-t-2 border-gray-200">
              <p className="font-bold mb-2">MISOLLAR:</p>
              {examples.map((example, idx) => (
                <p key={idx} className="mb-2">• {example}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}