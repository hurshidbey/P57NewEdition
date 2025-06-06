import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { apiRequest } from '@/lib/queryClient';

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

export function useProgress() {
  const [protocolProgress, setProtocolProgress] = useState<Map<number, ProtocolProgress>>(new Map());
  const [lastStudiedDate, setLastStudiedDate] = useState<string | null>(null);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Load progress from server when user is available
  useEffect(() => {
    async function loadProgress() {
      if (!user) {
        // Load from localStorage if no user
        loadFromLocalStorage();
        setLoading(false);
        return;
      }

      try {
        const response = await apiRequest('GET', `/api/progress/${user.id}`);
        const serverProgress: ServerProgress[] = await response.json();
        
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
      } catch (error) {
        console.error('Failed to load progress from server:', error);
        // Fallback to localStorage
        loadFromLocalStorage();
      } finally {
        setLoading(false);
      }
    }

    loadProgress();
  }, [user]);

  // Load from localStorage (fallback)
  const loadFromLocalStorage = () => {
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
      console.error('Failed to load progress data from localStorage:', error);
    }
  };

  // Save to localStorage (backup)
  useEffect(() => {
    if (loading) return;
    
    try {
      const dataToStore: StoredProgress = {
        completed: Array.from(protocolProgress.values()),
        lastStudiedDate,
        currentStreak
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
    } catch (error) {
      console.error('Failed to save progress data to localStorage:', error);
    }
  }, [protocolProgress, lastStudiedDate, currentStreak, loading]);

  // Calculate streak based on progress data
  const calculateStreak = (progressMap: Map<number, ProtocolProgress>) => {
    if (progressMap.size === 0) {
      setCurrentStreak(0);
      return;
    }

    const dates = Array.from(progressMap.values())
      .map(p => new Date(p.completedAt).toDateString())
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    const uniqueDates = Array.from(new Set(dates));
    let streak = 0;
    const today = new Date().toDateString();
    
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
  };

  const markProtocolCompleted = async (protocolId: number, score: number = 70) => {
    if (!user) {
      // Fallback to localStorage for non-authenticated users
      setProtocolProgress(prev => {
        const newMap = new Map(prev);
        const existing = newMap.get(protocolId);
        
        if (existing) {
          newMap.set(protocolId, {
            ...existing,
            practiceCount: existing.practiceCount + 1,
            completedAt: new Date().toISOString(),
            lastScore: score
          });
        } else {
          newMap.set(protocolId, {
            protocolId,
            completedAt: new Date().toISOString(),
            practiceCount: 1,
            lastScore: score
          });
        }
        
        return newMap;
      });
      
      setLastStudiedDate(new Date().toISOString());
      return;
    }

    try {
      // Update on server
      await apiRequest('POST', `/api/progress/${user.id}/${protocolId}`, { score });
      
      // Update local state
      setProtocolProgress(prev => {
        const newMap = new Map(prev);
        const existing = newMap.get(protocolId);
        
        if (existing) {
          newMap.set(protocolId, {
            ...existing,
            practiceCount: existing.practiceCount + 1,
            completedAt: new Date().toISOString(),
            lastScore: score
          });
        } else {
          newMap.set(protocolId, {
            protocolId,
            completedAt: new Date().toISOString(),
            practiceCount: 1,
            lastScore: score
          });
        }
        
        calculateStreak(newMap);
        return newMap;
      });
      
      setLastStudiedDate(new Date().toISOString());
    } catch (error) {
      console.error('Failed to update progress on server:', error);
      // Still update locally as fallback
      setProtocolProgress(prev => {
        const newMap = new Map(prev);
        const existing = newMap.get(protocolId);
        
        if (existing) {
          newMap.set(protocolId, {
            ...existing,
            practiceCount: existing.practiceCount + 1,
            completedAt: new Date().toISOString(),
            lastScore: score
          });
        } else {
          newMap.set(protocolId, {
            protocolId,
            completedAt: new Date().toISOString(),
            practiceCount: 1,
            lastScore: score
          });
        }
        
        return newMap;
      });
    }
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
    resetProgress,
    loading
  };
}