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
      
      // Now get the updated user
      const currentUser = await authService.getCurrentUser()
      setUser(currentUser)
      
      console.log('🔄 [AuthContext] User refreshed:', currentUser?.email, 'Tier:', currentUser?.tier);
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
  
  // Listen for URL changes (like payment success) to refresh user
  useEffect(() => {
    const checkPaymentSuccess = () => {
      const urlParams = new URLSearchParams(window.location.search)
      // Only check for explicit payment success parameter, not pathname
      if (urlParams.get('payment') === 'success') {
        // Check if we've already processed this payment success
        const processedKey = 'payment_success_processed';
        if (sessionStorage.getItem(processedKey) === 'true') {
          return; // Already processed this payment success
        }
        
        // Mark as processed
        sessionStorage.setItem(processedKey, 'true');
        console.log('🎯 Payment success detected, refreshing user data...')
        
        // Show loading state while refreshing
        const showRefreshingToast = () => {
          const toastElement = document.createElement('div')
          toastElement.className = 'fixed top-4 right-4 bg-foreground text-background px-6 py-3 rounded-md shadow-lg z-50 flex items-center gap-2'
          toastElement.innerHTML = `
            <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Premium dostup faollashtirilmoqda...</span>
          `
          document.body.appendChild(toastElement)
          
          return () => document.body.removeChild(toastElement)
        }
        
        const removeToast = showRefreshingToast()
        
        // Multiple refresh attempts with increasing delays
        const refreshAttempts = [500, 1500, 3000]
        let attemptIndex = 0
        
        const attemptRefresh = () => {
          refreshUser().then(() => {
            console.log('✅ User data refreshed successfully')
            removeToast()
            
            // Show success toast
            const successToast = document.createElement('div')
            successToast.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-md shadow-lg z-50 flex items-center gap-2'
            successToast.innerHTML = `
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Premium dostup faollashtirildi!</span>
            `
            document.body.appendChild(successToast)
            setTimeout(() => document.body.removeChild(successToast), 3000)
          }).catch(error => {
            console.error('❌ Failed to refresh user:', error)
            if (attemptIndex < refreshAttempts.length) {
              setTimeout(() => {
                attemptIndex++
                attemptRefresh()
              }, refreshAttempts[attemptIndex])
            } else {
              removeToast()
              console.error('Failed to refresh user after multiple attempts')
            }
          })
        }
        
        setTimeout(attemptRefresh, refreshAttempts[0])
      }
    }
    
    // Only check on initial mount, not on every navigation
    checkPaymentSuccess()
    
    // Clear the processed flag when component unmounts or user changes
    return () => {
      // Don't clear on unmount to prevent re-processing
    }
  }, []) // Only run once on mount
  
  // Clear payment success flag when user logs out
  useEffect(() => {
    if (!user) {
      sessionStorage.removeItem('payment_success_processed');
    }
  }, [user])
  
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

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    signIn,
    signInWithGoogle,
    signUp,
    signOut,
    refreshUser
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
