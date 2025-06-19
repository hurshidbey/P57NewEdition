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
        console.log('🔍 Query string:', window.location.search)
        console.log('🔗 Hash fragment:', window.location.hash)
        
        // Check both query params (?token=) and hash params (#token_hash=)
        let urlParams: URLSearchParams
        let token: string | null = null
        let type: string | null = null

        // First, try query parameters (most common for email links)
        urlParams = new URLSearchParams(window.location.search)
        token = urlParams.get('token') || urlParams.get('token_hash')
        type = urlParams.get('type')
        
        console.log('📝 Query params extracted:', { token: token?.substring(0, 10) + '...', type })

        // If not found in query, check hash fragment (Supabase sometimes uses this)
        if (!token || !type) {
          const hashString = window.location.hash.substring(1)
          if (hashString) {
            urlParams = new URLSearchParams(hashString)
            token = token || urlParams.get('token') || urlParams.get('token_hash')
            type = type || urlParams.get('type')
            console.log('📝 Hash params extracted:', { token: token?.substring(0, 10) + '...', type })
          }
        }

        console.log('🔑 Final params:', { 
          hasToken: !!token, 
          tokenLength: token?.length,
          type: type,
          tokenPreview: token?.substring(0, 15) + '...'
        })
        
        // Handle different type formats
        const isValidType = type === 'email' || type === 'signup' || type === 'email_confirmation'
        
        if (isValidType && token) {
          console.log('✅ Valid parameters found, attempting verification...')
          
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: type === 'signup' ? 'email' : type as any
          })
          
          console.log('📊 Verification result:', { data, error })
          
          if (error) {
            console.error('❌ Email verification failed:', error.message)
            setStatus('error')
            setMessage(`Tasdiqlashda xatolik: ${error.message}`)
          } else {
            console.log('✅ Email verified successfully!')
            console.log('👤 User data:', data)
            setStatus('success')
            setMessage('Email muvaffaqiyatli tasdiqlandi!')
            setTimeout(() => {
              console.log('🔄 Redirecting to home page...')
              window.location.href = '/'
            }, 2000)
          }
        } else {
          console.error('❌ Invalid or missing parameters:', { 
            hasToken: !!token, 
            type: type, 
            isValidType: isValidType,
            allParams: Object.fromEntries(new URLSearchParams(window.location.search))
          })
          setStatus('error')
          setMessage('Noto\'g\'ri tasdiqlash havolasi yoki parametrlar topilmadi')
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
