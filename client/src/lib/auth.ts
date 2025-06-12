import { supabase } from './supabase'
import type { User } from '@supabase/supabase-js';

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

export interface AuthUser {
  id: string
  email: string
  name?: string
}

export const authService = {
  async signUp(email: string, password: string, name?: string) {
    console.log('🔐 Attempting signup for:', email)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
        data: {
          name: name || email.split('@')[0]
        }
      }
    })
    
    if (error) {
      console.error('❌ Signup error:', error)
      throw error
    }
    
    console.log('✅ Signup response:', data)
    console.log('User created:', data.user?.email)
    console.log('Email confirmed:', data.user?.email_confirmed_at)
    
    return data
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) throw error
    return data
  },

  async signInWithTelegram(user: TelegramUser) {
    console.log('🔐 Attempting Telegram signin');
    
    try {
      // First, validate with our Edge Function
      const { data, error } = await supabase.functions.invoke('telegram-auth', {
        body: { user },
      });

      if (error) {
        console.error('❌ Telegram function error:', error);
        throw new Error(error.message || 'Telegram authentication failed');
      }

      if (!data?.success || !data?.telegram_user) {
        console.error('❌ Invalid response from auth service');
        throw new Error('Invalid response from authentication service');
      }

      console.log('✅ Telegram validation successful, creating user...');
      
      const telegramUser = data.telegram_user;
      
      // Always try to create user first (it will fail if user exists, which is fine)
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: telegramUser.email,
        password: `telegram_${telegramUser.id}`,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
          data: {
            name: telegramUser.name,
            telegram_id: telegramUser.id,
            username: telegramUser.username,
            avatar_url: telegramUser.photo_url,
            provider: 'telegram'
          }
        }
      });

      // If signup succeeded and user has session, return it
      if (!signUpError && signUpData.session) {
        console.log('✅ New Telegram user created and signed in');
        return signUpData;
      }

      // If signup failed (user already exists) or no session, try to sign in
      console.log('🔄 User exists or needs sign in, attempting password signin...');
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: telegramUser.email,
        password: `telegram_${telegramUser.id}`
      });
      
      if (signInError) {
        console.error('❌ Sign-in failed:', signInError);
        throw signInError;
      }
      
      console.log('✅ Existing Telegram user signed in');
      return signInData;
      
    } catch (error: any) {
      console.error('❌ Telegram signin error:', error);
      throw new Error(error.message || 'Telegram authentication failed');
    }
  },

  async signInWithGoogle() {
    console.log('🔐 Attempting Google OAuth signin')
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    
    if (error) {
      console.error('❌ Google OAuth error:', error)
      throw error
    }
    
    console.log('✅ Google OAuth initiated:', data)
    return data
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return null
    
    console.log('Current user check:', user.email, 'confirmed:', user.email_confirmed_at)
    
    return {
      id: user.id,
      email: user.email!,
      name: user.user_metadata?.name || user.email?.split('@')[0]
    }
  },

  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email)
      if (session?.user && session?.user?.email_confirmed_at) {
        const authUser: AuthUser = {
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0]
        }
        callback(authUser)
      } else {
        callback(null)
      }
    })
    return data
  }
}
