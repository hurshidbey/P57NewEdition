import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useProgress } from '@/hooks/use-progress';

export type UserTier = 'free' | 'paid';

interface UserTierData {
  tier: UserTier;
  loading: boolean;
  canAccessProtocol: (protocolId: number, isFreeAccess: boolean) => boolean;
  getTierStatus: () => {
    tier: UserTier;
    displayName: string;
    color: string;
    features: string[];
  };
}

export function useUserTier(): UserTierData {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return; // Wait for auth to finish loading
    
    setLoading(false);
  }, [user, isAuthenticated, authLoading]);
  
  // Get tier directly from auth context
  const tier = (user?.tier as UserTier) || 'free';

  const canAccessProtocol = (protocolId: number, isFreeAccess: boolean): boolean => {
    if (tier === 'paid') {
      return true; // Paid users can access all protocols
    }
    
    if (tier === 'free') {
      return isFreeAccess; // Free users can only access free protocols
    }
    
    return false;
  };

  const getTierStatus = () => {
    switch (tier) {
      case 'paid':
        return {
          tier: 'paid' as UserTier,
          displayName: 'Premium',
          color: 'text-green-600 bg-green-100',
          features: [
            'Barcha 57 protokolga kirish',
            'Cheksiz AI baholash',
            'Progress tracking',
            'Priority support'
          ]
        };
      case 'free':
      default:
        return {
          tier: 'free' as UserTier,
          displayName: 'Bepul',
          color: 'text-blue-600 bg-blue-100',
          features: [
            '3 ta bepul protokol',
            'Kunlik 3 ta AI baholash',
            'Asosiy progress tracking'
          ]
        };
    }
  };

  return {
    tier,
    loading: loading || authLoading,
    canAccessProtocol,
    getTierStatus
  };
}

// Hook to check if a specific protocol is accessible
export function useProtocolAccess(protocolId: number, isFreeAccess: boolean) {
  const { tier, canAccessProtocol, loading } = useUserTier();
  
  return {
    canAccess: canAccessProtocol(protocolId, isFreeAccess),
    isLocked: !canAccessProtocol(protocolId, isFreeAccess),
    tier,
    loading,
    requiresUpgrade: tier === 'free' && !isFreeAccess
  };
}