import { useState, useEffect } from 'react';
import { useUserTier, type UserTier } from '@/hooks/use-user-tier';

const STORAGE_KEY = 'protokol57_protocol_evaluations';

// Tier-based per-protocol evaluation limits
const getEvaluationLimit = (tier: UserTier): number => {
  return tier === 'paid' ? 5 : 1; // Free users: 1 per protocol, Paid users: 5 per protocol
};

interface ProtocolEvaluations {
  [protocolId: string]: {
    count: number;
    lastEvaluated: string;
  };
}

export function useProtocolEvaluation(protocolId: number) {
  const { tier } = useUserTier();
  const [evaluations, setEvaluations] = useState<ProtocolEvaluations>({});

  const evaluationLimit = getEvaluationLimit(tier);
  const protocolKey = protocolId.toString();

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data: ProtocolEvaluations = JSON.parse(saved);
        setEvaluations(data);
      }
    } catch (error) {
      console.error('Failed to load protocol evaluation data:', error);
    }
  }, []);

  const incrementEvaluation = () => {
    const now = new Date().toISOString();
    const newEvaluations = {
      ...evaluations,
      [protocolKey]: {
        count: (evaluations[protocolKey]?.count || 0) + 1,
        lastEvaluated: now
      }
    };
    
    setEvaluations(newEvaluations);
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newEvaluations));
    } catch (error) {
      console.error('Failed to save protocol evaluation data:', error);
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newEvaluations));
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