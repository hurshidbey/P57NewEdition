import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';

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
  const { user, isAuthenticated } = useAuth();
  const [tier, setTier] = useState<UserTier>('free');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setTier('free');
      setLoading(false);
      return;
    }

    // For now, check user metadata for tier information
    // In the future, this could be a separate API call
    const userTier = user?.tier || 'paid'; // Existing users are considered paid for now
    
    // TODO: Implement proper tier detection once payment system is fully integrated
    // This could check:
    // 1. User metadata from Supabase
    // 2. Payment history from ATMOS
    // 3. Database tier field
    
    setTier(userTier as UserTier);
    setLoading(false);
  }, [user, isAuthenticated]);

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
    loading,
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