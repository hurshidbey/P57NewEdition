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
        // Check both query params (?token_hash=) and hash params (#token_hash=)
        let urlParams: URLSearchParams
        let token_hash: string | null = null
        let type: string | null = null

        // First, try query parameters (traditional approach)
        urlParams = new URLSearchParams(window.location.search)
        token_hash = urlParams.get('token_hash')
        type = urlParams.get('type')

        // If not found in query, check hash fragment (Supabase default)
        if (!token_hash || !type) {
          const hashString = window.location.hash.substring(1) // Remove the # character
          urlParams = new URLSearchParams(hashString)
          token_hash = urlParams.get('token_hash')
          type = urlParams.get('type')
        }

        console.log('🔍 Email confirmation params:', { token_hash: token_hash?.substring(0, 10) + '...', type })
        
        if (type === 'email' && token_hash) {
          const { error } = await supabase.auth.verifyOtp({
            token_hash,
            type: 'email'
          })
          
          if (error) {
            console.error('❌ Email verification error:', error)
            setStatus('error')
            setMessage(`Tasdiqlashda xatolik: ${error.message}`)
          } else {
            console.log('✅ Email verified successfully')
            setStatus('success')
            setMessage('Email muvaffaqiyatli tasdiqlandi!')
            setTimeout(() => window.location.href = '/', 2000)
          }
        } else {
          console.error('❌ Missing or invalid parameters:', { token_hash: !!token_hash, type })
          setStatus('error')
          setMessage('Noto\'g\'ri tasdiqlash havolasi yoki parametrlar topilmadi')
        }
      } catch (error) {
        console.error('❌ Email confirmation error:', error)
        setStatus('error')
        setMessage('Tasdiqlash jarayonida xatolik yuz berdi')
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
