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
    console.log('🔐 TELEGRAM AUTH v7.0 - Custom JWT auth');
    console.log('👤 User:', user.id, user.first_name);
    
    try {
      // Send to our new v2 endpoint directly
      const response = await fetch('/api/auth/telegram-v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('❌ Server auth error:', data);
        throw new Error(data.error || 'Telegram orqali kirishda xatolik');
      }

      console.log('✅ Server auth successful, storing tokens...');
      
      // Store tokens and user data in localStorage
      localStorage.setItem('protokol57_telegram_token', data.access_token);
      localStorage.setItem('protokol57_telegram_refresh', data.refresh_token);
      localStorage.setItem('protokol57_telegram_user', JSON.stringify(data.user));
      
      // Return in a format compatible with existing code
      return {
        user: {
          id: data.user.id,
          email: `telegram_${data.user.telegram_id}@protokol57.app`, // Fake email for compatibility
          user_metadata: {
            name: `${data.user.first_name} ${data.user.last_name || ''}`.trim(),
            telegram_id: data.user.telegram_id,
            username: data.user.username,
            avatar_url: data.user.photo_url
          }
        },
        session: {
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          expires_in: data.expires_in
        }
      };
      
    } catch (error: any) {
      console.error('❌ Telegram auth error:', error);
      throw error;
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
