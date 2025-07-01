import { useState, useEffect, useRef, useCallback } from 'react';
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

export function useProgress() {
  const [protocolProgress, setProtocolProgress] = useState<Map<number, ProtocolProgress>>(new Map());
  const [lastStudiedDate, setLastStudiedDate] = useState<string | null>(null);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Load progress from server when user is available
  useEffect(() => {
    async function loadProgress() {
      // ALWAYS load from localStorage first for immediate UI updates
      loadFromLocalStorage();
      
      if (!user) {
        setLoading(false);
        return;
      }

      // 🔍 Debug logging for Google Auth users
      console.log(`🔍 [DEBUG] Loading progress for user: ${user.id} (${user.email})`);
      console.log(`🔍 [DEBUG] Expected localStorage key: ${getStorageKey(user.id)}`);

      try {
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
      } catch (error) {

        // localStorage already loaded above, so we're good
      } finally {
        setLoading(false);
      }
    }

    loadProgress();
  }, [user?.id]); // Only depend on user.id, not the whole user object

  // Clean up old shared progress data when user logs in
  useEffect(() => {
    if (user?.id) {
      // Remove the old shared storage key if it exists
      const oldSharedKey = 'protokol57_progress';
      if (localStorage.getItem(oldSharedKey)) {

        localStorage.removeItem(oldSharedKey);
      }
    }
  }, [user?.id]);

  // Load from localStorage (fallback)
  const loadFromLocalStorage = () => {
    try {
      const storageKey = getStorageKey(user?.id || null);
      const saved = localStorage.getItem(storageKey);
      
      // 🔍 Debug logging

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

    }
  };

  // Save to localStorage (backup)
  useEffect(() => {
    if (loading) return;
    
    try {
      const storageKey = getStorageKey(user?.id || null);
      const dataToStore: StoredProgress = {
        completed: Array.from(protocolProgress.values()),
        lastStudiedDate,
        currentStreak
      };
      
      localStorage.setItem(storageKey, JSON.stringify(dataToStore));
    } catch (error) {

    }
  }, [protocolProgress, lastStudiedDate, currentStreak, loading, user?.id]);

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
    // 🔍 Debug logging

    // Create the new progress entry
    const newProgress: ProtocolProgress = {
      protocolId,
      completedAt: new Date().toISOString(),
      practiceCount: 1,
      lastScore: score
    };

    const newDate = new Date().toISOString();

    // First, read current localStorage to merge with existing data
    let existingProgress: ProtocolProgress[] = [];
    try {
      const storageKey = getStorageKey(user?.id || null);
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const data = JSON.parse(saved) as StoredProgress;
        existingProgress = data.completed || [];
      }
    } catch (error) {

    }

    // Merge new progress with existing (avoiding duplicates)
    const progressMap = new Map(existingProgress.map(p => [p.protocolId, p]));
    progressMap.set(protocolId, newProgress);
    
    // Calculate streak with the updated map
    const uniqueDates = Array.from(progressMap.values())
      .map(p => new Date(p.completedAt).toDateString())
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    const uniqueDateSet = Array.from(new Set(uniqueDates));
    let streak = 0;
    
    for (let i = 0; i < uniqueDateSet.length; i++) {
      const date = uniqueDateSet[i];
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - i);
      
      if (date === expectedDate.toDateString()) {
        streak++;
      } else {
        break;
      }
    }

    // Save to localStorage immediately with all data
    const dataToStore: StoredProgress = {
      completed: Array.from(progressMap.values()),
      lastStudiedDate: newDate,
      currentStreak: streak
    };
    
    try {
      const storageKey = getStorageKey(user?.id || null);

      localStorage.setItem(storageKey, JSON.stringify(dataToStore));
    } catch (error) {

    }

    // Update React state
    setProtocolProgress(progressMap);
    setLastStudiedDate(newDate);
    setCurrentStreak(streak);

    // Try to sync with server in background (don't block UI)
    if (user) {
      try {
        await apiRequest('POST', `/api/progress/${user.id}/${protocolId}`, { score });
      } catch (error) {

        // Progress is already saved locally, so this is okay
      }
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
    const percentage = totalProtocols > 0 ? Math.round((completed / totalProtocols) * 100) : 0;
    
    return {
      completedProtocols: completedSet,
      totalProtocols,
      completionPercentage: percentage,
      lastStudiedDate,
      currentStreak
    };
  };

  const resetProgress = () => {
    setProtocolProgress(new Map());
    setLastStudiedDate(null);
    setCurrentStreak(0);
    const storageKey = getStorageKey(user?.id || null);
    localStorage.removeItem(storageKey);
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