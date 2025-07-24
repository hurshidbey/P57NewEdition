import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '@/lib/supabase';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { getSafeRedirectDomain } from '@/utils/domain-validation';

export default function AuthCallback() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Google bilan kirilmoqda...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the session from the URL hash
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          setStatus('error');
          setMessage('Kirishda xatolik yuz berdi');
          return;
        }

        if (data.session) {
          setStatus('success');
          setMessage('Muvaffaqiyatli kirildi!');
          
          // Initialize user metadata if needed (especially for OAuth users)
          try {
            const token = data.session.access_token;
            const response = await fetch('/api/auth/initialize-metadata', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (response.ok) {
              const result = await response.json();
              console.log('[AuthCallback] Metadata initialized:', result);
            } else {
              console.error('[AuthCallback] Failed to initialize metadata:', response.status);
            }
          } catch (error) {
            console.error('[AuthCallback] Error initializing metadata:', error);
            // Don't fail the login process if metadata initialization fails
          }
          
          // Check if we need to redirect to the original domain
          const storedOrigin = localStorage.getItem('auth_origin_domain');
          const currentOrigin = window.location.origin;
          
          console.log('[AuthCallback] Stored origin:', storedOrigin);
          console.log('[AuthCallback] Current origin:', currentOrigin);
          
          // Clean up stored domain
          localStorage.removeItem('auth_origin_domain');
          
          // Get safe redirect domain (validates against allowed list)
          const safeRedirectDomain = getSafeRedirectDomain(storedOrigin);
          
          // If we're on a different domain than where auth started, redirect back
          if (storedOrigin && safeRedirectDomain !== currentOrigin) {
            console.log('[AuthCallback] Redirecting to original domain:', safeRedirectDomain);
            // Small delay to ensure session is established
            setTimeout(() => {
              window.location.href = safeRedirectDomain + '/';
            }, 1000);
          } else {
            // Redirect to home page after success
            setTimeout(() => {
              setLocation('/');
            }, 2000);
          }
        } else {
          setLocation('/auth');
        }
      } catch (err) {
        setStatus('error');
        setMessage('Kutilmagan xatolik yuz berdi');
      }
    };

    handleAuthCallback();
  }, [setLocation]);

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center space-y-4">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-[#FF4F30]" />
            <p className="text-lg text-gray-700">{message}</p>
            <p className="text-sm text-gray-500">Iltimos kuting...</p>
          </div>
        );
      
      case 'success':
        return (
          <div className="text-center space-y-4">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
            <p className="text-lg text-green-700">{message}</p>
            <p className="text-sm text-gray-500">Bosh sahifaga yo'naltirilmoqda...</p>
          </div>
        );
      
      case 'error':
        return (
          <div className="text-center space-y-4">
            <XCircle className="mx-auto h-12 w-12 text-red-500" />
            <p className="text-lg text-red-700">{message}</p>
            <button
              onClick={() => setLocation('/auth')}
              className="px-4 py-2 bg-[#FF4F30] text-white rounded-none hover:bg-[#E63E20] transition-colors"
            >
              Kirish sahifasiga qaytish
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-none shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Protokol 57</h1>
          <p className="text-gray-600 mt-2">AI Prompt Mastery Platform</p>
        </div>
        
        {renderContent()}
      </div>
    </div>
  );
}