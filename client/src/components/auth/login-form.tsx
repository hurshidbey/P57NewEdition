import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import { Mail, Lock, ArrowRight } from "lucide-react"

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
    <form onSubmit={handleSubmit} className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-2"
      >
        <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Mail className="w-4 h-4" />
          Email
        </Label>
        <div className="relative">
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            className="h-12 px-4 text-base border-2 focus:border-accent transition-colors duration-200 focus-ring"
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
        <Label htmlFor="password" className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Lock className="w-4 h-4" />
          Parol
        </Label>
        <div className="relative">
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="h-12 px-4 text-base border-2 focus:border-accent transition-colors duration-200 focus-ring"
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
          className="text-sm text-gray-600 hover:text-accent transition-colors duration-200"
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
          className="w-full h-12 bg-accent hover:bg-gray-800 text-white font-medium text-base transition-all duration-300 hover-lift group"
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-caption">
          <span className="bg-white px-4 text-gray-500">yoki</span>
        </div>
      </motion.div>

      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center text-sm text-gray-600"
      >
        Hisobingiz yo'qmi?{" "}
        <button
          type="button"
          onClick={onToggleMode}
          className="text-accent hover:text-gray-800 font-medium transition-colors duration-200 hover:underline underline-offset-4"
        >
          Ro'yxatdan o'ting
        </button>
      </motion.p>
    </form>
  )
}