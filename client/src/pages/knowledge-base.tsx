import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import AppHeader from "@/components/app-header";
import AppFooter from "@/components/app-footer";
import { AiIcon } from "@/components/ai-icon";

// Component definitions
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
          <pre className="bg-gray-50 border-2 border-black p-4 font-mono text-sm overflow-x-auto whitespace-pre-wrap">
            {badExample}
          </pre>
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
          <pre className="bg-gray-50 border-2 border-black p-4 font-mono text-sm overflow-x-auto whitespace-pre-wrap">
            {goodExample}
          </pre>
        </div>
        
        {/* Explanation */}
        <div className="mt-6 p-4 bg-gray-50 border-2 border-black">
          <p>{explanation}</p>
        </div>
      </div>
    </div>
  );
}

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
              Sun'iy intellekt — bu kompyuterlarni inson kabi "o'ylash"ga o'rgatish san'ati. 
              Lekin bu "o'ylash" aslida nima?
            </p>
          </div>

          <Card className="border-2 border-black">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4">AI QANDAY "O'YLAYDI":</h3>
              <ol className="space-y-3">
                <li className="flex gap-3">
                  <span className="font-bold">1.</span>
                  <div>
                    <strong>Pattern tanish:</strong> Millionlab misollardan qonuniyatlarni topadi
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold">2.</span>
                  <div>
                    <strong>Bashorat qilish:</strong> O'rgangan pattern'lar asosida keyingi so'zni taxmin qiladi
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold">3.</span>
                  <div>
                    <strong>Kontekstni tushunish:</strong> Sizning savolingiz qaysi mavzuga tegishli ekanini aniqlaydi
                  </div>
                </li>
              </ol>
            </CardContent>
          </Card>
          
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

          <Alert className="border-2 border-black">
            <AiIcon name="info" size={20} />
            <AlertDescription>
              <strong>Muhim:</strong> AI aslida "tushunmaydi" — u statistik model. 
              Lekin bu model shunchalik murakkabki, u go'yo tushungandek natija beradi.
            </AlertDescription>
          </Alert>
        </div>
      );
    }
    
    if (categoryId === 'kirish' && sectionId === 'prompting-nima') {
      return (
        <div className="space-y-6">
          <div className="prose prose-lg max-w-none">
            <p className="text-lg leading-relaxed">
              Prompting — bu AI bilan samarali muloqot qilish san'ati. To'g'ri prompt yozish orqali 
              siz AI'dan maksimal foyda olishingiz mumkin.
            </p>
          </div>

          <ExpandableCard
            term="PROMPT"
            definition="AI'ga beriladigan ko'rsatma yoki savol. Qanchalik aniq va to'liq bo'lsa, shunchalik yaxshi natija olasiz."
            icon={<AiIcon name="target" size={24} />}
            examples={[
              "Oddiy prompt: 'Menga Python haqida aytib ber'",
              "Yaxshi prompt: 'Python dasturlash tilining 5 ta asosiy afzalligini sanab ber. Har biri uchun qisqa misol keltir.'"
            ]}
          />

          <Card className="border-2 border-black">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4">YAXSHI PROMPT ELEMENTLARI:</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <AiIcon name="target" size={20} className="mt-1 flex-shrink-0" />
                  <div>
                    <strong>Aniq maqsad:</strong> Nimani xohlayotganingizni aniq ayting
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <AiIcon name="context" size={20} className="mt-1 flex-shrink-0" />
                  <div>
                    <strong>Kontekst:</strong> Vaziyat haqida ma'lumot bering
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <AiIcon name="format" size={20} className="mt-1 flex-shrink-0" />
                  <div>
                    <strong>Format:</strong> Qanday ko'rinishda javob kutayotganingizni ayting
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <AiIcon name="layers" size={20} className="mt-1 flex-shrink-0" />
                  <div>
                    <strong>Misollar:</strong> Agar kerak bo'lsa, namuna ko'rsating
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <CodeExample
            title="PROMPT TAQQOSLASH"
            badExample="Menga marketing haqida yoz"
            goodExample="Men yangi mobil ilova uchun marketing strategiya tuzmoqchiman.

Ilova haqida:
- Nom: FitTracker
- Maqsad: Sog'lom turmush tarzi uchun kunlik rejalar
- Target auditoriya: 25-40 yoshli professional ayollar
- Narx: Oyiga $9.99

Iltimos, quyidagi marketing strategiya tayyorla:
1. 3 ta asosiy marketing kanal
2. Har bir kanal uchun konkret taktikalar
3. Birinchi oy uchun content kalendar
4. Taxminiy byudjet taqsimoti

Format: Bullet point ro'yxat shaklida"
            explanation="Yaxshi promptda barcha kerakli ma'lumotlar, aniq ko'rsatmalar va kutilgan format ko'rsatilgan."
          />

          <Alert className="border-2 border-black">
            <AiIcon name="lightbulb" size={20} />
            <AlertDescription>
              <strong>Maslahat:</strong> Prompt yozishda o'zingizni AI o'rniga qo'ying. 
              Sizga shunday topshiriq berilsa, nimalar kerak bo'lardi?
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    if (categoryId === 'kirish' && sectionId === 'prompt-elementlari') {
      return (
        <div className="space-y-6">
          <div className="prose prose-lg max-w-none">
            <p className="text-lg leading-relaxed">
              Professional prompt 5 ta asosiy elementdan tashkil topadi. Har bir element 
              o'z vazifasiga ega va natija sifatiga ta'sir qiladi.
            </p>
          </div>

          <div className="grid gap-4">
            <ExpandableCard
              term="1. ROL (ROLE)"
              definition="AI'ga qanday mutaxassis sifatida javob berishini ko'rsating."
              icon={<AiIcon name="brain" size={24} />}
              examples={[
                "Sen tajribali marketing mutaxassisisan...",
                "Professional dasturchi sifatida...",
                "10 yillik tajribaga ega moliya maslahatchisi rolida..."
              ]}
            />

            <ExpandableCard
              term="2. KONTEKST (CONTEXT)"
              definition="Vaziyat haqida to'liq ma'lumot bering."
              icon={<AiIcon name="context" size={24} />}
              examples={[
                "Bizning kompaniya B2B SaaS mahsulot ishlab chiqaradi...",
                "Men universitetda o'qiyman va diplom ishi yozishim kerak...",
                "Kichik biznes egasiman, 5 ta xodim bor..."
              ]}
            />

            <ExpandableCard
              term="3. VAZIFA (TASK)"
              definition="Aniq nima qilish kerakligini ayting."
              icon={<AiIcon name="target" size={24} />}
              examples={[
                "3 oylik marketing kampaniya rejasini tuzing",
                "Ushbu kodni optimize qiling va kommentlar qo'shing",
                "SWOT tahlil o'tkazing va tavsiyalar bering"
              ]}
            />

            <ExpandableCard
              term="4. FORMAT"
              definition="Javob qanday ko'rinishda bo'lishini belgilang."
              icon={<AiIcon name="format" size={24} />}
              examples={[
                "Markdown table shaklida",
                "5 ta bullet point",
                "Step-by-step qo'llanma"
              ]}
            />

            <ExpandableCard
              term="5. TON (TONE)"
              definition="Qanday uslubda yozilishini ko'rsating."
              icon={<AiIcon name="message" size={24} />}
              examples={[
                "Professional va rasmiy",
                "Do'stona va tushunarli",
                "Qisqa va lo'nda"
              ]}
            />
          </div>

          <Card className="border-2 border-black bg-gray-50">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4">TO'LIQ PROMPT NAMUNASI:</h3>
              <pre className="bg-white border-2 border-black p-4 overflow-x-auto text-sm">
{`ROL: Sen tajribali content marketing mutaxassisisan.

KONTEKST: Men yangi fitness blog ochyapman. Target auditoriya - 
25-40 yoshli ayollar. Asosiy mavzu - uyda mashq qilish.

VAZIFA: Birinchi oy uchun content plan tuzing.

FORMAT: 
- 4 haftalik jadval
- Har hafta uchun 3 ta post mavzusi
- Har bir post uchun asosiy kalit so'zlar

TON: Professional lekin do'stona`}</pre>
            </CardContent>
          </Card>
        </div>
      );
    }

    if (categoryId === 'kirish' && sectionId === 'ai-inqilobi') {
      return (
        <div className="space-y-6">
          <div className="prose prose-lg max-w-none">
            <p className="text-lg leading-relaxed">
              AI inqilobi global miqyosda sodir bo'lmoqda. O'zbekiston ham bu jarayondan 
              chetda qolmasligi, balki faol ishtirok etishi muhim.
            </p>
          </div>

          <Card className="border-2 border-black">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4">AI INQILOBINING 3 TO'LQINI:</h3>
              <div className="space-y-4">
                <div className="border-l-4 border-black pl-4">
                  <h4 className="font-bold">1-to'lqin: Tor AI (2010-2020)</h4>
                  <p className="text-muted-foreground">Bitta vazifaga ixtisoslashgan AI: rasm tanish, tarjima, tavsiyalar</p>
                </div>
                <div className="border-l-4 border-black pl-4">
                  <h4 className="font-bold">2-to'lqin: Generativ AI (2020-2025)</h4>
                  <p className="text-muted-foreground">Yangi kontent yaratadigan AI: ChatGPT, DALL-E, Midjourney</p>
                </div>
                <div className="border-l-4 border-gray-400 pl-4">
                  <h4 className="font-bold text-gray-600">3-to'lqin: AGI (2025+)</h4>
                  <p className="text-muted-foreground">Inson darajasidagi umumiy sun'iy intellekt</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-2 border-black">
              <CardContent className="p-6">
                <h4 className="font-bold mb-4 flex items-center gap-2">
                  <AiIcon name="world" size={20} />
                  GLOBAL IMKONIYATLAR
                </h4>
                <ul className="space-y-2 text-sm">
                  <li>• Remote ish imkoniyatlari</li>
                  <li>• Global bozorga chiqish</li>
                  <li>• Xalqaro hamkorlik</li>
                  <li>• Bilim almashish</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-black">
              <CardContent className="p-6">
                <h4 className="font-bold mb-4 flex items-center gap-2">
                  <AiIcon name="flag" size={20} />
                  O'ZBEKISTON UCHUN
                </h4>
                <ul className="space-y-2 text-sm">
                  <li>• IT eksporti o'sishi</li>
                  <li>• Ta'lim tizimi yangilanishi</li>
                  <li>• Startap ekotizimi</li>
                  <li>• Raqamli transformatsiya</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <Alert className="border-2 border-black">
            <AiIcon name="lightbulb" size={20} />
            <AlertDescription>
              <strong>Muhim:</strong> AI inqilobida g'olib bo'lish uchun texnologiyani 
              tushunish yetarli emas — uni to'g'ri qo'llashni bilish kerak. Aynan shuning 
              uchun prompting ko'nikmalari muhim.
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    if (categoryId === 'kirish' && sectionId === 'umumiy-maslahatlar') {
      return (
        <div className="space-y-6">
          <div className="prose prose-lg max-w-none">
            <p className="text-lg leading-relaxed">
              AI bilan ishlashda muvaffaqiyatli bo'lish uchun ushbu asosiy tamoyillarga 
              amal qiling.
            </p>
          </div>

          <Card className="border-2 border-black bg-black text-white">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4">7 OLTIN QOIDA</h3>
              <div className="space-y-3">
                {[
                  "Aniq va konkret bo'ling",
                  "Kontekst bering",
                  "Misollar keltiring",
                  "Iterativ yondashing",
                  "Faktlarni tekshiring",
                  "Etik chegaralarni saqlang",
                  "Doimiy o'rganing"
                ].map((rule, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="font-bold text-2xl">{idx + 1}</span>
                    <span>{rule}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            <Card className="border-2 border-black">
              <CardContent className="p-6">
                <h4 className="font-bold mb-3">❌ QILMANG:</h4>
                <ul className="space-y-2 text-sm">
                  <li>• Noaniq so'rovlar bermang</li>
                  <li>• AI'ga ko'r-ko'rona ishonmang</li>
                  <li>• Shaxsiy ma'lumotlarni bermang</li>
                  <li>• Noqonuniy maqsadlarda foydalanmang</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-black">
              <CardContent className="p-6">
                <h4 className="font-bold mb-3">✅ QILING:</h4>
                <ul className="space-y-2 text-sm">
                  <li>• Aniq maqsad belgilang</li>
                  <li>• Natijalarni tekshiring</li>
                  <li>• Takrorlash orqali yaxshilang</li>
                  <li>• Yangi texnikalarni sinang</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <CodeExample
            title="ITERATIV YONDASHUV MISOLI"
            badExample="Menga maqola yoz"
            goodExample="1-urinish: Menga texnologiya haqida maqola yoz
2-urinish: Sun'iy intellekt haqida 500 so'zlik maqola yoz
3-urinish: ChatGPT'ning ta'limdagi roli haqida 500 so'zlik maqola yoz. Auditoriya: o'qituvchilar
4-urinish: [Oldingi natijaga asoslanib] Iltimos, ko'proq amaliy misollar qo'sh"
            explanation="Har bir iteratsiyada promptingizni aniqlashtirib boring. Bu sizga kerakli natijaga tezroq erishishga yordam beradi."
          />
        </div>
      );
    }
    
    // SOZLAMALAR category content
    if (categoryId === 'sozlamalar' && sectionId === 'harorat-parametri') {
      return (
        <div className="space-y-6">
          <div className="prose prose-lg max-w-none">
            <p className="text-lg leading-relaxed">
              Temperature (harorat) — AI javoblarining kreativlik darajasini boshqaruvchi 
              eng muhim parametr. 0 dan 2 gacha qiymat oladi.
            </p>
          </div>

          <Card className="border-2 border-black">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4">TEMPERATURE SHKALASI</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-24 text-center">
                    <div className="text-2xl font-bold">0.0</div>
                    <div className="text-xs text-muted-foreground">Deterministik</div>
                  </div>
                  <div className="flex-1 bg-gradient-to-r from-blue-100 via-yellow-100 to-red-100 h-8 border-2 border-black"></div>
                  <div className="w-24 text-center">
                    <div className="text-2xl font-bold">2.0</div>
                    <div className="text-xs text-muted-foreground">Xaotik</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-4">
            <Card className="border-2 border-black">
              <CardContent className="p-4">
                <h4 className="font-bold mb-2">PAST (0.0-0.5)</h4>
                <p className="text-sm text-muted-foreground mb-3">Aniq, bashorat qilsa bo'ladigan</p>
                <ul className="text-xs space-y-1">
                  <li>• Faktlar va ma'lumotlar</li>
                  <li>• Kod yozish</li>
                  <li>• Hisob-kitoblar</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-black">
              <CardContent className="p-4">
                <h4 className="font-bold mb-2">O'RTA (0.5-1.0)</h4>
                <p className="text-sm text-muted-foreground mb-3">Muvozanatli javoblar</p>
                <ul className="text-xs space-y-1">
                  <li>• Umumiy foydalanish</li>
                  <li>• Maqola yozish</li>
                  <li>• Suhbat</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-black">
              <CardContent className="p-4">
                <h4 className="font-bold mb-2">YUQORI (1.0-2.0)</h4>
                <p className="text-sm text-muted-foreground mb-3">Ijodkor, kutilmagan</p>
                <ul className="text-xs space-y-1">
                  <li>• Brainstorming</li>
                  <li>• She'riyat</li>
                  <li>• Kreativ yozish</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <CodeExample
            title="TEMPERATURE MISOLLARI"
            badExample="Temperature = 2.0
Prompt: O'zbekiston poytaxti qaysi?
Javob: O'zbekiston poytaxti... balki Samarqand? Yoki Buxoro? Qadimda turli shaharlar..."
            goodExample="Temperature = 0.2
Prompt: O'zbekiston poytaxti qaysi?
Javob: O'zbekiston poytaxti - Toshkent shahri."
            explanation="Faktik ma'lumotlar uchun past temperature, ijodiy vazifalar uchun yuqori temperature ishlating."
          />
        </div>
      );
    }

    if (categoryId === 'sozlamalar' && sectionId === 'top-p-va-top-k') {
      return (
        <div className="space-y-6">
          <div className="prose prose-lg max-w-none">
            <p className="text-lg leading-relaxed">
              Top-P va Top-K parametrlari AI'ning so'z tanlash jarayonini boshqaradi. 
              Ular temperature bilan birgalikda ishlab, javob sifatini nazorat qiladi.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-2 border-black">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-4">TOP-P (Nucleus Sampling)</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Ehtimollik yig'indisi P ga teng bo'lgan so'zlarni tanlaydi
                </p>
                <div className="space-y-3">
                  <div className="bg-gray-100 p-3 border border-gray-300">
                    <div className="font-mono text-sm">top_p = 0.1</div>
                    <div className="text-xs">Faqat eng ehtimollik yuqori so'zlar</div>
                  </div>
                  <div className="bg-gray-100 p-3 border border-gray-300">
                    <div className="font-mono text-sm">top_p = 0.9</div>
                    <div className="text-xs">Ko'proq so'z variantlari</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-black">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-4">TOP-K</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Faqat eng yuqori K ta so'zdan tanlaydi
                </p>
                <div className="space-y-3">
                  <div className="bg-gray-100 p-3 border border-gray-300">
                    <div className="font-mono text-sm">top_k = 5</div>
                    <div className="text-xs">Faqat 5 ta eng ehtimol so'z</div>
                  </div>
                  <div className="bg-gray-100 p-3 border border-gray-300">
                    <div className="font-mono text-sm">top_k = 50</div>
                    <div className="text-xs">50 ta so'z variantidan tanlash</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Alert className="border-2 border-black">
            <AiIcon name="info" size={20} />
            <AlertDescription>
              <strong>Qachon ishlatish:</strong> Ko'pchilik holatlarda default qiymatlar 
              yetarli. Faqat maxsus ehtiyoj bo'lganda o'zgartiring.
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    if (categoryId === 'sozlamalar' && sectionId === 'max-tokens') {
      return (
        <div className="space-y-6">
          <div className="prose prose-lg max-w-none">
            <p className="text-lg leading-relaxed">
              Max tokens parametri AI javobining maksimal uzunligini belgilaydi. 
              Bu nafaqat narxni, balki javob to'liqligini ham nazorat qiladi.
            </p>
          </div>

          <Card className="border-2 border-black">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4">TOKEN HISOBI</h3>
              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-3xl font-bold">1 token</div>
                  <div className="text-sm text-muted-foreground">≈ 0.75 so'z (inglizcha)</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">1 token</div>
                  <div className="text-sm text-muted-foreground">≈ 0.5 so'z (o'zbekcha)</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">1000 token</div>
                  <div className="text-sm text-muted-foreground">≈ 2 sahifa matn</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            <Card className="border-2 border-black">
              <CardContent className="p-4">
                <h4 className="font-bold mb-2">QISQA JAVOBLAR (50-150 token)</h4>
                <ul className="text-sm space-y-1">
                  <li>• Ha/yo'q savollari</li>
                  <li>• Qisqa ta'riflar</li>
                  <li>• Tezkor javoblar</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-black">
              <CardContent className="p-4">
                <h4 className="font-bold mb-2">O'RTA JAVOBLAR (500-1000 token)</h4>
                <ul className="text-sm space-y-1">
                  <li>• Email va xatlar</li>
                  <li>• Qisqa maqolalar</li>
                  <li>• Kod parchalari</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-black">
              <CardContent className="p-4">
                <h4 className="font-bold mb-2">UZUN JAVOBLAR (2000+ token)</h4>
                <ul className="text-sm space-y-1">
                  <li>• To'liq maqolalar</li>
                  <li>• Batafsil tahlillar</li>
                  <li>• Katta kod fayllari</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <Alert className="border-2 border-black bg-gray-50">
            <AiIcon name="dollar" size={20} />
            <AlertDescription>
              <strong>Narx optimallashtirish:</strong> Keragidan ortiq token sarflamang. 
              Agar 500 token yetarli bo'lsa, max_tokens=2000 qo'ymang.
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    // TEXNIKALAR category content
    if (categoryId === 'texnikalar' && sectionId === 'zero-shot') {
      return (
        <div className="space-y-6">
          <div className="prose prose-lg max-w-none">
            <p className="text-lg leading-relaxed">
              Zero-shot prompting — AI'ga hech qanday misol bermasdan to'g'ridan-to'g'ri 
              vazifani bajarish ko'rsatmasi. Eng oddiy, lekin kuchli texnika.
            </p>
          </div>

          <Card className="border-2 border-black">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4">ZERO-SHOT QACHON ISHLAYDI?</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <AiIcon name="checked" size={20} className="mt-1 flex-shrink-0" />
                  <span>Oddiy va aniq vazifalar uchun</span>
                </li>
                <li className="flex items-start gap-2">
                  <AiIcon name="checked" size={20} className="mt-1 flex-shrink-0" />
                  <span>AI allaqachon bilishi mumkin bo'lgan ma'lumotlar</span>
                </li>
                <li className="flex items-start gap-2">
                  <AiIcon name="checked" size={20} className="mt-1 flex-shrink-0" />
                  <span>Umumiy til vazifalar (tarjima, tushuntirish)</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <CodeExample
            title="ZERO-SHOT MISOLLARI"
            badExample="Quyidagi gapni tahlil qil: 'Bugun havo yaxshi'"
            goodExample="Quyidagi gapni grammatik jihatdan tahlil qiling: 'Bugun havo yaxshi'

Gap tarkibi:
- Gap turi (darak/so'roq/undov)
- Ega va kesim
- Ikkinchi darajali bo'laklar
- So'z turkumlari"
            explanation="Aniq ko'rsatmalar berish zero-shot texnikani samaraliroq qiladi."
          />

          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-2 border-green-600">
              <CardContent className="p-4">
                <h4 className="font-bold mb-2 text-green-700">✅ AFZALLIKLARI</h4>
                <ul className="text-sm space-y-1">
                  <li>• Tez va oson</li>
                  <li>• Misollar tayyorlash shart emas</li>
                  <li>• Kam token sarflaydi</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-red-600">
              <CardContent className="p-4">
                <h4 className="font-bold mb-2 text-red-700">❌ KAMCHILIKLARI</h4>
                <ul className="text-sm space-y-1">
                  <li>• Murakkab vazifalar uchun yaramaydi</li>
                  <li>• Format nazorati qiyin</li>
                  <li>• Natija sifati o'zgaruvchan</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }

    if (categoryId === 'texnikalar' && sectionId === 'few-shot') {
      return (
        <div className="space-y-6">
          <div className="prose prose-lg max-w-none">
            <p className="text-lg leading-relaxed">
              Few-shot prompting — AI'ga bir nechta misol ko'rsatib, keyin vazifani 
              bajarishni so'rash. Bu AI'ga formatni va kutilgan natijani tushunishga yordam beradi.
            </p>
          </div>

          <Card className="border-2 border-black">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4">NECHTA MISOL KERAK?</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold">1-2</div>
                  <div className="text-sm text-muted-foreground">Oddiy formatlar</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">3-5</div>
                  <div className="text-sm text-muted-foreground">O'rtacha murakkablik</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">5-10</div>
                  <div className="text-sm text-muted-foreground">Murakkab pattern'lar</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <CodeExample
            title="FEW-SHOT PROMPTING NAMUNASI"
            badExample="Bu gaplarni ijobiy yoki salbiy deb tasniflang:
'Mahsulot zo'r!'
'Xizmat yomon'"
            goodExample="Gaplarni his-tuyg'u bo'yicha tasniflang:

Gap: Bu kitob juda qiziqarli!
Tasnif: IJOBIY

Gap: Xizmat ko'rsatish darajasi past
Tasnif: SALBIY

Gap: Oddiy mahsulot, na yaxshi na yomon
Tasnif: NEYTRAL

Gap: Bugungi uchrashuvdan xursandman
Tasnif:"
            explanation="Misollar orqali AI format va tasnif mezonlarini aniq tushunadi."
          />

          <Alert className="border-2 border-black">
            <AiIcon name="lightbulb" size={20} />
            <AlertDescription>
              <strong>Pro maslahat:</strong> Misollaringiz turli xil va vakillik qiluvchi 
              bo'lsin. Faqat bir xil turdagi misollar bermang.
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    if (categoryId === 'texnikalar' && sectionId === 'chain-of-thought') {
      return (
        <div className="space-y-6">
          <div className="prose prose-lg max-w-none">
            <p className="text-lg leading-relaxed">
              Chain-of-Thought (CoT) — AI'ni qadam-ba-qadam fikrlashga undash texnikasi. 
              Murakkab masalalar va mantiqiy xulosalar uchun juda samarali.
            </p>
          </div>

          <Card className="border-2 border-black bg-black text-white">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4">SEHRLI IBORA:</h3>
              <p className="text-2xl font-mono">"Keling, qadam-ba-qadam fikrlaymiz"</p>
              <p className="text-sm mt-2">Let's think step by step</p>
            </CardContent>
          </Card>

          <CodeExample
            title="COT TAQQOSLASH"
            badExample="Agar Aziz 23 yoshda va u akasidan 5 yosh kichik bo'lsa, ularning yoshlari yig'indisi nechchi?

Javob: 51"
            goodExample="Agar Aziz 23 yoshda va u akasidan 5 yosh kichik bo'lsa, ularning yoshlari yig'indisi nechchi?

Keling, qadam-ba-qadam fikrlaymiz:
1. Aziz 23 yoshda
2. U akasidan 5 yosh kichik
3. Demak, akasi: 23 + 5 = 28 yoshda
4. Yoshlari yig'indisi: 23 + 28 = 51

Javob: 51 yosh"
            explanation="CoT texnikasi AI'ni o'z fikrlash jarayonini ko'rsatishga majbur qiladi, bu xatolar ehtimolini kamaytiradi."
          />

          <div className="grid gap-4">
            <Card className="border-2 border-black">
              <CardContent className="p-6">
                <h4 className="font-bold mb-3">COT QACHON FOYDALANISH:</h4>
                <ul className="space-y-2 text-sm">
                  <li>• Matematik masalalar</li>
                  <li>• Mantiqiy topshiriqlar</li>
                  <li>• Ko'p bosqichli vazifalar</li>
                  <li>• Murakkab tahlillar</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-black">
              <CardContent className="p-6">
                <h4 className="font-bold mb-3">COT VARIANTLARI:</h4>
                <ul className="space-y-2 text-sm">
                  <li>• <strong>Zero-shot CoT:</strong> "Qadam-ba-qadam tushuntir"</li>
                  <li>• <strong>Few-shot CoT:</strong> Misollar bilan</li>
                  <li>• <strong>Self-consistency:</strong> Bir necha yechim, eng ko'p takrorlangan javob</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }

    if (categoryId === 'texnikalar' && sectionId === 'role-playing') {
      return (
        <div className="space-y-6">
          <div className="prose prose-lg max-w-none">
            <p className="text-lg leading-relaxed">
              Role-playing — AI'ga ma'lum bir mutaxassis yoki shaxs rolini berish. 
              Bu javob sifati va uslubini sezilarli yaxshilaydi.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-2 border-black">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-4">PROFESSIONAL ROLLAR</h3>
                <ul className="space-y-2 text-sm">
                  <li>• Tajribali dasturchi</li>
                  <li>• Marketing mutaxassisi</li>
                  <li>• Moliya maslahatchisi</li>
                  <li>• Tibbiyot mutaxassisi</li>
                  <li>• Huquqshunos</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-black">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-4">KREATIV ROLLAR</h3>
                <ul className="space-y-2 text-sm">
                  <li>• Stend-up komediyachi</li>
                  <li>• Motivatsion spiker</li>
                  <li>• Tarixchi</li>
                  <li>• Bolalar yozuvchisi</li>
                  <li>• Ilmiy fantast muallifi</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <CodeExample
            title="ROLE-PLAYING MISOLI"
            badExample="Menga JavaScript'da array methods haqida tushuntir"
            goodExample="Sen 10 yillik tajribaga ega Senior JavaScript dasturchisan. Junior dasturchilarga murakkab tushunchalarni sodda tilda tushuntirish bo'yicha maxsus tajribaga egasan.

Menga JavaScript'dagi array methodlari haqida tushuntir. Har bir method uchun:
1. Nima ish qilishini
2. Qachon ishlatilishini
3. Real proyektdan misol keltirishingni xohlayman."
            explanation="Aniq rol va kontekst berish AI'ni mutaxassis kabi javob berishga undaydi."
          />

          <Alert className="border-2 border-black">
            <AiIcon name="info" size={20} />
            <AlertDescription>
              <strong>Maslahat:</strong> Rolni batafsil tavsiflang - tajriba, mutaxassislik 
              sohasi, uslub. Qanchalik aniq bo'lsa, shunchalik yaxshi natija.
            </AlertDescription>
          </Alert>
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