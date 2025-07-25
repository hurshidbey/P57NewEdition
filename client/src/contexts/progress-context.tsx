import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { apiRequest } from '@/lib/queryClient';

const getStorageKey = (userId: string | null) => {
  return userId ? `protokol57_progress_${userId}` : 'protokol57_progress_anonymous';
};

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
  lastScore?: number;
}

interface ServerProgress {
  id: number;
  userId: string;
  protocolId: number;
  completedAt: string;
  practiceCount: number;
  lastScore: number | null;
}

interface StoredProgress {
  completed: ProtocolProgress[];
  lastStudiedDate: string | null;
  currentStreak: number;
}

interface ProgressContextValue {
  markProtocolCompleted: (protocolId: number, score?: number) => Promise<void>;
  toggleProtocolCompleted: (protocolId: number, score?: number) => Promise<void>;
  isProtocolCompleted: (protocolId: number) => boolean;
  getProtocolProgress: (protocolId: number) => ProtocolProgress | null;
  getProgressData: (totalProtocols: number) => ProgressData;
  resetProgress: () => void;
  loading: boolean;
  error: Error | null;
}

const ProgressContext = createContext<ProgressContextValue | undefined>(undefined);

export const useProgressContext = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgressContext must be used within a ProgressProvider');
  }
  return context;
};

interface ProgressProviderProps {
  children: ReactNode;
}

export function ProgressProvider({ children }: ProgressProviderProps) {
  const [protocolProgress, setProtocolProgress] = useState<Map<number, ProtocolProgress>>(new Map());
  const [lastStudiedDate, setLastStudiedDate] = useState<string | null>(null);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  // Calculate streak based on progress data
  const calculateStreak = useCallback((progressMap: Map<number, ProtocolProgress>) => {
    if (progressMap.size === 0) {
      setCurrentStreak(0);
      return;
    }

    const dates = Array.from(progressMap.values())
      .map(p => new Date(p.completedAt).toDateString())
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    const uniqueDates = Array.from(new Set(dates));
    let streak = 0;
    
    for (let i = 0; i < uniqueDates.length; i++) {
      const date = uniqueDates[i];
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - i);
      
      if (date === expectedDate.toDateString()) {
        streak++;
      } else {
        break;
      }
    }
    
    setCurrentStreak(streak);
  }, []);

  // Load from localStorage
  const loadFromLocalStorage = useCallback(() => {
    try {
      const storageKey = getStorageKey(user?.id || null);
      const saved = localStorage.getItem(storageKey);
      
      if (saved) {
        const data: StoredProgress = JSON.parse(saved);
        const progressMap = new Map(
          data.completed.map(p => [p.protocolId, p])
        );

        setProtocolProgress(progressMap);
        setLastStudiedDate(data.lastStudiedDate || null);
        setCurrentStreak(data.currentStreak || 0);
      } else {
        // No saved data - initialize empty state
        console.log('🆕 [Progress] No saved progress found, initializing empty state');
        setProtocolProgress(new Map());
        setLastStudiedDate(null);
        setCurrentStreak(0);
      }
    } catch (err) {
      console.error('[Progress] Error loading from localStorage:', err);
      // Initialize with empty state on error
      setProtocolProgress(new Map());
      setLastStudiedDate(null);
      setCurrentStreak(0);
      setError(new Error('Failed to load progress from storage'));
    }
  }, [user?.id]);

  // Save to localStorage
  const saveToLocalStorage = useCallback(() => {
    try {
      const storageKey = getStorageKey(user?.id || null);
      const dataToStore: StoredProgress = {
        completed: Array.from(protocolProgress.values()),
        lastStudiedDate,
        currentStreak
      };
      
      localStorage.setItem(storageKey, JSON.stringify(dataToStore));
    } catch (err) {
      setError(new Error('Failed to save progress to storage'));
    }
  }, [protocolProgress, lastStudiedDate, currentStreak, user?.id]);

  // Load progress from server when user is available
  useEffect(() => {
    async function loadProgress() {
      setLoading(true);
      setError(null);
      
      // Always load from localStorage first for immediate UI updates
      loadFromLocalStorage();
      
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Clear any stale localStorage data from other users first
        const currentStorageKey = getStorageKey(user.id);
        const allKeys = Object.keys(localStorage);
        const progressKeys = allKeys.filter(key => 
          key.startsWith('protokol57_progress_') && key !== currentStorageKey
        );
        progressKeys.forEach(key => {
          console.log(`🧹 [Progress] Clearing stale progress data: ${key}`);
          localStorage.removeItem(key);
        });
        
        const response = await apiRequest('GET', `/api/progress/${user.id}`);
        const serverProgress: ServerProgress[] = await response.json();

        // Only update if server has data
        if (serverProgress && serverProgress.length > 0) {
          const progressMap = new Map<number, ProtocolProgress>();
          let lastDate: string | null = null;
          
          serverProgress.forEach(progress => {
            progressMap.set(progress.protocolId, {
              protocolId: progress.protocolId,
              completedAt: progress.completedAt,
              practiceCount: progress.practiceCount,
              lastScore: progress.lastScore || undefined
            });
            
            if (!lastDate || new Date(progress.completedAt) > new Date(lastDate)) {
              lastDate = progress.completedAt;
            }
          });

          setProtocolProgress(progressMap);
          setLastStudiedDate(lastDate);
          calculateStreak(progressMap);
        }
      } catch (err) {
        setError(new Error('Failed to load progress from server'));
        // localStorage already loaded above, so we're good
      } finally {
        setLoading(false);
      }
    }

    loadProgress();
  }, [user?.id, loadFromLocalStorage, calculateStreak]);

  // Save to localStorage when data changes
  useEffect(() => {
    if (!loading) {
      saveToLocalStorage();
    }
  }, [protocolProgress, lastStudiedDate, currentStreak, loading, saveToLocalStorage]);

  // Clean up old shared progress data when user logs in
  useEffect(() => {
    if (user?.id) {
      const oldSharedKey = 'protokol57_progress';
      if (localStorage.getItem(oldSharedKey)) {
        localStorage.removeItem(oldSharedKey);
      }
    }
  }, [user?.id]);

  const markProtocolCompleted = useCallback(async (protocolId: number, score: number = 70) => {
    const newProgress: ProtocolProgress = {
      protocolId,
      completedAt: new Date().toISOString(),
      practiceCount: 1,
      lastScore: score
    };

    // Update state
    const newProgressMap = new Map(protocolProgress);
    newProgressMap.set(protocolId, newProgress);
    
    setProtocolProgress(newProgressMap);
    setLastStudiedDate(newProgress.completedAt);
    calculateStreak(newProgressMap);

    // Try to sync with server in background
    if (user) {
      try {
        await apiRequest('POST', `/api/progress/${user.id}/${protocolId}`, { score });
      } catch (err) {
        // Progress is already saved locally, so this is okay
      }
    }
  }, [protocolProgress, user, calculateStreak]);

  const toggleProtocolCompleted = useCallback(async (protocolId: number, score: number = 70) => {
    const isCurrentlyCompleted = protocolProgress.has(protocolId);
    
    if (isCurrentlyCompleted) {
      // Remove protocol from completed
      const newProgress = new Map(protocolProgress);
      newProgress.delete(protocolId);
      setProtocolProgress(newProgress);
      
      // Recalculate streak
      calculateStreak(newProgress);
      
      // Also remove from server
      if (user) {
        try {
          await apiRequest('DELETE', `/api/progress/${user.id}/${protocolId}`);
        } catch (err) {
          // Local removal still worked, so don't block user
        }
      }
    } else {
      // Mark as completed
      await markProtocolCompleted(protocolId, score);
    }
  }, [protocolProgress, user, calculateStreak, markProtocolCompleted]);

  const isProtocolCompleted = useCallback((protocolId: number) => {
    return protocolProgress.has(protocolId);
  }, [protocolProgress]);

  const getProtocolProgress = useCallback((protocolId: number) => {
    return protocolProgress.get(protocolId) || null;
  }, [protocolProgress]);

  const getProgressData = useCallback((totalProtocols: number): ProgressData => {
    const completedSet = new Set(protocolProgress.keys());
    const completed = completedSet.size;
    const percentage = totalProtocols > 0 ? Math.round((completed / totalProtocols) * 100) : 0;
    
    return {
      completedProtocols: completedSet,
      totalProtocols,
      completionPercentage: percentage,
      lastStudiedDate,
      currentStreak
    };
  }, [protocolProgress, lastStudiedDate, currentStreak]);

  const resetProgress = useCallback(() => {
    setProtocolProgress(new Map());
    setLastStudiedDate(null);
    setCurrentStreak(0);
    const storageKey = getStorageKey(user?.id || null);
    localStorage.removeItem(storageKey);
  }, [user?.id]);

  const value: ProgressContextValue = {
    markProtocolCompleted,
    toggleProtocolCompleted,
    isProtocolCompleted,
    getProtocolProgress,
    getProgressData,
    resetProgress,
    loading,
    error
  };

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
}