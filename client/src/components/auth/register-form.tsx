import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import { User, Mail, Lock, CheckCircle, ArrowRight } from "lucide-react"

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

  const passwordStrength = (pass: string) => {
    if (!pass) return 0
    let strength = 0
    if (pass.length >= 6) strength++
    if (pass.length >= 8) strength++
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) strength++
    if (/[0-9]/.test(pass)) strength++
    if (/[^a-zA-Z0-9]/.test(pass)) strength++
    return Math.min(strength, 4)
  }

  const strengthLevel = passwordStrength(password)
  const strengthColors = ["bg-gray-300", "bg-red-500", "bg-yellow-500", "bg-blue-500", "bg-green-500"]
  const strengthTexts = ["", "Zaif", "O'rtacha", "Yaxshi", "Kuchli"]

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
    <form onSubmit={handleSubmit} className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-2"
      >
        <Label htmlFor="name" className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <User className="w-4 h-4" />
          Ism
        </Label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ismingizni kiriting"
          className="h-12 px-4 text-base border-2 focus:border-accent transition-colors duration-200 focus-ring"
          required
        />
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-2"
      >
        <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Mail className="w-4 h-4" />
          Email
        </Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@example.com"
          className="h-12 px-4 text-base border-2 focus:border-accent transition-colors duration-200 focus-ring"
          required
        />
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-2"
      >
        <Label htmlFor="password" className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Lock className="w-4 h-4" />
          Parol
        </Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Kuchli parol kiriting"
          className="h-12 px-4 text-base border-2 focus:border-accent transition-colors duration-200 focus-ring"
          required
        />
        {password && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="space-y-2"
          >
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                    level <= strengthLevel ? strengthColors[strengthLevel] : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
            <p className={`text-xs ${
              strengthLevel <= 1 ? "text-red-500" : 
              strengthLevel <= 2 ? "text-yellow-600" : 
              "text-green-600"
            }`}>
              Parol kuchi: {strengthTexts[strengthLevel]}
            </p>
          </motion.div>
        )}
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-2"
      >
        <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          Parolni tasdiqlang
        </Label>
        <Input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Parolni qayta kiriting"
          className={`h-12 px-4 text-base border-2 transition-colors duration-200 focus-ring ${
            confirmPassword && password !== confirmPassword 
              ? "border-red-300 focus:border-red-500" 
              : confirmPassword && password === confirmPassword
              ? "border-green-300 focus:border-green-500"
              : "focus:border-accent"
          }`}
          required
        />
        {confirmPassword && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`text-xs ${
              password !== confirmPassword ? "text-red-500" : "text-green-600"
            }`}
          >
            {password !== confirmPassword ? "Parollar mos kelmaydi" : "Parollar mos keldi ✓"}
          </motion.p>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gray-50 rounded-lg p-4 border border-gray-100"
      >
        <p className="text-xs text-gray-600">
          Ro'yxatdan o'tish orqali siz bizning <a href="#" className="text-accent hover:underline">foydalanish shartlari</a> va{" "}
          <a href="#" className="text-accent hover:underline">maxfiylik siyosati</a>ga rozilik bildirasiz.
        </p>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Button 
          type="submit" 
          className="w-full h-12 bg-accent hover:bg-gray-800 text-white font-medium text-base transition-all duration-300 hover-lift group"
          disabled={loading || !email || !password || !name || password !== confirmPassword}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Ro'yxatdan o'tilmoqda...
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              Ro'yxatdan o'tish
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          )}
        </Button>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
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
        transition={{ delay: 0.8 }}
        className="text-center text-sm text-gray-600"
      >
        Hisobingiz bormi?{" "}
        <button
          type="button"
          onClick={onToggleMode}
          className="text-accent hover:text-gray-800 font-medium transition-colors duration-200 hover:underline underline-offset-4"
        >
          Kirish
        </button>
      </motion.p>
    </form>
  )
}