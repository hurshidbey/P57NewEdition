import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LoginForm } from "@/components/auth/login-form"
import { RegisterForm } from "@/components/auth/register-form"

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [showEmailConfirm, setShowEmailConfirm] = useState(false)

  if (showEmailConfirm) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-black">Emailni tasdiqlang</CardTitle>
            <CardDescription>
              Ro'yxatdan o'tish jarayonini yakunlash uchun emailingizga yuborilgan havolani bosing.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm text-gray-600">
                Agar email kelmagan bo'lsa, spam papkasini tekshiring.
              </p>
              <button
                onClick={() => {
                  setShowEmailConfirm(false)
                  setIsLogin(true)
                }}
                className="text-accent hover:underline text-sm"
              >
                Kirish sahifasiga qaytish
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-black">
            {isLogin ? "Protokol 57" : "Ro'yxatdan o'tish"}
          </CardTitle>
          <CardDescription>
            {isLogin 
              ? "57 ta AI prompt texnikasini o'rganing"
              : "Protokol 57 ga qo'shiling"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLogin ? (
            <LoginForm onToggleMode={() => setIsLogin(false)} />
          ) : (
            <RegisterForm 
              onToggleMode={() => setIsLogin(true)}
              onRegistered={() => setShowEmailConfirm(true)}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
