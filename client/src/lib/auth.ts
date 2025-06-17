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
    
    // Check if user recently attempted signup to prevent rate limiting
    const lastAttempt = localStorage.getItem(`signup_attempt_${email}`)
    const now = Date.now()
    
    if (lastAttempt && now - parseInt(lastAttempt) < 60000) { // 1 minute cooldown
      throw new Error('Iltimos, 1 daqiqa kutib qayta urinib ko\'ring. Email yuborish cheklovi.')
    }
    
    // Store attempt timestamp
    localStorage.setItem(`signup_attempt_${email}`, now.toString())
    
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
      
      // Handle specific rate limiting errors
      if (error.message.includes('rate') || error.message.includes('limit') || error.message.includes('too many')) {
        throw new Error('Juda ko\'p urinish. Iltimos, bir necha daqiqa kutib qayta urinib ko\'ring.')
      }
      
      if (error.message.includes('already registered') || error.message.includes('already exists')) {
        throw new Error('Bu email allaqachon ro\'yxatdan o\'tgan. Kirish sahifasiga o\'ting.')
      }
      
      if (error.message.includes('invalid email')) {
        throw new Error('Email manzili noto\'g\'ri formatda.')
      }
      
      if (error.message.includes('password')) {
        throw new Error('Parol juda zaif. Kamida 6 ta belgi, harf va raqam ishlatib ko\'ring.')
      }
      
      throw new Error('Ro\'yxatdan o\'tishda xatolik: ' + error.message)
    }
    
    console.log('✅ Signup response:', data)
    console.log('User created:', data.user?.email)
    console.log('Email confirmed:', data.user?.email_confirmed_at)
    
    return data
  },

  async signIn(email: string, password: string) {
    console.log('🔐 Attempting signin for:', email)
    
    // Check if user recently attempted signin to prevent rate limiting
    const lastAttempt = localStorage.getItem(`signin_attempt_${email}`)
    const now = Date.now()
    
    if (lastAttempt && now - parseInt(lastAttempt) < 30000) { // 30 second cooldown
      throw new Error('Iltimos, 30 soniya kutib qayta urinib ko\'ring.')
    }
    
    // Store attempt timestamp
    localStorage.setItem(`signin_attempt_${email}`, now.toString())
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) {
      console.error('❌ Signin error:', error)
      
      // Handle specific errors
      if (error.message.includes('rate') || error.message.includes('limit') || error.message.includes('too many')) {
        throw new Error('Juda ko\'p urinish. Iltimos, bir necha daqiqa kutib qayta urinib ko\'ring.')
      }
      
      if (error.message.includes('Invalid login credentials') || error.message.includes('invalid') || error.message.includes('wrong')) {
        throw new Error('Email yoki parol noto\'g\'ri.')
      }
      
      if (error.message.includes('not confirmed') || error.message.includes('confirm')) {
        throw new Error('Email tasdiqlanmagan. Emailingizni tekshirib tasdiqlash havolasini bosing.')
      }
      
      throw new Error('Kirishda xatolik: ' + error.message)
    }
    
    console.log('✅ Signin successful:', data.user?.email)
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
    
    // 🔧 FIX: Create email-based user ID for Google OAuth users
    // This ensures different Google accounts get different user IDs
    const userId = user.app_metadata?.provider === 'google' 
      ? `google_${user.email?.replace(/[^a-zA-Z0-9]/g, '_')}` 
      : user.id;
    
    console.log(`🔍 [DEBUG] User ID assignment: ${user.id} -> ${userId} (${user.email})`);
    
    return {
      id: userId,
      email: user.email!,
      name: user.user_metadata?.name || user.email?.split('@')[0]
    }
  },

  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email)
      if (session?.user && session?.user?.email_confirmed_at) {
        // 🔧 FIX: Create email-based user ID for Google OAuth users
        const userId = session.user.app_metadata?.provider === 'google' 
          ? `google_${session.user.email?.replace(/[^a-zA-Z0-9]/g, '_')}` 
          : session.user.id;
        
        console.log(`🔍 [DEBUG] Auth state change - User ID assignment: ${session.user.id} -> ${userId} (${session.user.email})`);
        
        const authUser: AuthUser = {
          id: userId,
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
