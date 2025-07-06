import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useProgress } from '@/hooks/use-progress';

export type UserTier = 'free' | 'paid';

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
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { getProgressData } = useProgress();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return; // Wait for auth to finish loading
    
    setLoading(false);
  }, [user, isAuthenticated, authLoading]);
  
  // Get tier from user object - admins will have their tier set properly by the backend
  const tier = (user?.tier as UserTier) || 'free';
  // Admin status should come from the backend user object
  const isAdmin = user?.role === 'admin' || false;

  // Get count of accessed protocols for free tier limits
  const getAccessedProtocolsCount = (): number => {
    if (tier === 'paid') return 0; // No limit for paid users
    
    const progressData = getProgressData(57); // Total protocols = 57
    return progressData.completedProtocols.size;
  };

  // Check if free user can access a new protocol (max 3 protocols)
  const canAccessNewProtocol = (): boolean => {
    // CRITICAL FIX: Admin users have unlimited access
    if (isAdmin) return true; // Admin users unlimited
    if (tier === 'paid') return true; // Paid users unlimited
    
    const accessedCount = getAccessedProtocolsCount();
    return accessedCount < 3;
  };

  const canAccessProtocol = (protocolId: number, isFreeAccess: boolean): boolean => {
    // CRITICAL FIX: Admin users have unlimited access to all protocols
    if (isAdmin) {
      return true; // Admin can access all protocols regardless of tier
    }
    
    if (tier === 'paid') {
      return true; // Paid users can access all protocols
    }
    
    if (tier === 'free') {
      // For free users, check both free access AND protocol count limit
      if (!isFreeAccess) return false; // Must be a free protocol
      
      const progressData = getProgressData(57);
      const hasCompletedThisProtocol = progressData.completedProtocols.has(protocolId);
      
      // Can access if already completed this protocol OR if under limit
      return hasCompletedThisProtocol || canAccessNewProtocol();
    }
    
    return false;
  };

  const getTierStatus = () => {
    // CRITICAL FIX: Show special admin status
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
    getAccessedProtocolsCount,
    canAccessNewProtocol,
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