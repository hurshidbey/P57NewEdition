import { useEffect, useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { useLocation } from "wouter"

export default function EmailConfirmPage() {
  const [location] = useLocation()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const hasRun = useRef(false) // Prevent multiple runs

  useEffect(() => {
    // Prevent multiple executions due to auth context re-renders
    if (hasRun.current) {

      return
    }
    hasRun.current = true

    const handleEmailConfirmation = async () => {
      try {

        // ROBUST AUTH CHECK: Check multiple times with different intervals
        const checkAuthAndRedirect = async (attempt = 1) => {

          const { data: { user }, error } = await supabase.auth.getUser()

          if (user && user.email_confirmed_at) {

            setStatus('success')
            setMessage('Email muvaffaqiyatli tasdiqlandi!')
            setTimeout(() => {

              window.location.href = '/'
            }, 1500)
            return true // Success
          }
          
          return false // Not ready yet
        }
        
        // Try immediate check
        if (await checkAuthAndRedirect(1)) return
        
        // Try again after 500ms (auth might be loading)
        setTimeout(async () => {
          if (await checkAuthAndRedirect(2)) return
          
          // Try again after 1500ms (final attempt)
          setTimeout(async () => {
            if (await checkAuthAndRedirect(3)) return
            
            // If still no success, check for Supabase redirect params

            const urlParams = new URLSearchParams(window.location.search)
            const hashParams = new URLSearchParams(window.location.hash.substring(1))
            
            const error = urlParams.get('error') || hashParams.get('error')
            const accessToken = urlParams.get('access_token') || hashParams.get('access_token')
            
            if (error) {

              setStatus('error')
              setMessage(`Tasdiqlashda xatolik: ${error}`)
            } else if (accessToken) {

              setStatus('success')
              setMessage('Email muvaffaqiyatli tasdiqlandi!')
              setTimeout(() => window.location.href = '/', 1500)
            } else {

              setStatus('error')
              setMessage('Tasdiqlash jarayoni tugallanmadi. Iltimos, qaytadan urinib ko\'ring.')
            }
          }, 1500)
        }, 500)
      } catch (error) {

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
