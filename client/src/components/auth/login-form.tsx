import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import { Mail, Lock, ArrowRight } from "lucide-react"
import { useLocation } from "wouter"
import { GoogleOAuthButton } from "./google-oauth-button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface LoginFormProps {
  onToggleMode: () => void
}

export function LoginForm({ onToggleMode }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [lastSubmit, setLastSubmit] = useState<number>(0)
  const { signIn, resetPasswordForEmail } = useAuth()
  const { toast } = useToast()
  const [, setLocation] = useLocation()
  const [testLoading, setTestLoading] = useState<string | null>(null)
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [resetEmail, setResetEmail] = useState("")
  const [resetLoading, setResetLoading] = useState(false)

  // Test users for development
  const testUsers = import.meta.env.DEV ? [
    { email: 'test@p57.uz', password: 'test123456', name: 'Test User', tier: 'free' },
    { email: 'premium@p57.uz', password: 'premium123456', name: 'Premium User', tier: 'paid' },
    { email: 'admin@p57.uz', password: 'admin123456', name: 'Admin User', tier: 'paid' }
  ] : []

  const handleTestLogin = async (testUser: typeof testUsers[0]) => {
    setTestLoading(testUser.email)
    
    try {
      const response = await fetch('/api/auth/test-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser)
      })

      const data = await response.json()

      if (data.success && data.session) {
        // Set the session in Supabase client
        const { supabase } = await import('@/lib/supabase')
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token
        })

        if (sessionError) {
          console.error('Failed to set session:', sessionError)
          toast({
            title: "Xatolik",
            description: "Sessiyani o'rnatishda xatolik",
            variant: "destructive"
          })
          return
        }
        
        // Trigger auth state refresh
        await supabase.auth.getUser()
        
        toast({
          title: `Xush kelibsiz, ${testUser.name}!`,
          description: `${testUser.email === 'admin@p57.uz' ? 'Admin (Premium kirish)' : testUser.tier === 'paid' ? 'Premium' : 'Oddiy'} foydalanuvchi sifatida kirdingiz`
        })

        // Reload to refresh auth state
        setTimeout(() => {
          window.location.href = '/'
        }, 1000)
      } else {
        toast({
          title: "Xatolik",
          description: data.message || "Test foydalanuvchi bilan kirish amalga oshmadi",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Xatolik",
        description: "Serverga ulanishda xatolik",
        variant: "destructive"
      })
    } finally {
      setTestLoading(null)
    }
  }

  const handlePasswordReset = async () => {
    if (!resetEmail) {
      toast({
        title: "Xatolik",
        description: "Email manzilingizni kiriting",
        variant: "destructive"
      })
      return
    }

    setResetLoading(true)
    
    try {
      await resetPasswordForEmail(resetEmail)
      toast({
        title: "Muvaffaqiyat!",
        description: "Parolni tiklash havolasi emailingizga yuborildi. Iltimos, spam papkasini ham tekshiring.",
        duration: 8000
      })
      setShowResetDialog(false)
      setResetEmail("")
    } catch (error: any) {
      toast({
        title: "Xatolik",
        description: error.message || "Parolni tiklashda xatolik yuz berdi",
        variant: "destructive"
      })
    } finally {
      setResetLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Prevent rapid-fire submissions
    const now = Date.now()
    if (now - lastSubmit < 3000) { // 3 second cooldown
      toast({
        title: "Iltimos kuting",
        description: "Juda tez urinish. 3 soniya kutib qayta urinib ko'ring.",
        variant: "destructive"
      })
      return
    }
    
    if (!email || !password) {
      toast({
        title: "Xatolik",
        description: "Barcha maydonlarni to'ldiring",
        variant: "destructive"
      })
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast({
        title: "Xatolik",
        description: "Email manzili noto'g'ri formatda",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    setLastSubmit(now)
    
    try {
      await signIn(email, password)
      toast({
        title: "Muvaffaqiyat!",
        description: "Tizimga kirildi"
      })
      
      // Clear form on success
      setEmail("")
      setPassword("")
      
      // Redirect to home page after successful login
      setTimeout(() => {
        setLocation("/")
      }, 500)
    } catch (error: any) {

      toast({
        title: "Xatolik",
        description: error.message || "Kirish jarayonida xatolik yuz berdi",
        variant: "destructive",
        duration: 8000 // Show error longer
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
    <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-2"
      >
        <Label htmlFor="email" className="text-sm font-medium text-foreground flex items-center gap-2">
          <Mail className="w-4 h-4" />
          Email
        </Label>
        <div className="relative">
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Emailingizni kiriting"
            className="h-12 px-4 text-base border-2 focus:border-accent transition-colors duration-200 focus-ring"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            required
          />
        </div>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-2"
      >
        <Label htmlFor="password" className="text-sm font-medium text-foreground flex items-center gap-2">
          <Lock className="w-4 h-4" />
          Parol
        </Label>
        <div className="relative">
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Parolingizni kiriting"
            className="h-12 px-4 text-base border-2 focus:border-accent transition-colors duration-200 focus-ring"
            autoComplete="new-password"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            required
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex justify-end"
      >
        <button
          type="button"
          onClick={() => {
            setResetEmail(email) // Pre-fill with current email if available
            setShowResetDialog(true)
          }}
          className="text-sm text-muted-foreground hover:text-accent transition-colors duration-200"
        >
          Parolni unutdingizmi?
        </button>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Button 
          type="submit" 
          className="w-full h-12 bg-accent hover:bg-accent/90 text-accent-foreground font-medium text-base transition-all duration-300 hover-lift group"
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
              Kirilmoqda...
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              Kirish
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          )}
        </Button>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="relative"
      >
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-black"></div>
        </div>
        <div className="relative flex justify-center text-caption">
          <span className="bg-background px-4 text-muted-foreground">yoki</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="space-y-4"
      >
        <GoogleOAuthButton>
          Google bilan kirish
        </GoogleOAuthButton>
      </motion.div>

      {/* Test users for development */}
      {import.meta.env.DEV && testUsers.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="space-y-3"
        >
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-dashed border-muted-foreground/30"></div>
            </div>
            <div className="relative flex justify-center text-caption">
              <span className="bg-background px-4 text-xs text-muted-foreground">Test foydalanuvchilar</span>
            </div>
          </div>
          
          <div className="space-y-2">
            {testUsers.map((user) => (
              <Button
                key={user.email}
                type="button"
                variant="outline"
                className="w-full h-10 text-sm border-dashed border-muted-foreground/30 hover:border-accent/50 transition-all duration-200"
                onClick={() => handleTestLogin(user)}
                disabled={testLoading !== null}
              >
                {testLoading === user.email ? (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                    Kirilmoqda...
                  </div>
                ) : (
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium">{user.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {user.email === 'admin@p57.uz' ? '(Admin + Premium)' : user.tier === 'paid' ? '(Premium)' : '(Free)'}
                    </span>
                  </div>
                )}
              </Button>
            ))}
          </div>
        </motion.div>
      )}

      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-center text-sm text-muted-foreground"
      >
        Hisobingiz yo'qmi?{" "}
        <button
          type="button"
          onClick={onToggleMode}
          className="text-accent hover:text-accent/80 font-medium transition-colors duration-200 hover:underline underline-offset-4"
        >
          Ro'yxatdan o'ting
        </button>
      </motion.p>
    </form>

    {/* Password Reset Dialog */}
    <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Parolni Tiklash</DialogTitle>
          <DialogDescription>
            Email manzilingizni kiriting. Sizga parolni tiklash havolasi yuboriladi.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="reset-email">Email</Label>
            <Input
              id="reset-email"
              type="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              placeholder="email@example.com"
              className="h-12"
            />
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowResetDialog(false)}
              className="flex-1"
            >
              Bekor qilish
            </Button>
            <Button
              onClick={handlePasswordReset}
              disabled={resetLoading}
              className="flex-1 bg-accent hover:bg-accent/90"
            >
              {resetLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
                  Yuborilmoqda...
                </div>
              ) : (
                "Yuborish"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  )
}