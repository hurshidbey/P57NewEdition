import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, 
  ArrowLeft, 
  BookOpen, 
  Brain, 
  Lightbulb, 
  Hash, 
  Zap, 
  CheckCircle, 
  MessageSquare, 
  Target, 
  Sparkles,
  Info,
  AlertCircle,
  Code,
  Layers,
  ChevronRight,
  FileText,
  Workflow,
  GitBranch,
  Cpu,
  Users,
  Play,
  Pause
} from "lucide-react";
import { Link } from "wouter";
import AppHeader from "@/components/app-header";
import AppFooter from "@/components/app-footer";

interface FlipCardProps {
  term: string;
  definition: string;
  icon?: React.ReactNode;
  examples?: string[];
}

function FlipCard({ term, definition, icon, examples }: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <motion.div 
      className="relative w-full h-64 cursor-pointer perspective-1000 group"
      onClick={() => setIsFlipped(!isFlipped)}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className={`absolute inset-0 w-full h-full transition-transform duration-700 transform-style-preserve-3d ${
        isFlipped ? 'rotate-y-180' : ''
      }`}>
        {/* Front */}
        <div className="absolute inset-0 w-full h-full backface-hidden">
          <Card className="h-full border-2 border-gray-100 hover:border-accent transition-all shadow-medium hover:shadow-strong">
            <CardContent className="h-full flex flex-col items-center justify-center text-center p-6">
              {icon && <div className="mb-4 text-accent">{icon}</div>}
              <h3 className="text-xl font-bold text-black mb-2">{term}</h3>
              <p className="text-sm text-gray-500">Bosing ko'rish uchun</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Back */}
        <div className="absolute inset-0 w-full h-full rotate-y-180 backface-hidden">
          <Card className="h-full bg-gradient-to-br from-accent to-gray-800 text-white border-2 border-accent overflow-y-auto shadow-strong">
            <CardContent className="h-full flex flex-col justify-center p-6">
              <p className="text-base leading-relaxed mb-4">{definition}</p>
              {examples && examples.length > 0 && (
                <div className="mt-auto pt-4 border-t border-white/20">
                  <p className="text-xs opacity-80 mb-2">Misollar:</p>
                  {examples.map((example, idx) => (
                    <p key={idx} className="text-xs opacity-90">• {example}</p>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}

interface KnowledgeCheckProps {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  onAnswer: (isCorrect: boolean) => void;
}

function KnowledgeCheck({ question, options, correctAnswer, explanation, onAnswer }: KnowledgeCheckProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleSelect = (index: number) => {
    setSelected(index);
    setShowResult(true);
    onAnswer(index === correctAnswer);
  };

  return (
    <Card className="border-2 border-gray-100 shadow-soft hover:shadow-medium transition-all">
      <CardContent className="p-6">
        <h4 className="font-semibold text-lg mb-4">{question}</h4>
        <div className="space-y-3">
          {options.map((option, index) => (
            <motion.button
              key={index}
              onClick={() => handleSelect(index)}
              disabled={showResult}
              whileHover={{ scale: showResult ? 1 : 1.01 }}
              whileTap={{ scale: showResult ? 1 : 0.99 }}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                showResult && index === correctAnswer
                  ? 'border-green-500 bg-green-50'
                  : showResult && index === selected && index !== correctAnswer
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 hover:border-accent'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 border-2 rounded-full flex items-center justify-center text-sm font-bold">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="text-base">{option}</span>
              </div>
            </motion.button>
          ))}
        </div>
        {showResult && explanation && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Alert className="mt-4 border-accent/20">
              <Info className="h-4 w-4" />
              <AlertDescription>{explanation}</AlertDescription>
            </Alert>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

interface InteractiveExampleProps {
  title: string;
  badPrompt: string;
  goodPrompt: string;
  explanation: string;
}

function InteractiveExample({ title, badPrompt, goodPrompt, explanation }: InteractiveExampleProps) {
  const [showGood, setShowGood] = useState(false);

  return (
    <Card className="border-2 border-gray-200">
      <CardContent className="p-6">
        <h4 className="font-semibold text-lg mb-4">{title}</h4>
        
        <div className="space-y-4">
          {/* Bad Example */}
          <div className={`transition-opacity ${showGood ? 'opacity-50' : ''}`}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs font-bold">✗</div>
              <span className="text-sm font-medium text-red-600">Yomon misol</span>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm font-mono text-gray-800">{badPrompt}</p>
            </div>
          </div>

          {/* Toggle Button */}
          <div className="flex justify-center">
            <Button
              onClick={() => setShowGood(!showGood)}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              {showGood ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {showGood ? "Yomon misolni ko'rish" : "Yaxshi misolni ko'rish"}
            </Button>
          </div>

          {/* Good Example */}
          <div className={`transition-opacity ${!showGood ? 'opacity-50' : ''}`}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold">✓</div>
              <span className="text-sm font-medium text-green-600">Yaxshi misol</span>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm font-mono text-gray-800">{goodPrompt}</p>
            </div>
          </div>

          {/* Explanation */}
          <Alert className="border-blue-200 bg-blue-50">
            <Lightbulb className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">{explanation}</AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  );
}

interface TryItYourselfProps {
  task: string;
  hints: string[];
  sampleSolution: string;
}

function TryItYourself({ task, hints, sampleSolution }: TryItYourselfProps) {
  const [userInput, setUserInput] = useState("");
  const [showHints, setShowHints] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  return (
    <Card className="border-2 border-accent/20 bg-gradient-to-r from-accent/5 to-accent/10">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Code className="w-5 h-5 text-accent" />
          <h4 className="font-semibold text-lg">O'zingiz sinab ko'ring!</h4>
        </div>
        
        <p className="text-gray-700 mb-4">{task}</p>
        
        <Textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Promptingizni shu yerga yozing..."
          className="mb-4 min-h-[120px]"
        />

        <div className="flex gap-2 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHints(!showHints)}
          >
            {showHints ? "Maslahatlarni yashirish" : "Maslahat olish"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSolution(!showSolution)}
          >
            {showSolution ? "Yechimni yashirish" : "Yechimni ko'rish"}
          </Button>
        </div>

        {showHints && (
          <Alert className="mb-4">
            <Lightbulb className="h-4 w-4" />
            <AlertDescription>
              <ul className="list-disc list-inside space-y-1">
                {hints.map((hint, idx) => (
                  <li key={idx} className="text-sm">{hint}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {showSolution && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-600 mb-2">Namuna yechim:</p>
            <p className="text-sm font-mono text-gray-800 whitespace-pre-wrap">{sampleSolution}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Onboarding() {
  const [currentSection, setCurrentSection] = useState(0);
  const [tokenText, setTokenText] = useState("");
  const [completedSections, setCompletedSections] = useState<Set<number>>(new Set());
  const [knowledgeScore, setKnowledgeScore] = useState(0);
  
  // Approximate token calculation
  const calculateTokens = (text: string) => {
    return Math.ceil(text.length / 3);
  };

  // Mark section as completed when leaving it
  useEffect(() => {
    setCompletedSections(prev => new Set(Array.from(prev).concat(currentSection)));
  }, [currentSection]);

  const sections = [
    {
      id: "intro",
      title: "Kirish",
      icon: <BookOpen className="w-5 h-5" />,
      content: (
        <div className="space-y-8">
          {/* Hero Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <Badge className="mb-4 bg-accent/10 text-accent border-accent/20">
              Yangi boshlanish
            </Badge>
            <h1 className="text-5xl font-black text-black mb-6 leading-tight">
              ChatGPT bilan to'g'ri ishlashni o'rganing
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto">
              Bu qo'llanma ChatGPT bilan muloyim gaplashishni o'rgatmaydi. 
              <span className="font-bold text-black"> Bu yerda faqat natija muhim.</span>
            </p>
          </motion.div>
          
          {/* Why This Matters - New Section */}
          <Card className="border-2 border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6">
              <h3 className="text-xl font-bold text-black mb-4">Nima uchun bu muhim?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Bugunga qadar:</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">→</span>
                      <span>AI'dan 10% foydalanish</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">→</span>
                      <span>Oddiy savol-javob darajasi</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">→</span>
                      <span>Natijalardan ko'ngilsizlik</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">O'rganganingizdan keyin:</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">→</span>
                      <span>AI imkoniyatlaridan 90% foydalanish</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">→</span>
                      <span>Professional darajadagi promptlar</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">→</span>
                      <span>5-10x yaxshi natijalar</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>

          {/* Key Points Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="border-2 border-gray-100 hover:border-accent transition-all shadow-soft hover:shadow-medium hover-lift">
              <CardContent className="p-6 text-center">
                <Zap className="w-12 h-12 text-accent mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">Robot, inson emas</h3>
                <p className="text-gray-600 text-sm">ChatGPT sizning kayfiyatingizni tushunmaydi</p>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-gray-100 hover:border-accent transition-all shadow-soft hover:shadow-medium hover-lift">
              <CardContent className="p-6 text-center">
                <Target className="w-12 h-12 text-accent mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">Buyruqlar asosida</h3>
                <p className="text-gray-600 text-sm">Aniq ko'rsatmalar = yaxshi natijalar</p>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-gray-100 hover:border-accent transition-all shadow-soft hover:shadow-medium hover-lift">
              <CardContent className="p-6 text-center">
                <Sparkles className="w-12 h-12 text-accent mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">100x natija</h3>
                <p className="text-gray-600 text-sm">To'g'ri usul bilan 100 barobar ko'p foyda</p>
              </CardContent>
            </Card>
          </div>

          {/* Motivational Quote */}
          <Card className="border-2 border-accent/20 bg-gradient-to-r from-accent/5 to-accent/10 shadow-medium">
            <CardContent className="p-8">
              <blockquote className="space-y-4">
                <p className="text-lg font-semibold text-black italic">
                  "Ishoning, sizdan aqlli bo'lmagan odamlar — ChatGPT'dan sizdan 100 karra ko'p foyda olyapti."
                </p>
                <p className="text-base text-gray-700">
                  Sababi oddiy: ular qanday gapirishni, qanday buyruq berishni biladi.
                </p>
                <div className="pt-4 border-t border-accent/20">
                  <p className="font-bold text-accent text-center text-xl">
                    Bu qo'llanma — so'zlaringizni qurolga aylantiradi.
                  </p>
                </div>
              </blockquote>
            </CardContent>
          </Card>

          {/* Learning Path Preview */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="font-bold text-lg mb-4">Nimalarni o'rganasiz:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "AI va ChatGPT qanday ishlashini",
                "Tanqidiy fikrlash asoslarini",
                "Professional prompting texnikalarini",
                "Zero-shot, Few-shot, Chain-of-Thought usullarini",
                "57 ta amaliy protokolni qo'llashni",
                "Real loyihalarda AI'ni ishlatishni"
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Author Info */}
          <div className="text-center text-gray-600">
            <p className="mb-2">- Xurshid Mo'roziqov</p>
            <p className="text-sm">t.me/birfoizbilim</p>
          </div>
        </div>
      )
    },
    {
      id: "ai-basics",
      title: "AI Asoslari",
      icon: <Brain className="w-5 h-5" />,
      content: (
        <div className="space-y-8">
          <div className="text-center mb-8">
            <Badge className="mb-4 bg-accent/10 text-accent border-accent/20">
              4 ta asos
            </Badge>
            <h2 className="text-3xl font-bold text-black">
              ChatGPT bilan ishlashni boshlashdan oldin
            </h2>
          </div>

          {/* Deep Dive: What is AI Really? */}
          <Card className="border-2 border-gray-200">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold mb-4">AI haqiqatda nima?</h3>
              <div className="space-y-4 text-gray-700">
                <p>
                  Sun'iy intellekt — bu kompyuterlarni inson kabi "o'ylash"ga o'rgatish san'ati. 
                  Lekin bu "o'ylash" aslida nima?
                </p>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-semibold mb-3">AI qanday "o'ylaydi":</h4>
                  <ol className="space-y-3">
                    <li className="flex gap-3">
                      <span className="font-bold text-accent">1.</span>
                      <div>
                        <strong>Pattern tanish:</strong> Millionlab misollardan qonuniyatlarni topadi
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-bold text-accent">2.</span>
                      <div>
                        <strong>Bashorat qilish:</strong> O'rgangan pattern'lar asosida keyingi so'zni taxmin qiladi
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-bold text-accent">3.</span>
                      <div>
                        <strong>Kontekstni tushunish:</strong> Sizning savolingiz qaysi mavzuga tegishli ekanini aniqlaydi
                      </div>
                    </li>
                  </ol>
                </div>
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Muhim:</strong> AI aslida "tushunmaydi" — u statistik model. 
                    Lekin bu model shunchalik murakkabki, u go'yo tushungandek natija beradi.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
          
          {/* Interactive Flip Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <FlipCard 
              term="ChatGPT nima?" 
              definition="Sun'iy idrokka asoslangan suhbat tizimi. GPT (Generative Pre-trained Transformer) modeli asosida ishlaydi. 175 milliard parametr va internetdagi yuz millionlab matnlar asosida o'qitilgan."
              icon={<MessageSquare className="w-8 h-8" />}
              examples={[
                "Matn yozish va tahrirlash",
                "Kod yozish va debug qilish",
                "Muammolarni hal qilish"
              ]}
            />
            <FlipCard 
              term="LLM nima?" 
              definition="Large Language Model - katta til modeli. Bu modellar til qonuniyatlarini o'rganib, yangi matn generatsiya qiladi. Ular milliardlab parametrlarga ega."
              icon={<Layers className="w-8 h-8" />}
              examples={[
                "GPT-4: 1.76 trillion parametr",
                "Claude: 175B+ parametr",
                "LLaMA: 65B parametr"
              ]}
            />
            <FlipCard 
              term="Token nima?" 
              definition="AI uchun matnning eng kichik bo'lagi. Bir token ≈ 0.75 so'z (inglizcha) yoki 0.5 so'z (o'zbekcha). ChatGPT tokenlar bilan ishlaydi va ular orqali narxlanadi."
              icon={<Hash className="w-8 h-8" />}
              examples={[
                "'Salom' = 2 token",
                "'Assalomu alaykum' = 5 token",
                "1 sahifa ≈ 500 token"
              ]}
            />
            <FlipCard 
              term="Hallucination" 
              definition="AI noto'g'ri yoki mavjud bo'lmagan ma'lumotlarni ishonchli tarzda taqdim etishi. Bu AI'ning eng katta muammolaridan biri."
              icon={<AlertCircle className="w-8 h-8" />}
              examples={[
                "Mavjud bo'lmagan kitob nomi",
                "Noto'g'ri statistika",
                "Xayoliy voqealar"
              ]}
            />
          </div>

          {/* Token Calculator Enhanced */}
          <Card className="border-2 border-accent/20 bg-gradient-to-r from-gray-50 to-white shadow-medium">
            <CardContent className="p-8">
              <h3 className="font-bold text-xl mb-6 flex items-center gap-3">
                <Hash className="w-6 h-6 text-accent" />
                Token Kalkulyator - Amaliyot
              </h3>
              <Textarea 
                placeholder="Matningizni yozing, tokenlar sonini real vaqtda ko'ring..."
                value={tokenText}
                onChange={(e) => setTokenText(e.target.value)}
                className="mb-6 min-h-[120px] text-lg border-2 focus:border-accent transition-colors focus-ring"
                rows={5}
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="text-center p-4 bg-white rounded-xl border-2 border-gray-100 shadow-soft hover:shadow-medium transition-all"
                >
                  <p className="text-sm text-gray-600 mb-1">Belgilar</p>
                  <p className="text-2xl font-bold text-gray-800">{tokenText.length}</p>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="text-center p-4 bg-accent/10 rounded-xl border-2 border-accent/20 shadow-soft hover:shadow-medium transition-all"
                >
                  <p className="text-sm text-gray-600 mb-1">Taxminiy tokenlar</p>
                  <p className="text-3xl font-bold text-accent">{calculateTokens(tokenText)}</p>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="text-center p-4 bg-white rounded-xl border-2 border-gray-100 shadow-soft hover:shadow-medium transition-all"
                >
                  <p className="text-sm text-gray-600 mb-1">Narxi (GPT-4)</p>
                  <p className="text-2xl font-bold text-gray-800">${(calculateTokens(tokenText) * 0.00003).toFixed(4)}</p>
                </motion.div>
              </div>
              
              {/* Token Tips */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Tokenlarni tejash uchun:</h4>
                <ul className="space-y-1 text-sm text-blue-800">
                  <li>• Aniq va qisqa yozing</li>
                  <li>• Keraksiz takrorlardan qoching</li>
                  <li>• Kontekstni optimal saqlang</li>
                  <li>• System prompt'ni optimallang</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Understanding AI Limitations */}
          <Card className="border-2 border-yellow-200 bg-yellow-50">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                AI Cheklovlari - Bilishingiz shart
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">AI nima qila olmaydi:</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>❌ Haqiqiy tushunish va his-tuyg'u</li>
                    <li>❌ Real vaqtdagi ma'lumotlar (cutoff sanasidan keyin)</li>
                    <li>❌ 100% aniqlikda faktlar</li>
                    <li>❌ Shaxsiy tajriba va xotira</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">AI nimada zo'r:</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>✅ Matn generatsiya va tahrirlash</li>
                    <li>✅ Pattern tanish va tahlil</li>
                    <li>✅ Ko'p tildagi muloqot</li>
                    <li>✅ Ijodiy g'oyalar va yechimlar</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      id: "critical-thinking",
      title: "Tanqidiy Fikrlash",
      icon: <Lightbulb className="w-5 h-5" />,
      content: (
        <div className="space-y-8">
          <div className="text-center mb-8">
            <Badge className="mb-4 bg-accent/10 text-accent border-accent/20">
              Qoida 1
            </Badge>
            <h2 className="text-3xl font-bold text-black mb-4">
              Tanqidiy Fikrlash
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              O'ylash, tahlil qilish va tanqidiy qarash orqali haqiqatni bilishga intilish
            </p>
          </div>

          {/* Why Critical Thinking Matters for AI */}
          <Card className="border-2 border-gray-200">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold mb-4">Nima uchun AI bilan ishlashda tanqidiy fikrlash muhim?</h3>
              <div className="space-y-4">
                <p className="text-gray-700">
                  AI juda kuchli, lekin u har doim to'g'ri javob bermaydi. Tanqidiy fikrlash sizga:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <Brain className="w-8 h-8 text-blue-600 mb-2" />
                      <h4 className="font-semibold mb-1">Savollarni to'g'ri shakllantirish</h4>
                      <p className="text-sm text-gray-600">Aniq savol = aniq javob</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-4">
                      <CheckCircle className="w-8 h-8 text-green-600 mb-2" />
                      <h4 className="font-semibold mb-1">Javoblarni tekshirish</h4>
                      <p className="text-sm text-gray-600">AI hallucination'larini aniqlash</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-purple-50 border-purple-200">
                    <CardContent className="p-4">
                      <Workflow className="w-8 h-8 text-purple-600 mb-2" />
                      <h4 className="font-semibold mb-1">Mantiqiy ketma-ketlik</h4>
                      <p className="text-sm text-gray-600">Murakkab masalalarni bosqichma-bosqich yechish</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* 3 Questions Framework Enhanced */}
          <Card className="border-2 border-accent/20 overflow-hidden">
            <div className="bg-accent text-white p-6">
              <h3 className="text-xl font-bold flex items-center gap-3">
                <AlertCircle className="w-6 h-6" />
                Ma'lumotni qabul qilishda 3 savol
              </h3>
            </div>
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-accent text-white rounded-xl flex items-center justify-center font-bold text-lg">
                      1
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-lg mb-2">Xabar qayerdan kelyapti?</h4>
                    <p className="text-gray-600 mb-3">Manba ishonchli yoki yo'qmi? Kim yozgan? Qachon?</p>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <p className="text-sm font-medium">[manba]</p>
                      <div className="text-sm text-gray-600">
                        <p><strong>Misol:</strong> AI "2024-yilda Nobel mukofoti" haqida gapirsa, lekin uning bilimi 2023-yilda tugagan bo'lsa — bu ma'lumot noto'g'ri.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-accent text-white rounded-xl flex items-center justify-center font-bold text-lg">
                      2
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-lg mb-2">Gapini tayini bormi?</h4>
                    <p className="text-gray-600 mb-3">Mantiqiy asos mavjudmi? Dalillar keltirilganmi?</p>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <p className="text-sm font-medium">[mantiqiy asos]</p>
                      <div className="text-sm text-gray-600">
                        <p><strong>Misol:</strong> "Bu kod 10x tezroq ishlaydi" — qanday test qilingan? Qaysi sharoitda? Benchmark bormi?</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-accent text-white rounded-xl flex items-center justify-center font-bold text-lg">
                      3
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-lg mb-2">Axborot bilan reallik mosmi?</h4>
                    <p className="text-gray-600 mb-3">Gapi-gapiga to'g'ri kelyaptimi? Qarama-qarshilik yo'qmi?</p>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <p className="text-sm font-medium">[gapi-gapiga mosmi?]</p>
                      <div className="text-sm text-gray-600">
                        <p><strong>Misol:</strong> AI bir joyda "Python eng tez til" desa, ikkinchi joyda "Python sekin til" desa — qarama-qarshilik bor.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Practical Exercise */}
          <InteractiveExample
            title="Tanqidiy fikrlashni amalda qo'llash"
            badPrompt="ChatGPT, menga pul ishlash haqida gapir"
            goodPrompt="Men 25 yoshli dasturchi, oylik maoshim $1000. Toshkentda yashayapman. Qo'shimcha daromad uchun qaysi yo'nalishlarni tavsiya qilasiz? Remote ish qidirish, freelance yoki o'z startupim ochish — qaysi biri mening holatimga mos?"
            explanation="Yaxshi promptda kontekst (yosh, kasb, maosh, joylashuv) va aniq variantlar berilgan. Bu AI'ga sizning holatga mos javob berishga yordam beradi."
          />

          {/* Connection to Prompting */}
          <Card className="border-2 border-accent bg-gradient-to-r from-accent/5 to-accent/10">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold text-black mb-4 flex items-center gap-3">
                <Zap className="w-6 h-6 text-accent" />
                Tanqidiy Fikrlash → Promptlash
              </h3>
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  Promptlash zamonaviy raqamli dunyoda, fikrlashga start beruvchi asosiy vositalardan biriga aylandi.
                </p>
                
                <div className="bg-white rounded-lg p-6 space-y-4">
                  <h4 className="font-semibold">Tanqidiy fikrlash promptingda qanday yordam beradi:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex gap-3">
                      <span className="text-accent font-bold">1.</span>
                      <div>
                        <strong>Muammoni aniqlash:</strong> "Mening haqiqiy muammom nima?"
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-accent font-bold">2.</span>
                      <div>
                        <strong>Strukturalash:</strong> "Qanday qilib mantiqiy tartibda so'rashim kerak?"
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-accent font-bold">3.</span>
                      <div>
                        <strong>Kontekst berish:</strong> "AI qanday ma'lumotga muhtoj?"
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-accent font-bold">4.</span>
                      <div>
                        <strong>Natijani baholash:</strong> "Bu javob mantiqiymi?"
                      </div>
                    </div>
                  </div>
                </div>
                
                <Alert className="border-accent/20 bg-white">
                  <Sparkles className="h-4 w-4 text-accent" />
                  <AlertDescription className="text-base">
                    <strong>Prompt</strong> — S.I. fikrlash jarayonini boshlash, yo'naltirish va kengaytirish uchun qo'llaniladigan sizning 'so'rovingiz'.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>

          {/* Critical Thinking Techniques */}
          <Card className="border-2 border-gray-200">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-4">5 ta tanqidiy fikrlash texnikasi</h3>
              <Tabs defaultValue="socratic" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="socratic">Sokrat usuli</TabsTrigger>
                  <TabsTrigger value="5why">5 Nima uchun</TabsTrigger>
                  <TabsTrigger value="devils">Iblis advokati</TabsTrigger>
                </TabsList>
                <TabsContent value="socratic" className="space-y-4">
                  <h4 className="font-semibold">Sokrat usuli - Savol orqali o'rganish</h4>
                  <p className="text-gray-600">Ketma-ket savollar orqali chuqur tushunishga erishish:</p>
                  <ul className="space-y-2 text-sm">
                    <li>• "Bu nima?"</li>
                    <li>• "Qanday ishlaydi?"</li>
                    <li>• "Nega shunday?"</li>
                    <li>• "Boshqacha bo'lishi mumkinmi?"</li>
                  </ul>
                </TabsContent>
                <TabsContent value="5why" className="space-y-4">
                  <h4 className="font-semibold">5 Nima uchun - Sababga yetish</h4>
                  <p className="text-gray-600">Muammoning ildizini topish uchun 5 marta "Nima uchun?" deb so'rash:</p>
                  <ol className="space-y-2 text-sm">
                    <li>1. Kod ishlamayapti — Nima uchun?</li>
                    <li>2. Sintaksis xato bor — Nima uchun?</li>
                    <li>3. Qavs yopilmagan — Nima uchun?</li>
                    <li>4. Diqqatsizlik — Nima uchun?</li>
                    <li>5. Linter ishlatmagan — Ildiz sabab!</li>
                  </ol>
                </TabsContent>
                <TabsContent value="devils" className="space-y-4">
                  <h4 className="font-semibold">Iblis advokati - Qarama-qarshi fikr</h4>
                  <p className="text-gray-600">Ataylab qarama-qarshi pozitsiyani olish:</p>
                  <ul className="space-y-2 text-sm">
                    <li>• "Bu g'oya ishlamasligi mumkin chunki..."</li>
                    <li>• "Eng yomon senariy nima?"</li>
                    <li>• "Kimdir bunga qarshi chiqsa nima deydi?"</li>
                  </ul>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Knowledge Check */}
          <KnowledgeCheck
            question="Tanqidiy fikrlashda eng muhim nima?"
            options={[
              "Har qanday ma'lumotga ishonish",
              "Manba, mantiq va reallikka mos kelishini tekshirish",
              "Faqat o'z fikringizga ishonish",
              "Hamma narsani inkor qilish"
            ]}
            correctAnswer={1}
            explanation="To'g'ri! Tanqidiy fikrlash — bu manbani tekshirish, mantiqiy asosni qidirish va reallik bilan mosligini ko'rish. Bu sizga AI javoblarini ham to'g'ri baholashga yordam beradi."
            onAnswer={(isCorrect) => {
              if (isCorrect) setKnowledgeScore(prev => prev + 1);
            }}
          />
        </div>
      )
    },
    {
      id: "prompt-basics",
      title: "Prompting Asoslari",
      icon: <Code className="w-5 h-5" />,
      content: (
        <div className="space-y-8">
          <div className="text-center mb-8">
            <Badge className="mb-4 bg-accent/10 text-accent border-accent/20">
              Asosiy komponentlar
            </Badge>
            <h2 className="text-3xl font-bold text-black mb-4">
              Prompting asoslari
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Prompting - bu sun'iy intellektga aniq ko'rsatmalar berib, kerakli natijani olish san'atidir.
            </p>
          </div>

          {/* The Science Behind Prompting */}
          <Card className="border-2 border-gray-200">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold mb-4">Prompting ortidagi ilm</h3>
              <div className="space-y-4">
                <p className="text-gray-700">
                  Prompting — bu oddiy savol berish emas. Bu AI'ning "miya"siga to'g'ri signal yuborish san'ati.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Noto'g'ri yondashuv:</h4>
                    <p className="text-sm text-gray-700 mb-2">"AI ga nima desam tushunadi"</p>
                    <p className="text-sm text-red-600">❌ 30% samara</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-semibold mb-2">To'g'ri yondashuv:</h4>
                    <p className="text-sm text-gray-700 mb-2">"AI qanday signal kutayotganini bilaman"</p>
                    <p className="text-sm text-green-600">✅ 90% samara</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 5 Components with Deep Examples */}
          <div className="space-y-6">
            {[
              {
                number: 1,
                title: "Rol (Role)",
                description: "AI'ga qanday rol o'ynashini ko'rsating",
                example: "Sen 10 yillik tajribaga ega Python dasturchi va o'qituvchisan",
                icon: <Brain className="w-5 h-5" />,
                deepDive: {
                  why: "AI turli rol o'ynaganda turli javob beradi",
                  examples: [
                    "Oddiy: 'Python kodini tushuntir'",
                    "Yaxshi: 'Sen Python expert. Yangi boshlovchilarga kod tushuntir'",
                    "Zo'r: 'Sen 10 yillik Python o'qituvchisan. 16 yoshli o'quvchiga decoratorlarni sodda tilda tushuntir'"
                  ]
                }
              },
              {
                number: 2,
                title: "Kontekst (Context)",
                description: "Vaziyatni aniqlashtiring",
                example: "Men yangi dasturchi va Python o'rganyapman...",
                icon: <BookOpen className="w-5 h-5" />,
                deepDive: {
                  why: "Kontekst AI'ga sizning holatni tushunishga yordam beradi",
                  examples: [
                    "Yomon: 'Kod yoz'",
                    "Yaxshi: 'Django loyiha uchun kod yoz'",
                    "Zo'r: 'Men e-commerce loyiha ustida ishlayapman. Django 4.2, PostgreSQL ishlataman. Buyurtmalar uchun model yoz'"
                  ]
                }
              },
              {
                number: 3,
                title: "Ko'rsatmalar (Instructions)",
                description: "Aniq va batafsil ko'rsatmalar bering",
                example: "Faqat yozda iste'mol qilinadigan 5 ta o'zbek taomlari uchun retsept ber",
                icon: <Target className="w-5 h-5" />,
                deepDive: {
                  why: "Aniq ko'rsatma = aniq natija",
                  examples: [
                    "Noaniq: 'Taom haqida yoz'",
                    "Aniq: '5 ta yozgi o'zbek taomi ro'yxati'",
                    "Juda aniq: '5 ta yozgi o'zbek taomi: nomi, asosiy ingredientlar (5 ta), tayyorlash vaqti'"
                  ]
                }
              },
              {
                number: 4,
                title: "Misollar (Example)",
                description: "Kutilgan javob formatini ko'rsating",
                example: "Har bir retsept: [taom nomi] - [qisqa tavsif]",
                icon: <Layers className="w-5 h-5" />,
                deepDive: {
                  why: "Misollar AI'ga aniq format ko'rsatadi",
                  examples: [
                    "Misol yo'q: Natija har xil formatda",
                    "1 misol: 70% to'g'ri format",
                    "2-3 misol: 95% to'g'ri format"
                  ]
                }
              },
              {
                number: 5,
                title: "Natija (Output)",
                description: "Natija qanday bo'lishi kerakligini aniqlashtiring",
                example: "Javobni o'zbek tilida, tushunarli tilda yoz",
                icon: <CheckCircle className="w-5 h-5" />,
                deepDive: {
                  why: "Output ko'rsatmasi javob sifatini oshiradi",
                  examples: [
                    "Oddiy: 'Javob ber'",
                    "Yaxshi: 'O'zbek tilida, sodda tilda javob ber'",
                    "Professional: 'Javobni quyidagicha struktura qil: 1) Asosiy fikr 2) Tushuntirish 3) Misol. Har biri yangi qatordan'"
                  ]
                }
              }
            ].map((component) => (
              <Card key={component.number} className="border-2 border-gray-200 hover:border-accent transition-all hover:shadow-lg overflow-hidden">
                <div className={`h-2 bg-gradient-to-r from-accent to-accent/60`} />
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-14 h-14 bg-accent/10 text-accent rounded-xl flex items-center justify-center">
                        {component.icon}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-bold text-gray-500">#{component.number}</span>
                        <h3 className="font-bold text-xl text-black">{component.title}</h3>
                      </div>
                      <p className="text-gray-600 mb-4">{component.description}</p>
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                        <code className="text-sm text-gray-800 font-mono">"{component.example}"</code>
                      </div>
                      
                      {/* Deep Dive Section */}
                      <details className="group">
                        <summary className="cursor-pointer text-accent font-medium text-sm flex items-center gap-2 hover:text-accent/80">
                          <ChevronRight className="w-4 h-4 transition-transform group-open:rotate-90" />
                          Chuqurroq o'rganish
                        </summary>
                        <div className="mt-4 space-y-3 pl-6 border-l-2 border-accent/20">
                          <p className="text-sm text-gray-600 italic">{component.deepDive.why}</p>
                          <div className="space-y-2">
                            {component.deepDive.examples.map((ex, idx) => (
                              <div key={idx} className="bg-white p-3 rounded border border-gray-100">
                                <p className="text-xs text-gray-800">{ex}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </details>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Real-World Example Builder */}
          <TryItYourself
            task="Restoran uchun chatbot yaratish promptini yozing. Bot mijozlar savollariga javob berishi kerak."
            hints={[
              "Rol: Kim bo'lib javob berishi kerak?",
              "Kontekst: Qanday restoran? Qaysi shahar?",
              "Ko'rsatma: Qanday savollarga javob berishi kerak?",
              "Misol: Bitta savol-javob misoli",
              "Natija: Javob qanday tonda bo'lishi kerak?"
            ]}
            sampleSolution={`Rol: Sen "Milliy Taomlar" restorani virtual yordamchisisan.

Kontekst: Restoranmiz Toshkent markazida joylashgan, o'zbek milliy taomlariga ixtisoslashgan. 50 kishilik zal, oilaviy muhit.

Ko'rsatmalar:
1. Menyu haqida savollarga javob ber
2. Stol band qilish uchun yo'naltir
3. Ish vaqti va manzilni ayting
4. Samimiy va professional bo'l

Misol:
Savol: "Sizda vegetarian taomlar bormi?"
Javob: "Ha, albatta! Bizda qovurilgan sabzavotlar, manti (qalampir), somsa (kartoshka) va turli salatalar bor."

Natija: Javoblar qisqa (2-3 gap), samimiy va foydali bo'lsin. Emoji ishlatma.`}
          />

          {/* Prompt Burger Visual Enhanced */}
          <Card className="border-2 border-accent/20 bg-gradient-to-b from-white to-accent/5">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-6">Haqiqiy Prompt Burger 🍔</h3>
              <div className="max-w-md mx-auto">
                <div className="relative">
                  {/* Burger Layers */}
                  {[
                    { layer: "Til ko'nikmasi", color: "bg-yellow-100 border-yellow-300", desc: "Grammatika, uslub" },
                    { layer: "Kreativlik + Soha bilimi", color: "bg-green-100 border-green-300", desc: "Innovatsiya, expertise" },
                    { layer: "Protokollar", color: "bg-red-100 border-red-300", desc: "57 ta maxsus texnika" },
                    { layer: "Tanqidiy fikrlash", color: "bg-purple-100 border-purple-300", desc: "Mantiq, tahlil" },
                    { layer: "Oddiy savollar", color: "bg-blue-100 border-blue-300", desc: "Asos, fundament" }
                  ].map((item, index) => (
                    <div key={index} className="group relative mb-2">
                      <div
                        className={`p-4 rounded-lg border-2 ${item.color} font-medium text-gray-800 transition-all hover:scale-105 cursor-pointer`}
                      >
                        {item.layer}
                      </div>
                      <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-xs px-2 py-1 rounded pointer-events-none whitespace-nowrap">
                        {item.desc}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-6 text-gray-600">
                  Har bir qatlam muhim. 57 ta protokol — sizning maxsus ziravorlaringiz!
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Common Mistakes */}
          <Card className="border-2 border-red-200 bg-red-50">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-4 text-red-800">Eng ko'p uchraydigan xatolar</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    mistake: "Haddan tashqari umumiy",
                    example: "Menga marketing haqida aytib ber",
                    fix: "Instagram'da coffee shop uchun 7 kunlik kontent rejasi tuzing"
                  },
                  {
                    mistake: "Kontekstsiz",
                    example: "Kod yozib ber",
                    fix: "React'da login forma yoz, Tailwind CSS ishlatib, validation bilan"
                  },
                  {
                    mistake: "Format ko'rsatmasdan",
                    example: "Ro'yxat ber",
                    fix: "Quyidagi formatda: '1. [Nom] - [Tavsif] - [Narx]'"
                  },
                  {
                    mistake: "Rol bermasdan",
                    example: "Tushuntir",
                    fix: "Sen tajribali o'qituvchisan. 10 yoshli bolaga tushuntir"
                  }
                ].map((item, idx) => (
                  <div key={idx} className="bg-white rounded-lg p-4 border border-red-200">
                    <h4 className="font-semibold text-red-700 mb-2">{item.mistake}</h4>
                    <p className="text-sm text-gray-600 mb-1">❌ "{item.example}"</p>
                    <p className="text-sm text-green-600">✅ "{item.fix}"</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Important Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Alert className="border-accent/20">
              <Sparkles className="h-4 w-4" />
              <AlertDescription>
                <strong>Qoida 3:</strong> Asoslar muhim. 57 ta protokolni asosiy komponentlar bilan birlashtirsangiz, ta'siri o'n barobar ortadi.
              </AlertDescription>
            </Alert>
            
            <Alert className="border-green-500/20 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>
                <strong>Qoida 4:</strong> Protokollar faqat S.I. uchun emas. Ular real hayotda ham fikrlash quroli.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      )
    },
    {
      id: "prompting-techniques",
      title: "Prompting Texnikalari",
      icon: <Cpu className="w-5 h-5" />,
      content: (
        <div className="space-y-8">
          <div className="text-center mb-8">
            <Badge className="mb-4 bg-accent/10 text-accent border-accent/20">
              Ilg'or texnikalar
            </Badge>
            <h2 className="text-3xl font-bold text-black mb-4">
              Professional Prompting Texnikalari
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Zero-shot'dan Chain-of-Thought'gacha — AI'dan maksimal foyda olish usullari
            </p>
          </div>

          {/* Techniques Overview */}
          <Card className="border-2 border-gray-200">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold mb-6">Prompting evolyutsiyasi</h3>
              <div className="relative">
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-accent to-accent/20"></div>
                <div className="space-y-8">
                  {[
                    { year: "2020", tech: "Zero-shot", desc: "Hech qanday misolsiz" },
                    { year: "2021", tech: "Few-shot", desc: "Bir necha misol bilan" },
                    { year: "2022", tech: "Chain-of-Thought", desc: "Bosqichma-bosqich fikrlash" },
                    { year: "2023", tech: "Tree-of-Thought", desc: "Tarmoqli fikrlash" },
                    { year: "2024", tech: "Multi-agent", desc: "Ko'p agentli tizimlar" }
                  ].map((item, idx) => (
                    <div key={idx} className="flex gap-4 items-center">
                      <div className="w-16 h-16 bg-accent text-white rounded-full flex items-center justify-center font-bold z-10">
                        {item.year}
                      </div>
                      <div className="flex-1 bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <h4 className="font-semibold">{item.tech}</h4>
                        <p className="text-sm text-gray-600">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Technique Cards */}
          <div className="space-y-8">
            {/* Zero-shot Prompting */}
            <Card className="border-2 border-blue-200 overflow-hidden">
              <div className="bg-blue-100 p-4 border-b border-blue-200">
                <h3 className="text-xl font-bold flex items-center gap-3">
                  <Zap className="w-6 h-6 text-blue-600" />
                  Zero-shot Prompting
                </h3>
              </div>
              <CardContent className="p-6">
                <p className="text-gray-700 mb-4">
                  <strong>Nima bu?</strong> Hech qanday misol bermasdan to'g'ridan-to'g'ri savol berish.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="font-semibold mb-2 text-green-700">✅ Afzalliklari:</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Tez va oddiy</li>
                      <li>• Kamroq token sarflaydi</li>
                      <li>• Umumiy savollar uchun ideal</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-red-700">❌ Kamchiliklari:</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Murakkab vazifalar uchun yaramaydi</li>
                      <li>• Format aniq bo'lmasligi mumkin</li>
                      <li>• Natija barqaror emas</li>
                    </ul>
                  </div>
                </div>

                <InteractiveExample
                  title="Zero-shot misol"
                  badPrompt="Tarjima qil: Hello"
                  goodPrompt="Quyidagi inglizcha matnni o'zbek tiliga tarjima qil: 'Hello, how are you today?'"
                  explanation="Yaxshi misolda til ko'rsatilgan va to'liq gap berilgan. Zero-shot'da ham kontekst muhim!"
                />
              </CardContent>
            </Card>

            {/* Few-shot Prompting */}
            <Card className="border-2 border-green-200 overflow-hidden">
              <div className="bg-green-100 p-4 border-b border-green-200">
                <h3 className="text-xl font-bold flex items-center gap-3">
                  <Layers className="w-6 h-6 text-green-600" />
                  Few-shot Prompting
                </h3>
              </div>
              <CardContent className="p-6">
                <p className="text-gray-700 mb-4">
                  <strong>Nima bu?</strong> AI'ga bir necha misol ko'rsatib, keyin o'z vazifangizni berish.
                </p>
                
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h4 className="font-semibold mb-3">Qachon ishlatish kerak:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-3 rounded border border-gray-200">
                      <FileText className="w-6 h-6 text-green-500 mb-2" />
                      <p className="text-sm">Maxsus format kerak bo'lganda</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-gray-200">
                      <GitBranch className="w-6 h-6 text-green-500 mb-2" />
                      <p className="text-sm">Murakkab pattern'lar uchun</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-gray-200">
                      <Target className="w-6 h-6 text-green-500 mb-2" />
                      <p className="text-sm">Aniq natija kerak bo'lganda</p>
                    </div>
                  </div>
                </div>

                <TryItYourself
                  task="O'zbek tilida she'r tahlili uchun few-shot prompt yozing. AI'ga 2 ta misol ko'rsating."
                  hints={[
                    "Birinchi misol: oddiy she'r tahlili",
                    "Ikkinchi misol: murakkabroq tahlil",
                    "Format: She'r → Tahlil strukturasi",
                    "Yangi she'r berish"
                  ]}
                  sampleSolution={`Men she'rlarni tahlil qilaman. Mana misollar:

She'r: "Vatan"
Tahlil:
- Mavzu: Vatanga muhabbat
- Kayfiyat: G'ururli, samimiy
- Vositalar: Metafora, takror

She'r: "Kuz"
Tahlil:
- Mavzu: Fasl almashinuvi
- Kayfiyat: Hozunli, filosofik
- Vositalar: Epitet, o'xshatish

Endi bu she'rni tahlil qil:
She'r: "Ona"
Tahlil:`}
                />
              </CardContent>
            </Card>

            {/* Chain-of-Thought */}
            <Card className="border-2 border-purple-200 overflow-hidden">
              <div className="bg-purple-100 p-4 border-b border-purple-200">
                <h3 className="text-xl font-bold flex items-center gap-3">
                  <Workflow className="w-6 h-6 text-purple-600" />
                  Chain-of-Thought (CoT)
                </h3>
              </div>
              <CardContent className="p-6">
                <p className="text-gray-700 mb-4">
                  <strong>Nima bu?</strong> AI'ni bosqichma-bosqich fikrlashga undash. "Qadam-baqadam o'ylab ko'r" deyish.
                </p>
                
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-6">
                  <h4 className="font-semibold mb-3">CoT ning siri:</h4>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <span className="text-purple-600 font-bold">1.</span>
                      <div>
                        <strong>Muammoni parchalash:</strong> Katta masalani kichik qismlarga bo'lish
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-purple-600 font-bold">2.</span>
                      <div>
                        <strong>Mantiqiy ketma-ketlik:</strong> Har bir qadam oldingi qadamga asoslanadi
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-purple-600 font-bold">3.</span>
                      <div>
                        <strong>Oraliq natijalar:</strong> Har bir qadamda natija tekshiriladi
                      </div>
                    </div>
                  </div>
                </div>

                <Card className="border border-purple-200 bg-white">
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-3">Amaliy misol: Matematik masala</h4>
                    <div className="space-y-3 text-sm">
                      <div className="bg-gray-50 p-3 rounded">
                        <strong>Oddiy prompt:</strong> "3 ta olma va 5 ta nok bor. Jami nechta meva?"
                      </div>
                      <div className="bg-purple-50 p-3 rounded border border-purple-100">
                        <strong>CoT prompt:</strong> "3 ta olma va 5 ta nok bor. Jami nechta meva? Qadam-baqadam hisoblang:
                        1) Olmalar sonini aniqlang
                        2) Noklar sonini aniqlang  
                        3) Ularni qo'shing
                        4) Javobni tekshiring"
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>

            {/* Self-Consistency */}
            <Card className="border-2 border-orange-200 overflow-hidden">
              <div className="bg-orange-100 p-4 border-b border-orange-200">
                <h3 className="text-xl font-bold flex items-center gap-3">
                  <Users className="w-6 h-6 text-orange-600" />
                  Self-Consistency
                </h3>
              </div>
              <CardContent className="p-6">
                <p className="text-gray-700 mb-4">
                  <strong>Nima bu?</strong> Bir xil savolni bir necha marta berib, eng ko'p takrorlangan javobni tanlash.
                </p>
                
                <div className="bg-orange-50 rounded-lg p-6">
                  <h4 className="font-semibold mb-3">Qanday ishlaydi:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="w-16 h-16 bg-orange-200 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="font-bold">3x</span>
                      </div>
                      <p className="text-sm">Bir xil savolni 3-5 marta berish</p>
                    </div>
                    <div>
                      <div className="w-16 h-16 bg-orange-300 rounded-full flex items-center justify-center mx-auto mb-2">
                        <CheckCircle className="w-8 h-8 text-white" />
                      </div>
                      <p className="text-sm">Javoblarni taqqoslash</p>
                    </div>
                    <div>
                      <div className="w-16 h-16 bg-orange-400 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Target className="w-8 h-8 text-white" />
                      </div>
                      <p className="text-sm">Eng ishonchli javobni tanlash</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Advanced Techniques */}
            <Card className="border-2 border-gray-200">
              <CardContent className="p-6">
                <h3 className="font-bold text-xl mb-6">Ilg'or texnikalar</h3>
                <Tabs defaultValue="tree" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="tree">Tree-of-Thought</TabsTrigger>
                    <TabsTrigger value="react">ReAct</TabsTrigger>
                    <TabsTrigger value="meta">Meta-Prompting</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="tree" className="space-y-4">
                    <h4 className="font-semibold">Tree-of-Thought - Tarmoqli fikrlash</h4>
                    <p className="text-gray-600">Bir necha yo'nalishda fikrlab, eng yaxshisini tanlash:</p>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <pre className="text-sm whitespace-pre-wrap">
{`"Bu masalani 3 xil yo'l bilan yeching:
1-yo'l: [birinchi yondashuv]
2-yo'l: [ikkinchi yondashuv]  
3-yo'l: [uchinchi yondashuv]

Har bir yo'lni baholab, eng yaxshisini tanlang."`}
                      </pre>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="react" className="space-y-4">
                    <h4 className="font-semibold">ReAct - Reasoning + Acting</h4>
                    <p className="text-gray-600">Fikrlash va harakat qilishni birlashtirish:</p>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <pre className="text-sm whitespace-pre-wrap">
{`Fikr: Men bu masalani yechish uchun...
Harakat: Birinchi qadamni bajaraman
Kuzatuv: Natija shunday bo'ldi
Fikr: Demak, keyingi qadam...
Harakat: Ikkinchi qadamni bajaraman`}
                      </pre>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="meta" className="space-y-4">
                    <h4 className="font-semibold">Meta-Prompting</h4>
                    <p className="text-gray-600">AI'ga o'z promptini yaxshilashni buyurish:</p>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <pre className="text-sm whitespace-pre-wrap">
{`"Men [vazifa] qilmoqchiman. 
Bu vazifa uchun eng yaxshi prompt qanday bo'ladi?
O'z javobingizga asoslanib vazifani bajaring."`}
                      </pre>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Comparison Table */}
          <Card className="border-2 border-gray-200">
            <CardContent className="p-6">
              <h3 className="font-bold text-xl mb-4">Texnikalarni taqqoslash</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Texnika</th>
                      <th className="text-center p-2">Qiyinlik</th>
                      <th className="text-center p-2">Token sarfi</th>
                      <th className="text-center p-2">Aniqlik</th>
                      <th className="text-left p-2">Qachon ishlatish</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">Zero-shot</td>
                      <td className="text-center p-2">⭐</td>
                      <td className="text-center p-2">Kam</td>
                      <td className="text-center p-2">60-70%</td>
                      <td className="p-2">Oddiy savollar</td>
                    </tr>
                    <tr className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">Few-shot</td>
                      <td className="text-center p-2">⭐⭐</td>
                      <td className="text-center p-2">O'rtacha</td>
                      <td className="text-center p-2">80-85%</td>
                      <td className="p-2">Format muhim bo'lganda</td>
                    </tr>
                    <tr className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">Chain-of-Thought</td>
                      <td className="text-center p-2">⭐⭐⭐</td>
                      <td className="text-center p-2">Ko'p</td>
                      <td className="text-center p-2">90-95%</td>
                      <td className="p-2">Murakkab masalalar</td>
                    </tr>
                    <tr className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">Self-Consistency</td>
                      <td className="text-center p-2">⭐⭐⭐</td>
                      <td className="text-center p-2">Juda ko'p</td>
                      <td className="text-center p-2">95%+</td>
                      <td className="p-2">Kritik aniqlik kerak</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Final Knowledge Check */}
          <KnowledgeCheck
            question="Murakkab matematik masalani yechish uchun qaysi texnika eng mos?"
            options={[
              "Zero-shot - tez va oddiy",
              "Few-shot - misollar bilan",
              "Chain-of-Thought - bosqichma-bosqich",
              "Meta-prompting - AI o'zi hal qilsin"
            ]}
            correctAnswer={2}
            explanation="To'g'ri! Chain-of-Thought (CoT) murakkab masalalarni bosqichma-bosqich yechish uchun eng samarali. U AI'ni har bir qadamni ko'rsatishga majbur qiladi."
            onAnswer={(isCorrect) => {
              if (isCorrect) setKnowledgeScore(prev => prev + 1);
            }}
          />

          {/* Next Steps */}
          <Card className="border-2 border-accent/20 bg-gradient-to-r from-accent/5 to-accent/10">
            <CardContent className="p-8 text-center">
              <Sparkles className="w-12 h-12 text-accent mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-4">Tabriklaymiz! 🎉</h3>
              <p className="text-lg text-gray-700 mb-6">
                Siz prompting asoslarini va ilg'or texnikalarni o'rgandingiz. 
                Endi 57 ta maxsus protokol bilan tanishing!
              </p>
              <div className="bg-white rounded-lg p-6 max-w-md mx-auto">
                <h4 className="font-semibold mb-3">Nimalarni o'rgandingiz:</h4>
                <ul className="text-left space-y-2 text-gray-700">
                  <li>✅ AI va ChatGPT qanday ishlashi</li>
                  <li>✅ Tanqidiy fikrlash asoslari</li>
                  <li>✅ Prompting komponentlari</li>
                  <li>✅ Professional texnikalar</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const totalProgress = ((completedSections.size) / sections.length) * 100;

  return (
    <div className="min-h-screen bg-white">
      <AppHeader />
      
      <main className="max-w-container-wide mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-8 shadow-soft"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">O'rganish jarayoni</h2>
              <p className="text-sm text-gray-600 mt-1">
                {completedSections.size} / {sections.length} bo'lim tugatildi
              </p>
            </div>
            <div className="text-right">
              <span className="text-4xl font-black text-accent">{Math.round(totalProgress)}%</span>
              <p className="text-sm text-gray-600">bajarildi</p>
            </div>
          </div>
          <Progress value={totalProgress} className="h-3 bg-gray-200" />
        </motion.div>

        {/* Section Navigation Tabs */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-center gap-1 mb-12 bg-gray-100 rounded-2xl p-1 overflow-x-auto shadow-soft"
        >
          {sections.map((section, index) => (
            <motion.button
              key={section.id}
              onClick={() => setCurrentSection(index)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all flex-1 min-w-[140px] ${
                index === currentSection 
                  ? 'bg-accent text-white shadow-medium' 
                  : completedSections.has(index)
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="hidden sm:flex">{section.icon}</span>
              <span className="text-sm font-medium whitespace-nowrap">{section.title}</span>
              {completedSections.has(index) && index !== currentSection && (
                <CheckCircle className="w-4 h-4 ml-auto" />
              )}
            </motion.button>
          ))}
        </motion.div>

        {/* Content Area with Animation */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="min-h-[600px]"
          >
            {sections[currentSection].content}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-between mt-16 pt-8 border-t border-gray-200"
        >
          <Button
            onClick={handlePrevious}
            variant="outline"
            disabled={currentSection === 0}
            className="px-6 py-3 h-auto hover-lift border-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Oldingi
          </Button>

          <div className="flex items-center gap-2">
            {sections.map((_, index) => (
              <motion.div
                key={index}
                animate={{
                  width: index === currentSection ? 32 : 8,
                  backgroundColor: index === currentSection 
                    ? "rgb(0 0 0)" 
                    : completedSections.has(index)
                    ? "rgb(34 197 94)"
                    : "rgb(209 213 219)"
                }}
                className="h-2 rounded-full"
              />
            ))}
          </div>

          {currentSection === sections.length - 1 ? (
            <Link href="/">
              <Button className="bg-accent text-white hover:bg-gray-800 px-8 py-3 h-auto flex items-center gap-2 shadow-strong hover-lift group">
                57 Protokolga o'tish
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          ) : (
            <Button
              onClick={handleNext}
              className="bg-accent text-white hover:bg-gray-800 px-6 py-3 h-auto flex items-center gap-2 hover-lift group"
            >
              Keyingi
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          )}
        </motion.div>
      </main>
      <AppFooter />
    </div>
  );
}