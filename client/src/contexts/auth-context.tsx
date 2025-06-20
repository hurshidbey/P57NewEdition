import React, { createContext, useContext, useEffect, useState } from 'react'
import { authService, type AuthUser, type TelegramUser } from '@/lib/auth'

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInWithTelegram: (user: TelegramUser) => Promise<void>
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
      const currentUser = await authService.getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      console.error('Failed to refresh user:', error)
    }
  }

  useEffect(() => {
    // Check for Telegram user first (using localStorage directly)
    const telegramUserStr = localStorage.getItem('protokol57_telegram_user');
    if (telegramUserStr) {
      try {
        const telegramUser = JSON.parse(telegramUserStr);
        setUser({
          id: telegramUser.id,
          email: `telegram_${telegramUser.telegram_id}@protokol57.app`,
          name: `${telegramUser.first_name} ${telegramUser.last_name || ''}`.trim(),
          tier: 'free' // Default tier for Telegram users
        });
        setLoading(false);
        return;
      } catch {
        // Invalid Telegram user data, continue to Supabase auth
      }
    }
    
    // If no Telegram user, check Supabase auth
    authService.getCurrentUser().then(user => {
      setUser(user)
      setLoading(false)
    })

    // Listen for auth changes (Supabase only)
    const subscription = authService.onAuthStateChange((user) => {
      setUser(user)
      setLoading(false)
    })

    return () => subscription.subscription.unsubscribe()
  }, [])
  
  // Listen for URL changes (like payment success) to refresh user
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('payment') === 'success') {
      console.log('🔄 Payment success detected, refreshing user data...')
      setTimeout(() => {
        refreshUser()
      }, 1000) // Small delay to ensure backend has processed the update
    }
  }, [window.location.search])

  const signIn = async (email: string, password: string) => {
    const { user } = await authService.signIn(email, password)
    if (user) {
      setUser({
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.name || user.email?.split('@')[0],
        tier: user.user_metadata?.tier || 'free'
      })
    }
  }

  const signInWithGoogle = async () => {
    await authService.signInWithGoogle()
    // OAuth redirect will handle the rest
  }

  const signInWithTelegram = async (user: TelegramUser) => {
    const result = await authService.signInWithTelegram(user)
    
    // If we got a user and session, update state immediately
    if (result.user && result.session) {
      setUser({
        id: result.user.id,
        email: result.user.email!,
        name: result.user.user_metadata?.name || result.user.email?.split('@')[0],
        tier: result.user.user_metadata?.tier || 'free'
      })
    }
  }

  const signUp = async (email: string, password: string, name?: string) => {
    await authService.signUp(email, password, name)
    // Note: User will be null until email is confirmed
  }

  const signOut = async () => {
    // Check if this is a Telegram user (using localStorage directly)
    const telegramToken = localStorage.getItem('protokol57_telegram_token');
    if (telegramToken) {
      // Clear Telegram tokens
      localStorage.removeItem('protokol57_telegram_token');
      localStorage.removeItem('protokol57_telegram_refresh');
      localStorage.removeItem('protokol57_telegram_user');
      window.location.reload();
    } else {
      await authService.signOut()
    }
    
    // 🔧 FIX: Clear all progress localStorage keys on logout
    // This prevents cross-user contamination when switching Google accounts
    console.log('🧹 Clearing all progress data on logout...');
    const allKeys = Object.keys(localStorage);
    const progressKeys = allKeys.filter(key => key.startsWith('protokol57_progress_'));
    progressKeys.forEach(key => {
      console.log(`🗑️ Removing progress key: ${key}`);
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
    signInWithTelegram,
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
