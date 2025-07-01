import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AiIcon } from "@/components/ai-icon";

interface InteractivePromptProps {
  title: string;
  placeholder?: string;
  initialBadExample?: string;
  initialGoodExample?: string;
}

export function InteractivePrompt({ 
  title, 
  placeholder = "Yozing...",
  initialBadExample = "",
  initialGoodExample = ""
}: InteractivePromptProps) {
  const [badPrompt, setBadPrompt] = useState(initialBadExample);
  const [goodPrompt, setGoodPrompt] = useState(initialGoodExample);
  const [showComparison, setShowComparison] = useState(false);

  return (
    <Card className="border-2 border-black">
      <div className="bg-black text-white p-4">
        <h4 className="font-bold uppercase">{title}</h4>
      </div>
      
      <CardContent className="p-6 space-y-4">
        {/* Bad Example */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <AiIcon name="close" size={16} />
            <span className="font-bold">YOMON MISOL</span>
          </div>
          <textarea
            value={badPrompt}
            onChange={(e) => setBadPrompt(e.target.value)}
            placeholder={placeholder}
            className="w-full min-h-[100px] p-4 border-2 border-black text-gray-900 placeholder:text-gray-500 bg-white focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 resize-none"
          />
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setShowComparison(!showComparison)}
          className="w-full px-4 py-2 border-2 border-black font-bold hover:bg-gray-50 transition-colors"
        >
          {showComparison ? 'YOPISH' : 'TAQQOSLASH'}
        </button>

        {/* Good Example */}
        {showComparison && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <AiIcon name="checked" size={16} />
              <span className="font-bold">YAXSHI MISOL</span>
            </div>
            <textarea
              value={goodPrompt}
              onChange={(e) => setGoodPrompt(e.target.value)}
              placeholder={placeholder}
              className="w-full min-h-[100px] p-4 border-2 border-black text-gray-900 placeholder:text-gray-500 bg-white focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 resize-none"
            />
          </div>
        )}

        {/* Info Box */}
        <div className="mt-4 p-4 bg-gray-50 border-2 border-gray-300">
          <p className="text-sm text-gray-700">
            Yaxshi prompt aniq kontekst, maqsad va kutilgan natijani o'z ichiga oladi.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}