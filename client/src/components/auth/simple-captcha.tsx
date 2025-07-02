import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"
import { RefreshCw, Calculator } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SimpleCaptchaProps {
  onValidationChange: (isValid: boolean) => void
  className?: string
}

export function SimpleCaptcha({ onValidationChange, className }: SimpleCaptchaProps) {
  const [num1, setNum1] = useState(0)
  const [num2, setNum2] = useState(0)
  const [operator, setOperator] = useState<'+' | '-' | '*'>('+')
  const [answer, setAnswer] = useState("")
  const [isValid, setIsValid] = useState(false)

  const generateCaptcha = () => {
    const operators: ('+' | '-' | '*')[] = ['+', '-', '*']
    const randomOperator = operators[Math.floor(Math.random() * operators.length)]
    
    let n1: number, n2: number
    
    switch (randomOperator) {
      case '+':
        n1 = Math.floor(Math.random() * 15) + 1  // 1-15 (simple calculations)
        n2 = Math.floor(Math.random() * 15) + 1  // 1-15 (simple calculations)
        break
      case '-':
        n1 = Math.floor(Math.random() * 15) + 10  // 10-25 (simple subtraction)
        n2 = Math.floor(Math.random() * 9) + 1    // 1-9 (ensure positive result)
        break
      case '*':
        n1 = Math.floor(Math.random() * 5) + 2    // 2-6 (very simple multiplication)
        n2 = Math.floor(Math.random() * 5) + 2    // 2-6 (very simple multiplication)
        break
      default:
        n1 = 5
        n2 = 3
    }
    
    setNum1(n1)
    setNum2(n2)
    setOperator(randomOperator)
    setAnswer("")
    setIsValid(false)
    onValidationChange(false)
  }

  const getCorrectAnswer = (): number => {
    switch (operator) {
      case '+':
        return num1 + num2
      case '-':
        return num1 - num2
      case '*':
        return num1 * num2
      default:
        return 0
    }
  }

  const validateAnswer = (userAnswer: string) => {
    const correctAnswer = getCorrectAnswer()
    const userNum = parseInt(userAnswer, 10)
    const valid = !isNaN(userNum) && userNum === correctAnswer
    setIsValid(valid)
    onValidationChange(valid)
  }

  const handleAnswerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setAnswer(value)
    validateAnswer(value)
  }

  const handleRefresh = () => {
    generateCaptcha()
  }

  useEffect(() => {
    generateCaptcha()
  }, [])

  const getOperatorText = () => {
    switch (operator) {
      case '+':
        return 'qo\'shish'
      case '-':
        return 'ayirish'
      case '*':
        return 'ko\'paytirish'
      default:
        return 'hisoblash'
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`space-y-3 ${className}`}
    >
      <Label className="text-sm font-medium text-foreground flex items-center gap-2">
        <Calculator className="w-4 h-4" />
        Oddiy tekshirish
      </Label>
      
      <div className="bg-muted/30 rounded-none p-4 border border-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="text-lg font-mono font-bold text-foreground bg-background rounded px-3 py-2 border">
              {num1} {operator} {num2} = ?
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="h-8 w-8 p-0 hover:bg-accent/10"
              title="Yangi masala yaratish"
            >
              <RefreshCw className="w-3 h-3" />
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="captcha-answer" className="text-xs text-muted-foreground">
            {num1} va {num2} sonlarining {getOperatorText} natijasini kiriting:
          </Label>
          <div className="flex gap-2">
            <Input
              id="captcha-answer"
              type="number"
              value={answer}
              onChange={handleAnswerChange}
              placeholder="Javob"
              className={`h-10 px-3 text-center font-mono border-2 transition-colors duration-200 ${
                answer 
                  ? isValid 
                    ? "border-green-300 focus:border-green-500 bg-green-50/50" 
                    : "border-red-300 focus:border-red-500 bg-red-50/50"
                  : "focus:border-accent"
              }`}
              autoComplete="off"
              autoCorrect="off"
              min="0"
              step="1"
            />
          </div>
          
          {answer && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`text-xs ${
                isValid ? "text-green-600" : "text-red-500"
              }`}
            >
              {isValid ? "To'g'ri javob ✓" : "Noto'g'ri javob, qayta urinib ko'ring"}
            </motion.p>
          )}
        </div>
      </div>
    </motion.div>
  )
}