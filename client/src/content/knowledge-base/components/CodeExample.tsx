import React, { useState } from "react";
import { AiIcon } from "@/components/ai-icon";

interface CodeExampleProps {
  title: string;
  badExample: string;
  goodExample: string;
  explanation: string;
}

export function CodeExample({ title, badExample, goodExample, explanation }: CodeExampleProps) {
  const [showGood, setShowGood] = useState(false);
  
  return (
    <div className="border-2 border-black mb-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <div className="bg-black p-6">
        <h4 className="text-xl font-black uppercase text-white tracking-tight">{title}</h4>
      </div>
      
      <div className="p-8">
        {/* Bad Example */}
        <div className={showGood ? 'opacity-50' : ''}>
          <div className="flex items-center gap-2 mb-2">
            <AiIcon name="close" size={16} className="text-black" />
            <span className="font-black uppercase">YOMON MISOL</span>
          </div>
          <pre className="bg-white border-2 border-black p-6 font-mono text-sm overflow-x-auto whitespace-pre-wrap text-black">
            {badExample}
          </pre>
        </div>
        
        {/* Toggle Button */}
        <button
          onClick={() => setShowGood(!showGood)}
          className="my-6 px-6 py-3 h-12 border-2 border-black font-black uppercase bg-white hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
        >
          {showGood ? 'YOMON MISOLNI KO\'RISH' : 'YAXSHI MISOLNI KO\'RISH'}
        </button>
        
        {/* Good Example */}
        <div className={!showGood ? 'opacity-50' : ''}>
          <div className="flex items-center gap-2 mb-2">
            <AiIcon name="checked" size={16} className="text-[#ffeb3b]" />
            <span className="font-black uppercase">YAXSHI MISOL</span>
          </div>
          <pre className="bg-white border-2 border-black p-6 font-mono text-sm overflow-x-auto whitespace-pre-wrap text-black">
            {goodExample}
          </pre>
        </div>
        
        {/* Explanation */}
        <div className="mt-8 p-6 bg-black text-white border-2 border-black">
          <p className="text-white font-black uppercase">{explanation}</p>
        </div>
      </div>
    </div>
  );
}