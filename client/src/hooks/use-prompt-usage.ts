import { useState, useEffect } from 'react';

const STORAGE_KEY = 'protokol57_prompt_usage';
const DAILY_LIMIT = 500;

interface PromptUsage {
  count: number;
  date: string;
  lastReset: string;
}

export function usePromptUsage() {
  const [usage, setUsage] = useState<PromptUsage>({
    count: 0,
    date: new Date().toDateString(),
    lastReset: new Date().toDateString()
  });

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data: PromptUsage = JSON.parse(saved);
        const today = new Date().toDateString();
        
        // Reset count if it's a new day
        if (data.date !== today) {
          const resetData = {
            count: 0,
            date: today,
            lastReset: today
          };
          setUsage(resetData);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(resetData));
        } else {
          setUsage(data);
        }
      }
    } catch (error) {
      console.error('Failed to load prompt usage data:', error);
    }
  }, []);

  const incrementUsage = () => {
    const today = new Date().toDateString();
    const newUsage = {
      count: usage.date === today ? usage.count + 1 : 1,
      date: today,
      lastReset: usage.date === today ? usage.lastReset : today
    };
    
    setUsage(newUsage);
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUsage));
    } catch (error) {
      console.error('Failed to save prompt usage data:', error);
    }
  };

  const canUsePrompt = () => {
    const today = new Date().toDateString();
    const currentCount = usage.date === today ? usage.count : 0;
    return currentCount < DAILY_LIMIT;
  };

  const getRemainingUsage = () => {
    const today = new Date().toDateString();
    const currentCount = usage.date === today ? usage.count : 0;
    return Math.max(0, DAILY_LIMIT - currentCount);
  };

  const getUsagePercentage = () => {
    const today = new Date().toDateString();
    const currentCount = usage.date === today ? usage.count : 0;
    return Math.min(100, (currentCount / DAILY_LIMIT) * 100);
  };

  const resetUsage = () => {
    const today = new Date().toDateString();
    const resetData = {
      count: 0,
      date: today,
      lastReset: today
    };
    setUsage(resetData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resetData));
  };

  return {
    usage: usage.date === new Date().toDateString() ? usage.count : 0,
    limit: DAILY_LIMIT,
    canUsePrompt,
    getRemainingUsage,
    getUsagePercentage,
    incrementUsage,
    resetUsage
  };
}