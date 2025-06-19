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
        console.log('🔍 Full search params:', window.location.search)
        console.log('🔗 Full hash:', window.location.hash)
        
        // SIMPLE FIX: Just check if user is already authenticated with confirmed email
        console.log('🔍 [SIMPLE CHECK] Checking if user is already authenticated...')
        const { data: { user: quickUser } } = await supabase.auth.getUser()
        console.log('👤 [SIMPLE CHECK] Quick user check:', {
          hasUser: !!quickUser,
          email: quickUser?.email,
          emailConfirmed: quickUser?.email_confirmed_at,
          isConfirmed: !!quickUser?.email_confirmed_at
        })
        
        if (quickUser && quickUser.email_confirmed_at) {
          console.log('✅ [SIMPLE CHECK] User already authenticated and confirmed - showing success!')
          setStatus('success')
          setMessage('Email muvaffaqiyatli tasdiqlandi!')
          setTimeout(() => {
            console.log('🔄 Redirecting to home page...')
            window.location.href = '/'
          }, 2000)
          return // Exit early - we're done!
        }
        
        // Check if we're coming from Supabase redirect after verification
        const urlParams = new URLSearchParams(window.location.search)
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        
        // Log all parameters for debugging
        console.log('📋 All query params:')
        for (let [key, value] of urlParams.entries()) {
          console.log(`  ${key}: ${value}`)
        }
        console.log('📋 All hash params:')
        for (let [key, value] of hashParams.entries()) {
          console.log(`  ${key}: ${value}`)
        }
        
        // Check for error parameters from Supabase redirect
        const error = urlParams.get('error') || hashParams.get('error')
        const errorDescription = urlParams.get('error_description') || hashParams.get('error_description')
        
        // Check for success indicators
        const accessToken = urlParams.get('access_token') || hashParams.get('access_token')
        const refreshToken = urlParams.get('refresh_token') || hashParams.get('refresh_token')
        
        console.log('📊 Redirect params summary:', { 
          hasError: !!error, 
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          error,
          errorDescription,
          queryParamCount: urlParams.size,
          hashParamCount: hashParams.size
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
          const { data: { user }, error: userError } = await supabase.auth.getUser()
          
          console.log('👤 Current user state:', { 
            hasUser: !!user, 
            email: user?.email,
            emailConfirmed: user?.email_confirmed_at,
            userError: userError?.message
          })
          
          if (user) {
            if (user.email_confirmed_at) {
              console.log('✅ User is authenticated and email confirmed')
              setStatus('success')
              setMessage('Email muvaffaqiyatli tasdiqlandi!')
              setTimeout(() => {
                console.log('🔄 Redirecting to home page...')
                window.location.href = '/'
              }, 2000)
            } else {
              console.log('⚠️ User authenticated but email not confirmed yet')
              setStatus('error')
              setMessage('Email hali tasdiqlanmagan. Iltimos, biroz kuting yoki qaytadan urinib ko\'ring.')
            }
          } else {
            console.log('❌ No user authenticated')
            
            // One more attempt - wait a bit and check again (auth might be loading)
            setTimeout(async () => {
              const { data: { user: retryUser } } = await supabase.auth.getUser()
              console.log('🔄 Retry check - user:', retryUser?.email, 'confirmed:', retryUser?.email_confirmed_at)
              
              if (retryUser && retryUser.email_confirmed_at) {
                console.log('✅ User found on retry - showing success')
                setStatus('success')
                setMessage('Email muvaffaqiyatli tasdiqlandi!')
                setTimeout(() => window.location.href = '/', 2000)
              } else {
                setStatus('error')
                setMessage('Tasdiqlash jarayoni tugallanmadi. Iltimos, qaytadan urinib ko\'ring.')
              }
            }, 1000)
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
