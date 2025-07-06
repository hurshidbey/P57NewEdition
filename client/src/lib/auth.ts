import { supabase } from './supabase'
import type { User } from '@supabase/supabase-js';

export interface AuthUser {
  id: string
  email: string
  name?: string
  tier?: string
  paidAt?: string
  role?: string
}

export const authService = {
  async signUp(email: string, password: string, name?: string) {

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
          name: name || email.split('@')[0],
          tier: 'free' // New users start with free tier
        }
      }
    })
    
    if (error) {

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

    return data
  },

  async signIn(email: string, password: string) {

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

    return data
  },

  async signInWithGoogle() {

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    
    if (error) {

      throw error
    }

    return data
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return null

    // 🔧 FIX: Create email-based user ID for Google OAuth users
    // This ensures different Google accounts get different user IDs
    const userId = user.app_metadata?.provider === 'google' 
      ? `google_${user.email?.replace(/[^a-zA-Z0-9]/g, '_')}` 
      : user.id;
    
    console.log(`🔍 [DEBUG] User ID assignment: ${user.id} -> ${userId} (${user.email})`);
    
    // Check if user is admin based on their email
    // Note: This is temporary - ideally this should come from user metadata or a database role
    const adminEmails = ['hurshidbey@gmail.com', 'mustafaabdurahmonov7777@gmail.com'];
    const isAdmin = adminEmails.includes(user.email || '');
    
    return {
      id: userId,
      email: user.email!,
      name: user.user_metadata?.name || user.email?.split('@')[0],
      tier: isAdmin ? 'paid' : (user.user_metadata?.tier || 'free'),
      paidAt: user.user_metadata?.paidAt,
      role: isAdmin ? 'admin' : undefined
    }
  },

  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {

      if (session?.user && session?.user?.email_confirmed_at) {
        // 🔧 FIX: Create email-based user ID for Google OAuth users
        const userId = session.user.app_metadata?.provider === 'google' 
          ? `google_${session.user.email?.replace(/[^a-zA-Z0-9]/g, '_')}` 
          : session.user.id;
        
        console.log(`🔍 [DEBUG] Auth state change - User ID assignment: ${session.user.id} -> ${userId} (${session.user.email})`);
        
        // Check if user is admin based on their email
        const adminEmails = ['hurshidbey@gmail.com', 'mustafaabdurahmonov7777@gmail.com'];
        const isAdmin = adminEmails.includes(session.user.email || '');
        
        const authUser: AuthUser = {
          id: userId,
          email: session.user.email!,
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0],
          tier: isAdmin ? 'paid' : (session.user.user_metadata?.tier || 'free'),
          paidAt: session.user.user_metadata?.paidAt,
          role: isAdmin ? 'admin' : undefined
        }
        callback(authUser)
      } else {
        callback(null)
      }
    })
    return data
  }
}
