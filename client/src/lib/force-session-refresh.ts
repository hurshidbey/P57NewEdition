import { supabase } from './supabase';

/**
 * Force refresh the Supabase session to get updated user metadata
 * This is needed after backend updates user tier via admin API
 */
export async function forceSessionRefresh(): Promise<boolean> {
  try {
    console.log('🔄 [Session] Forcing session refresh...');
    
    // Get current session
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    if (!currentSession) {
      console.log('❌ [Session] No active session to refresh');
      return false;
    }
    
    // Force refresh the session token
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error) {
      console.error('❌ [Session] Failed to refresh session:', error);
      return false;
    }
    
    if (!data.session) {
      console.error('❌ [Session] No session returned after refresh');
      return false;
    }
    
    console.log('✅ [Session] Session refreshed successfully');
    console.log('📊 [Session] New tier:', data.user?.user_metadata?.tier);
    
    // Force auth state change to update React context
    await supabase.auth.setSession({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token
    });
    
    return true;
  } catch (error) {
    console.error('❌ [Session] Error during refresh:', error);
    return false;
  }
}