import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useProgressContext } from '@/contexts/progress-context';

export type UserTier = 'free' | 'paid';

interface UserTierData {
  tier: UserTier;
  displayName: string;
  color: string;
  features: string[];
}

interface ProtocolsContextValue {
  userTier: UserTier;
  isAdmin: boolean;
  loading: boolean;
  canAccessProtocol: (protocolId: number, isFreeAccess: boolean) => boolean;
  isProtocolLocked: (protocolId: number, isFreeAccess: boolean) => boolean;
  getAccessedProtocolsCount: () => number;
  canAccessNewProtocol: () => boolean;
  getTierStatus: () => UserTierData;
  lockedProtocolIds: Set<number>;
}

const ProtocolsContext = createContext<ProtocolsContextValue | undefined>(undefined);

export const useProtocolsContext = () => {
  const context = useContext(ProtocolsContext);
  if (!context) {
    throw new Error('useProtocolsContext must be used within a ProtocolsProvider');
  }
  return context;
};

interface ProtocolsProviderProps {
  children: ReactNode;
  protocols?: Array<{ id: number; isFreeAccess: boolean }>;
}

export function ProtocolsProvider({ children, protocols = [] }: ProtocolsProviderProps) {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { getProgressData } = useProgressContext();
  const [loading, setLoading] = useState(true);
  const [lockedProtocolIds, setLockedProtocolIds] = useState<Set<number>>(new Set());

  // Get tier from user object - admins will have their tier set properly by the backend
  const tier = (user?.tier as UserTier) || 'free';
  // Admin status should come from the backend user object
  const isAdmin = user?.role === 'admin' || false;

  useEffect(() => {
    if (!authLoading) {
      setLoading(false);
    }
  }, [authLoading]);

  // Pre-calculate locked protocols for O(1) lookup
  useEffect(() => {
    if (loading || !protocols.length) return;

    const locked = new Set<number>();
    const progressData = getProgressData(57); // Total protocols = 57
    const completedCount = progressData.completedProtocols.size;

    protocols.forEach(protocol => {
      // Admin can access everything
      if (isAdmin) return;
      
      // Paid users can access everything
      if (tier === 'paid') return;
      
      // For free users
      if (tier === 'free') {
        // If it's not a free protocol, it's locked
        if (!protocol.isFreeAccess) {
          locked.add(protocol.id);
          return;
        }
        
        // If user has already completed this protocol, they can access it
        if (progressData.completedProtocols.has(protocol.id)) {
          return;
        }
        
        // If user has reached the 3 protocol limit, new protocols are locked
        if (completedCount >= 3) {
          locked.add(protocol.id);
        }
      }
    });

    setLockedProtocolIds(locked);
  }, [protocols, tier, isAdmin, loading, getProgressData]);

  // Get count of accessed protocols for free tier limits
  const getAccessedProtocolsCount = useCallback((): number => {
    if (tier === 'paid' || isAdmin) return 0; // No limit for paid users or admins
    
    const progressData = getProgressData(57); // Total protocols = 57
    return progressData.completedProtocols.size;
  }, [tier, isAdmin, getProgressData]);

  // Check if free user can access a new protocol (max 3 protocols)
  const canAccessNewProtocol = useCallback((): boolean => {
    if (isAdmin) return true; // Admin users unlimited
    if (tier === 'paid') return true; // Paid users unlimited
    
    const accessedCount = getAccessedProtocolsCount();
    return accessedCount < 3;
  }, [tier, isAdmin, getAccessedProtocolsCount]);

  const canAccessProtocol = useCallback((protocolId: number, isFreeAccess: boolean): boolean => {
    // Admin users have unlimited access to all protocols
    if (isAdmin) {
      return true;
    }
    
    // Paid users can access all protocols
    if (tier === 'paid') {
      return true;
    }
    
    // For free users, check both free access AND protocol count limit
    if (tier === 'free') {
      // Must be a free protocol
      if (!isFreeAccess) return false;
      
      const progressData = getProgressData(57);
      const hasCompletedThisProtocol = progressData.completedProtocols.has(protocolId);
      
      // Can access if already completed this protocol OR if under limit
      return hasCompletedThisProtocol || canAccessNewProtocol();
    }
    
    return false;
  }, [tier, isAdmin, getProgressData, canAccessNewProtocol]);

  const isProtocolLocked = useCallback((protocolId: number, isFreeAccess: boolean): boolean => {
    // Use pre-calculated set for O(1) lookup when possible
    if (lockedProtocolIds.has(protocolId)) {
      return true;
    }
    
    // Fallback to calculation
    return !canAccessProtocol(protocolId, isFreeAccess);
  }, [lockedProtocolIds, canAccessProtocol]);

  const getTierStatus = useCallback((): UserTierData => {
    // Show special admin status
    if (isAdmin) {
      return {
        tier: 'paid' as UserTier, // Admin treated as paid tier
        displayName: 'Admin',
        color: 'text-purple-600 bg-purple-100',
        features: [
          'Barcha 57 protokolga kirish',
          'Admin panel kirish',
          'Cheksiz AI baholash',
          'Protokollarni boshqarish',
          'Full system access'
        ]
      };
    }
    
    switch (tier) {
      case 'paid':
        return {
          tier: 'paid',
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
          tier: 'free',
          displayName: 'Bepul',
          color: 'text-blue-600 bg-blue-100',
          features: [
            '3 ta bepul protokol',
            'Kunlik 3 ta AI baholash',
            'Asosiy progress tracking'
          ]
        };
    }
  }, [tier, isAdmin]);

  const value: ProtocolsContextValue = {
    userTier: tier,
    isAdmin,
    loading: loading || authLoading,
    canAccessProtocol,
    isProtocolLocked,
    getAccessedProtocolsCount,
    canAccessNewProtocol,
    getTierStatus,
    lockedProtocolIds
  };

  return (
    <ProtocolsContext.Provider value={value}>
      {children}
    </ProtocolsContext.Provider>
  );
}