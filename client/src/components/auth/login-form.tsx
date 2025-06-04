import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

interface LoginFormProps {
  onToggleMode: () => void
}

export function LoginForm({ onToggleMode }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast({
        title: "Xatolik",
        description: "Barcha maydonlarni to'ldiring",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      await signIn(email, password)
      toast({
        title: "Muvaffaqiyat!",
        description: "Tizimga kirildi"
      })
    } catch (error: any) {
      toast({
        title: "Xatolik",
        description: error.message || "Kirish jarayonida xatolik yuz berdi",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
      
      <Button 
        type="submit" 
        className="w-full bg-accent hover:bg-accent/90"
        disabled={loading}
      >
        {loading ? "Kirilmoqda..." : "Kirish"}
      </Button>
      
      <p className="text-center text-sm text-gray-600">
        Hisobingiz yo'qmi?{" "}
        <button
          type="button"
          onClick={onToggleMode}
          className="text-accent hover:underline font-medium"
        >
          Ro'yxatdan o'ting
        </button>
      </p>
    </form>
  )
}
