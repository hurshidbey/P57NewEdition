import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"
import { useLocation } from "wouter"
import { useToast } from "@/hooks/use-toast"
import { Lock } from "lucide-react"

export default function ResetPasswordPage() {
  const [, setLocation] = useLocation()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [isValidToken, setIsValidToken] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Check if we have a valid recovery token
    const checkToken = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error || !session) {
        toast({
          title: "Xatolik",
          description: "Noto'g'ri yoki muddati o'tgan havola. Iltimos, qaytadan urinib ko'ring.",
          variant: "destructive"
        })
        setTimeout(() => setLocation("/auth"), 3000)
        return
      }
      
      setIsValidToken(true)
    }
    
    checkToken()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      toast({
        title: "Xatolik",
        description: "Parollar mos kelmadi",
        variant: "destructive"
      })
      return
    }
    
    if (password.length < 6) {
      toast({
        title: "Xatolik",
        description: "Parol kamida 6 ta belgidan iborat bo'lishi kerak",
        variant: "destructive"
      })
      return
    }
    
    setLoading(true)
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })
      
      if (error) {
        throw error
      }
      
      toast({
        title: "Muvaffaqiyat!",
        description: "Parolingiz yangilandi. Endi yangi parol bilan kirishingiz mumkin.",
        duration: 5000
      })
      
      // Sign out to force re-login with new password
      await supabase.auth.signOut()
      
      // Redirect to login
      setTimeout(() => setLocation("/auth"), 2000)
    } catch (error: any) {
      toast({
        title: "Xatolik",
        description: error.message || "Parolni yangilashda xatolik yuz berdi",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-black">Kutilmoqda...</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-black">Yangi Parol O'rnatish</CardTitle>
          <CardDescription>
            Hisobingiz uchun yangi parol kiriting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Yangi Parol
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Kamida 6 ta belgi"
                className="h-12"
                required
                minLength={6}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Parolni Tasdiqlash
              </Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Parolni qayta kiriting"
                className="h-12"
                required
                minLength={6}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-12 bg-accent hover:bg-accent/90"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
                  Yangilanmoqda...
                </div>
              ) : (
                "Parolni Yangilash"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}