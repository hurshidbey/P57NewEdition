import React, { createContext, useContext, useEffect, useState } from 'react'
import { authService, type AuthUser } from '@/lib/auth'
import { forceSessionRefresh } from '@/lib/force-session-refresh'

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signUp: (email: string, password: string, name?: string) => Promise<void>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
  resetPasswordForEmail: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Function to refresh user data from Supabase
  const refreshUser = async () => {
    try {
      // Force refresh the session to get latest metadata
      await forceSessionRefresh();
      
      // Store previous tier to detect upgrades
      const previousTier = user?.tier;
      
      // Now get the updated user
      const currentUser = await authService.getCurrentUser()
      setUser(currentUser)
      
      console.log('🔄 [AuthContext] User refreshed:', currentUser?.email, 'Tier:', currentUser?.tier);
      
      // Show a simple success message if user just upgraded
      if (previousTier === 'free' && currentUser?.tier === 'paid') {
        // Import toast dynamically to avoid circular dependency
        const { toast } = await import('@/hooks/use-toast');
        toast({
          title: "Premium faollashtirildi! 🎉",
          description: "Endi barcha protokollarga kirishingiz mumkin",
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('[AuthContext] Failed to refresh user:', error);
    }
  }

  useEffect(() => {
    // Check Supabase auth
    authService.getCurrentUser().then(user => {
      console.log('[AuthContext] Initial user loaded:', user)
      setUser(user)
      setLoading(false)
    }).catch(error => {
      console.error('[AuthContext] Error loading initial user:', error)
      setLoading(false)
    })

    // Listen for auth changes (Supabase only)
    const subscription = authService.onAuthStateChange((user) => {
      console.log('[AuthContext] Auth state changed, new user:', user)
      setUser(user)
      setLoading(false)
    })

    return () => subscription.subscription.unsubscribe()
  }, [])
  
  // REMOVED: This effect was causing duplicate popups and logout issues
  // Payment success is now handled only on the /payment/success page
  
  // REMOVED: No longer needed since we removed the payment success effect
  
  // Listen for storage events to refresh user when tier might have changed
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'tier_upgrade_trigger') {
        console.log('🎯 Tier upgrade trigger detected, refreshing user...')
        refreshUser()
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const signIn = async (email: string, password: string) => {
    const { user } = await authService.signIn(email, password)
    if (user) {
      // Check if user is admin
      const adminEmails = ['hurshidbey@gmail.com', 'mustafaabdurahmonov7777@gmail.com'];
      const isAdmin = adminEmails.includes(user.email || '');
      
      setUser({
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.name || user.email?.split('@')[0],
        tier: isAdmin ? 'paid' : (user.user_metadata?.tier || 'free'),
        role: isAdmin ? 'admin' : undefined
      })
    }
  }

  const signInWithGoogle = async () => {
    await authService.signInWithGoogle()
    // OAuth redirect will handle the rest
  }

  const signUp = async (email: string, password: string, name?: string) => {
    await authService.signUp(email, password, name)
    // Note: User will be null until email is confirmed
  }

  const signOut = async () => {
    await authService.signOut()
    
    // 🔧 FIX: Clear all user-specific localStorage keys on logout
    // This prevents cross-user contamination when switching Google accounts

    const allKeys = Object.keys(localStorage);
    const progressKeys = allKeys.filter(key => key.startsWith('protokol57_progress_'));
    const evaluationKeys = allKeys.filter(key => key.startsWith('protokol57_evaluations_'));
    
    progressKeys.forEach(key => {

      localStorage.removeItem(key);
    });
    
    evaluationKeys.forEach(key => {

      localStorage.removeItem(key);
    });
    
    setUser(null)
  }

  const resetPasswordForEmail = async (email: string) => {
    await authService.resetPasswordForEmail(email)
  }

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    signIn,
    signInWithGoogle,
    signUp,
    signOut,
    refreshUser,
    resetPasswordForEmail
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
