import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LoginForm } from "@/components/auth/login-form"
import { RegisterForm } from "@/components/auth/register-form"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/contexts/auth-context"
import { useLocation } from "wouter"

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [showEmailConfirm, setShowEmailConfirm] = useState(false)
  const { isAuthenticated } = useAuth()
  const [, setLocation] = useLocation()
  
  // If user is already authenticated, redirect to home
  useEffect(() => {
    if (isAuthenticated) {
      console.log('[AuthPage] User is authenticated, redirecting to home')
      setLocation('/')
    }
  }, [isAuthenticated, setLocation])

  if (showEmailConfirm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-container-narrow"
        >
          <Card className="border-2 border-border shadow-glow overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-accent via-accent/50 to-accent" />
            <CardHeader className="text-center p-12 pb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-20 h-20 bg-gradient-to-br from-accent to-accent/70 rounded-full flex items-center justify-center mx-auto mb-6 shadow-strong"
              >
                <svg className="w-10 h-10 text-accent-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </motion.div>
              <CardTitle className="text-2xl font-bold text-foreground">Emailni tasdiqlang</CardTitle>
              <CardDescription className="text-lg text-muted-foreground mt-2 max-w-sm mx-auto">
                Ro'yxatdan o'tish jarayonini yakunlash uchun emailingizga yuborilgan havolani bosing.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-12 pt-0">
              <div className="text-center space-y-6">
                <div className="bg-muted rounded-xl p-6 border border-border">
                  <p className="text-sm text-muted-foreground">
                    Agar email kelmagan bo'lsa, spam papkasini tekshiring.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowEmailConfirm(false)
                    setIsLogin(true)
                  }}
                  className="text-accent hover:text-accent/80 font-medium text-body-sm transition-colors duration-200 hover:underline underline-offset-4"
                >
                  ← Kirish sahifasiga qaytish
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-container-narrow">
        {/* Logo and Branding */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-4 mb-6">
            <img 
              src="https://bazptglwzqstppwlvmvb.supabase.co/storage/v1/object/public/assets/protokol57-logo.svg" 
              alt="Protokol 57 Logo" 
              className="h-12 w-auto"
            />
            <h1 className="text-4xl font-black text-foreground">Protokol 57</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-sm mx-auto">
            AI bilan professional ishlashni o'rganish platformasi
          </p>
        </motion.div>

        {/* Auth Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="border-2 border-border shadow-glow hover-lift overflow-hidden">
            
            {/* Tab Navigation */}
            <div className="flex border-b border-border">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-4 px-6 text-base font-medium transition-all duration-300 relative ${
                  isLogin 
                    ? 'text-foreground bg-background' 
                    : 'text-muted-foreground bg-muted hover:text-foreground'
                }`}
              >
                Kirish
                {isLogin && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"
                  />
                )}
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-4 px-6 text-base font-medium transition-all duration-300 relative ${
                  !isLogin 
                    ? 'text-foreground bg-background' 
                    : 'text-muted-foreground bg-muted hover:text-foreground'
                }`}
              >
                Ro'yxatdan o'tish
                {!isLogin && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"
                  />
                )}
              </button>
            </div>

            <CardContent className="p-12">
              <AnimatePresence mode="wait">
                {isLogin ? (
                  <motion.div
                    key="login"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <LoginForm onToggleMode={() => setIsLogin(false)} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="register"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <RegisterForm 
                      onToggleMode={() => setIsLogin(true)}
                      onRegistered={() => setShowEmailConfirm(true)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-12"
        >
          <p className="text-xs text-muted-foreground">
            © 2025 Protokol 57. Barcha huquqlar himoyalangan.
          </p>
        </motion.div>
      </div>
    </div>
  )
}