// Force Cache Refresh Script
// This script can be added to the app to force a refresh if the version doesn't match

(function() {
  const STORAGE_KEY = 'protokol57-version';
  const CURRENT_VERSION = 'v2025-01-20-atmos-fix';
  
  // Get stored version
  const storedVersion = localStorage.getItem(STORAGE_KEY);
  
  // If version doesn't match, clear everything and reload
  if (storedVersion !== CURRENT_VERSION) {
    console.log('New version detected, clearing cache...');
    
    // Clear all caches
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
    
    // Clear localStorage except auth data
    const authData = localStorage.getItem('supabase.auth.token');
    localStorage.clear();
    if (authData) {
      localStorage.setItem('supabase.auth.token', authData);
    }
    
    // Set new version
    localStorage.setItem(STORAGE_KEY, CURRENT_VERSION);
    
    // Force reload with cache bypass
    window.location.reload(true);
  }
})();