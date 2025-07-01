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
    <div className="border-2 border-black mb-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-6 flex items-center justify-between hover:bg-white hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
        type="button"
        aria-expanded={isExpanded}
        aria-controls={`expandable-content-${term.replace(/\s+/g, '-').toLowerCase()}`}
      >
        <div className="flex items-center gap-4">
          {icon && <div>{icon}</div>}
          <h3 className="text-2xl font-black uppercase text-black tracking-tight">{term}</h3>
        </div>
        <AiIcon name={isExpanded ? 'chevron-up' : 'chevron-down'} size={24} />
      </button>
      
      {isExpanded && (
        <div className="p-6 pt-0" id={`expandable-content-${term.replace(/\s+/g, '-').toLowerCase()}`}>
          <p className="text-base mb-4 text-black leading-relaxed">{definition}</p>
          {examples && examples.length > 0 && (
            <div className="mt-4 pt-4 border-t-2 border-black">
              <p className="font-black mb-3 text-black uppercase">MISOLLAR:</p>
              {examples.map((example, idx) => (
                <p key={idx} className="mb-2 text-black text-sm">• {example}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}