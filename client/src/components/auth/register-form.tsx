import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

interface RegisterFormProps {
  onToggleMode: () => void
  onRegistered: () => void
}

export function RegisterForm({ onToggleMode, onRegistered }: RegisterFormProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name || !email || !password || !confirmPassword) {
      toast({
        title: "Xatolik",
        description: "Barcha maydonlarni to'ldiring",
        variant: "destructive"
      })
      return
    }

    if (password !== confirmPassword) {
      toast({
        title: "Xatolik",
        description: "Parollar mos kelmaydi",
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
      await signUp(email, password, name)
      toast({
        title: "Muvaffaqiyat!",
        description: "Emailingizga tasdiqlash havolasi yuborildi. Emailingizni tekshiring."
      })
      onRegistered()
    } catch (error: any) {
      toast({
        title: "Xatolik",
        description: error.message || "Ro'yxatdan o'tishda xatolik yuz berdi",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Ism</Label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ismingizni kiriting"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@example.com"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Parol</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Parolingizni kiriting"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Parolni tasdiqlang</Label>
        <Input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Parolingizni qayta kiriting"
          required
        />
      </div>
      
      <Button 
        type="submit" 
        className="w-full bg-accent hover:bg-accent/90"
        disabled={loading}
      >
        {loading ? "Ro'yxatdan o'tilmoqda..." : "Ro'yxatdan o'tish"}
      </Button>
      
      <p className="text-center text-sm text-gray-600">
        Hisobingiz bormi?{" "}
        <button
          type="button"
          onClick={onToggleMode}
          className="text-accent hover:underline font-medium"
        >
          Kirish
        </button>
      </p>
    </form>
  )
}
