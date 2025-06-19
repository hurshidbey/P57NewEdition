import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { useLocation } from "wouter"

export default function EmailConfirmPage() {
  const [location] = useLocation()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        console.log('🚀 Starting email confirmation process...')
        console.log('📍 Current URL:', window.location.href)
        
        // Check if we're coming from Supabase redirect after verification
        const urlParams = new URLSearchParams(window.location.search)
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        
        // Check for error parameters from Supabase redirect
        const error = urlParams.get('error') || hashParams.get('error')
        const errorDescription = urlParams.get('error_description') || hashParams.get('error_description')
        
        // Check for success indicators
        const accessToken = urlParams.get('access_token') || hashParams.get('access_token')
        const refreshToken = urlParams.get('refresh_token') || hashParams.get('refresh_token')
        
        console.log('📊 Redirect params:', { 
          hasError: !!error, 
          hasAccessToken: !!accessToken,
          error,
          errorDescription 
        })
        
        if (error) {
          // Supabase redirected with an error
          console.error('❌ Supabase verification failed:', error, errorDescription)
          setStatus('error')
          setMessage(`Tasdiqlashda xatolik: ${errorDescription || error}`)
        } else if (accessToken) {
          // Supabase verification was successful - tokens provided
          console.log('✅ Email verification successful - access token received')
          setStatus('success')
          setMessage('Email muvaffaqiyatli tasdiqlandi!')
          setTimeout(() => {
            console.log('🔄 Redirecting to home page...')
            window.location.href = '/'
          }, 2000)
        } else {
          // Check current auth state - user might already be logged in
          console.log('🔍 Checking current auth state...')
          const { data: { user } } = await supabase.auth.getUser()
          
          if (user && user.email_confirmed_at) {
            console.log('✅ User is already authenticated and confirmed:', user.email)
            setStatus('success')
            setMessage('Email allaqachon tasdiqlangan!')
            setTimeout(() => {
              console.log('🔄 Redirecting to home page...')
              window.location.href = '/'
            }, 2000)
          } else {
            console.log('❌ No verification result and user not authenticated')
            setStatus('error')
            setMessage('Tasdiqlash jarayoni tugallanmadi. Iltimos, qaytadan urinib ko\'ring.')
          }
        }
      } catch (error) {
        console.error('💥 Unexpected error during email confirmation:', error)
        setStatus('error')
        setMessage('Tasdiqlash jarayonida kutilmagan xatolik yuz berdi')
      }
    }

    handleEmailConfirmation()
  }, [])

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-black">
            {status === 'loading' && 'Tasdiqlanmoqda...'}
            {status === 'success' && 'Muvaffaqiyat!'}
            {status === 'error' && 'Xatolik'}
          </CardTitle>
          <CardDescription>
            {message}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {status === 'loading' && (
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
          )}
          
          {status === 'success' && (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm text-gray-600">
                Tez orada asosiy sahifaga yo'naltirilasiz...
              </p>
            </div>
          )}
          
          {status === 'error' && (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <Button 
                onClick={() => window.location.href = '/auth'}
                className="bg-accent hover:bg-accent/90"
              >
                Qaytish
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
