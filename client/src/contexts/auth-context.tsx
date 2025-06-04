import React, { createContext, useContext, useEffect, useState } from 'react'
import { authService, type AuthUser } from '@/lib/auth'

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name?: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check current user on mount
    authService.getCurrentUser().then(user => {
      setUser(user)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = authService.onAuthStateChange((user) => {
      setUser(user)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
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

  const signUp = async (email: string, password: string, name?: string) => {
    await authService.signUp(email, password, name)
    // Note: User will be null until email is confirmed
  }

  const signOut = async () => {
    await authService.signOut()
    setUser(null)
  }

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    signIn,
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
