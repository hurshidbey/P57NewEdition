import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '@/lib/supabase';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

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
          
          // Redirect to home page after success
          setTimeout(() => {
            setLocation('/');
          }, 2000);
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