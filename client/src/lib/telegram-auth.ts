// Custom Telegram authentication without Supabase Auth
export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

export interface TelegramAuthUser {
  id: string;
  telegram_id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}

export interface TelegramAuthSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: TelegramAuthUser;
}

const TOKEN_KEY = 'protokol57_telegram_token';
const REFRESH_TOKEN_KEY = 'protokol57_telegram_refresh';
const USER_KEY = 'protokol57_telegram_user';

export const telegramAuth = {
  async signIn(telegramData: TelegramUser): Promise<TelegramAuthSession> {
    console.log('🔐 TELEGRAM AUTH v7.0 - Custom JWT auth');
    console.log('👤 User:', telegramData.id, telegramData.first_name);
    
    try {
      // Send to our new v2 endpoint
      const response = await fetch('/api/auth/telegram-v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(telegramData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('❌ Server auth error:', data);
        throw new Error(data.error || 'Telegram orqali kirishda xatolik');
      }

      console.log('✅ Server auth successful, storing tokens...');
      
      // Store tokens and user data
      localStorage.setItem(TOKEN_KEY, data.access_token);
      localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      
      // Set authorization header for future requests
      this.setAuthHeader(data.access_token);
      
      return data;
      
    } catch (error: any) {
      console.error('❌ Telegram auth error:', error);
      throw error;
    }
  },

  getCurrentUser(): TelegramAuthUser | null {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setAuthHeader(token: string) {
    // Set default header for fetch requests
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
      let [resource, config] = args;
      
      // Only add header for API requests
      if (typeof resource === 'string' && resource.startsWith('/api/')) {
        config = config || {};
        
        // Convert headers to Headers object if needed
        const headers = new Headers(config.headers);
        
        // Don't override if Authorization is already set
        if (!headers.has('Authorization')) {
          headers.set('Authorization', `Bearer ${token}`);
        }
        
        config.headers = headers;
      }
      
      return originalFetch(resource, config);
    };
  },

  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getCurrentUser();
  },

  signOut() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    
    // Reset fetch
    window.location.reload();
  },

  // Initialize auth on app load
  init() {
    const token = this.getToken();
    if (token) {
      this.setAuthHeader(token);
    }
  }
};