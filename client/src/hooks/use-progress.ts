import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { apiRequest } from '@/lib/queryClient';

const STORAGE_KEY = 'protokol57_progress';

// Debug function
const debugProgress = (action: string, data: any) => {
  console.log(`🔍 Progress Debug [${action}]:`, data);
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
      debugProgress('loadProgress called', { userId: user?.id, loading });
      
      // ALWAYS load from localStorage first for immediate UI updates
      loadFromLocalStorage();
      
      if (!user) {
        debugProgress('no user, setting loading false', {});
        setLoading(false);
        return;
      }

      try {
        debugProgress('attempting server load', { userId: user.id });
        const response = await apiRequest('GET', `/api/progress/${user.id}`);
        const serverProgress: ServerProgress[] = await response.json();
        
        debugProgress('server response', { length: serverProgress?.length });
        
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

          debugProgress('server data loaded', { protocolCount: progressMap.size });
          setProtocolProgress(progressMap);
          setLastStudiedDate(lastDate);
          calculateStreak(progressMap);
        }
      } catch (error) {
        console.warn('Server progress unavailable, using localStorage:', error.message);
        debugProgress('server load failed', { error: error.message });
        // localStorage already loaded above, so we're good
      } finally {
        setLoading(false);
        debugProgress('loading set to false', {});
      }
    }

    loadProgress();
  }, [user?.id]); // Only depend on user.id, not the whole user object

  // Load from localStorage (fallback)
  const loadFromLocalStorage = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      debugProgress('localStorage read', { saved: !!saved, length: saved?.length });
      
      if (saved) {
        const data: StoredProgress = JSON.parse(saved);
        const progressMap = new Map(
          data.completed.map(p => [p.protocolId, p])
        );
        debugProgress('localStorage loaded', { 
          completed: data.completed.length, 
          protocols: Array.from(progressMap.keys()),
          streak: data.currentStreak 
        });
        
        setProtocolProgress(progressMap);
        setLastStudiedDate(data.lastStudiedDate || null);
        setCurrentStreak(data.currentStreak || 0);
      } else {
        debugProgress('localStorage empty', {});
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
      
      debugProgress('localStorage save', { 
        completed: dataToStore.completed.length,
        protocols: dataToStore.completed.map(p => p.protocolId),
        streak: dataToStore.currentStreak
      });
      
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
    debugProgress('markProtocolCompleted called', { protocolId, score, user: !!user });
    
    // ALWAYS update local state first for immediate feedback
    setProtocolProgress(prev => {
      const newMap = new Map(prev);
      
      debugProgress('before protocol set', { 
        currentSize: newMap.size, 
        hasProtocol: newMap.has(protocolId),
        allProtocols: Array.from(newMap.keys()) 
      });
      
      // Simple: just mark as completed
      newMap.set(protocolId, {
        protocolId,
        completedAt: new Date().toISOString(),
        practiceCount: 1,
        lastScore: score
      });
      
      debugProgress('after protocol set', { 
        newSize: newMap.size, 
        addedProtocol: protocolId,
        allProtocols: Array.from(newMap.keys()) 
      });
      
      calculateStreak(newMap);
      return newMap;
    });
    
    setLastStudiedDate(new Date().toISOString());

    // Try to sync with server in background (don't block UI)
    if (user) {
      try {
        await apiRequest('POST', `/api/progress/${user.id}/${protocolId}`, { score });
        debugProgress('server sync success', { protocolId });
      } catch (error) {
        console.error('Failed to sync progress to server:', error);
        debugProgress('server sync failed', { protocolId, error: error.message });
        // Progress is already saved locally, so this is okay
      }
    } else {
      debugProgress('no user for server sync', {});
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
    
    debugProgress('getProgressData called', { 
      completed,
      totalProtocols,
      percentage,
      protocols: Array.from(completedSet),
      mapSize: protocolProgress.size
    });
    
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