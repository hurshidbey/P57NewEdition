import { useState, useEffect } from 'react';

const STORAGE_KEY = 'protokol57_progress';

export interface ProgressData {
  completedProtocols: Set<number>;
  totalProtocols: number;
  completionPercentage: number;
  lastStudiedDate: string | null;
  currentStreak: number;
}

export interface ProtocolProgress {
  protocolId: number;
  completedAt: string;
  practiceCount: number;
}

interface StoredProgress {
  completed: ProtocolProgress[];
  lastStudiedDate: string | null;
  currentStreak: number;
}

export function useProgress() {
  const [protocolProgress, setProtocolProgress] = useState<Map<number, ProtocolProgress>>(new Map());
  const [lastStudiedDate, setLastStudiedDate] = useState<string | null>(null);
  const [currentStreak, setCurrentStreak] = useState(0);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data: StoredProgress = JSON.parse(saved);
        const progressMap = new Map(
          data.completed.map(p => [p.protocolId, p])
        );
        setProtocolProgress(progressMap);
        setLastStudiedDate(data.lastStudiedDate || null);
        setCurrentStreak(data.currentStreak || 0);
      }
    } catch (error) {
      console.error('Failed to load progress data:', error);
    }
  }, []);

  // Save to localStorage whenever progress changes
  useEffect(() => {
    try {
      const dataToStore: StoredProgress = {
        completed: Array.from(protocolProgress.values()),
        lastStudiedDate,
        currentStreak
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
    } catch (error) {
      console.error('Failed to save progress data:', error);
    }
  }, [protocolProgress, lastStudiedDate, currentStreak]);

  const updateStreak = () => {
    const today = new Date().toDateString();
    const lastDate = lastStudiedDate ? new Date(lastStudiedDate).toDateString() : null;
    
    if (lastDate === today) {
      // Already studied today, no change
      return;
    }
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (lastDate === yesterday.toDateString()) {
      // Studied yesterday, increment streak
      setCurrentStreak(prev => prev + 1);
    } else {
      // Streak broken, start new
      setCurrentStreak(1);
    }
    
    setLastStudiedDate(new Date().toISOString());
  };

  const markProtocolCompleted = (protocolId: number) => {
    setProtocolProgress(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(protocolId);
      
      if (existing) {
        // Update practice count
        newMap.set(protocolId, {
          ...existing,
          practiceCount: existing.practiceCount + 1,
          completedAt: new Date().toISOString()
        });
      } else {
        // First time completion
        newMap.set(protocolId, {
          protocolId,
          completedAt: new Date().toISOString(),
          practiceCount: 1
        });
      }
      
      return newMap;
    });
    
    updateStreak();
  };

  const isProtocolCompleted = (protocolId: number) => {
    return protocolProgress.has(protocolId);
  };

  const getProtocolProgress = (protocolId: number) => {
    return protocolProgress.get(protocolId) || null;
  };

  const getProgressData = (totalProtocols: number): ProgressData => {
    const completedSet = new Set(protocolProgress.keys());
    const completed = completedSet.size;
    
    return {
      completedProtocols: completedSet,
      totalProtocols,
      completionPercentage: totalProtocols > 0 ? Math.round((completed / totalProtocols) * 100) : 0,
      lastStudiedDate,
      currentStreak
    };
  };

  const resetProgress = () => {
    setProtocolProgress(new Map());
    setLastStudiedDate(null);
    setCurrentStreak(0);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    markProtocolCompleted,
    isProtocolCompleted,
    getProtocolProgress,
    getProgressData,
    resetProgress
  };
}