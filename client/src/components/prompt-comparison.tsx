import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PromptExample {
  bad: string;
  good: string;
}

const promptExamples: PromptExample[] = [
  {
    bad: "Bu g'oya yaxshimi?",
    good: "Avval g'oyamning 3 ta kuchli tomonini, keyin investor nuqtai nazaridan 3 ta zaif tomonini tanqid qil"
  },
  {
    bad: "Biznesni qanday boshlash kerak?",
    good: "5000 dollar va haftada 10 soat vaqt bilan onlayn biznes boshlash uchun 3 ta variant"
  },
  {
    bad: "Mijoz bilan qanday gaplashish kerak?",
    good: "Yangi mijoz bilan birinchi qo'ng'iroq uchun SOP yoz: 10 qadam, har birida aniq gaplar va maqsad"
  }
];

export default function PromptComparison() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % promptExamples.length);
    }, 4000); // Change every 4 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mb-12 max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
          Har bir protokol yaxshi va yomon misollar bilan.
        </h2>
        <div className="w-24 h-1 bg-accent mx-auto"></div>
      </div>
      
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-none p-8 border border-gray-800">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Bad Example */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center mr-3">
                <span className="text-red-400 text-xl">❌</span>
              </div>
              <h3 className="text-lg font-semibold text-red-400">Yomon misol</h3>
            </div>
            <div className="bg-gray-900 rounded-none p-6 border border-red-500/20 min-h-[120px] flex items-center">
              <AnimatePresence mode="wait">
                <motion.p
                  key={`bad-${currentIndex}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="text-gray-300 text-base leading-relaxed"
                >
                  "{promptExamples[currentIndex].bad}"
                </motion.p>
              </AnimatePresence>
            </div>
          </div>

          {/* Good Example */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center mr-3">
                <span className="text-green-400 text-xl">✅</span>
              </div>
              <h3 className="text-lg font-semibold text-green-400">Yaxshi misol</h3>
            </div>
            <div className="bg-gray-900 rounded-none p-6 border border-green-500/20 min-h-[120px] flex items-center">
              <AnimatePresence mode="wait">
                <motion.p
                  key={`good-${currentIndex}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-gray-300 text-base leading-relaxed"
                >
                  "{promptExamples[currentIndex].good}"
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Progress Indicators */}
        <div className="flex justify-center mt-8 space-x-2">
          {promptExamples.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex ? 'bg-accent w-8' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}