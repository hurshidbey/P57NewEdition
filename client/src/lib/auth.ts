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
    console.log('🔐 TELEGRAM AUTH START - User ID:', user.id);
    
    // Generate consistent credentials
    const email = `tg_${user.id}@telegram.local`;
    const password = `telegram_${user.id}`;
    const userData = {
      name: `${user.first_name} ${user.last_name || ''}`.trim(),
      telegram_id: user.id,
      username: user.username,
      avatar_url: user.photo_url,
      provider: 'telegram'
    };
    
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    
    try {
      // Strategy: Always try signup first for new users (most common case)
      console.log('🆕 Attempting to create new user...');
      
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });
      
      // If signup succeeded with session, user is created and logged in
      if (!signUpError && signUpData.session) {
        console.log('✅ NEW user created and signed in');
        return signUpData;
      }
      
      // If signup failed because user exists, try signin
      if (signUpError?.message?.includes('already registered')) {
        console.log('👤 User exists, attempting signin...');
        
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (!signInError && signInData.session) {
          console.log('✅ EXISTING user signed in');
          return signInData;
        }
        
        throw new Error(`Sign-in failed: ${signInError?.message}`);
      }
      
      // Other signup errors
      throw new Error(`User creation failed: ${signUpError?.message}`);
      
    } catch (error: any) {
      console.error('❌ Telegram auth error:', error.message);
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
