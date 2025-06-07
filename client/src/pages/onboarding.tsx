import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  Layers
} from "lucide-react";
import { Link } from "wouter";
import AppHeader from "@/components/app-header";

interface FlipCardProps {
  term: string;
  definition: string;
  icon?: React.ReactNode;
}

function FlipCard({ term, definition, icon }: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className="relative w-full h-56 cursor-pointer perspective-1000 group"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div className={`absolute inset-0 w-full h-full transition-transform duration-700 transform-style-preserve-3d ${
        isFlipped ? 'rotate-y-180' : ''
      }`}>
        {/* Front */}
        <div className="absolute inset-0 w-full h-full backface-hidden">
          <Card className="h-full border-2 border-gray-200 hover:border-accent transition-all hover:shadow-lg">
            <CardContent className="h-full flex flex-col items-center justify-center text-center p-6">
              {icon && <div className="mb-4 text-accent">{icon}</div>}
              <h3 className="text-xl font-bold text-black mb-2">{term}</h3>
              <p className="text-sm text-gray-500">Bosing ko'rish uchun</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Back */}
        <div className="absolute inset-0 w-full h-full rotate-y-180 backface-hidden">
          <Card className="h-full bg-accent text-white border-2 border-accent">
            <CardContent className="h-full flex items-center justify-center text-center p-6">
              <p className="text-base leading-relaxed">{definition}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

interface KnowledgeCheckProps {
  question: string;
  options: string[];
  correctAnswer: number;
  onAnswer: (isCorrect: boolean) => void;
}

function KnowledgeCheck({ question, options, correctAnswer, onAnswer }: KnowledgeCheckProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleSelect = (index: number) => {
    setSelected(index);
    setShowResult(true);
    onAnswer(index === correctAnswer);
  };

  return (
    <Card className="border-2 border-gray-200">
      <CardContent className="p-6">
        <h4 className="font-semibold text-lg mb-4">{question}</h4>
        <div className="space-y-3">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleSelect(index)}
              disabled={showResult}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
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
                <span>{option}</span>
              </div>
            </button>
          ))}
        </div>
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
    setCompletedSections(prev => new Set([...prev, currentSection]));
  }, [currentSection]);

  const sections = [
    {
      id: "intro",
      title: "Kirish",
      icon: <BookOpen className="w-5 h-5" />,
      content: (
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-accent/10 text-accent border-accent/20">
              Yangi boshlanish
            </Badge>
            <h1 className="text-4xl font-black text-black mb-6 leading-tight">
              ChatGPT bilan to'g'ri ishlashni o'rganing
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
              Bu qo'llanma ChatGPT bilan muloyim gaplashishni o'rgatmaydi. 
              <span className="font-bold text-black"> Bu yerda faqat natija muhim.</span>
            </p>
          </div>
          
          {/* Key Points Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="border-2 border-gray-200 hover:border-accent transition-all hover:shadow-lg">
              <CardContent className="p-6 text-center">
                <Zap className="w-12 h-12 text-accent mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">Robot, inson emas</h3>
                <p className="text-gray-600 text-sm">ChatGPT sizning kayfiyatingizni tushunmaydi</p>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-gray-200 hover:border-accent transition-all hover:shadow-lg">
              <CardContent className="p-6 text-center">
                <Target className="w-12 h-12 text-accent mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">Buyruqlar asosida</h3>
                <p className="text-gray-600 text-sm">Aniq ko'rsatmalar = yaxshi natijalar</p>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-gray-200 hover:border-accent transition-all hover:shadow-lg">
              <CardContent className="p-6 text-center">
                <Sparkles className="w-12 h-12 text-accent mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">100x natija</h3>
                <p className="text-gray-600 text-sm">To'g'ri usul bilan 100 barobar ko'p foyda</p>
              </CardContent>
            </Card>
          </div>

          {/* Motivational Quote */}
          <Card className="border-2 border-accent/20 bg-gradient-to-r from-accent/5 to-accent/10">
            <CardContent className="p-8">
              <blockquote className="space-y-4">
                <p className="text-lg font-semibold text-black italic">
                  "Ishoning, sizdan aqlli bo'lmagan odamlar — ChatGPT'dan sizdan 100 karra ko'p foyda olyapti."
                </p>
                <p className="text-gray-700">
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
          
          {/* Interactive Flip Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <FlipCard 
              term="ChatGPT nima?" 
              definition="Sun'iy idrokka asoslangan tizim. Millionlab matnlarni o'rgangan va siz bergan buyruqni tushunishga harakat qiladi. U LLM (Large Language Model) asosida ishlaydi."
              icon={<MessageSquare className="w-8 h-8" />}
            />
            <FlipCard 
              term="Sun'iy Intellekt" 
              definition="Inson kabi o'ylay oladigan texnologiya. U uxlamaydi, charchamaydi, lekin o'z-o'zidan ishlamaydi. Sizdan ko'rsatma kutadi."
              icon={<Brain className="w-8 h-8" />}
            />
            <FlipCard 
              term="Token nima?" 
              definition="So'z bo'lagi. 'Salom' = 2 token. ChatGPT sizning yozganingizni tokenlar bo'yicha hisoblaydi. 1 sahifa matn ≈ 500 token."
              icon={<Hash className="w-8 h-8" />}
            />
            <FlipCard 
              term="LLM nima?" 
              definition="Large Language Model - katta til modeli. ChatGPT'ning miyasi. Yuz minglab kitoblar va saytlar asosida shakllangan."
              icon={<Layers className="w-8 h-8" />}
            />
          </div>

          {/* Token Calculator */}
          <Card className="border-2 border-accent/20 bg-gradient-to-r from-gray-50 to-white">
            <CardContent className="p-8">
              <h3 className="font-bold text-xl mb-6 flex items-center gap-3">
                <Hash className="w-6 h-6 text-accent" />
                Token Kalkulyator
              </h3>
              <Textarea 
                placeholder="Matningizni yozing, tokenlar sonini real vaqtda ko'ring..."
                value={tokenText}
                onChange={(e) => setTokenText(e.target.value)}
                className="mb-6 min-h-[120px] text-lg"
                rows={5}
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white rounded-lg border-2 border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Belgilar</p>
                  <p className="text-2xl font-bold text-gray-800">{tokenText.length}</p>
                </div>
                <div className="text-center p-4 bg-accent/10 rounded-lg border-2 border-accent/20">
                  <p className="text-sm text-gray-600 mb-1">Taxminiy tokenlar</p>
                  <p className="text-3xl font-bold text-accent">{calculateTokens(tokenText)}</p>
                </div>
                <div className="text-center p-4 bg-white rounded-lg border-2 border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Sahifalar</p>
                  <p className="text-2xl font-bold text-gray-800">{Math.ceil(calculateTokens(tokenText) / 500)}</p>
                </div>
              </div>
              <Alert className="mt-4">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  ChatGPT sizga chegaralangan token miqdorida javob beradi. Tokenni tejash - aniq yozishdan boshlanadi.
                </AlertDescription>
              </Alert>
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
          
          {/* 3 Questions Framework */}
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
                    <p className="text-gray-600">Manba ishonchli yoki yo'qmi? Kim yozgan? Qachon?</p>
                    <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium">[manba]</p>
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
                    <p className="text-gray-600">Mantiqiy asos mavjudmi? Dalillar keltirilganmi?</p>
                    <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium">[mantiqiy asos]</p>
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
                    <p className="text-gray-600">Gapi-gapiga to'g'ri kelyaptimi? Qarama-qarshilik yo'qmi?</p>
                    <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium">[gapi-gapiga mosmi?]</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

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
                <Alert className="border-accent/20 bg-white">
                  <Sparkles className="h-4 w-4 text-accent" />
                  <AlertDescription className="text-base">
                    <strong>Prompt</strong> — S.I. fikrlash jarayonini boshlash, yo'naltirish va kengaytirish uchun qo'llaniladigan sizning 'so'rovingiz'.
                  </AlertDescription>
                </Alert>
                <p className="text-gray-700 leading-relaxed">
                  Bu jarayonda biz doimiy ravishda o'zimizga: <span className="font-semibold">"Nima uchun?"</span>, 
                  <span className="font-semibold"> "Qanday qilib?"</span>, 
                  <span className="font-semibold"> "Nima bo'lishi mumkin edi?"</span> kabi savollarni beramiz.
                </p>
              </div>
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

          {/* 5 Components with Visual Examples */}
          <div className="space-y-6">
            {[
              {
                number: 1,
                title: "Rol (Role)",
                description: "AI'ga qanday rol o'ynashini ko'rsating",
                example: "Sen 10 yillik tajribaga ega Python dasturchi va o'qituvchisan",
                icon: <Brain className="w-5 h-5" />,
                color: "blue"
              },
              {
                number: 2,
                title: "Kontekst (Context)",
                description: "Vaziyatni aniqlashtiring",
                example: "Men yangi dasturchi va Python o'rganyapman...",
                icon: <BookOpen className="w-5 h-5" />,
                color: "green"
              },
              {
                number: 3,
                title: "Ko'rsatmalar (Instructions)",
                description: "Aniq va batafsil ko'rsatmalar bering",
                example: "Faqat yozda iste'mol qilinadigan 5 ta o'zbek taomlari uchun retsept ber",
                icon: <Target className="w-5 h-5" />,
                color: "purple"
              },
              {
                number: 4,
                title: "Misollar (Example)",
                description: "Kutilgan javob formatini ko'rsating",
                example: "Har bir retsept: [taom nomi] - [qisqa tavsif]",
                icon: <Layers className="w-5 h-5" />,
                color: "orange"
              },
              {
                number: 5,
                title: "Natija (Output)",
                description: "Natija qanday bo'lishi kerakligini aniqlashtiring",
                example: "Javobni o'zbek tilida, tushunarli tilda yoz",
                icon: <CheckCircle className="w-5 h-5" />,
                color: "red"
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
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <code className="text-sm text-gray-800 font-mono">"{component.example}"</code>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Prompt Burger Visual */}
          <Card className="border-2 border-accent/20 bg-gradient-to-b from-white to-accent/5">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-6">Haqiqiy Prompt Burger 🍔</h3>
              <div className="max-w-sm mx-auto space-y-2">
                {[
                  { layer: "Til ko'nikmasi", color: "bg-yellow-100 border-yellow-300" },
                  { layer: "Kreativlik + Soha bilimi", color: "bg-green-100 border-green-300" },
                  { layer: "Protokollar", color: "bg-red-100 border-red-300" },
                  { layer: "Tanqidiy fikrlash prompt asoslari", color: "bg-purple-100 border-purple-300" },
                  { layer: "Oddiy savollar", color: "bg-blue-100 border-blue-300" }
                ].map((item, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border-2 ${item.color} font-medium text-gray-800`}
                  >
                    {item.layer}
                  </div>
                ))}
              </div>
              <p className="mt-6 text-gray-600">
                57 ta protokol — mo'jizaviy palitra. Har biri alohida promptlarni boyitadi.
              </p>
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
      
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Header */}
        <div className="mb-8 bg-gray-50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">O'rganish jarayoni</h2>
              <p className="text-sm text-gray-600 mt-1">
                {completedSections.size} / {sections.length} bo'lim tugatildi
              </p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold text-accent">{Math.round(totalProgress)}%</span>
              <p className="text-sm text-gray-600">bajarildi</p>
            </div>
          </div>
          <Progress value={totalProgress} className="h-3" />
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center justify-center gap-1 mb-12 bg-gray-100 rounded-xl p-2">
          {sections.map((section, index) => (
            <button
              key={section.id}
              onClick={() => setCurrentSection(index)}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all flex-1 ${
                index === currentSection 
                  ? 'bg-accent text-white shadow-lg' 
                  : completedSections.has(index)
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="hidden sm:flex">{section.icon}</span>
              <span className="text-sm font-medium">{section.title}</span>
              {completedSections.has(index) && index !== currentSection && (
                <CheckCircle className="w-4 h-4 ml-auto" />
              )}
            </button>
          ))}
        </div>

        {/* Content Area with Animation */}
        <div className="min-h-[600px] animate-in fade-in duration-300">
          {sections[currentSection].content}
        </div>

        {/* Navigation Footer */}
        <div className="flex items-center justify-between mt-16 pt-8 border-t border-gray-200">
          <Button
            onClick={handlePrevious}
            variant="outline"
            disabled={currentSection === 0}
            className="px-6 py-3 h-auto"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Oldingi
          </Button>

          <div className="flex items-center gap-2">
            {sections.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentSection
                    ? 'w-8 bg-accent'
                    : completedSections.has(index)
                    ? 'bg-green-500'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {currentSection === sections.length - 1 ? (
            <Link href="/">
              <Button className="bg-accent text-white hover:bg-accent/90 px-8 py-3 h-auto flex items-center gap-2 shadow-lg">
                57 Protokolga o'tish
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          ) : (
            <Button
              onClick={handleNext}
              className="bg-accent text-white hover:bg-accent/90 px-6 py-3 h-auto flex items-center gap-2"
            >
              Keyingi
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}