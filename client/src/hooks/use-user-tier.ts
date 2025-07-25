// This hook now acts as a simple wrapper around the ProtocolsContext
// to maintain backward compatibility
import { useProtocolsContext, UserTier } from '@/contexts/protocols-context';

export type { UserTier } from '@/contexts/protocols-context';

interface UserTierData {
  tier: UserTier;
  loading: boolean;
  canAccessProtocol: (protocolId: number, isFreeAccess: boolean) => boolean;
  getAccessedProtocolsCount: () => number;
  canAccessNewProtocol: () => boolean;
  getTierStatus: () => {
    tier: UserTier;
    displayName: string;
    color: string;
    features: string[];
  };
}

export function useUserTier(): UserTierData {
  const { 
    userTier,
    loading,
    canAccessProtocol,
    getAccessedProtocolsCount,
    canAccessNewProtocol,
    getTierStatus
  } = useProtocolsContext();

  return {
    tier: userTier,
    loading,
    canAccessProtocol,
    getAccessedProtocolsCount,
    canAccessNewProtocol,
    getTierStatus
  };
}

// Hook to check if a specific protocol is accessible
export function useProtocolAccess(protocolId: number, isFreeAccess: boolean) {
  const { userTier, canAccessProtocol, isProtocolLocked, loading } = useProtocolsContext();
  
  return {
    canAccess: canAccessProtocol(protocolId, isFreeAccess),
    isLocked: isProtocolLocked(protocolId, isFreeAccess),
    tier: userTier,
    loading,
    requiresUpgrade: userTier === 'free' && !isFreeAccess
  };
}