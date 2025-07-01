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
    <div className="border-2 border-black mb-6">
      <div className="bg-black text-white p-4">
        <h4 className="font-bold uppercase">{title}</h4>
      </div>
      
      <div className="p-6">
        {/* Bad Example */}
        <div className={showGood ? 'opacity-50' : ''}>
          <div className="flex items-center gap-2 mb-2">
            <AiIcon name="close" size={16} />
            <span className="font-bold">YOMON MISOL</span>
          </div>
          <pre className="bg-gray-50 border-2 border-black p-4 font-mono text-sm overflow-x-auto whitespace-pre-wrap">
            {badExample}
          </pre>
        </div>
        
        {/* Toggle Button */}
        <button
          onClick={() => setShowGood(!showGood)}
          className="my-4 px-4 py-2 border-2 border-black font-bold hover:bg-gray-50"
        >
          {showGood ? 'YOMON MISOLNI KO\'RISH' : 'YAXSHI MISOLNI KO\'RISH'}
        </button>
        
        {/* Good Example */}
        <div className={!showGood ? 'opacity-50' : ''}>
          <div className="flex items-center gap-2 mb-2">
            <AiIcon name="checked" size={16} />
            <span className="font-bold">YAXSHI MISOL</span>
          </div>
          <pre className="bg-gray-50 border-2 border-black p-4 font-mono text-sm overflow-x-auto whitespace-pre-wrap">
            {goodExample}
          </pre>
        </div>
        
        {/* Explanation */}
        <div className="mt-6 p-4 bg-gray-50 border-2 border-black">
          <p>{explanation}</p>
        </div>
      </div>
    </div>
  );
}