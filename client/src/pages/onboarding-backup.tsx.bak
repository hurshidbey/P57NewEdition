import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { motion, AnimatePresence } from "framer-motion";
// All icons now use AiIcon component for consistency
import { Link } from "wouter";
import AppHeader from "@/components/app-header";
import AppFooter from "@/components/app-footer";
import { AiIcon } from "@/components/ai-icon";

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
      className="relative w-full min-h-[240px] sm:h-72 cursor-pointer perspective-1000 group touch-manipulation"
      onClick={() => setIsFlipped(!isFlipped)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className={`absolute inset-0 w-full h-full transition-transform duration-700 transform-style-preserve-3d ${
        isFlipped ? 'rotate-y-180' : ''
      }`}>
        {/* Front */}
        <div className="absolute inset-0 w-full h-full backface-hidden">
          <Card className="h-full border-2 border-black hover:border-black transition-all shadow-lg hover:shadow-xl">
            <CardContent className="h-full flex flex-col items-center justify-center text-center p-6 sm:p-8">
              {icon && <div className="mb-4 text-black">{icon}</div>}
              <h3 className="text-xl sm:text-2xl font-bold text-black mb-3">{term}</h3>
              <p className="text-sm text-gray-600">Bosing ko'rish uchun</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Back */}
        <div className="absolute inset-0 w-full h-full rotate-y-180 backface-hidden">
          <Card className="h-full bg-black text-white border-2 border-black overflow-y-auto shadow-xl">
            <CardContent className="h-full flex flex-col justify-center p-6 sm:p-8">
              <p className="text-base sm:text-lg leading-relaxed mb-4">{definition}</p>
              {examples && examples.length > 0 && (
                <div className="mt-auto pt-4 border-t border-white/20">
                  <p className="text-xs sm:text-sm opacity-80 mb-2">Misollar:</p>
                  {examples.map((example, idx) => (
                    <p key={idx} className="text-xs sm:text-sm opacity-90">• {example}</p>
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
    <Card className="border-2 border-black shadow-lg hover:shadow-xl transition-all">
      <CardContent className="p-6 sm:p-8">
        <h4 className="font-semibold text-lg mb-4">{question}</h4>
        <div className="space-y-3">
          {options.map((option, index) => (
            <motion.button
              key={index}
              onClick={() => handleSelect(index)}
              disabled={showResult}
              whileHover={{ scale: showResult ? 1 : 1.01 }}
              whileTap={{ scale: showResult ? 1 : 0.99 }}
              className={`w-full text-left p-4 sm:p-5 rounded-xl border-2 transition-all min-h-[60px] ${
                showResult && index === correctAnswer
                  ? 'border-green-600 bg-green-50'
                  : showResult && index === selected && index !== correctAnswer
                  ? 'border-red-600 bg-red-50'
                  : 'border-gray-300 hover:border-black'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 border-2 border-current rounded-full flex items-center justify-center text-sm font-bold">
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
            <Alert className="mt-4 border-2 border-black bg-gray-50">
              <AiIcon name="info" size={20} />
              <AlertDescription className="text-sm sm:text-base">{explanation}</AlertDescription>
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
    <Card className="border-2 border-black shadow-lg">
      <CardContent className="p-6 sm:p-8">
        <h4 className="font-semibold text-lg mb-4">{title}</h4>
        
        <div className="space-y-4">
          {/* Bad Example */}
          <div className={`transition-opacity ${showGood ? 'opacity-50' : ''}`}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center"><AiIcon name="close" size={16} /></div>
              <span className="text-sm font-medium text-gray-900">Yomon misol</span>
            </div>
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 sm:p-5 overflow-x-auto">
              <p className="text-sm sm:text-base font-mono text-gray-900 break-words">{badPrompt}</p>
            </div>
          </div>

          {/* Toggle Button */}
          <div className="flex justify-center">
            <Button
              onClick={() => setShowGood(!showGood)}
              variant="outline"
              size="sm"
              className="gap-2 h-10 px-6 touch-manipulation border-2 border-black hover:bg-gray-100"
            >
              {showGood ? <AiIcon name="pause" size={16} /> : <AiIcon name="play" size={16} />}
              {showGood ? "Yomon misolni ko'rish" : "Yaxshi misolni ko'rish"}
            </Button>
          </div>

          {/* Good Example */}
          <div className={`transition-opacity ${!showGood ? 'opacity-50' : ''}`}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center"><AiIcon name="checked" size={16} /></div>
              <span className="text-sm font-medium text-gray-900">Yaxshi misol</span>
            </div>
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 sm:p-5 overflow-x-auto">
              <p className="text-sm sm:text-base font-mono text-gray-900 break-words">{goodPrompt}</p>
            </div>
          </div>

          {/* Explanation */}
          <Alert className="border-2 border-black bg-gray-50">
            <AiIcon name="lightbulb" size={20} />
            <AlertDescription className="text-sm sm:text-base">{explanation}</AlertDescription>
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
    <Card className="border-2 border-black bg-gradient-to-r from-gray-50 to-white shadow-lg">
      <CardContent className="p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-4">
          <AiIcon name="code" size={24} />
          <h4 className="font-bold text-xl">O'zingiz sinab ko'ring!</h4>
        </div>
        
        <p className="text-muted-foreground mb-4">{task}</p>
        
        <Textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Promptingizni shu yerga yozing..."
          className="mb-4 min-h-[120px] border-2 border-gray-300 focus:border-black"
        />

        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHints(!showHints)}
            className="w-full sm:w-auto h-10 touch-manipulation border-2 border-black hover:bg-gray-100"
          >
            {showHints ? "Maslahatlarni yashirish" : "Maslahat olish"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSolution(!showSolution)}
            className="w-full sm:w-auto h-10 touch-manipulation border-2 border-black hover:bg-gray-100"
          >
            {showSolution ? "Yechimni yashirish" : "Yechimni ko'rish"}
          </Button>
        </div>

        {showHints && (
          <Alert className="mb-4 border-2 border-black bg-gray-50">
            <AiIcon name="lightbulb" size={20} />
            <AlertDescription className="text-sm sm:text-base">
              <ul className="list-disc list-inside space-y-1">
                {hints.map((hint, idx) => (
                  <li key={idx} className="text-sm">{hint}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {showSolution && (
          <div className="bg-gray-50 border-2 border-black rounded-lg p-5">
            <p className="text-sm font-medium text-gray-600 mb-2">Namuna yechim:</p>
            <p className="text-sm sm:text-base font-mono text-black whitespace-pre-wrap">{sampleSolution}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface InteractiveLLMSettingProps {
  setting: string;
  min: number;
  max: number;
  step: number;
  default?: number;
  examples: Array<{
    value: number;
    label: string;
    example: string;
  }>;
}

function InteractiveLLMSetting({ setting, min, max, step, default: defaultValue = 1, examples }: InteractiveLLMSettingProps) {
  const [value, setValue] = useState(defaultValue);
  
  // Find the closest example
  const currentExample = examples.reduce((prev, curr) => {
    return Math.abs(curr.value - value) < Math.abs(prev.value - value) ? curr : prev;
  });

  return (
    <div className="space-y-6">
      {/* Slider */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">Qiymat:</span>
          <span className="text-2xl font-bold text-black">{value.toFixed(1)}</span>
        </div>
        
        <Slider
          value={[value]}
          onValueChange={(values) => setValue(values[0])}
          min={min}
          max={max}
          step={step}
          className="w-full"
        />
        
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      </div>

      {/* Visual representation */}
      <div className="relative h-24 bg-gradient-to-r from-blue-100 via-yellow-100 to-red-100 rounded-lg overflow-hidden border-2 border-black">
        <motion.div
          className="absolute top-0 bottom-0 w-2 bg-black"
          animate={{
            left: `${(value - min) / (max - min) * 100}%`
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            key={currentExample.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <p className="font-bold text-lg">{currentExample.label}</p>
            <p className="text-sm text-muted-foreground">{currentExample.example}</p>
          </motion.div>
        </div>
      </div>

      {/* Examples grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {examples.map((example) => (
          <motion.button
            key={example.value}
            onClick={() => setValue(example.value)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`p-3 rounded-lg border-2 transition-all text-sm ${
              Math.abs(value - example.value) < 0.05
                ? 'border-black bg-gray-100'
                : 'border-gray-300 hover:border-black'
            }`}
          >
            <p className="font-semibold">{example.label}</p>
            <p className="text-xs text-muted-foreground">({example.value})</p>
          </motion.button>
        ))}
      </div>

      {/* Live example */}
      <Alert className="border-2 border-black bg-gray-50">
        <AiIcon name="rocket" size={20} />
        <AlertDescription className="text-sm sm:text-base">
          <strong>Hozirgi sozlama:</strong> {setting}={value.toFixed(1)}
          <br />
          <span className="text-sm text-muted-foreground">
            {value < 0.5 && "Juda qat'iy va bashorat qilsa bo'ladigan natijalar"}
            {value >= 0.5 && value < 1 && "Muvozanatli va ishonchli natijalar"}
            {value >= 1 && value < 1.5 && "Ijodkor, lekin mantiqiy natijalar"}
            {value >= 1.5 && "Juda ijodkor, ba'zan kutilmagan natijalar"}
          </span>
        </AlertDescription>
      </Alert>
    </div>
  );
}

export default function Onboarding() {
  // localStorage key constants
  const STORAGE_KEY = {
    CURRENT_SECTION: 'onboarding_current_section',
    COMPLETED_SECTIONS: 'onboarding_completed_sections',
    LAST_VISIT: 'onboarding_last_visit'
  };

  // Load saved progress from localStorage
  const loadProgress = () => {
    try {
      const savedSection = localStorage.getItem(STORAGE_KEY.CURRENT_SECTION);
      const savedCompleted = localStorage.getItem(STORAGE_KEY.COMPLETED_SECTIONS);
      
      return {
        currentSection: savedSection ? parseInt(savedSection, 10) : 0,
        completedSections: savedCompleted ? new Set<number>(JSON.parse(savedCompleted)) : new Set<number>()
      };
    } catch (error) {
      console.error('Error loading progress:', error);
      return { currentSection: 0, completedSections: new Set<number>() };
    }
  };

  // Initialize state with saved progress
  const savedProgress = loadProgress();
  const [currentSection, setCurrentSection] = useState(savedProgress.currentSection);
  const [tokenText, setTokenText] = useState("");
  const [completedSections, setCompletedSections] = useState<Set<number>>(savedProgress.completedSections);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const [showSaveIndicator, setShowSaveIndicator] = useState(false);
  
  // Check if user is returning
  useEffect(() => {
    const lastVisit = localStorage.getItem(STORAGE_KEY.LAST_VISIT);
    if (lastVisit && savedProgress.completedSections.size > 0) {
      setShowWelcomeBack(true);
      // Hide welcome message after 5 seconds
      const timer = setTimeout(() => setShowWelcomeBack(false), 5000);
      return () => clearTimeout(timer);
    }
  }, []);
  
  // Approximate token calculation
  const calculateTokens = (text: string) => {
    return Math.ceil(text.length / 3);
  };

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY.CURRENT_SECTION, currentSection.toString());
      localStorage.setItem(STORAGE_KEY.COMPLETED_SECTIONS, JSON.stringify(Array.from(completedSections)));
      localStorage.setItem(STORAGE_KEY.LAST_VISIT, new Date().toISOString());
      
      // Show save indicator
      setShowSaveIndicator(true);
      const timer = setTimeout(() => setShowSaveIndicator(false), 2000);
      return () => clearTimeout(timer);
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }, [currentSection, completedSections]);

  // Mark section as completed when leaving it
  useEffect(() => {
    setCompletedSections(prev => new Set(Array.from(prev).concat(currentSection)));
  }, [currentSection]);

  const sections = [
    {
      id: "intro",
      title: "Kirish",
      icon: <AiIcon name="teaching" size={20} />,
      content: (
        <div className="space-y-8">
          {/* Hero Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <Badge className="mb-4 bg-black text-white border-black px-4 py-2">
              Yangi boshlanish
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-black text-black mb-6 leading-tight">
              ChatGPT bilan to'g'ri ishlashni o'rganing
            </h1>
            <p className="text-lg sm:text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto">
              Bu qo'llanma ChatGPT bilan muloyim gaplashishni o'rgatmaydi. 
              <span className="font-bold text-black"> Bu yerda faqat natija muhim.</span>
            </p>
          </motion.div>
          
          {/* Why This Matters - New Section */}
          <Card className="border-2 border-black overflow-hidden shadow-lg">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 sm:p-8 border-b-2 border-black">
              <h3 className="text-xl sm:text-2xl font-bold text-black mb-4">Nima uchun bu muhim?</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Bugunga qadar:</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-black mt-1">▸</span>
                      <span>AI'dan 10% foydalanish</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-900 mt-1">▸</span>
                      <span>Oddiy savol-javob darajasi</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-900 mt-1">▸</span>
                      <span>Natijalardan ko'ngilsizlik</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">O'rganganingizdan keyin:</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-black mt-1">▸</span>
                      <span>AI imkoniyatlaridan 90% foydalanish</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-800 mt-1">▸</span>
                      <span>Professional darajadagi promptlar</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-800 mt-1">▸</span>
                      <span>5-10x yaxshi natijalar</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>

          {/* Key Points Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="border-2 border-border hover:border-accent transition-all shadow-soft hover:shadow-medium hover-lift">
              <CardContent className="p-6 text-center">
                <AiIcon name="robot" size={48} className="mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2 text-foreground">Robot, inson emas</h3>
                <p className="text-muted-foreground text-sm">ChatGPT sizning kayfiyatingizni tushunmaydi</p>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-border hover:border-accent transition-all shadow-soft hover:shadow-medium hover-lift">
              <CardContent className="p-6 text-center">
                <AiIcon name="target" size={48} className="mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2 text-foreground">Buyruqlar asosida</h3>
                <p className="text-muted-foreground text-sm">Aniq ko'rsatmalar = yaxshi natijalar</p>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-border hover:border-accent transition-all shadow-soft hover:shadow-medium hover-lift">
              <CardContent className="p-6 text-center">
                <AiIcon name="rocket" size={48} className="mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2 text-foreground">100x natija</h3>
                <p className="text-muted-foreground text-sm">To'g'ri usul bilan 100 barobar ko'p foyda</p>
              </CardContent>
            </Card>
          </div>

          {/* Motivational Quote */}
          <Card className="border-2 border-accent/20 bg-gradient-to-r from-accent/5 to-accent/10 shadow-medium">
            <CardContent className="p-8">
              <blockquote className="space-y-4">
                <p className="text-lg font-semibold text-foreground italic">
                  "Ishoning, sizdan aqlli bo'lmagan odamlar — ChatGPT'dan sizdan 100 karra ko'p foyda olyapti."
                </p>
                <p className="text-base text-muted-foreground">
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
          <div className="bg-muted rounded-xl p-6">
            <h3 className="font-bold text-lg mb-4 text-foreground">Nimalarni o'rganasiz:</h3>
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
                  <AiIcon name="checked" size={20} className="flex-shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Author Info */}
          <div className="text-center text-muted-foreground">
            <p className="mb-2">- Xurshid Mo'roziqov</p>
            <p className="text-sm">t.me/birfoizbilim</p>
          </div>
        </div>
      )
    },
    {
      id: "ai-basics",
      title: "AI Asoslari",
      icon: <AiIcon name="brain" size={20} />,
      content: (
        <div className="space-y-8">
          <div className="text-center mb-8">
            <Badge className="mb-4 bg-accent/10 text-accent border-accent/20">
              4 ta asos
            </Badge>
            <h2 className="text-3xl font-bold text-foreground">
              ChatGPT bilan ishlashni boshlashdan oldin
            </h2>
          </div>

          {/* Deep Dive: What is AI Really? */}
          <Card className="border-2 border-border">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold mb-4 text-foreground">AI haqiqatda nima?</h3>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Sun'iy intellekt — bu kompyuterlarni inson kabi "o'ylash"ga o'rgatish san'ati. 
                  Lekin bu "o'ylash" aslida nima?
                </p>
                <div className="bg-muted p-6 rounded-lg">
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
                  <AiIcon name="info" size={16} />
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
              icon={<AiIcon name="chat" size={32} />}
              examples={[
                "Matn yozish va tahrirlash",
                "Kod yozish va debug qilish",
                "Muammolarni hal qilish"
              ]}
            />
            <FlipCard 
              term="LLM nima?" 
              definition="Large Language Model - katta til modeli. Bu modellar til qonuniyatlarini o'rganib, yangi matn generatsiya qiladi. Ular milliardlab parametrlarga ega."
              icon={<AiIcon name="layers" size={32} />}
              examples={[
                "GPT-4: 1.76 trillion parametr",
                "Claude: 175B+ parametr",
                "LLaMA: 65B parametr"
              ]}
            />
            <FlipCard 
              term="Token nima?" 
              definition="AI uchun matnning eng kichik bo'lagi. Bir token ≈ 0.75 so'z (inglizcha) yoki 0.5 so'z (o'zbekcha). ChatGPT tokenlar bilan ishlaydi va ular orqali narxlanadi."
              icon={<AiIcon name="code" size={32} />}
              examples={[
                "'Salom' = 2 token",
                "'Assalomu alaykum' = 5 token",
                "1 sahifa ≈ 500 token"
              ]}
            />
            <FlipCard 
              term="Hallucination" 
              definition="AI noto'g'ri yoki mavjud bo'lmagan ma'lumotlarni ishonchli tarzda taqdim etishi. Bu AI'ning eng katta muammolaridan biri."
              icon={<AiIcon name="warning" size={32} />}
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
                <AiIcon name="code" size={24} />
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
                  className="text-center p-4 bg-background rounded-xl border-2 border-border shadow-soft hover:shadow-medium transition-all"
                >
                  <p className="text-sm text-muted-foreground mb-1">Belgilar</p>
                  <p className="text-2xl font-bold text-foreground">{tokenText.length}</p>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="text-center p-4 bg-accent/10 rounded-xl border-2 border-accent/20 shadow-soft hover:shadow-medium transition-all"
                >
                  <p className="text-sm text-muted-foreground mb-1">Taxminiy tokenlar</p>
                  <p className="text-3xl font-bold text-accent">{calculateTokens(tokenText)}</p>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="text-center p-4 bg-background rounded-xl border-2 border-border shadow-soft hover:shadow-medium transition-all"
                >
                  <p className="text-sm text-muted-foreground mb-1">Narxi (GPT-4)</p>
                  <p className="text-2xl font-bold text-foreground">${(calculateTokens(tokenText) * 0.00003).toFixed(4)}</p>
                </motion.div>
              </div>
              
              {/* Token Tips */}
              <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
                <h4 className="font-semibold text-black mb-2">Tokenlarni tejash uchun:</h4>
                <ul className="space-y-1 text-sm text-black">
                  <li>• Aniq va qisqa yozing</li>
                  <li>• Keraksiz takrorlardan qoching</li>
                  <li>• Kontekstni optimal saqlang</li>
                  <li>• System prompt'ni optimallang</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Understanding AI Limitations */}
          <Card className="border-2 border-black bg-gray-50">
            <CardContent className="p-4 sm:p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <AiIcon name="warning" size={20} />
                AI Cheklovlari - Bilishingiz shart
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">AI nima qila olmaydi:</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-gray-900">×</span>
                      <span>Haqiqiy tushunish va his-tuyg'u</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-900">×</span>
                      <span>Real vaqtdagi ma'lumotlar (cutoff sanasidan keyin)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-900">×</span>
                      <span>100% aniqlikda faktlar</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-900">×</span>
                      <span>Shaxsiy tajriba va xotira</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">AI nimada zo'r:</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <AiIcon name="checked" size={16} />
                      <span>Matn generatsiya va tahrirlash</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AiIcon name="checked" size={16} />
                      <span>Pattern tanish va tahlil</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AiIcon name="checked" size={16} />
                      <span>Ko'p tildagi muloqot</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AiIcon name="checked" size={16} />
                      <span>Ijodiy g'oyalar va yechimlar</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How AI Makes Mistakes - New Comprehensive Section */}
          <div className="space-y-6">
            <div className="text-center">
              <Badge className="mb-4 bg-black text-white border-black">
                Muhim bilish kerak
              </Badge>
              <h3 className="text-2xl font-bold text-black">AI qanday xato qiladi?</h3>
              <p className="text-muted-foreground mt-2">Va ulardan qanday himoyalanish kerak</p>
            </div>

            {/* Main Mistakes Types */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Hallucination Deep Dive */}
              <Card className="border-2 border-black overflow-hidden">
                <div className="bg-black text-white p-6">
                  <h4 className="text-xl font-bold flex items-center gap-3">
                    <AiIcon name="warning" size={24} className="invert" />
                    Hallucination - Xayoliy ma'lumotlar
                  </h4>
                </div>
                <CardContent className="p-4 sm:p-6">
                  <p className="text-sm text-muted-foreground mb-4">
                    AI ba'zan o'zi "o'ylab topgan" ma'lumotlarni haqiqatdek taqdim etadi.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="bg-gray-100 border border-gray-400 p-4 rounded-lg">
                      <h5 className="font-semibold text-black mb-2">Real misol:</h5>
                      <p className="text-sm text-black">
                        "2022-yilda Toshkentda bo'lib o'tgan AI konferensiyada..." - 
                        bunday konferensiya bo'lmagan, AI o'ylab topgan.
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 border border-gray-300 p-4 rounded-lg">
                      <h5 className="font-semibold text-black mb-2">Himoya:</h5>
                      <ul className="text-sm text-black space-y-1">
                        <li>• Har doim faktlarni tekshiring</li>
                        <li>• Manbalarni so'rang</li>
                        <li>• Shubha bo'lsa - Google'dan foydalaning</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Bias and Stereotypes */}
              <Card className="border-2 border-black overflow-hidden">
                <div className="bg-gray-100 border-b-2 border-black p-6">
                  <h4 className="text-xl font-bold flex items-center gap-3">
                    <AiIcon name="algorithm" size={24} />
                    Bias - Noto'g'ri qarashlar
                  </h4>
                </div>
                <CardContent className="p-4 sm:p-6">
                  <p className="text-sm text-muted-foreground mb-4">
                    AI o'qitilgan ma'lumotlardagi stereotiplarni takrorlashi mumkin.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="bg-gray-100 border border-gray-400 p-4 rounded-lg">
                      <h5 className="font-semibold text-black mb-2">Real misol:</h5>
                      <p className="text-sm text-black">
                        "Shifokorlar odatda erkaklar..." - bu noto'g'ri stereotip.
                        AI ba'zan shunday xato fikrlarni bildirishi mumkin.
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 border border-gray-300 p-4 rounded-lg">
                      <h5 className="font-semibold text-black mb-2">Himoya:</h5>
                      <ul className="text-sm text-black space-y-1">
                        <li>• Tanqidiy fikrlang</li>
                        <li>• Stereotiplarga ishonmang</li>
                        <li>• Turli nuqtai nazarlarni so'rang</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Common Mistake Patterns */}
            <Card className="border-2 border-black">
              <CardContent className="p-8">
                <h4 className="text-xl font-bold mb-6 flex items-center gap-3">
                  <AiIcon name="detection" size={24} />
                  AI xatolarining 5 ta asosiy sababi
                </h4>
                
                <div className="space-y-6">
                  {[
                    {
                      title: "1. Kontekstni noto'g'ri tushunish",
                      example: "Siz: 'U qanday?' AI: 'Kim haqida gapiryapsiz?'",
                      solution: "Har doim to'liq kontekst bering"
                    },
                    {
                      title: "2. Vaqt bo'yicha chalkashlik",
                      example: "2024-yil voqealari haqida 2021-yil ma'lumotlari bilan javob",
                      solution: "Sanalarni aniq ko'rsating"
                    },
                    {
                      title: "3. Matematik xatolar",
                      example: "Katta sonlar bilan ishlashda xato hisoblash",
                      solution: "Murakkab hisoblarni qayta tekshiring"
                    },
                    {
                      title: "4. Til chalkashligi",
                      example: "O'zbekcha so'zlarni inglizcha ma'noda tushunish",
                      solution: "Qaysi tilda ishlashni aniq ayting"
                    },
                    {
                      title: "5. Ortiqcha ishonch",
                      example: "Bilmagan narsani ham 'aniq bilaman' deb javob berish",
                      solution: "'Aniq emas' javoblarini ham qabul qiling"
                    }
                  ].map((item, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="border-l-4 border-black pl-6"
                    >
                      <h5 className="font-bold mb-2">{item.title}</h5>
                      <p className="text-sm text-muted-foreground mb-2">
                        <strong>Misol:</strong> {item.example}
                      </p>
                      <p className="text-sm text-black">
                        <strong>Yechim:</strong> {item.solution}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Interactive Test */}
            <Card className="border-2 border-black bg-gradient-to-r from-gray-50 to-white">
              <CardContent className="p-8">
                <h4 className="text-xl font-bold mb-6 flex items-center gap-3">
                  <AiIcon name="turing" size={24} />
                  Xatolarni aniqlash testi
                </h4>
                
                <InteractiveExample
                  title="AI javobini baholang"
                  badPrompt="Toshkentning aholisi 5 million kishi. Bu O'zbekistonning eng katta shahri va 1966-yilda zilzila bo'lgan."
                  goodPrompt="Toshkentning aholisi taxminan 2.7-3 million kishi (2023-yil ma'lumotlari). Bu O'zbekistonning eng katta shahri. 1966-yil 26-aprelda 5.2 magnitudali zilzila bo'lgan."
                  explanation="AI ko'pincha aniq raqamlarni noto'g'ri aytadi. Har doim statistik ma'lumotlarni rasmiy manbalardan tekshiring!"
                />
              </CardContent>
            </Card>

            {/* Best Practices */}
            <Card className="border-2 border-black bg-gray-50">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold text-black mb-6 flex items-center gap-3">
                  <AiIcon name="shield" size={24} />
                  AI xatolaridan himoyalanish qoidalari
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                      <AiIcon name="question" size={32} className="invert" />
                    </div>
                    <h4 className="font-bold mb-2">Har doim so'rang</h4>
                    <p className="text-sm text-muted-foreground">
                      "Bu ma'lumot qayerdan olingan?" "Manba bormi?"
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                      <AiIcon name="search" size={32} className="invert" />
                    </div>
                    <h4 className="font-bold mb-2">Tekshiring</h4>
                    <p className="text-sm text-muted-foreground">
                      Muhim ma'lumotlarni Google yoki rasmiy manbalarda tekshiring
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                      <AiIcon name="brain" size={32} className="invert" />
                    </div>
                    <h4 className="font-bold mb-2">Tanqidiy fikrlang</h4>
                    <p className="text-sm text-muted-foreground">
                      AI javobi mantiqqa to'g'ri keladimi? Real hayotga mosmi?
                    </p>
                  </div>
                </div>

                <Alert className="mt-6 border-black bg-white">
                  <AiIcon name="info" size={16} />
                  <AlertDescription>
                    <strong>Eslatma:</strong> AI - bu vosita. U sizning o'rningizda fikrlamaydi, 
                    balki fikrlashingizga yordam beradi. Har doim oxirgi qarorni o'zingiz qabul qiling.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    {
      id: "llm-settings",
      title: "LLM Sozlamalari",
      icon: <AiIcon name="settings" size={20} />,
      content: (
        <div className="space-y-8">
          <div className="text-center mb-8">
            <Badge className="mb-4 bg-accent/10 text-accent border-accent/20">
              AI kayfiyati
            </Badge>
            <h2 className="text-3xl font-bold text-foreground mb-4">
              ChatGPT'ning "kayfiyatini" sozlash
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              AI qanchalik ijodkor yoki qat'iy bo'lishini siz boshqarasiz
            </p>
          </div>

          {/* Main concept explanation */}
          <Card className="border-2 border-border">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold mb-4 text-foreground">Nima uchun bu muhim?</h3>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  ChatGPT xuddi musiqachiday - uni qanday sozlasangiz, shunday o'ynaydi. 
                  To'g'ri sozlamalar = to'g'ri natijalar.
                </p>
                <div className="bg-gray-50 border border-gray-200 p-6 rounded-none">
                  <h4 className="font-semibold mb-4 uppercase tracking-wide text-sm">Oddiy tilda:</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <AiIcon name="checklist" size={20} className="opacity-80" />
                      <span><strong>Rasmiy hujjat yozish</strong> → Qat'iy sozlamalar</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <AiIcon name="rocket" size={20} className="opacity-80" />
                      <span><strong>Ijodiy fikrlar</strong> → Erkin sozlamalar</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <AiIcon name="data" size={20} className="opacity-80" />
                      <span><strong>Ma'lumot tahlili</strong> → Muvozanatli sozlamalar</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Interactive Temperature Slider */}
          <Card className="border-2 border-black overflow-hidden">
            <div className="bg-black text-white p-6">
              <h3 className="text-xl font-bold flex items-center gap-3">
                <AiIcon name="magic-wand" size={24} className="invert" />
                Temperature - AI'ning "ijodkorligi"
              </h3>
            </div>
            <CardContent className="p-8">
              <InteractiveLLMSetting
                setting="temperature"
                min={0}
                max={2}
                step={0.1}
                default={1}
                examples={[
                  { value: 0, label: "Juda qat'iy", example: "2+2=4. Har doim shunday javob." },
                  { value: 0.5, label: "Biroz qat'iy", example: "Rasmiy xatlar, hisobotlar uchun" },
                  { value: 1, label: "Muvozanat", example: "Kundalik muloqot uchun ideal" },
                  { value: 1.5, label: "Ijodkor", example: "G'oyalar, brainstorming uchun" },
                  { value: 2, label: "Juda ijodkor", example: "She'r, fantastika uchun (ba'zan 'telba' bo'lishi mumkin)" }
                ]}
              />
            </CardContent>
          </Card>

          {/* Interactive Top-p Slider */}
          <Card className="border-2 border-gray-300 overflow-hidden">
            <div className="bg-gradient-to-r from-green-100 to-green-200 p-6 border-b border-gray-400">
              <h3 className="text-xl font-bold flex items-center gap-3">
                <AiIcon name="target" size={24} />
                Top-p - So'z tanlash doirasi
              </h3>
            </div>
            <CardContent className="p-8">
              <InteractiveLLMSetting
                setting="top_p"
                min={0}
                max={1}
                step={0.05}
                default={1}
                examples={[
                  { value: 0.1, label: "Juda tor", example: "Faqat eng ehtimoliy so'zlar. Bashorat qilsa bo'ladigan natijalar." },
                  { value: 0.5, label: "O'rtacha", example: "Yaxshi muvozanat. Ko'p hollarda ideal." },
                  { value: 0.9, label: "Keng", example: "Ko'proq tanlov. Ijodiy, lekin mantiqiy." },
                  { value: 1, label: "Hamma so'zlar", example: "Barcha imkoniyatlar ochiq. Kutilmagan natijalar." }
                ]}
              />
            </CardContent>
          </Card>

          {/* Max Length Explanation */}
          <Card className="border-2 border-gray-300 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-100 to-purple-200 p-6 border-b border-gray-400">
              <h3 className="text-xl font-bold flex items-center gap-3">
                <AiIcon name="file" size={24} />
                Max Length - Javob uzunligi
              </h3>
            </div>
            <CardContent className="p-8">
              <div className="space-y-6">
                <p className="text-muted-foreground">
                  Bu parametr AI javobining maksimal uzunligini belgilaydi. Token hisobida o'lchanadi.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-gray-50 border-black">
                    <CardContent className="p-4 text-center">
                      <h4 className="font-bold text-lg mb-2">Qisqa</h4>
                      <p className="text-3xl font-bold text-black mb-2">50-100</p>
                      <p className="text-sm text-muted-foreground">SMS, tweet, qisqa javoblar</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-50 border-black">
                    <CardContent className="p-4 text-center">
                      <h4 className="font-bold text-lg mb-2">O'rtacha</h4>
                      <p className="text-3xl font-bold text-black mb-2">500-1000</p>
                      <p className="text-sm text-muted-foreground">Email, paragraf, tavsif</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-50 border-black">
                    <CardContent className="p-4 text-center">
                      <h4 className="font-bold text-lg mb-2">Uzun</h4>
                      <p className="text-3xl font-bold text-black mb-2">2000+</p>
                      <p className="text-sm text-muted-foreground">Maqola, esse, batafsil tahlil</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Real Example with Settings */}
          <TryItYourself
            task="Turli sozlamalar bilan 'Toshkentning kelajagi' haqida yozing. Temperature va top-p ni o'zgartirib ko'ring."
            hints={[
              "Temperature=0.2 → Faktlarga asoslangan, rasmiy",
              "Temperature=1.5 → Ijodiy, futuristik g'oyalar",
              "Top-p=0.3 → Oddiy, kutilgan fikrlar",
              "Top-p=0.9 → Noodatiy, qiziq g'oyalar"
            ]}
            sampleSolution={`Temperature=0.2, Top-p=0.5:
"Toshkent 2030-yilga kelib 4 million aholiga ega bo'ladi. Yangi metro liniyalari quriladi. IT Park kengaytiriladi."

Temperature=1.5, Top-p=0.9:
"Toshkent osmondan ko'rinadigan yashil shahar - daraxtlar uylar tomida, ko'chalar suv havzalari bilan bezatilgan. Odamlar uchar taksida harakatlanishadi, AI har bir uy va ko'chani boshqaradi."`}
          />

          {/* Common Mistakes */}
          <Card className="border-2 border-black bg-gray-50">
            <CardContent className="p-4 sm:p-6">
              <h3 className="font-bold text-lg mb-4 text-black">Tez-tez uchraydigan xatolar</h3>
              <div className="space-y-4">
                <Alert className="border-black bg-white">
                  <AiIcon name="warning" size={16} />
                  <AlertDescription>
                    <strong>Xato:</strong> Har doim temperature=2 ishlatish
                    <br />
                    <strong>Oqibat:</strong> Mantiqsiz, bog'lanmagan javoblar
                  </AlertDescription>
                </Alert>
                <Alert className="border-black bg-white">
                  <AiIcon name="warning" size={16} />
                  <AlertDescription>
                    <strong>Xato:</strong> Top-p va Temperature'ni birga yuqori qilish
                    <br />
                    <strong>Oqibat:</strong> Haddan tashqari tasodifiy natijalar
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>

          {/* Best Practices */}
          <Card className="border-2 border-black bg-gray-50">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold text-black mb-4 flex items-center gap-3">
                <AiIcon name="rocket" size={24} />
                Professional maslahatlar
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Qachon past temperature:</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2"><AiIcon name="checked" size={16} /> Faktlar, ma'lumotlar kerak</li>
                    <li className="flex items-center gap-2"><AiIcon name="checked" size={16} /> Kod yozish</li>
                    <li className="flex items-center gap-2"><AiIcon name="checked" size={16} /> Tarjima qilish</li>
                    <li className="flex items-center gap-2"><AiIcon name="checked" size={16} /> Rasmiy hujjatlar</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Qachon yuqori temperature:</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2"><AiIcon name="checked" size={16} /> Brainstorming</li>
                    <li className="flex items-center gap-2"><AiIcon name="checked" size={16} /> Kreativ yozuv</li>
                    <li className="flex items-center gap-2"><AiIcon name="checked" size={16} /> Marketing g'oyalari</li>
                    <li className="flex items-center gap-2"><AiIcon name="checked" size={16} /> Hikoya yozish</li>
                  </ul>
                </div>
              </div>
              <Alert className="mt-6 border-accent/20">
                <AiIcon name="info" size={16} />
                <AlertDescription>
                  <strong>Pro tip:</strong> Birinchi temperature=0.7 dan boshlang. Keyin kerak bo'lsa sozlang.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      id: "meta-prompting",
      title: "Meta Prompting",
      icon: <AiIcon name="thought" size={20} />,
      content: (
        <div className="space-y-8">
          <div className="text-center mb-8">
            <Badge className="mb-4 bg-black text-white border-black">
              AI o'zini yaxshilaydi
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-black text-black mb-4 tracking-tight">
              Meta Prompting
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              AI'ga o'z ishini baholashni va yaxshilashni o'rgating
            </p>
          </div>

          {/* What is Meta Prompting */}
          <Card className="border-2 border-black bg-white">
            <CardContent className="p-8">
              <h3 className="text-2xl font-black mb-6 text-black">Meta Prompting nima?</h3>
              <div className="space-y-4 text-gray-700">
                <p className="text-lg leading-relaxed">
                  Meta Prompting - bu AI'ni o'z javobi haqida o'ylashga majbur qilish usuli. 
                  Oddiy qilib aytganda, AI'ga "o'zingdan so'ra" deyish.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                  <div className="bg-gray-100 border-2 border-gray-300 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gray-1000 flex items-center justify-center">
                        <span className="text-white font-bold text-xl">×</span>
                      </div>
                      <h4 className="font-bold uppercase tracking-wide">Oddiy usul</h4>
                    </div>
                    <code className="block bg-white p-4 border border-gray-300 text-sm">
                      "Maqola yoz"
                    </code>
                  </div>
                  
                  <div className="bg-black text-white p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gray-500 flex items-center justify-center">
                        <span className="text-white font-bold text-xl">✓</span>
                      </div>
                      <h4 className="font-bold uppercase tracking-wide">Meta usul</h4>
                    </div>
                    <code className="block bg-gray-900 p-4 border border-gray-700 text-sm">
                      "Avval o'ylab ko'r: maqolani qanday yozish kerak? Keyin shu reja bo'yicha yoz"
                    </code>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Real Example: Kun.uz Article */}
          <Card className="border-2 border-black overflow-hidden">
            <div className="bg-black text-white p-6">
              <h3 className="text-xl font-bold flex items-center gap-3">
                <AiIcon name="teaching" size={24} className="invert" />
                Amaliy misol: Kun.uz uchun yangilik
              </h3>
            </div>
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="border-2 border-gray-300 p-6">
                  <h4 className="font-bold mb-4 uppercase text-sm tracking-wide">Meta Prompt namunasi:</h4>
                  <pre className="bg-gray-50 p-4 border border-gray-200 whitespace-pre-wrap text-sm">
{`Sen Kun.uz muxbirisan. Toshkentda yangi IT Park ochilishi haqida yangilik yozishdan oldin:

1. O'zingdan so'ra: 
   - Kun.uz o'quvchilari kimlar?
   - Ular qanday ma'lumotni kutishadi?
   - Yangilik strukturasi qanday bo'lishi kerak?

2. Javoblaringga asoslanib yangilik rejasini tuz

3. Keyin yangilikni yoz`}</pre>
                </div>

                <div className="border-2 border-black p-6 bg-gray-50">
                  <h4 className="font-bold mb-4 uppercase text-sm tracking-wide">AI javobi:</h4>
                  <div className="space-y-4 text-sm">
                    <div className="bg-white p-4 border border-gray-300">
                      <strong>1. O'z-o'zimga savol:</strong>
                      <ul className="mt-2 space-y-1 list-disc list-inside">
                        <li>Kun.uz o'quvchilari: 20-45 yosh, texnologiyaga qiziquvchi</li>
                        <li>Kutilgan ma'lumot: Qachon, qayerda, nimalar bo'ladi</li>
                        <li>Struktura: Sarlavha → Asosiy fakt → Tafsilotlar → Foyda</li>
                      </ul>
                    </div>
                    
                    <div className="bg-white p-4 border border-gray-300">
                      <strong>2. Reja:</strong>
                      <ol className="mt-2 space-y-1 list-decimal list-inside">
                        <li>Diqqatni tortuvchi sarlavha</li>
                        <li>Birinchi gapda asosiy ma'lumot</li>
                        <li>IT Park imkoniyatlari</li>
                        <li>Startaplar uchun shartlar</li>
                        <li>Rasmiylar izohi</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Meta Prompting Techniques */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <Card className="border-2 border-black hover:bg-black hover:text-white transition-all group">
              <CardContent className="p-4 sm:p-6">
                <div className="w-16 h-16 bg-black group-hover:bg-white mb-4 flex items-center justify-center">
                  <AiIcon name="brain" size={32} className="group-hover:invert" />
                </div>
                <h4 className="font-bold text-lg mb-2">O'z-o'zini tekshirish</h4>
                <p className="text-sm opacity-80">
                  "Bu javob to'g'rimi? Qaysi qismini yaxshilash mumkin?"
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-black hover:bg-black hover:text-white transition-all group">
              <CardContent className="p-4 sm:p-6">
                <div className="w-16 h-16 bg-black group-hover:bg-white mb-4 flex items-center justify-center">
                  <AiIcon name="algorithm" size={32} className="group-hover:invert" />
                </div>
                <h4 className="font-bold text-lg mb-2">Qadam-baqadam reja</h4>
                <p className="text-sm opacity-80">
                  "Avval reja tuz, keyin har bir qadamni bajar"
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-black hover:bg-black hover:text-white transition-all group">
              <CardContent className="p-4 sm:p-6">
                <div className="w-16 h-16 bg-black group-hover:bg-white mb-4 flex items-center justify-center">
                  <AiIcon name="network" size={32} className="group-hover:invert" />
                </div>
                <h4 className="font-bold text-lg mb-2">Muqobil yechimlar</h4>
                <p className="text-sm opacity-80">
                  "Bu masalani 3 xil usulda hal qil, eng yaxshisini tanla"
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Practice Exercise */}
          <TryItYourself
            task="Instagram'da oziq-ovqat yetkazib berish startapi uchun post yozish. Meta prompting'dan foydalaning."
            hints={[
              "Avval auditoriyani tahlil qiling",
              "Post maqsadini aniqlang (reklama, ma'lumot, engagement)",
              "Ton va uslubni tanlang",
              "Vizual element haqida o'ylang",
              "CTA (Call-to-Action) qo'shing"
            ]}
            sampleSolution={`Meta Prompt:
"Sen SMM mutaxassisisan. Food delivery startup uchun Instagram post yozishdan oldin o'ylan:

1. Kim bizning auditoriyamiz? (18-35 yosh, vaqt qadrli, sifatli ovqat sevuvchi)
2. Post maqsadi? (Yangi foydalanuvchilar jalb qilish)
3. Qanday his-tuyg'u uyg'otish kerak? (Ochlik, qulaylik, ishonch)

Endi shu tahlilga asoslanib post yoz."

Natija:
"Uyda pishirilgandek mazali taomlar - 30 daqiqada eshigingizda! 🚪

✓ Faqat yangi mahsulotlar
✓ Professional oshpazlar
✓ Issiq yetkazib berish

Birinchi buyurtmaga 20% chegirma. 
Promokod: YANGI20

Hoziroq buyurtma bering → [link]"`}
          />

          {/* Advanced Meta Techniques */}
          <Card className="border-2 border-black">
            <CardContent className="p-8">
              <h3 className="font-bold text-2xl mb-6 text-black">Ilg'or Meta texnikalar</h3>
              
              <Tabs defaultValue="self-improve" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1">
                  <TabsTrigger value="self-improve" className="data-[state=active]:bg-black data-[state=active]:text-white">
                    O'z-o'zini yaxshilash
                  </TabsTrigger>
                  <TabsTrigger value="role-play" className="data-[state=active]:bg-black data-[state=active]:text-white">
                    Rol o'ynash
                  </TabsTrigger>
                  <TabsTrigger value="critique" className="data-[state=active]:bg-black data-[state=active]:text-white">
                    Tanqidiy baholash
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="self-improve" className="mt-6 space-y-4">
                  <h4 className="font-bold">AI o'z javobini yaxshilaydi</h4>
                  <div className="bg-gray-50 p-4 border border-gray-200">
                    <pre className="text-sm whitespace-pre-wrap">
{`"Email yoz. Keyin o'z emailingni baho:
- Qisqami?
- Aniqmi?
- Professional ko'rinishmi?

Bahoga asoslanib qayta yoz."`}</pre>
                  </div>
                </TabsContent>
                
                <TabsContent value="role-play" className="mt-6 space-y-4">
                  <h4 className="font-bold">AI turli rollarni o'ynaydi</h4>
                  <div className="bg-gray-50 p-4 border border-gray-200">
                    <pre className="text-sm whitespace-pre-wrap">
{`"Avval mijoz bo'lib, mahsulotga shikoyat yoz.
Keyin support xodimi bo'lib javob ber.
Nihoyat, menejer bo'lib, bu muloqotni baho."`}</pre>
                  </div>
                </TabsContent>
                
                <TabsContent value="critique" className="mt-6 space-y-4">
                  <h4 className="font-bold">AI o'z ishini tanqid qiladi</h4>
                  <div className="bg-gray-50 p-4 border border-gray-200">
                    <pre className="text-sm whitespace-pre-wrap">
{`"Biznes reja yoz.
Keyin investor bo'lib, bu rejaning zaif tomonlarini ko'rsat.
So'ng rejani zaif tomonlarini hisobga olib qayta yoz."`}</pre>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Knowledge Check */}
          <KnowledgeCheck
            question="Meta prompting'ning asosiy afzalligi nimada?"
            options={[
              "AI tezroq javob beradi",
              "AI o'z javobini tahlil qilib, sifatini oshiradi",
              "Kamroq token sarflaydi",
              "Faqat kod yozishda ishlaydi"
            ]}
            correctAnswer={1}
            explanation="To'g'ri! Meta prompting AI'ni o'z javobi ustida fikrlashga majbur qilib, natija sifatini sezilarli oshiradi. Bu xuddi talabaga 'tekshir va qayta ko'rib chiq' deyishga o'xshaydi."
            onAnswer={() => {
              // Score tracking can be implemented later
            }}
          />
        </div>
      )
    },
    {
      id: "tree-of-thoughts",
      title: "Tree of Thoughts",
      icon: <AiIcon name="hierarchy" size={20} />,
      content: (
        <div className="space-y-8">
          <div className="text-center mb-8">
            <Badge className="mb-4 bg-black text-white border-black">
              Shoxli fikrlash
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-black text-black mb-4 tracking-tight">
              Tree of Thoughts
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Bir emas, bir necha yo'ldan boring. Eng yaxshisini tanlang.
            </p>
          </div>

          {/* Visual Explanation */}
          <Card className="border-2 border-black bg-white overflow-hidden">
            <CardContent className="p-0">
              <div className="grid md:grid-cols-2">
                <div className="p-8 flex items-center justify-center bg-gray-50">
                  {/* Tree Visualization */}
                  <div className="relative w-full max-w-sm">
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2">
                      <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">START</span>
                      </div>
                    </div>
                    
                    {/* Branches */}
                    <svg className="absolute inset-0 w-full h-full" style={{ top: '80px' }}>
                      <line x1="50%" y1="0" x2="20%" y2="80" stroke="black" strokeWidth="2" />
                      <line x1="50%" y1="0" x2="50%" y2="80" stroke="black" strokeWidth="2" />
                      <line x1="50%" y1="0" x2="80%" y2="80" stroke="black" strokeWidth="2" />
                      
                      <line x1="20%" y1="80" x2="10%" y2="160" stroke="black" strokeWidth="2" />
                      <line x1="20%" y1="80" x2="30%" y2="160" stroke="black" strokeWidth="2" />
                      
                      <line x1="50%" y1="80" x2="40%" y2="160" stroke="black" strokeWidth="2" />
                      <line x1="50%" y1="80" x2="60%" y2="160" stroke="black" strokeWidth="2" />
                      
                      <line x1="80%" y1="80" x2="70%" y2="160" stroke="black" strokeWidth="2" />
                      <line x1="80%" y1="80" x2="90%" y2="160" stroke="black" strokeWidth="2" />
                    </svg>
                    
                    {/* Level 1 Nodes */}
                    <div className="absolute left-[20%] transform -translate-x-1/2" style={{ top: '160px' }}>
                      <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">A</span>
                      </div>
                    </div>
                    <div className="absolute left-1/2 transform -translate-x-1/2" style={{ top: '160px' }}>
                      <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">B</span>
                      </div>
                    </div>
                    <div className="absolute right-[20%] transform translate-x-1/2" style={{ top: '160px' }}>
                      <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">C</span>
                      </div>
                    </div>
                    
                    {/* Level 2 Nodes */}
                    <div className="absolute left-[10%] transform -translate-x-1/2" style={{ top: '240px' }}>
                      <div className="w-12 h-12 bg-gray-400 rounded-full"></div>
                    </div>
                    <div className="absolute left-[30%] transform -translate-x-1/2" style={{ top: '240px' }}>
                      <div className="w-12 h-12 bg-gray-500 rounded-full flex items-center justify-center">
                        <AiIcon name="checked" size={20} className="invert" />
                      </div>
                    </div>
                    <div className="absolute left-[40%] transform -translate-x-1/2" style={{ top: '240px' }}>
                      <div className="w-12 h-12 bg-gray-400 rounded-full"></div>
                    </div>
                    <div className="absolute left-[60%] transform -translate-x-1/2" style={{ top: '240px' }}>
                      <div className="w-12 h-12 bg-gray-400 rounded-full"></div>
                    </div>
                    <div className="absolute left-[70%] transform -translate-x-1/2" style={{ top: '240px' }}>
                      <div className="w-12 h-12 bg-gray-400 rounded-full"></div>
                    </div>
                    <div className="absolute left-[90%] transform -translate-x-1/2" style={{ top: '240px' }}>
                      <div className="w-12 h-12 bg-gray-400 rounded-full"></div>
                    </div>
                  </div>
                </div>
                
                <div className="p-8 bg-white">
                  <h3 className="text-2xl font-bold mb-4">Qanday ishlaydi?</h3>
                  <ol className="space-y-4">
                    <li className="flex gap-3">
                      <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">1</div>
                      <div>
                        <strong>Muammoni aniqlash</strong>
                        <p className="text-sm text-gray-600 mt-1">Asosiy savolni aniq qilib oling</p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">2</div>
                      <div>
                        <strong>Yo'llarni yaratish</strong>
                        <p className="text-sm text-gray-600 mt-1">3-5 ta turli yondashuv o'ylab toping</p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">3</div>
                      <div>
                        <strong>Har birini rivojlantirish</strong>
                        <p className="text-sm text-gray-600 mt-1">Har bir yo'lni chuqur tahlil qiling</p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <div className="w-8 h-8 bg-gray-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">4</div>
                      <div>
                        <strong>Eng yaxshisini tanlash</strong>
                        <p className="text-sm text-gray-600 mt-1">Natijalarni taqqoslab, optimal yechimni toping</p>
                      </div>
                    </li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Real Example */}
          <Card className="border-2 border-black overflow-hidden">
            <div className="bg-black text-white p-6">
              <h3 className="text-xl font-bold flex items-center gap-3">
                <AiIcon name="workflow" size={24} className="invert" />
                Amaliy misol: Startup g'oyasi tanlash
              </h3>
            </div>
            <CardContent className="p-8">
              <div className="mb-6 p-4 bg-gray-50 border border-gray-300">
                <h4 className="font-bold mb-2">Vazifa:</h4>
                <p>"Men 23 yoshdaman, dasturlashni bilaman. Toshkentda startup ochmoqchiman. Qaysi sohani tanlasam?"</p>
              </div>

              <div className="space-y-6">
                {/* Branch 1 */}
                <div className="border-l-4 border-gray-400 pl-6">
                  <h5 className="font-bold flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-400 rounded-full"></div>
                    Yo'l 1: EdTech (Ta'lim texnologiyalari)
                  </h5>
                  <ul className="mt-2 ml-8 space-y-1 text-sm text-gray-600">
                    <li>+ Katta bozor (maktablar, universitetlar)</li>
                    <li>+ Davlat qo'llab-quvvatlashi mumkin</li>
                    <li>- Sekin o'sish</li>
                    <li>- Byurokratiya ko'p</li>
                  </ul>
                </div>

                {/* Branch 2 - Winner */}
                <div className="border-l-4 border-black pl-6 bg-gray-50 -mx-6 px-6 py-4">
                  <h5 className="font-bold flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center">
                      <AiIcon name="checked" size={16} className="invert" />
                    </div>
                    Yo'l 2: Food Delivery
                  </h5>
                  <ul className="mt-2 ml-8 space-y-1 text-sm">
                    <li className="text-black">+ Kundalik ehtiyoj</li>
                    <li className="text-black">+ Tez o'sish imkoniyati</li>
                    <li className="text-black">+ Aniq biznes model</li>
                    <li className="text-gray-700">- Raqobat bor (lekin yengsa bo'ladi)</li>
                  </ul>
                  <div className="mt-3 ml-8 p-3 bg-white border border-gray-400 text-sm">
                    <strong>Nima uchun bu?</strong> Toshkentda talabni bilaman, texnik yechim oddiy, tez boshlasa bo'ladi.
                  </div>
                </div>

                {/* Branch 3 */}
                <div className="border-l-4 border-gray-400 pl-6">
                  <h5 className="font-bold flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-400 rounded-full"></div>
                    Yo'l 3: FinTech (Moliyaviy texnologiyalar)
                  </h5>
                  <ul className="mt-2 ml-8 space-y-1 text-sm text-gray-600">
                    <li>+ Katta potensial</li>
                    <li>+ Yuqori daromad</li>
                    <li>- Litsenziya kerak</li>
                    <li>- Xavfli (regulyatsiya o'zgarishi mumkin)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How to use with AI */}
          <Card className="border-2 border-black">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-6">ChatGPT'da qanday ishlatish?</h3>
              
              <div className="bg-gray-50 p-6 border border-gray-300 mb-6">
                <h4 className="font-bold mb-3 uppercase text-sm tracking-wide">Tree of Thoughts Prompt shabloni:</h4>
                <pre className="text-sm whitespace-pre-wrap font-mono">
{`"[Muammo yoki savol]

Bu masalani 3 xil yo'l bilan hal qiling:

Yo'l 1: [Birinchi yondashuv]
- Afzalliklari
- Kamchiliklari
- Natija

Yo'l 2: [Ikkinchi yondashuv]
- Afzalliklari
- Kamchiliklari
- Natija

Yo'l 3: [Uchinchi yondashuv]
- Afzalliklari
- Kamchiliklari
- Natija

Har bir yo'lni tahlil qilib, eng optimal yechimni tanlang va nima uchun ekanini tushuntiring."`}</pre>
              </div>

              <Alert className="border-2 border-black bg-white">
                <AiIcon name="lightbulb" size={20} />
                <AlertDescription>
                  <strong>Pro maslahat:</strong> Tree of Thoughts ayniqsa murakkab qarorlar qabul qilishda, strategik rejalashtirish va muammolarni hal qilishda juda samarali.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Practice Exercise */}
          <TryItYourself
            task="O'zingizning shaxsiy brend (personal brand) yaratish uchun Tree of Thoughts usulidan foydalaning. LinkedIn, Instagram va Twitter uchun 3 xil strategiya ishlab chiqing."
            hints={[
              "Professional (LinkedIn focused) strategiya",
              "Creative (Instagram focused) strategiya", 
              "Thought leader (Twitter focused) strategiya",
              "Har birining maqsadli auditoriyasini aniqlang",
              "Content turlari va chastotasini belgilang"
            ]}
            sampleSolution={`Tree of Thoughts - Personal Branding:

Yo'l 1: Professional Expert (LinkedIn)
- Haftalik 3 ta insight post
- Case study'lar va white paper'lar
- B2B networking fokus
- ROI: Konsalting imkoniyatlari

Yo'l 2: Visual Storyteller (Instagram)
- Kunlik Stories + haftalik 2 post
- Behind-the-scenes content
- Lifestyle + professional mix
- ROI: Brand hamkorliklar

Yo'l 3: Tech Influencer (Twitter)
- Kunlik 5-10 tweet/thread
- Hot takes va trendlar
- Diskussiyalar va Space'lar
- ROI: Speaking imkoniyatlari

Tanlangan: Yo'l 1 + 3 kombinatsiyasi
Sabab: LinkedIn orqali authority, Twitter orqali reach. Instagram vaqt ko'p oladi, ROI past.`}
          />

          {/* Knowledge Check */}
          <KnowledgeCheck
            question="Tree of Thoughts usulining asosiy afzalligi nimada?"
            options={[
              "Bitta eng yaxshi yechimni tez topadi",
              "Ko'p variantlarni ko'rib, taqqoslab optimal yechim tanlaydi",
              "Kamroq vaqt sarflaydi",
              "Faqat ha/yo'q savollarga javob beradi"
            ]}
            correctAnswer={1}
            explanation="To'g'ri! Tree of Thoughts bir necha yo'lni parallel ravishda o'rganib, ularni taqqoslash orqali eng yaxshi yechimni topadi. Bu oddiy linear fikrlashdan ko'ra samaraliroq."
            onAnswer={() => {
              // Score tracking can be implemented later
            }}
          />
        </div>
      )
    },
    {
      id: "rag-basics",
      title: "RAG Asoslari",
      icon: <AiIcon name="search" size={20} />,
      content: (
        <div className="space-y-8">
          <div className="text-center mb-8">
            <Badge className="mb-4 bg-black text-white border-black">
              Google + ChatGPT
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-black text-black mb-4 tracking-tight">
              RAG - Retrieval Augmented Generation
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              AI'ga Google'ni o'rgating. Real ma'lumotlar bilan ishlash.
            </p>
          </div>

          {/* Simple Explanation */}
          <Card className="border-2 border-black bg-white">
            <CardContent className="p-8">
              <h3 className="text-2xl font-black mb-6 text-black">Oddiy tilda RAG nima?</h3>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-bold mb-4 uppercase text-sm tracking-wide">Oddiy ChatGPT:</h4>
                  <div className="bg-gray-100 p-4 border-2 border-gray-300 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <AiIcon name="brain" size={24} />
                      <span className="font-medium">Faqat o'z xotirasidan</span>
                    </div>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• 2021-yilgacha ma'lumot</li>
                      <li>• Ba'zan noto'g'ri eslaydi</li>
                      <li>• Yangi ma'lumotlarni bilmaydi</li>
                    </ul>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-bold mb-4 uppercase text-sm tracking-wide">RAG bilan ChatGPT:</h4>
                  <div className="bg-black text-white p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <AiIcon name="search" size={24} className="invert" />
                      <span className="font-medium">Google + Xotira</span>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li>• Real vaqtda qidiradi</li>
                      <li>• Aniq manbalardan oladi</li>
                      <li>• Har doim yangi ma'lumot</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-6 bg-gray-50 border-2 border-gray-300">
                <h4 className="font-bold mb-3">Misol:</h4>
                <p className="text-sm mb-3">
                  <strong>Savol:</strong> "Toshkentdagi bugungi ob-havo qanday?"
                </p>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-900 font-bold">Oddiy AI:</span>
                    <p className="mt-1">"Men 2021-yilgacha ma'lumotga egaman, bugungi ob-havoni bilmayman."</p>
                  </div>
                  <div>
                    <span className="text-gray-900 font-bold">RAG AI:</span>
                    <p className="mt-1">"[weather.com'dan qidiradi] Bugun Toshkentda 28°C, quyoshli."</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How RAG Works - Visual */}
          <Card className="border-2 border-black overflow-hidden">
            <div className="bg-black text-white p-6">
              <h3 className="text-xl font-bold flex items-center gap-3">
                <AiIcon name="workflow" size={24} className="invert" />
                RAG qanday ishlaydi?
              </h3>
            </div>
            <CardContent className="p-8">
              <div className="space-y-8">
                {/* Step by step process */}
                <div className="relative">
                  {[
                    {
                      step: 1,
                      icon: "question",
                      title: "Savol berish",
                      desc: "Foydalanuvchi savol beradi",
                      example: "Protokol 57 nima?"
                    },
                    {
                      step: 2,
                      icon: "search",
                      title: "Qidirish",
                      desc: "AI ma'lumot bazasidan qidiradi",
                      example: "Knowledge base'dan tegishli bo'limlarni topadi"
                    },
                    {
                      step: 3,
                      icon: "file",
                      title: "Ma'lumot olish",
                      desc: "Topilgan ma'lumotlarni o'qiydi",
                      example: "57 ta prompting protokoli haqidagi hujjatlar"
                    },
                    {
                      step: 4,
                      icon: "brain",
                      title: "Javob yaratish",
                      desc: "Ma'lumotlar asosida javob tuzadi",
                      example: "Protokol 57 - bu AI bilan samarali ishlash uchun..."
                    }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-6 mb-8 last:mb-0">
                      <div className="relative">
                        <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center">
                          <AiIcon name={item.icon} size={28} className="invert" />
                        </div>
                        {idx < 3 && (
                          <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-0.5 h-8 bg-gray-300"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-lg mb-1">
                          {item.step}. {item.title}
                        </h4>
                        <p className="text-gray-600 mb-2">{item.desc}</p>
                        <div className="bg-gray-50 p-3 border border-gray-200 text-sm font-mono">
                          {item.example}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Real World Examples */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <Card className="border-2 border-black">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <AiIcon name="checklist" size={32} />
                  <h4 className="font-bold text-lg">Hujjatlar bilan ishlash</h4>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-gray-50 border border-gray-200">
                    <strong>Vazifa:</strong> Kompaniya policy'sidan javob topish
                  </div>
                  <div className="p-3 bg-black text-white">
                    <strong>RAG:</strong> 500 sahifalik hujjatdan 5 soniyada aniq javob
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-black">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <AiIcon name="code" size={32} />
                  <h4 className="font-bold text-lg">Kod bazasi tahlili</h4>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-gray-50 border border-gray-200">
                    <strong>Vazifa:</strong> "Bu funksiya qayerda ishlatilgan?"
                  </div>
                  <div className="p-3 bg-black text-white">
                    <strong>RAG:</strong> Barcha fayllarni tahlil qilib, aniq joylarni ko'rsatadi
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Building RAG Systems */}
          <Card className="border-2 border-black">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-6">O'zingizning RAG tizimingizni qurish</h3>
              
              <div className="space-y-6">
                <div className="border-l-4 border-black pl-6">
                  <h4 className="font-bold mb-2">1. Ma'lumot bazasini tayyorlash</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Hujjatlarni yig'ing (PDF, Word, Web sahifalar)</li>
                    <li>• Kichik bo'laklarga bo'ling (chunking)</li>
                    <li>• Vector database'ga saqlang</li>
                  </ul>
                </div>

                <div className="border-l-4 border-black pl-6">
                  <h4 className="font-bold mb-2">2. Qidiruv tizimi</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Semantic search (ma'no bo'yicha qidirish)</li>
                    <li>• Keyword matching</li>
                    <li>• Hybrid search (ikkalasini birlashtirish)</li>
                  </ul>
                </div>

                <div className="border-l-4 border-black pl-6">
                  <h4 className="font-bold mb-2">3. AI integratsiya</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Topilgan ma'lumotlarni prompt'ga qo'shish</li>
                    <li>• Context window'ni optimal ishlatish</li>
                    <li>• Javob sifatini tekshirish</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-50 border border-gray-300">
                <h4 className="font-bold mb-2">Mashhur RAG vositalari:</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="bg-white p-2 border border-gray-200 text-center">LangChain</div>
                  <div className="bg-white p-2 border border-gray-200 text-center">LlamaIndex</div>
                  <div className="bg-white p-2 border border-gray-200 text-center">Pinecone</div>
                  <div className="bg-white p-2 border border-gray-200 text-center">Weaviate</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Practice Exercise */}
          <TryItYourself
            task="O'z kompaniyangiz uchun customer support chatbot yarating. RAG yordamida FAQ va documentation'dan javob beradigan qilib."
            hints={[
              "Avval barcha FAQ va doc'larni yig'ing",
              "Savollarni kategoriyalarga bo'ling",
              "Har bir kategoriya uchun qidiruv so'zlarini aniqlang",
              "Javob template'larini tayyorlang",
              "Topilmagan savollar uchun fallback rejasi"
            ]}
            sampleSolution={`RAG Customer Support Bot Architecture:

1. Data Sources:
   - FAQ database (100+ savollar)
   - Product documentation (PDF)
   - Previous support tickets
   - Video tutorials transcripts

2. Query Processing:
   User: "Parolimni qanday o'zgartirsam bo'ladi?"
   
   RAG Process:
   - Keywords: [parol, o'zgartirish, reset, password]
   - Search in: FAQ → Docs → Tickets
   - Found: FAQ #23, Doc page 45

3. Response Generation:
   "Parolni o'zgartirish uchun:
   1. Profil → Sozlamalar
   2. 'Xavfsizlik' bo'limini tanlang
   3. 'Parolni o'zgartirish' tugmasini bosing
   
   [Video tutorial link]
   
   Qo'shimcha yordam kerakmi?"`}
          />

          {/* Knowledge Check */}
          <KnowledgeCheck
            question="RAG tizimining asosiy afzalligi nimada?"
            options={[
              "AI tezroq ishlaydi",
              "Real va yangi ma'lumotlar bilan ishlash imkoniyati",
              "Kamroq xotira ishlatadi",
              "Faqat ingliz tilida ishlaydi"
            ]}
            correctAnswer={1}
            explanation="To'g'ri! RAG AI'ga real vaqtda yangi ma'lumotlarni qidirib topish va ular asosida aniq javob berish imkonini beradi. Bu AI'ning eng katta muammosi - eskirgan ma'lumotlar muammosini hal qiladi."
            onAnswer={() => {
              // Score tracking can be implemented later
            }}
          />
        </div>
      )
    },
    {
      id: "critical-thinking",
      title: "Tanqidiy Fikrlash",
      icon: <AiIcon name="lightbulb" size={20} />,
      content: (
        <div className="space-y-8">
          <div className="text-center mb-8">
            <Badge className="mb-4 bg-black text-white border-black">
              Har bir inson uchun zarur
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-black text-black mb-4 tracking-tight">
              TANQIDIY FIKRLASH
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              "Aql - insonning eng katta boyligi" - deyishadi xalqimizda. 
              Bugun bu boylikni to'g'ri ishlatish har qachongidan ham muhim.
            </p>
          </div>

          {/* What is Critical Thinking */}
          <Card className="border-2 border-black overflow-hidden">
            <div className="bg-black text-white p-6">
              <h3 className="text-2xl font-bold">BU NIMA VA NIMA UCHUN KERAK?</h3>
            </div>
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="bg-gray-50 border-2 border-gray-300 p-6 rounded-lg">
                  <p className="text-lg mb-4">
                    <strong>Tasavvur qiling:</strong> Telegram guruhingizda "Sensatsion yangilik!" degan xabar tarqaldi. 
                    Do'stlaringiz uni qayta yuborishmoqda. Siz nima qilasiz?
                  </p>
                  <p className="text-muted-foreground">
                    Tanqidiy fikrlash - bu to'xtab, o'ylab, so'ng qaror qilish.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <p className="text-lg">
                    <strong>Tanqidiy fikrlash</strong> - bu ma'lumotni shunchaki qabul qilish emas, balki uni:
                  </p>
                  <ul className="space-y-2 ml-6">
                    <li className="flex items-start gap-3">
                      <AiIcon name="checked" size={20} />
                      <span>Tahlil qilish (ajratish, o'rganish)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <AiIcon name="checked" size={20} />
                      <span>Baholash (qanchalik ishonchli?)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <AiIcon name="checked" size={20} />
                      <span>Xulosa chiqarish (o'z qaroringiz)</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Modern Problems */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-center">Zamonaviy muammolar</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <Card className="border-2 border-black">
                <CardContent className="p-4 sm:p-6">
                  <h4 className="text-xl font-bold mb-4 flex items-center gap-3">
                    <AiIcon name="data" size={24} />
                    Axborot portlashi
                  </h4>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-gray-900 mt-1">•</span>
                      <span>Har kuni 500+ yangilik, 1000+ post</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-900 mt-1">•</span>
                      <span>Fake news 6x tezroq tarqaladi</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-900 mt-1">•</span>
                      <span>Clickbait sarlavhalar 70% ko'proq bosiladi</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 border-black">
                <CardContent className="p-4 sm:p-6">
                  <h4 className="text-xl font-bold mb-4 flex items-center gap-3">
                    <AiIcon name="users" size={24} />
                    Ijtimoiy bosim
                  </h4>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-gray-600 mt-1">•</span>
                      <span>"10K like = haqiqat" xatosi</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-600 mt-1">•</span>
                      <span>Influencer aytdi = to'g'ri?</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-600 mt-1">•</span>
                      <span>FOMO - qolib ketish qo'rquvi</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* 5 Key Questions */}
          <Card className="border-2 border-black overflow-hidden">
            <div className="bg-gray-100 border-b-2 border-black p-6">
              <h3 className="text-2xl font-bold">ODDIY, LEKIN SAMARALI SAVOLLAR</h3>
            </div>
            <CardContent className="p-8">
              <p className="text-lg mb-6">Har qanday ma'lumot kelganda shu 5 ta savolni bering:</p>
              
              <div className="space-y-4">
                {[
                  { 
                    q: "KIM aytmoqda?", 
                    a: "Manba kim? Mutaxassismi yoki shunchaki fikr?",
                    example: "Telegram kanalda 'shifokor' - haqiqiy diplomli shifokormi?"
                  },
                  { 
                    q: "QANDAY dalil bor?", 
                    a: "Raqamlar, tadqiqotlar yoki shunchaki gap?",
                    example: "'Millionlab odam foydalanadi' - qaysi statistika?"
                  },
                  { 
                    q: "NIMA UCHUN aytilmoqda?", 
                    a: "Maqsad nima? Kimga foyda?",
                    example: "Mahsulot reklama qilishmi yoki chin maslahat?"
                  },
                  { 
                    q: "QACHON aytilgan?", 
                    a: "Dolzarbmi yoki eskirgan?",
                    example: "2019-yil statistikasi 2024 uchun to'g'rimi?"
                  },
                  { 
                    q: "QAERDAN olingan?", 
                    a: "Rasmiy manbami yoki 'eshitdim'?",
                    example: "WHO sayti yoki noma'lum blog?"
                  }
                ].map((item, idx) => (
                  <div key={idx} className="border-2 border-gray-300 rounded-lg p-6 hover:border-black transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-xl mb-2">{item.q}</h4>
                        <p className="text-muted-foreground mb-3">{item.a}</p>
                        <div className="bg-gray-50 p-3 rounded border border-gray-200">
                          <p className="text-sm italic">{item.example}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Practical Examples - Enhanced */}
          <Card className="border-2 border-black">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-6">REAL HAYOTDAN MISOLLAR</h3>
              
              <div className="space-y-6">
                {/* Example 1: Social Media */}
                <div>
                  <h4 className="font-bold text-lg mb-4">1. Instagram'da "Mo'jizaviy dori"</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-100 border-2 border-gray-400 p-6 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <AiIcon name="close" size={24} />
                        <span className="font-bold text-black">Tanqidiy fikrsiz</span>
                      </div>
                      <p className="text-black">"Voy, 2 haftada -15kg! Sotib olaman!"</p>
                    </div>
                    
                    <div className="bg-gray-50 border-2 border-gray-300 p-6 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <AiIcon name="checked" size={24} />
                        <span className="font-bold text-black">Tanqidiy fikr bilan</span>
                      </div>
                      <p className="text-black">"Kim sotayapti? Sertifikat bormi? Yon ta'siri? Shifokor maslahati?"</p>
                    </div>
                  </div>
                </div>

                {/* Example 2: Job Offer */}
                <div>
                  <h4 className="font-bold text-lg mb-4">2. "Oyiga $5000 uydan ishlang!"</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-100 border-2 border-gray-400 p-6 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <AiIcon name="close" size={24} />
                        <span className="font-bold text-black">Tanqidiy fikrsiz</span>
                      </div>
                      <p className="text-black">"Zo'r imkoniyat! Hoziroq ro'yxatdan o'taman!"</p>
                    </div>
                    
                    <div className="bg-gray-50 border-2 border-gray-300 p-6 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <AiIcon name="checked" size={24} />
                        <span className="font-bold text-black">Tanqidiy fikr bilan</span>
                      </div>
                      <p className="text-black">"Qaysi kompaniya? Nima ish? Oldindan pul so'rashyaptimi?"</p>
                    </div>
                  </div>
                </div>

                {/* Example 3: News */}
                <div>
                  <h4 className="font-bold text-lg mb-4">3. "Breaking: Dollar 20,000 so'm bo'ladi!"</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-100 border-2 border-gray-400 p-6 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <AiIcon name="close" size={24} />
                        <span className="font-bold text-black">Tanqidiy fikrsiz</span>
                      </div>
                      <p className="text-black">"Hammaga ayt! Dollar sotib olish kerak!"</p>
                    </div>
                    
                    <div className="bg-gray-50 border-2 border-gray-300 p-6 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <AiIcon name="checked" size={24} />
                        <span className="font-bold text-black">Tanqidiy fikr bilan</span>
                      </div>
                      <p className="text-black">"Kim aytdi? Markaziy bank nimadir dedimi? Rasmiy manbani tekshiray"</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Benefits - Redesigned */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-center">Tanqidiy fikrlash sizga nima beradi?</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <Card className="border-2 border-black hover:bg-black hover:text-white transition-all group">
                <CardContent className="p-4 sm:p-6">
                  <div className="w-16 h-16 bg-black group-hover:bg-white rounded-full flex items-center justify-center mb-4">
                    <AiIcon name="users" size={32} className="group-hover:invert" />
                  </div>
                  <h4 className="text-xl font-bold mb-4">Shaxsiy hayotda</h4>
                  <ul className="space-y-2 text-sm">
                    <li>✓ Scam va firibgarlikdan himoya</li>
                    <li>✓ To'g'ri moliyaviy qarorlar</li>
                    <li>✓ Sog'lom munosabatlar</li>
                    <li>✓ Stress va vahimadan xalos</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 border-black hover:bg-black hover:text-white transition-all group">
                <CardContent className="p-4 sm:p-6">
                  <div className="w-16 h-16 bg-black group-hover:bg-white rounded-full flex items-center justify-center mb-4">
                    <AiIcon name="flag" size={32} className="group-hover:invert" />
                  </div>
                  <h4 className="text-xl font-bold mb-4">Jamiyatda</h4>
                  <ul className="space-y-2 text-sm">
                    <li>✓ Fake news tarqatmaslik</li>
                    <li>✓ Konstruktiv muhokama</li>
                    <li>✓ To'g'ri tanlov qilish</li>
                    <li>✓ Jamiyat farovonligiga hissa</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 border-black hover:bg-black hover:text-white transition-all group">
                <CardContent className="p-4 sm:p-6">
                  <div className="w-16 h-16 bg-black group-hover:bg-white rounded-full flex items-center justify-center mb-4">
                    <AiIcon name="rocket" size={32} className="group-hover:invert" />
                  </div>
                  <h4 className="text-xl font-bold mb-4">Kasbda</h4>
                  <ul className="space-y-2 text-sm">
                    <li>✓ Yaxshi qarorlar = yaxshi natijalar</li>
                    <li>✓ Muammolarni tez hal qilish</li>
                    <li>✓ Innovatsion g'oyalar</li>
                    <li>✓ Liderlik qobiliyati</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Remember Section - Simplified */}
          <Card className="border-2 border-black bg-gray-50">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-6 text-center">ESLAB QOLING</h3>
              
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="text-center">
                  <p className="text-xl font-bold mb-2">Tanqidiy fikrlash bu:</p>
                  <p className="text-lg text-muted-foreground">
                    Hamma narsaga shubha emas, balki <span className="font-bold text-black">aqlli savol berish</span>
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg border-2 border-gray-300">
                    <p className="font-bold flex items-center gap-2 mb-2">
                      <span className="text-gray-900 text-2xl">×</span>
                      Bu EMAS:
                    </p>
                    <ul className="space-y-1 text-sm text-muted-foreground ml-6">
                      <li>• Hammaga ishonmaslik</li>
                      <li>• Doim negative bo'lish</li>
                      <li>• Hamma narsani bilish</li>
                    </ul>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border-2 border-gray-300">
                    <p className="font-bold flex items-center gap-2 mb-2">
                      <AiIcon name="checked" size={20} />
                      Bu SHULAR:
                    </p>
                    <ul className="space-y-1 text-sm text-muted-foreground ml-6">
                      <li>• Dalil so'rash</li>
                      <li>• Turli fikrlarni eshitish</li>
                      <li>• O'z xatoni tan olish</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI + Critical Thinking - NEW SECTION */}
          <div className="space-y-6">
            <div className="text-center">
              <Badge className="mb-4 bg-black text-white border-black">
                Eng muhim kombinatsiya
              </Badge>
              <h3 className="text-3xl font-bold text-black mb-4">
                AI + Tanqidiy Fikrlash = Super Kuch
              </h3>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                AI bilan ishlashda tanqidiy fikrlash sizning eng kuchli qurolingiz
              </p>
            </div>

            {/* Why This Combination Matters */}
            <Card className="border-2 border-black overflow-hidden">
              <div className="bg-gradient-to-r from-black to-gray-800 text-white p-6">
                <h4 className="text-2xl font-bold">Nima uchun bu muhim?</h4>
              </div>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h5 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <AiIcon name="brain" size={24} />
                      AI'ning kuchli tomonlari:
                    </h5>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• Sekundda millionlab ma'lumotni qayta ishlash</li>
                      <li>• 100+ tilda gaplashish</li>
                      <li>• Charchamasdan 24/7 ishlash</li>
                      <li>• Pattern va bog'lanishlarni topish</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <AiIcon name="warning" size={24} />
                      AI'ning zaif tomonlari:
                    </h5>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• Ba'zan noto'g'ri ma'lumot beradi</li>
                      <li>• Real dunyoni tushunmaydi</li>
                      <li>• Hissiyot va tajribaga ega emas</li>
                      <li>• Kontekstni xato tushunishi mumkin</li>
                    </ul>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-black text-white rounded-lg">
                  <p className="text-center font-bold text-lg">
                    Tanqidiy fikrlash = AI'ning zaif tomonlarini to'ldiradi
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* How to Use Critical Thinking with AI */}
            <Card className="border-2 border-black">
              <CardContent className="p-8">
                <h4 className="text-2xl font-bold mb-6">AI bilan ishlashda tanqidiy fikrlash qoidalari</h4>
                
                <div className="space-y-6">
                  {[
                    {
                      number: 1,
                      title: "Har doim tekshiring",
                      description: "AI bergan ma'lumotni kamida 2 manbadan tasdiqlang",
                      example: "AI: 'Toshkent aholisi 3.5 million' → Google'dan tekshiring",
                      icon: "search"
                    },
                    {
                      number: 2,
                      title: "Kontekst bering",
                      description: "AI'ga to'liq ma'lumot bering, u sizni yaxshiroq tushunsin",
                      example: "Yomon: 'Kod yoz' → Yaxshi: 'React'da todo app, TypeScript bilan'",
                      icon: "file"
                    },
                    {
                      number: 3,
                      title: "Savol bering",
                      description: "AI javobidan qanoatlanmang, chuqurroq so'rang",
                      example: "'Bu nima uchun ishlaydi?', 'Boshqa usul bormi?', 'Kamchiligi nima?'",
                      icon: "question"
                    },
                    {
                      number: 4,
                      title: "Chegaralarni biling",
                      description: "AI nima qila olmasligini tushunib ishlang",
                      example: "Shaxsiy maslahat, tibbiy tashxis, yuridik xulosa - mutaxassisga",
                      icon: "shield"
                    }
                  ].map((rule) => (
                    <div key={rule.number} className="border-2 border-gray-300 rounded-lg p-6 hover:border-black transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 bg-black text-white rounded-full flex items-center justify-center flex-shrink-0">
                          <AiIcon name={rule.icon} size={24} className="invert" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-bold text-xl mb-2">
                            {rule.number}. {rule.title}
                          </h5>
                          <p className="text-muted-foreground mb-3">{rule.description}</p>
                          <div className="bg-gray-50 p-3 rounded border border-gray-200">
                            <p className="text-sm font-mono">{rule.example}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Practical Framework */}
            <Card className="border-2 border-black bg-gray-50">
              <CardContent className="p-8">
                <h4 className="text-2xl font-bold mb-6 text-center">AI bilan ishlashning 4 bosqichi</h4>
                
                <div className="max-w-3xl mx-auto">
                  <div className="space-y-4">
                    {[
                      {
                        step: "TAYYORGARLIK",
                        actions: ["Maqsadni aniqla", "Ma'lumot to'pla", "Savolni aniq qil"],
                        color: "bg-gray-100 border-gray-400"
                      },
                      {
                        step: "SO'ROV",
                        actions: ["To'liq kontekst ber", "Aniq ko'rsatmalar", "Format belgilash"],
                        color: "bg-gray-100 border-gray-400"
                      },
                      {
                        step: "BAHOLASH", 
                        actions: ["Javobni o'qi", "Xatolarni qidir", "Mantiqni tekshir"],
                        color: "bg-gray-100 border-gray-400"
                      },
                      {
                        step: "TAKOMILLASHTIRISH",
                        actions: ["Savol ber", "Tushuntirishni so'ra", "Qayta so'ra"],
                        color: "bg-gray-100 border-gray-400"
                      }
                    ].map((phase, idx) => (
                      <div key={idx} className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                          {idx + 1}
                        </div>
                        <div className={`flex-1 p-4 rounded-lg border-2 ${phase.color}`}>
                          <h5 className="font-bold mb-2">{phase.step}</h5>
                          <div className="flex gap-2 flex-wrap">
                            {phase.actions.map((action, i) => (
                              <span key={i} className="bg-white px-2 py-1 rounded text-sm">
                                {action}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Interactive Exercise */}
            <Card className="border-2 border-black">
              <CardContent className="p-8">
                <h4 className="text-2xl font-bold mb-6">Mashq qiling: AI javobini tanqidiy baholang</h4>
                
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-300 mb-6">
                  <p className="font-bold mb-2">Savol:</p>
                  <p className="italic">"Toshkentda eng yaxshi dasturlash kursini qayerdan topaman?"</p>
                  
                  <p className="font-bold mt-4 mb-2">AI javobi:</p>
                  <p className="text-muted-foreground">
                    "Toshkentda eng yaxshi dasturlash kursi PDP Academy'da. 
                    Ular 100% ish kafolati berishadi va barcha bitiruvchilar $2000+ maosh olishadi. 
                    Kurs 3 oy davom etadi va siz professional dasturchi bo'lib chiqasiz."
                  </p>
                </div>
                
                <div className="space-y-4">
                  <h5 className="font-bold">Bu javobni tanqidiy baholang:</h5>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-100 border-2 border-gray-400 p-4 rounded-lg">
                      <h6 className="font-bold text-black mb-2">🚨 Shubhali jihatlar:</h6>
                      <ul className="space-y-1 text-sm text-black">
                        <li>• "Eng yaxshi" - kim baholadi?</li>
                        <li>• "100% kafolat" - real emas</li>
                        <li>• "$2000+" - barcha uchunmi?</li>
                        <li>• "3 oyda professional" - juda qisqa</li>
                      </ul>
                    </div>
                    
                    <div className="bg-gray-50 border-2 border-gray-300 p-4 rounded-lg">
                      <h6 className="font-bold text-black mb-2">✅ To'g'ri yondashuv:</h6>
                      <ul className="space-y-1 text-sm text-black">
                        <li>• Bir nechta kurs solishtiring</li>
                        <li>• Bitiruvchilar bilan gaplashing</li>
                        <li>• Dastur va o'qituvchilarni o'rganing</li>
                        <li>• Real sharhlarni o'qing</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Call to Action */}
            <Card className="border-2 border-black bg-black text-white">
              <CardContent className="p-8 text-center">
                <h4 className="text-2xl font-bold mb-4">BOSHLANG!</h4>
                <p className="text-lg mb-6">
                  Endi siz AI'ning kuchidan to'liq foydalanishga tayyorsiz. 
                  Har bir AI javobi - bu sizning tanqidiy fikrlash mushaklaringizni mashq qilish imkoniyati.
                </p>
                <div className="inline-flex items-center gap-3 bg-white text-black px-6 py-3 rounded-lg font-bold">
                  <AiIcon name="rocket" size={24} />
                  <span>AI + Tanqidiy Fikr = Cheksiz Imkoniyat</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    {
      id: "prompt-basics",
      title: "Prompting Asoslari",
      icon: <AiIcon name="code" size={20} />,
      content: (
        <div className="space-y-8">
          <div className="text-center mb-8">
            <Badge className="mb-4 bg-accent/10 text-accent border-accent/20">
              Asosiy komponentlar
            </Badge>
            <h2 className="text-3xl font-bold text-black mb-4">
              Prompting asoslari
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Prompting - bu sun'iy intellektga aniq ko'rsatmalar berib, kerakli natijani olish san'atidir.
            </p>
          </div>

          {/* The Science Behind Prompting */}
          <Card className="border-2 border-border">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold mb-4">Prompting ortidagi ilm</h3>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Prompting — bu oddiy savol berish emas. Bu AI'ning "miya"siga to'g'ri signal yuborish san'ati.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Noto'g'ri yondashuv:</h4>
                    <p className="text-sm text-muted-foreground mb-2">"AI ga nima desam tushunadi"</p>
                    <p className="text-sm text-gray-900">❌ 30% samara</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold mb-2">To'g'ri yondashuv:</h4>
                    <p className="text-sm text-muted-foreground mb-2">"AI qanday signal kutayotganini bilaman"</p>
                    <p className="text-sm text-gray-900">✅ 90% samara</p>
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
                icon: <AiIcon name="brain" size={20} />,
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
                icon: <AiIcon name="teaching" size={20} />,
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
                icon: <AiIcon name="target" size={20} />,
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
                icon: <AiIcon name="layers" size={20} />,
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
                icon: <AiIcon name="checked" size={20} />,
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
              <Card key={component.number} className="border-2 border-border hover:border-accent transition-all hover:shadow-lg overflow-hidden">
                <div className={`h-2 bg-gradient-to-r from-accent to-accent/60`} />
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-14 h-14 bg-accent/10 text-accent rounded-xl flex items-center justify-center">
                        {component.icon}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-bold text-muted-foreground">#{component.number}</span>
                        <h3 className="font-bold text-xl text-black">{component.title}</h3>
                      </div>
                      <p className="text-muted-foreground mb-4">{component.description}</p>
                      <div className="bg-muted p-4 rounded-lg border border-border mb-4">
                        <code className="text-sm text-foreground font-mono">"{component.example}"</code>
                      </div>
                      
                      {/* Deep Dive Section */}
                      <details className="group">
                        <summary className="cursor-pointer text-accent font-medium text-sm flex items-center gap-2 hover:text-accent/80">
                          <AiIcon name="chevron-right" size={16} className="transition-transform group-open:rotate-90" />
                          Chuqurroq o'rganish
                        </summary>
                        <div className="mt-4 space-y-3 pl-6 border-l-2 border-accent/20">
                          <p className="text-sm text-muted-foreground italic">{component.deepDive.why}</p>
                          <div className="space-y-2">
                            {component.deepDive.examples.map((ex, idx) => (
                              <div key={idx} className="bg-background p-3 rounded border border-border">
                                <p className="text-xs text-foreground">{ex}</p>
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
                    { layer: "Til ko'nikmasi", color: "bg-gray-100 border-gray-400", desc: "Grammatika, uslub" },
                    { layer: "Kreativlik + Soha bilimi", color: "bg-gray-100 border-gray-400", desc: "Innovatsiya, expertise" },
                    { layer: "Protokollar", color: "bg-gray-200 border-gray-500", desc: "57 ta maxsus texnika" },
                    { layer: "Tanqidiy fikrlash", color: "bg-gray-100 border-gray-400", desc: "Mantiq, tahlil" },
                    { layer: "Oddiy savollar", color: "bg-gray-100 border-gray-400", desc: "Asos, fundament" }
                  ].map((item, index) => (
                    <div key={index} className="group relative mb-2">
                      <div
                        className={`p-4 rounded-lg border-2 ${item.color} font-medium text-foreground transition-all hover:scale-105 cursor-pointer`}
                      >
                        {item.layer}
                      </div>
                      <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-xs px-2 py-1 rounded pointer-events-none whitespace-nowrap">
                        {item.desc}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-6 text-muted-foreground">
                  Har bir qatlam muhim. 57 ta protokol — sizning maxsus ziravorlaringiz!
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Common Mistakes */}
          <Card className="border-2 border-gray-400 bg-gray-100">
            <CardContent className="p-4 sm:p-6">
              <h3 className="font-bold text-lg mb-4 text-black">Eng ko'p uchraydigan xatolar</h3>
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
                  <div key={idx} className="bg-background rounded-lg p-4 border border-gray-400">
                    <h4 className="font-semibold text-black mb-2">{item.mistake}</h4>
                    <p className="text-sm text-muted-foreground mb-1">❌ "{item.example}"</p>
                    <p className="text-sm text-gray-900">✅ "{item.fix}"</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Important Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <Alert className="border-accent/20">
              <AiIcon name="rocket" size={16} />
              <AlertDescription>
                <strong>Qoida 3:</strong> Asoslar muhim. 57 ta protokolni asosiy komponentlar bilan birlashtirsangiz, ta'siri o'n barobar ortadi.
              </AlertDescription>
            </Alert>
            
            <Alert className="border-black/20 bg-gray-50">
              <AiIcon name="checked" size={16} />
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
      icon: <AiIcon name="cpu" size={20} />,
      content: (
        <div className="space-y-8">
          <div className="text-center mb-8">
            <Badge className="mb-4 bg-accent/10 text-accent border-accent/20">
              Ilg'or texnikalar
            </Badge>
            <h2 className="text-3xl font-bold text-black mb-4">
              Professional Prompting Texnikalari
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Zero-shot'dan Chain-of-Thought'gacha — AI'dan maksimal foyda olish usullari
            </p>
          </div>

          {/* Techniques Overview */}
          <Card className="border-2 border-border">
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
                      <div className="flex-1 bg-muted rounded-lg p-4 border border-border">
                        <h4 className="font-semibold">{item.tech}</h4>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
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
            <Card className="border-2 border-gray-300 overflow-hidden">
              <div className="bg-gray-100 p-4 border-b border-gray-300">
                <h3 className="text-xl font-bold flex items-center gap-3">
                  <AiIcon name="rocket" size={24} />
                  Zero-shot Prompting
                </h3>
              </div>
              <CardContent className="p-4 sm:p-6">
                <p className="text-muted-foreground mb-4">
                  <strong>Nima bu?</strong> Hech qanday misol bermasdan to'g'ridan-to'g'ri savol berish.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="font-semibold mb-2 text-black">✅ Afzalliklari:</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Tez va oddiy</li>
                      <li>• Kamroq token sarflaydi</li>
                      <li>• Umumiy savollar uchun ideal</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-black">❌ Kamchiliklari:</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
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
            <Card className="border-2 border-gray-300 overflow-hidden">
              <div className="bg-gray-100 p-4 border-b border-gray-300">
                <h3 className="text-xl font-bold flex items-center gap-3">
                  <AiIcon name="layers" size={24} />
                  Few-shot Prompting
                </h3>
              </div>
              <CardContent className="p-4 sm:p-6">
                <p className="text-muted-foreground mb-4">
                  <strong>Nima bu?</strong> AI'ga bir necha misol ko'rsatib, keyin o'z vazifangizni berish.
                </p>
                
                <div className="bg-muted rounded-lg p-6 mb-6">
                  <h4 className="font-semibold mb-3">Qachon ishlatish kerak:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-background p-3 rounded border border-border">
                      <AiIcon name="file" size={24} className="mb-2" />
                      <p className="text-sm">Maxsus format kerak bo'lganda</p>
                    </div>
                    <div className="bg-background p-3 rounded border border-border">
                      <AiIcon name="network" size={24} className="mb-2" />
                      <p className="text-sm">Murakkab pattern'lar uchun</p>
                    </div>
                    <div className="bg-background p-3 rounded border border-border">
                      <AiIcon name="target" size={24} className="mb-2" />
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
            <Card className="border-2 border-gray-300 overflow-hidden">
              <div className="bg-gray-100 p-4 border-b border-gray-300">
                <h3 className="text-xl font-bold flex items-center gap-3">
                  <AiIcon name="workflow" size={24} />
                  Chain-of-Thought (CoT)
                </h3>
              </div>
              <CardContent className="p-4 sm:p-6">
                <p className="text-muted-foreground mb-4">
                  <strong>Nima bu?</strong> AI'ni bosqichma-bosqich fikrlashga undash. "Qadam-baqadam o'ylab ko'r" deyish.
                </p>
                
                <div className="bg-gray-50 border border-gray-300 rounded-lg p-6 mb-6">
                  <h4 className="font-semibold mb-3">CoT ning siri:</h4>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <span className="text-gray-700 font-bold">1.</span>
                      <div>
                        <strong>Muammoni parchalash:</strong> Katta masalani kichik qismlarga bo'lish
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-gray-700 font-bold">2.</span>
                      <div>
                        <strong>Mantiqiy ketma-ketlik:</strong> Har bir qadam oldingi qadamga asoslanadi
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-gray-700 font-bold">3.</span>
                      <div>
                        <strong>Oraliq natijalar:</strong> Har bir qadamda natija tekshiriladi
                      </div>
                    </div>
                  </div>
                </div>

                <Card className="border border-gray-300 bg-background">
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-3">Amaliy misol: Matematik masala</h4>
                    <div className="space-y-3 text-sm">
                      <div className="bg-muted p-3 rounded">
                        <strong>Oddiy prompt:</strong> "3 ta olma va 5 ta nok bor. Jami nechta meva?"
                      </div>
                      <div className="bg-gray-50 p-3 rounded border border-gray-200">
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
            <Card className="border-2 border-gray-300 overflow-hidden">
              <div className="bg-gray-100 p-4 border-b border-gray-300">
                <h3 className="text-xl font-bold flex items-center gap-3">
                  <AiIcon name="assistant" size={24} />
                  Self-Consistency
                </h3>
              </div>
              <CardContent className="p-4 sm:p-6">
                <p className="text-muted-foreground mb-4">
                  <strong>Nima bu?</strong> Bir xil savolni bir necha marta berib, eng ko'p takrorlangan javobni tanlash.
                </p>
                
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-semibold mb-3">Qanday ishlaydi:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="font-bold">3x</span>
                      </div>
                      <p className="text-sm">Bir xil savolni 3-5 marta berish</p>
                    </div>
                    <div>
                      <div className="w-16 h-16 bg-gray-400 rounded-full flex items-center justify-center mx-auto mb-2">
                        <AiIcon name="checked" size={32} className="invert" />
                      </div>
                      <p className="text-sm">Javoblarni taqqoslash</p>
                    </div>
                    <div>
                      <div className="w-16 h-16 bg-gray-500 rounded-full flex items-center justify-center mx-auto mb-2">
                        <AiIcon name="target" size={32} className="invert" />
                      </div>
                      <p className="text-sm">Eng ishonchli javobni tanlash</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Advanced Techniques */}
            <Card className="border-2 border-border">
              <CardContent className="p-4 sm:p-6">
                <h3 className="font-bold text-xl mb-6">Ilg'or texnikalar</h3>
                <Tabs defaultValue="tree" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="tree">Tree-of-Thought</TabsTrigger>
                    <TabsTrigger value="react">ReAct</TabsTrigger>
                    <TabsTrigger value="meta">Meta-Prompting</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="tree" className="space-y-4">
                    <h4 className="font-semibold">Tree-of-Thought - Tarmoqli fikrlash</h4>
                    <p className="text-muted-foreground">Bir necha yo'nalishda fikrlab, eng yaxshisini tanlash:</p>
                    <div className="bg-muted p-4 rounded-lg">
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
                    <p className="text-muted-foreground">Fikrlash va harakat qilishni birlashtirish:</p>
                    <div className="bg-muted p-4 rounded-lg">
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
                    <p className="text-muted-foreground">AI'ga o'z promptini yaxshilashni buyurish:</p>
                    <div className="bg-muted p-4 rounded-lg">
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
          <Card className="border-2 border-border">
            <CardContent className="p-4 sm:p-6">
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
                    <tr className="border-b hover:bg-muted">
                      <td className="p-2 font-medium">Zero-shot</td>
                      <td className="text-center p-2">⭐</td>
                      <td className="text-center p-2">Kam</td>
                      <td className="text-center p-2">60-70%</td>
                      <td className="p-2">Oddiy savollar</td>
                    </tr>
                    <tr className="border-b hover:bg-muted">
                      <td className="p-2 font-medium">Few-shot</td>
                      <td className="text-center p-2">⭐⭐</td>
                      <td className="text-center p-2">O'rtacha</td>
                      <td className="text-center p-2">80-85%</td>
                      <td className="p-2">Format muhim bo'lganda</td>
                    </tr>
                    <tr className="border-b hover:bg-muted">
                      <td className="p-2 font-medium">Chain-of-Thought</td>
                      <td className="text-center p-2">⭐⭐⭐</td>
                      <td className="text-center p-2">Ko'p</td>
                      <td className="text-center p-2">90-95%</td>
                      <td className="p-2">Murakkab masalalar</td>
                    </tr>
                    <tr className="border-b hover:bg-muted">
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
            onAnswer={() => {
              // Score tracking can be implemented later
            }}
          />

          {/* Next Steps */}
          <Card className="border-2 border-accent/20 bg-gradient-to-r from-accent/5 to-accent/10">
            <CardContent className="p-8 text-center">
              <AiIcon name="rocket" size={48} className="mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-4">Tabriklaymiz!</h3>
              <p className="text-lg text-muted-foreground mb-6">
                Siz prompting asoslarini va ilg'or texnikalarni o'rgandingiz. 
                Endi 57 ta maxsus protokol bilan tanishing!
              </p>
              <div className="bg-background rounded-lg p-6 max-w-md mx-auto">
                <h4 className="font-semibold mb-3">Nimalarni o'rgandingiz:</h4>
                <ul className="text-left space-y-2 text-muted-foreground">
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
  
  // Reset progress function
  const resetProgress = () => {
    if (confirm("Haqiqatan ham barcha progressni o'chirmoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi.")) {
      localStorage.removeItem(STORAGE_KEY.CURRENT_SECTION);
      localStorage.removeItem(STORAGE_KEY.COMPLETED_SECTIONS);
      localStorage.removeItem(STORAGE_KEY.LAST_VISIT);
      setCurrentSection(0);
      setCompletedSections(new Set<number>());
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      {/* Save Indicator */}
      <AnimatePresence>
        {showSaveIndicator && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-4 z-50 bg-black text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2"
          >
            <AiIcon name="checked" size={16} className="invert" />
            <span className="text-sm">Progress saqlandi</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Welcome Back Message */}
        <AnimatePresence>
          {showWelcomeBack && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 bg-black text-white p-4 rounded-xl flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <AiIcon name="robot" size={24} className="invert" />
                <div>
                  <p className="font-bold">Qaytganingizdan xursandmiz!</p>
                  <p className="text-sm opacity-90">Siz {completedSections.size} ta bo'limni tugatgansiz. Davom etamizmi?</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowWelcomeBack(false)}
                className="text-white hover:bg-white/20"
              >
                <AiIcon name="close" size={16} className="invert" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 bg-muted rounded-2xl p-8 shadow-soft"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-foreground">O'rganish jarayoni</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {completedSections.size} / {sections.length} bo'lim tugatildi
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={resetProgress}
                className="text-muted-foreground hover:text-foreground"
              >
                <AiIcon name="shuffle" size={16} className="mr-2" />
                Qayta boshlash
              </Button>
              <div className="text-right">
                <span className="text-3xl sm:text-4xl font-black text-accent">{Math.round(totalProgress)}%</span>
                <p className="text-sm text-muted-foreground">bajarildi</p>
              </div>
            </div>
          </div>
          <Progress value={totalProgress} className="h-3 bg-muted" />
        </motion.div>

        {/* Section Navigation Tabs */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-start sm:justify-center gap-1 mb-8 sm:mb-12 bg-muted rounded-2xl p-1 overflow-x-auto shadow-soft scrollbar-hide"
        >
          {sections.map((section, index) => (
            <motion.button
              key={section.id}
              onClick={() => setCurrentSection(index)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl transition-all flex-shrink-0 min-w-[120px] sm:min-w-[140px] ${
                index === currentSection 
                  ? 'bg-accent text-accent-foreground shadow-medium' 
                  : completedSections.has(index)
                  ? 'bg-success/20 text-success-foreground hover:bg-success/30'
                  : 'bg-background text-muted-foreground hover:bg-muted'
              }`}
            >
              <span className="hidden sm:flex">{section.icon}</span>
              <span className="text-sm font-medium whitespace-nowrap">{section.title}</span>
              {completedSections.has(index) && index !== currentSection && (
                <AiIcon name="checked" size={16} className="ml-auto" />
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
            className="min-h-[400px] sm:min-h-[600px]"
          >
            {sections[currentSection].content}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-between mt-8 sm:mt-16 pt-6 sm:pt-8 border-t border-border"
        >
          <Button
            onClick={handlePrevious}
            variant="outline"
            disabled={currentSection === 0}
            className="px-4 sm:px-6 py-3 h-12 sm:h-auto hover-lift border-2 text-sm sm:text-base"
          >
            <AiIcon name="arrow-left" size={16} className="mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Oldingi</span>
            <span className="sm:hidden">←</span>
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
              <Button className="bg-accent text-white hover:bg-accent/90 px-4 sm:px-8 py-3 h-12 sm:h-auto flex items-center gap-1 sm:gap-2 shadow-strong hover-lift group text-sm sm:text-base">
                <span className="hidden sm:inline">57 Protokolga o'tish</span>
                <span className="sm:hidden">Tugatish</span>
                <AiIcon name="arrow-right" size={16} className="transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          ) : (
            <Button
              onClick={handleNext}
              className="bg-accent text-white hover:bg-accent/90 px-4 sm:px-6 py-3 h-12 sm:h-auto flex items-center gap-1 sm:gap-2 hover-lift group text-sm sm:text-base"
            >
              <span className="hidden sm:inline">Keyingi</span>
              <span className="sm:hidden">→</span>
              <AiIcon name="arrow-right" size={16} className="transition-transform group-hover:translate-x-1" />
            </Button>
          )}
        </motion.div>
      </main>
      <AppFooter />
    </div>
  );
}