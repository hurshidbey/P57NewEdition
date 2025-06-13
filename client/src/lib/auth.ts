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
    console.log('🔐 TELEGRAM AUTH START - User ID:', user.id, '- SIMPLIFIED v5.0 SIGNIN-FIRST');
    
    // Generate consistent credentials with valid email domain
    const email = `telegram_${user.id}@protokol57.app`;
    const password = `tg_${user.id}_${user.auth_date}`;
    const userData = {
      name: `${user.first_name} ${user.last_name || ''}`.trim(),
      telegram_id: user.id,
      username: user.username,
      avatar_url: user.photo_url,
      provider: 'telegram'
    };
    
    console.log('📧 Email:', email);
    console.log('🔑 Password length:', password.length);
    console.log('✅ Using direct Supabase Auth (NO Edge Functions)');
    
    try {
      // Strategy: Try signin first (most users are returning users)
      console.log('🔐 Attempting signin for returning user...');
      
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      console.log('🔐 Signin response:', { data: signInData, error: signInError });
      
      // If signin succeeded, user exists and is logged in
      if (!signInError && signInData.session) {
        console.log('✅ RETURNING user signed in successfully');
        return signInData;
      }
      
      // If signin failed with invalid credentials, user doesn't exist - create them
      if (signInError?.message?.includes('Invalid login credentials') || 
          signInError?.message?.includes('invalid_credentials')) {
        console.log('🆕 User not found, creating new account...');
        
        // Wait a bit to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: userData,
            emailRedirectTo: undefined // Disable email confirmation for Telegram users
          }
        });
        
        console.log('📝 Signup response:', { data: signUpData, error: signUpError });
        
        if (!signUpError && signUpData.session) {
          console.log('✅ NEW user created and signed in');
          return signUpData;
        }
        
        // Handle rate limiting
        if (signUpError?.message?.includes('For security purposes')) {
          const match = signUpError.message.match(/after (\d+) seconds/);
          const seconds = match ? parseInt(match[1]) : 60;
          throw new Error(`Iltimos ${seconds} soniyadan so'ng qayta urinib ko'ring (xavfsizlik maqsadida)`);
        }
        
        throw new Error(`Foydalanuvchi yaratishda xatolik: ${signUpError?.message || 'Noma\'lum xatolik'}`);
      }
      
      // Handle rate limiting on signin
      if (signInError?.message?.includes('For security purposes')) {
        const match = signInError.message.match(/after (\d+) seconds/);
        const seconds = match ? parseInt(match[1]) : 60;
        throw new Error(`Iltimos ${seconds} soniyadan so'ng qayta urinib ko'ring (xavfsizlik maqsadida)`);
      }
      
      // Other signin errors
      console.error('❌ Signin error details:', signInError);
      throw new Error(`Tizimga kirishda xatolik: ${signInError?.message || 'Noma\'lum xatolik'}`);
      
    } catch (error: any) {
      console.error('❌ Telegram auth complete error:', error);
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
