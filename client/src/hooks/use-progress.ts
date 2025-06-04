import { useState, useEffect } from 'react';

const STORAGE_KEY = 'protokol57_progress';

export interface ProgressData {
  completedProtocols: Set<number>;
  totalProtocols: number;
  completionPercentage: number;
}

export function useProgress() {
  const [completedProtocols, setCompletedProtocols] = useState<Set<number>>(new Set());

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        setCompletedProtocols(new Set(data.completed || []));
      }
    } catch (error) {
      console.error('Failed to load progress data:', error);
    }
  }, []);

  // Save to localStorage whenever completedProtocols changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        completed: Array.from(completedProtocols),
        lastUpdated: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to save progress data:', error);
    }
  }, [completedProtocols]);

  const toggleProtocolCompletion = (protocolId: number) => {
    setCompletedProtocols(prev => {
      const newSet = new Set(prev);
      if (newSet.has(protocolId)) {
        newSet.delete(protocolId);
      } else {
        newSet.add(protocolId);
      }
      return newSet;
    });
  };

  const isProtocolCompleted = (protocolId: number) => {
    return completedProtocols.has(protocolId);
  };

  const getProgressData = (totalProtocols: number): ProgressData => {
    const completed = completedProtocols.size;
    return {
      completedProtocols,
      totalProtocols,
      completionPercentage: totalProtocols > 0 ? Math.round((completed / totalProtocols) * 100) : 0
    };
  };

  const resetProgress = () => {
    setCompletedProtocols(new Set());
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    completedProtocols,
    toggleProtocolCompletion,
    isProtocolCompleted,
    getProgressData,
    resetProgress
  };
}