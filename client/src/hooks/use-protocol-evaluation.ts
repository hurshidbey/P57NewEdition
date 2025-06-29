import { useState, useEffect } from 'react';
import { useUserTier, type UserTier } from '@/hooks/use-user-tier';
import { trackTierSystemEvent } from '@/utils/analytics';
import { useAuth } from '@/contexts/auth-context';

const STORAGE_KEY_PREFIX = 'protokol57_evaluations';

// Tier-based per-protocol evaluation limits
const getEvaluationLimit = (tier: UserTier): number => {
  return tier === 'paid' ? 5 : 3; // Free users: 3 per protocol, Paid users: 5 per protocol
};

interface ProtocolEvaluations {
  [protocolId: string]: {
    count: number;
    lastEvaluated: string;
  };
}

export function useProtocolEvaluation(protocolId: number) {
  const { tier } = useUserTier();
  const { user } = useAuth();
  const [evaluations, setEvaluations] = useState<ProtocolEvaluations>({});

  const evaluationLimit = getEvaluationLimit(tier);
  const protocolKey = protocolId.toString();
  
  // Create user-specific storage key
  const storageKey = user ? `${STORAGE_KEY_PREFIX}_${user.id}` : STORAGE_KEY_PREFIX;

  // Load from localStorage on mount or when user changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const data: ProtocolEvaluations = JSON.parse(saved);
        setEvaluations(data);
      } else {
        // Clear evaluations when no saved data (new user)
        setEvaluations({});
      }
    } catch (error) {

    }
  }, [storageKey]);

  const incrementEvaluation = () => {
    const currentCount = evaluations[protocolKey]?.count || 0;
    
    // Don't increment if already at limit
    if (currentCount >= evaluationLimit) {
      trackTierSystemEvent.evaluationLimitHit(protocolId, tier);
      return;
    }
    
    const now = new Date().toISOString();
    const newCount = currentCount + 1;
    const newEvaluations = {
      ...evaluations,
      [protocolKey]: {
        count: newCount,
        lastEvaluated: now
      }
    };
    
    setEvaluations(newEvaluations);
    
    // Track if user just hit the limit
    if (newCount >= evaluationLimit) {
      trackTierSystemEvent.evaluationLimitHit(protocolId, tier);
    }
    
    try {
      localStorage.setItem(storageKey, JSON.stringify(newEvaluations));
    } catch (error) {

    }
  };

  const canEvaluate = () => {
    const currentCount = evaluations[protocolKey]?.count || 0;
    return currentCount < evaluationLimit;
  };

  const getRemainingEvaluations = () => {
    const currentCount = evaluations[protocolKey]?.count || 0;
    return Math.max(0, evaluationLimit - currentCount);
  };

  const getEvaluationCount = () => {
    return evaluations[protocolKey]?.count || 0;
  };

  const getUsagePercentage = () => {
    const currentCount = evaluations[protocolKey]?.count || 0;
    return Math.min(100, (currentCount / evaluationLimit) * 100);
  };

  const resetEvaluations = () => {
    const newEvaluations = { ...evaluations };
    delete newEvaluations[protocolKey];
    setEvaluations(newEvaluations);
    localStorage.setItem(storageKey, JSON.stringify(newEvaluations));
  };

  return {
    evaluationCount: getEvaluationCount(),
    evaluationLimit,
    canEvaluate,
    getRemainingEvaluations,
    getUsagePercentage,
    incrementEvaluation,
    resetEvaluations,
    tier
  };
}