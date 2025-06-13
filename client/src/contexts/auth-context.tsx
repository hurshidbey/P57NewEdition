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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for Telegram user first
    import('@/lib/telegram-auth').then(({ telegramAuth }) => {
      telegramAuth.init();
      const telegramUser = telegramAuth.getCurrentUser();
      
      if (telegramUser) {
        setUser({
          id: telegramUser.id,
          email: `telegram_${telegramUser.telegram_id}@protokol57.app`,
          name: `${telegramUser.first_name} ${telegramUser.last_name || ''}`.trim()
        });
        setLoading(false);
        return;
      }
      
      // If no Telegram user, check Supabase auth
      authService.getCurrentUser().then(user => {
        setUser(user)
        setLoading(false)
      })
    });

    // Listen for auth changes (Supabase only)
    const subscription = authService.onAuthStateChange((user) => {
      setUser(user)
      setLoading(false)
    })

    return () => subscription.subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { user } = await authService.signIn(email, password)
    if (user) {
      setUser({
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.name || user.email?.split('@')[0]
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
        name: result.user.user_metadata?.name || result.user.email?.split('@')[0]
      })
    }
  }

  const signUp = async (email: string, password: string, name?: string) => {
    await authService.signUp(email, password, name)
    // Note: User will be null until email is confirmed
  }

  const signOut = async () => {
    // Check if this is a Telegram user
    const { telegramAuth } = await import('@/lib/telegram-auth');
    if (telegramAuth.isAuthenticated()) {
      telegramAuth.signOut();
    } else {
      await authService.signOut()
    }
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
    signOut
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
