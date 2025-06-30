import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import AppHeader from "@/components/app-header";
import AppFooter from "@/components/app-footer";
import { AiIcon } from "@/components/ai-icon";

// Knowledge Base Structure
interface KBSection {
  id: string;
  title: string;
  icon: string;
  sections: {
    id: string;
    title: string;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    readTime?: number;
    content?: React.ReactNode;
  }[];
}

const knowledgeBaseStructure: KBSection[] = [
  {
    id: 'kirish',
    title: 'KIRISH',
    icon: 'teaching',
    sections: [
      { id: 'nima-uchun-muhim', title: 'NIMA UCHUN BU MUHIM?', difficulty: 'beginner', readTime: 3 },
      { id: 'ai-inqilobi', title: 'AI INQILOBI VA O\'ZBEKISTON', difficulty: 'beginner', readTime: 5 },
      { id: 'prompting-nima', title: 'PROMPTING NIMA?', difficulty: 'beginner', readTime: 4 },
      { id: 'prompt-elementlari', title: 'PROMPT ELEMENTLARI', difficulty: 'intermediate', readTime: 6 },
      { id: 'umumiy-maslahatlar', title: 'UMUMIY MASLAHATLAR', difficulty: 'beginner', readTime: 5 }
    ]
  },
  {
    id: 'asoslar',
    title: 'ASOSLAR',
    icon: 'brain',
    sections: [
      { id: 'ai-qanday-ishlaydi', title: 'AI QANDAY ISHLAYDI?', difficulty: 'intermediate', readTime: 7 },
      { id: 'neyron-tarmoqlar', title: 'NEYRON TARMOQLAR', difficulty: 'advanced', readTime: 10 },
      { id: 'llm-arxitekturasi', title: 'LLM ARXITEKTURASI', difficulty: 'advanced', readTime: 12 },
      { id: 'transformer-modellari', title: 'TRANSFORMER MODELLARI', difficulty: 'advanced', readTime: 15 },
      { id: 'tokenizatsiya', title: 'TOKENIZATSIYA', difficulty: 'intermediate', readTime: 8 }
    ]
  },
  {
    id: 'sozlamalar',
    title: 'SOZLAMALAR',
    icon: 'settings',
    sections: [
      { id: 'harorat-parametri', title: 'HARORAT PARAMETRI', difficulty: 'intermediate', readTime: 5 },
      { id: 'top-p-va-top-k', title: 'TOP-P VA TOP-K', difficulty: 'intermediate', readTime: 6 },
      { id: 'max-tokens', title: 'MAX TOKENS', difficulty: 'beginner', readTime: 4 },
      { id: 'stop-sequences', title: 'STOP SEQUENCES', difficulty: 'intermediate', readTime: 5 },
      { id: 'presence-frequency', title: 'PRESENCE & FREQUENCY PENALTIES', difficulty: 'advanced', readTime: 7 }
    ]
  },
  {
    id: 'texnikalar',
    title: 'PROMPTING TEXNIKALARI',
    icon: 'layers',
    sections: [
      { id: 'zero-shot', title: 'ZERO-SHOT PROMPTING', difficulty: 'beginner', readTime: 5 },
      { id: 'few-shot', title: 'FEW-SHOT PROMPTING', difficulty: 'intermediate', readTime: 7 },
      { id: 'chain-of-thought', title: 'CHAIN-OF-THOUGHT (CoT)', difficulty: 'intermediate', readTime: 8 },
      { id: 'role-playing', title: 'ROLE PLAYING', difficulty: 'beginner', readTime: 6 },
      { id: 'structured-output', title: 'STRUCTURED OUTPUT', difficulty: 'intermediate', readTime: 7 }
    ]
  },
  {
    id: 'agents',
    title: 'AGENTS VA SISTEMALAR',
    icon: 'workflow',
    sections: [
      { id: 'agent-nima', title: 'AGENT NIMA?', difficulty: 'intermediate', readTime: 6 },
      { id: 'multi-agent', title: 'MULTI-AGENT SISTEMALAR', difficulty: 'advanced', readTime: 10 },
      { id: 'tool-use', title: 'TOOL USE', difficulty: 'intermediate', readTime: 8 },
      { id: 'orchestration', title: 'ORCHESTRATION', difficulty: 'advanced', readTime: 12 }
    ]
  },
  {
    id: 'rag',
    title: 'RAG VA ILGOR TEXNIKALAR',
    icon: 'network',
    sections: [
      { id: 'rag-asoslari', title: 'RAG ASOSLARI', difficulty: 'intermediate', readTime: 8 },
      { id: 'vector-db', title: 'VECTOR DATABASES', difficulty: 'advanced', readTime: 10 },
      { id: 'embeddings', title: 'EMBEDDINGS', difficulty: 'intermediate', readTime: 9 },
      { id: 'hybrid-search', title: 'HYBRID SEARCH', difficulty: 'advanced', readTime: 11 }
    ]
  },
  {
    id: 'tanqidiy',
    title: 'TANQIDIY FIKRLASH',
    icon: 'idea',
    sections: [
      { id: 'hallucination', title: 'HALLUCINATION', difficulty: 'intermediate', readTime: 6 },
      { id: 'fact-checking', title: 'FACT CHECKING', difficulty: 'intermediate', readTime: 7 },
      { id: 'bias-detection', title: 'BIAS DETECTION', difficulty: 'advanced', readTime: 8 },
      { id: 'prompt-injection', title: 'PROMPT INJECTION', difficulty: 'advanced', readTime: 9 }
    ]
  },
  {
    id: 'modellar',
    title: 'MODELLAR TAQQOSLASH',
    icon: 'compare',
    sections: [
      { id: 'gpt-oilasi', title: 'GPT OILASI', difficulty: 'beginner', readTime: 6 },
      { id: 'claude', title: 'CLAUDE', difficulty: 'beginner', readTime: 5 },
      { id: 'open-source', title: 'OPEN SOURCE MODELLAR', difficulty: 'intermediate', readTime: 8 },
      { id: 'multimodal', title: 'MULTIMODAL MODELLAR', difficulty: 'intermediate', readTime: 9 },
      { id: 'benchmark', title: 'BENCHMARK VA BAHOLASH', difficulty: 'advanced', readTime: 10 }
    ]
  },
  {
    id: 'xavfsizlik',
    title: 'XAVFSIZLIK VA ETIKA',
    icon: 'shield',
    sections: [
      { id: 'etik-qoidalar', title: 'ETIK QOIDALAR', difficulty: 'beginner', readTime: 5 },
      { id: 'malumot-xavfsizligi', title: 'MA\'LUMOT XAVFSIZLIGI', difficulty: 'intermediate', readTime: 7 },
      { id: 'jailbreaking', title: 'JAILBREAKING', difficulty: 'advanced', readTime: 8 },
      { id: 'responsible-ai', title: 'RESPONSIBLE AI', difficulty: 'intermediate', readTime: 6 }
    ]
  },
  {
    id: 'optimizatsiya',
    title: 'OPTIMIZATSIYA',
    icon: 'target',
    sections: [
      { id: 'prompt-qisqartirish', title: 'PROMPT QISQARTIRISH', difficulty: 'intermediate', readTime: 6 },
      { id: 'cost-optimization', title: 'COST OPTIMIZATION', difficulty: 'intermediate', readTime: 7 },
      { id: 'latency-reduction', title: 'LATENCY REDUCTION', difficulty: 'advanced', readTime: 8 },
      { id: 'caching-strategies', title: 'CACHING STRATEGIES', difficulty: 'advanced', readTime: 9 }
    ]
  },
  {
    id: 'amaliyot',
    title: 'AMALIYOT',
    icon: 'puzzle',
    sections: [
      { id: 'biznes-prompts', title: 'BIZNES UCHUN PROMPTLAR', difficulty: 'beginner', readTime: 7 },
      { id: 'talim-prompts', title: 'TA\'LIM UCHUN PROMPTLAR', difficulty: 'beginner', readTime: 6 },
      { id: 'texnik-prompts', title: 'TEXNIK PROMPTLAR', difficulty: 'intermediate', readTime: 8 },
      { id: 'kreativ-prompts', title: 'KREATIV PROMPTLAR', difficulty: 'beginner', readTime: 5 }
    ]
  },
  {
    id: 'resurslar',
    title: 'QO\'SHIMCHA RESURSLAR',
    icon: 'folder',
    sections: [
      { id: 'foydali-havolalar', title: 'FOYDALI HAVOLALAR', difficulty: 'beginner', readTime: 3 },
      { id: 'kitoblar', title: 'TAVSIYA ETILADIGAN KITOBLAR', difficulty: 'beginner', readTime: 4 },
      { id: 'kurslar', title: 'ONLINE KURSLAR', difficulty: 'beginner', readTime: 4 },
      { id: 'hamjamiyat', title: 'HAMJAMIYAT', difficulty: 'beginner', readTime: 3 },
      { id: 'glossariy', title: 'GLOSSARIY', difficulty: 'beginner', readTime: 10 }
    ]
  }
];

// User Progress Interface
interface UserProgress {
  completedSections: Set<string>;
  sectionScores: Record<string, number>;
  timeSpent: Record<string, number>;
  lastVisited: string;
  bookmarks: string[];
}

// Storage Keys
const STORAGE_KEY = {
  PROGRESS: 'kb_progress',
  LAST_VISITED: 'kb_last_visited',
  BOOKMARKS: 'kb_bookmarks'
};

// Components
interface ExpandableCardProps {
  term: string;
  definition: string;
  icon?: React.ReactNode;
  examples?: string[];
}

function ExpandableCard({ term, definition, icon, examples }: ExpandableCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="border-2 border-black mb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-6 flex items-center justify-between hover:bg-gray-50"
      >
        <div className="flex items-center gap-4">
          {icon && <div>{icon}</div>}
          <h3 className="text-xl font-bold uppercase">{term}</h3>
        </div>
        <AiIcon name={isExpanded ? 'chevron-up' : 'chevron-down'} size={20} />
      </button>
      
      {isExpanded && (
        <div className="p-6 pt-0">
          <p className="text-lg mb-4">{definition}</p>
          {examples && examples.length > 0 && (
            <div className="mt-4 pt-4 border-t-2 border-gray-200">
              <p className="font-bold mb-2">MISOLLAR:</p>
              {examples.map((example, idx) => (
                <p key={idx} className="mb-2">• {example}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface CodeExampleProps {
  title: string;
  badExample: string;
  goodExample: string;
  explanation: string;
}

function CodeExample({ title, badExample, goodExample, explanation }: CodeExampleProps) {
  const [showGood, setShowGood] = useState(false);
  
  return (
    <div className="border-2 border-black mb-6">
      <div className="bg-black text-white p-4">
        <h4 className="font-bold uppercase">{title}</h4>
      </div>
      
      <div className="p-6">
        {/* Bad Example */}
        <div className={showGood ? 'opacity-50' : ''}>
          <div className="flex items-center gap-2 mb-2">
            <AiIcon name="close" size={16} />
            <span className="font-bold">YOMON MISOL</span>
          </div>
          <div className="relative">
            <div className="absolute top-2 right-2">
              <CopyButton text={badExample} />
            </div>
            <pre className="bg-gray-50 border-2 border-black p-4 font-mono text-sm overflow-x-auto">
              {badExample}
            </pre>
          </div>
        </div>
        
        {/* Toggle Button */}
        <button
          onClick={() => setShowGood(!showGood)}
          className="my-4 px-4 py-2 border-2 border-black font-bold hover:bg-gray-50"
        >
          {showGood ? 'YOMON MISOLNI KO\'RISH' : 'YAXSHI MISOLNI KO\'RISH'}
        </button>
        
        {/* Good Example */}
        <div className={!showGood ? 'opacity-50' : ''}>
          <div className="flex items-center gap-2 mb-2">
            <AiIcon name="checked" size={16} />
            <span className="font-bold">YAXSHI MISOL</span>
          </div>
          <div className="relative">
            <div className="absolute top-2 right-2">
              <CopyButton text={goodExample} />
            </div>
            <pre className="bg-gray-50 border-2 border-black p-4 font-mono text-sm overflow-x-auto">
              {goodExample}
            </pre>
          </div>
        </div>
        
        {/* Explanation */}
        <div className="mt-6 p-4 bg-gray-50 border-2 border-black">
          <p>{explanation}</p>
        </div>
      </div>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <button
      onClick={handleCopy}
      className="px-3 py-1 border-2 border-black bg-white font-mono text-xs hover:bg-gray-50"
    >
      {copied ? 'COPIED!' : 'COPY'}
    </button>
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
    <Card className="border-2 border-black">
      <CardContent className="p-6">
        <h4 className="font-semibold text-lg mb-4">{question}</h4>
        <div className="space-y-3">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleSelect(index)}
              disabled={showResult}
              className={`w-full text-left p-4 border-2 transition-none ${
                showResult && index === correctAnswer
                  ? 'border-green-600 bg-green-50'
                  : showResult && index === selected && index !== correctAnswer
                  ? 'border-red-600 bg-red-50'
                  : 'border-black hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 border-2 border-current flex items-center justify-center text-sm font-bold">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="text-base">{option}</span>
              </div>
            </button>
          ))}
        </div>
        {showResult && explanation && (
          <Alert className="mt-4 border-2 border-black bg-gray-50">
            <AiIcon name="info" size={20} />
            <AlertDescription>{explanation}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

export default function KnowledgeBase() {
  // Navigation State
  const [activeCategory, setActiveCategory] = useState<string>('kirish');
  const [activeSection, setActiveSection] = useState<string>('nima-uchun-muhim');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['kirish']));
  const [isLoading, setIsLoading] = useState(false);
  
  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load saved progress on mount
  useEffect(() => {
    const progress = loadProgress();
    if (progress.lastVisited) {
      const [categoryId, sectionId] = progress.lastVisited.split('/');
      if (categoryId && sectionId) {
        setActiveCategory(categoryId);
        setActiveSection(sectionId);
        setExpandedCategories(new Set([categoryId]));
      }
    }
  }, []);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyPress(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft' && hasPrevious()) {
        navigateToPrevious();
      } else if (e.key === 'ArrowRight' && hasNext()) {
        navigateToNext();
      } else if (e.key === '/' && e.target !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'Escape') {
        setSidebarOpen(false);
      }
    }
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [activeCategory, activeSection]);

  // Navigation Functions
  function toggleCategory(categoryId: string) {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  }

  function navigateToSection(categoryId: string, sectionId: string) {
    setIsLoading(true);
    setActiveCategory(categoryId);
    setActiveSection(sectionId);
    setSidebarOpen(false);
    
    const sectionKey = `${categoryId}/${sectionId}`;
    saveProgress(sectionKey);
    
    window.scrollTo(0, 0);
    
    setTimeout(() => setIsLoading(false), 300);
  }

  function getCurrentCategory() {
    return knowledgeBaseStructure.find(c => c.id === activeCategory);
  }

  function getCurrentSection() {
    const category = getCurrentCategory();
    return category?.sections.find(s => s.id === activeSection);
  }

  function getAdjacentSections() {
    const allSections: { categoryId: string; sectionId: string }[] = [];
    knowledgeBaseStructure.forEach(category => {
      category.sections.forEach(section => {
        allSections.push({
          categoryId: category.id,
          sectionId: section.id
        });
      });
    });
    
    const currentIndex = allSections.findIndex(
      s => s.categoryId === activeCategory && s.sectionId === activeSection
    );
    
    return {
      previous: allSections[currentIndex - 1],
      next: allSections[currentIndex + 1]
    };
  }

  function navigateToPrevious() {
    const { previous } = getAdjacentSections();
    if (previous) {
      navigateToSection(previous.categoryId, previous.sectionId);
    }
  }

  function navigateToNext() {
    const { next } = getAdjacentSections();
    if (next) {
      navigateToSection(next.categoryId, next.sectionId);
    }
  }

  function hasPrevious() {
    return !!getAdjacentSections().previous;
  }

  function hasNext() {
    return !!getAdjacentSections().next;
  }

  // Progress Functions
  function saveProgress(sectionKey: string) {
    const progress = loadProgress();
    progress.completedSections.add(sectionKey);
    progress.lastVisited = sectionKey;
    
    localStorage.setItem(STORAGE_KEY.PROGRESS, JSON.stringify({
      completedSections: Array.from(progress.completedSections),
      lastVisited: progress.lastVisited,
      sectionScores: progress.sectionScores,
      timeSpent: progress.timeSpent
    }));
  }

  function loadProgress(): UserProgress {
    try {
      const saved = localStorage.getItem(STORAGE_KEY.PROGRESS);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          completedSections: new Set(parsed.completedSections),
          lastVisited: parsed.lastVisited,
          sectionScores: parsed.sectionScores || {},
          timeSpent: parsed.timeSpent || {},
          bookmarks: parsed.bookmarks || []
        };
      }
    } catch (e) {
      console.error('Error loading progress:', e);
    }
    
    return {
      completedSections: new Set(),
      lastVisited: '',
      sectionScores: {},
      timeSpent: {},
      bookmarks: []
    };
  }

  function isSectionCompleted(categoryId: string, sectionId: string) {
    const progress = loadProgress();
    return progress.completedSections.has(`${categoryId}/${sectionId}`);
  }

  function calculateOverallProgress() {
    const totalSections = knowledgeBaseStructure.reduce(
      (sum, cat) => sum + cat.sections.length, 0
    );
    const completedCount = loadProgress().completedSections.size;
    return Math.round((completedCount / totalSections) * 100);
  }

  // Search Functions
  function searchContent(query: string) {
    if (!query.trim()) return [];
    
    const results: any[] = [];
    const lowerQuery = query.toLowerCase();
    
    knowledgeBaseStructure.forEach(category => {
      category.sections.forEach(section => {
        if (section.title.toLowerCase().includes(lowerQuery)) {
          results.push({
            categoryId: category.id,
            sectionId: section.id,
            categoryTitle: category.title,
            sectionTitle: section.title,
            matchType: 'title'
          });
        }
      });
    });
    
    return results;
  }

  const searchResults = searchContent(searchQuery);

  // Content Renderer
  function renderCurrentContent() {
    const categoryId = activeCategory;
    const sectionId = activeSection;
    
    // Sample content mapping - will be expanded with content from onboarding.tsx
    if (categoryId === 'kirish' && sectionId === 'nima-uchun-muhim') {
      return (
        <div className="space-y-6">
          <div className="prose prose-lg max-w-none">
            <p className="text-lg leading-relaxed">
              Hozirgi kunda sun'iy intellekt (AI) hayotimizning ajralmas qismiga aylanmoqda. 
              ChatGPT, Claude, Gemini kabi AI assistentlar kundalik ishlarimizni yengillashtirmoqda.
            </p>
            <p className="text-lg leading-relaxed">
              Lekin ko'pchilik foydalanuvchilar AI'ning to'liq potensialidan foydalana olmayapti. 
              Sabab oddiy - ular AI bilan qanday muloqot qilishni bilishmaydi.
            </p>
          </div>
          
          <ExpandableCard
            term="PROMPTING"
            definition="AI bilan samarali muloqot qilish san'ati. To'g'ri savol berish orqali to'g'ri javob olish."
            icon={<AiIcon name="brain" size={24} />}
            examples={[
              "Yomon: 'Menga maqola yoz'",
              "Yaxshi: 'O'zbek tili tarixiga oid 500 so'zlik ilmiy maqola yoz. Uslub: akademik, auditoriya: universitet talabalari'"
            ]}
          />
          
          <Card className="border-2 border-black">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4">NIMA UCHUN BU MUHIM?</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <AiIcon name="checked" size={20} className="mt-1 flex-shrink-0" />
                  <span>Vaqtingizni tejaysiz - 10 soatlik ishni 1 soatda bajaring</span>
                </li>
                <li className="flex items-start gap-2">
                  <AiIcon name="checked" size={20} className="mt-1 flex-shrink-0" />
                  <span>Sifatni oshirasiz - Professional natijalar oling</span>
                </li>
                <li className="flex items-start gap-2">
                  <AiIcon name="checked" size={20} className="mt-1 flex-shrink-0" />
                  <span>Kreativlikni rivojlantirasiz - Yangi g'oyalar toping</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          
          <CodeExample
            title="YAXSHI PROMPT MISOLI"
            badExample="Menga biznes-plan yoz"
            goodExample="Men yangi online ta'lim platformasi ochmoqchiman. 
Target auditoriya: 18-25 yoshli talabalar
Asosiy xizmat: Professional ko'nikmalar o'rgatish
Biznes modeli: Oylik obuna
Iltimos, quyidagi bo'limlarni o'z ichiga olgan biznes-plan tayyorla:
1. Bozor tahlili
2. Raqobatchilar tahlili
3. Marketing strategiyasi
4. Moliyaviy prognoz (1 yillik)
5. Xatarlar va ularni kamaytirish yo'llari"
            explanation="Yaxshi prompt aniq kontekst, maqsad va kutilgan natijani o'z ichiga oladi. Bu AI'ga sizning ehtiyojingizni to'liq tushunishga yordam beradi."
          />
        </div>
      );
    }
    
    if (categoryId === 'asoslar' && sectionId === 'ai-qanday-ishlaydi') {
      return (
        <div className="space-y-6">
          <div className="prose prose-lg max-w-none">
            <p className="text-lg leading-relaxed">
              Sun'iy intellekt qanday ishlaydi? Bu savolga javob berish uchun avval 
              AI'ning asosiy tushunchalarini tushunishimiz kerak.
            </p>
          </div>
          
          <ExpandableCard
            term="NEYRON TARMOQLAR"
            definition="Inson miyasining ishlash prinsipiga asoslangan kompyuter tizimlari. Millionlab 'neyron'lar ma'lumotni qayta ishlaydi."
            icon={<AiIcon name="network" size={24} />}
            examples={[
              "Input (kirish) → Processing (qayta ishlash) → Output (natija)",
              "Misol: Rasm → Neyron tarmoq → 'Bu mushuk rasmi'"
            ]}
          />
          
          <ExpandableCard
            term="MACHINE LEARNING"
            definition="Kompyuterlarning ma'lumotlardan o'rganish qobiliyati. Qancha ko'p ma'lumot, shuncha yaxshi natija."
            icon={<AiIcon name="brain" size={24} />}
            examples={[
              "Supervised Learning - Nazorat ostida o'rganish",
              "Unsupervised Learning - Mustaqil o'rganish",
              "Reinforcement Learning - Mukofotlash orqali o'rganish"
            ]}
          />
        </div>
      );
    }
    
    // Default content for sections not yet implemented
    return (
      <div className="prose prose-lg max-w-none">
        <Alert className="border-2 border-black">
          <AiIcon name="warning" size={20} />
          <AlertDescription>
            Bu bo'lim hozircha ishlab chiqilmoqda. Tez orada to'liq kontent qo'shiladi.
          </AlertDescription>
        </Alert>
        <p className="text-lg mt-4">
          Hozircha boshqa bo'limlarni ko'rib chiqishingiz mumkin. Har bir bo'lim AI va prompting 
          bo'yicha foydali ma'lumotlar bilan to'ldiriladi.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <AppHeader />
      
      <div className="flex h-[calc(100vh-64px)]">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-[300px] border-r-2 border-black bg-white overflow-y-auto">
          {/* Progress Bar */}
          <div className="p-4 border-b-2 border-black">
            <div className="mb-2 flex justify-between text-sm">
              <span className="font-bold">UMUMIY PROGRESS</span>
              <span className="font-mono">{calculateOverallProgress()}%</span>
            </div>
            <div className="h-2 bg-gray-200 border border-black">
              <div 
                className="h-full bg-black transition-all duration-300"
                style={{ width: `${calculateOverallProgress()}%` }}
              />
            </div>
          </div>

          {/* Search Bar */}
          <div className="p-4 border-b-2 border-black">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="QIDIRISH..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border-2 border-black font-mono text-sm focus:outline-none"
              aria-label="Qidiruv"
            />
          </div>
          
          {/* Search Results */}
          {searchQuery && (
            <div className="p-4 border-b-2 border-black bg-gray-50">
              <p className="font-bold mb-2">QIDIRUV NATIJALARI:</p>
              {searchResults.length > 0 ? (
                <div className="space-y-2">
                  {searchResults.map((result, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        navigateToSection(result.categoryId, result.sectionId);
                        setSearchQuery('');
                      }}
                      className="w-full text-left p-2 hover:bg-white border border-gray-300"
                    >
                      <div className="font-bold">{result.sectionTitle}</div>
                      <div className="text-xs text-gray-600">{result.categoryTitle}</div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">Hech narsa topilmadi</p>
              )}
            </div>
          )}
          
          {/* Navigation Tree */}
          <nav className="p-4" role="navigation" aria-label="Asosiy navigatsiya">
            {knowledgeBaseStructure.map((category) => (
              <div key={category.id} className="mb-4">
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full flex items-center justify-between p-2 hover:bg-gray-100"
                >
                  <div className="flex items-center gap-2">
                    <AiIcon name={category.icon} size={20} />
                    <span className="font-bold text-sm">{category.title}</span>
                  </div>
                  <AiIcon 
                    name={expandedCategories.has(category.id) ? 'chevron-down' : 'chevron-right'} 
                    size={16} 
                  />
                </button>
                
                {/* Sections */}
                {expandedCategories.has(category.id) && (
                  <div className="ml-6 mt-2">
                    {category.sections.map((section) => (
                      <button
                        key={section.id}
                        onClick={() => navigateToSection(category.id, section.id)}
                        className={`w-full text-left p-2 text-sm hover:bg-gray-100 flex items-center justify-between ${
                          activeCategory === category.id && activeSection === section.id
                            ? 'bg-black text-white font-bold'
                            : ''
                        }`}
                      >
                        <span>{section.title}</span>
                        {isSectionCompleted(category.id, section.id) && (
                          <AiIcon name="checked" size={16} />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </aside>
        
        {/* Mobile Menu Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden fixed top-20 left-4 z-50 p-2 border-2 border-black bg-white"
        >
          <AiIcon name="menu" size={24} />
        </button>
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-6">
            {/* Breadcrumb */}
            <div className="mb-6 text-sm font-mono">
              <span className="text-gray-600">HOME</span>
              <span className="mx-2">/</span>
              <span className="text-gray-600">{getCurrentCategory()?.title}</span>
              <span className="mx-2">/</span>
              <span className="font-bold">{getCurrentSection()?.title}</span>
            </div>
            
            {/* Content Header */}
            <header className="mb-8 pb-6 border-b-2 border-black">
              <h1 className="text-3xl font-black mb-2 uppercase">
                {getCurrentSection()?.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>O'QISH VAQTI: {getCurrentSection()?.readTime || 5} DAQIQA</span>
                <span>•</span>
                <span className="uppercase">{getCurrentSection()?.difficulty || 'BEGINNER'}</span>
              </div>
            </header>
            
            {/* Dynamic Content */}
            <article className="prose prose-lg max-w-none">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-black border-t-transparent animate-spin mx-auto mb-4" />
                    <p className="font-bold">YUKLANMOQDA...</p>
                  </div>
                </div>
              ) : (
                renderCurrentContent()
              )}
            </article>
            
            {/* Navigation Footer */}
            <div className="mt-12 pt-6 border-t-2 border-black flex justify-between">
              <button
                onClick={navigateToPrevious}
                disabled={!hasPrevious()}
                className="flex items-center gap-2 px-4 py-2 border-2 border-black font-bold disabled:opacity-50"
                aria-label="Oldingi bo'lim"
              >
                <AiIcon name="arrow-left" size={16} />
                OLDINGI
              </button>
              
              <button
                onClick={navigateToNext}
                disabled={!hasNext()}
                className="flex items-center gap-2 px-4 py-2 border-2 border-black bg-black text-white font-bold disabled:opacity-50"
                aria-label="Keyingi bo'lim"
              >
                KEYINGI
                <AiIcon name="arrow-right" size={16} />
              </button>
            </div>
          </div>
        </main>
      </div>
      
      {/* Mobile Sidebar Drawer */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setSidebarOpen(false)}
          />
          
          {/* Drawer */}
          <div className="absolute left-0 top-0 h-full w-[280px] bg-white border-r-2 border-black overflow-y-auto">
            {/* Close button */}
            <div className="p-4 border-b-2 border-black flex justify-between items-center">
              <span className="font-black">MUNDARIJA</span>
              <button onClick={() => setSidebarOpen(false)}>
                <AiIcon name="close" size={24} />
              </button>
            </div>
            
            {/* Progress Bar */}
            <div className="p-4 border-b-2 border-black">
              <div className="mb-2 flex justify-between text-sm">
                <span className="font-bold">UMUMIY PROGRESS</span>
                <span className="font-mono">{calculateOverallProgress()}%</span>
              </div>
              <div className="h-2 bg-gray-200 border border-black">
                <div 
                  className="h-full bg-black transition-all duration-300"
                  style={{ width: `${calculateOverallProgress()}%` }}
                />
              </div>
            </div>

            {/* Search Bar */}
            <div className="p-4 border-b-2 border-black">
              <input
                type="text"
                placeholder="QIDIRISH..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border-2 border-black font-mono text-sm focus:outline-none"
              />
            </div>
            
            {/* Navigation - Same as desktop */}
            <nav className="p-4">
              {knowledgeBaseStructure.map((category) => (
                <div key={category.id} className="mb-4">
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="w-full flex items-center justify-between p-2 hover:bg-gray-100"
                  >
                    <div className="flex items-center gap-2">
                      <AiIcon name={category.icon} size={20} />
                      <span className="font-bold text-sm">{category.title}</span>
                    </div>
                    <AiIcon 
                      name={expandedCategories.has(category.id) ? 'chevron-down' : 'chevron-right'} 
                      size={16} 
                    />
                  </button>
                  
                  {expandedCategories.has(category.id) && (
                    <div className="ml-6 mt-2">
                      {category.sections.map((section) => (
                        <button
                          key={section.id}
                          onClick={() => navigateToSection(category.id, section.id)}
                          className={`w-full text-left p-2 text-sm hover:bg-gray-100 flex items-center justify-between ${
                            activeCategory === category.id && activeSection === section.id
                              ? 'bg-black text-white font-bold'
                              : ''
                          }`}
                        >
                          <span>{section.title}</span>
                          {isSectionCompleted(category.id, section.id) && (
                            <AiIcon name="checked" size={16} />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </div>
      )}
      
      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-black p-4">
        <div className="flex justify-between items-center">
          <button
            onClick={navigateToPrevious}
            disabled={!hasPrevious()}
            className="p-2"
          >
            <AiIcon name="arrow-left" size={24} />
          </button>
          
          <button
            onClick={() => setSidebarOpen(true)}
            className="px-4 py-2 border-2 border-black font-bold"
          >
            MUNDARIJA
          </button>
          
          <button
            onClick={navigateToNext}
            disabled={!hasNext()}
            className="p-2"
          >
            <AiIcon name="arrow-right" size={24} />
          </button>
        </div>
      </div>
      
      <AppFooter />
    </div>
  );
}