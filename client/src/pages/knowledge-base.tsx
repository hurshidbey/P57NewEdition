import React, { useState, useEffect, useRef, Component, ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link, useLocation } from "wouter";
import AppHeader from "@/components/app-header";
import AppFooter from "@/components/app-footer";
import { AiIcon } from "@/components/ai-icon";
import { getContent } from "@/content/knowledge-base";
import { ContentSkeleton } from "@/components/knowledge-base/ContentSkeleton";
import { NoResults } from "@/components/knowledge-base/NoResults";
import { useUserTier } from "@/hooks/use-user-tier";
import { useAuth } from "@/contexts/auth-context";
import { Crown, Lock } from "lucide-react";
import "@/styles/knowledge-base-spacing.css";
import "@/styles/knowledge-base-preview.css";
import UpgradeCTA from "@/components/upgrade-cta";
import LearningPromptHero from "@/components/learning-prompt-hero";

// Import the shared components
import { ExpandableCard } from "@/content/knowledge-base/components/ExpandableCard";
import { CodeExample } from "@/content/knowledge-base/components/CodeExample";

// Knowledge Base Structure
interface KBSection {
  id: string;
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  readTime: number;
}

interface KBCategory {
  id: string;
  title: string;
  icon: string;
  sections: KBSection[];
}

const knowledgeBaseStructure: KBCategory[] = [
  {
    id: 'kirish',
    title: 'KIRISH',
    icon: 'book',
    sections: [
      { id: 'nima-uchun-muhim', title: 'PROMPTING NIMA UCHUN MUHIM?', difficulty: 'beginner', readTime: 5 },
      { id: 'prompting-nima', title: 'PROMPTING NIMA?', difficulty: 'beginner', readTime: 3 },
      { id: 'prompt-elementlari', title: 'PROMPT ELEMENTLARI', difficulty: 'beginner', readTime: 7 },
      { id: 'ai-inqilobi', title: 'AI INQILOBI', difficulty: 'beginner', readTime: 5 },
      { id: 'umumiy-maslahatlar', title: 'UMUMIY MASLAHATLAR', difficulty: 'beginner', readTime: 6 }
    ]
  },
  {
    id: 'asoslar',
    title: 'AI ASOSLARI',
    icon: 'cpu',
    sections: [
      { id: 'ai-qanday-ishlaydi', title: 'AI QANDAY ISHLAYDI?', difficulty: 'beginner', readTime: 8 },
      { id: 'neyron-tarmoqlar', title: 'NEYRON TARMOQLAR', difficulty: 'intermediate', readTime: 10 },
      { id: 'llm-arxitekturasi', title: 'LLM ARXITEKTURASI', difficulty: 'advanced', readTime: 15 },
      { id: 'transformer-modellari', title: 'TRANSFORMER MODELLARI', difficulty: 'advanced', readTime: 12 },
      { id: 'tokenizatsiya', title: 'TOKENIZATSIYA', difficulty: 'intermediate', readTime: 8 }
    ]
  },
  {
    id: 'sozlamalar',
    title: 'MODEL SOZLAMALARI',
    icon: 'settings',
    sections: [
      { id: 'harorat-parametri', title: 'HARORAT (TEMPERATURE)', difficulty: 'beginner', readTime: 6 },
      { id: 'top-p-va-top-k', title: 'TOP-P VA TOP-K', difficulty: 'intermediate', readTime: 8 },
      { id: 'max-tokens', title: 'MAX TOKENS', difficulty: 'beginner', readTime: 5 },
      { id: 'stop-sequences', title: 'STOP SEQUENCES', difficulty: 'intermediate', readTime: 6 },
      { id: 'presence-frequency', title: 'PRESENCE & FREQUENCY PENALTY', difficulty: 'intermediate', readTime: 7 }
    ]
  },
  {
    id: 'texnikalar',
    title: 'PROMPTING TEXNIKALARI',
    icon: 'lightbulb',
    sections: [
      { id: 'zero-shot', title: 'ZERO-SHOT PROMPTING', difficulty: 'beginner', readTime: 5 },
      { id: 'few-shot', title: 'FEW-SHOT PROMPTING', difficulty: 'intermediate', readTime: 7 },
      { id: 'chain-of-thought', title: 'CHAIN-OF-THOUGHT', difficulty: 'intermediate', readTime: 8 },
      { id: 'role-playing', title: 'ROLE-PLAYING', difficulty: 'beginner', readTime: 6 },
      { id: 'structured-output', title: 'STRUCTURED OUTPUT', difficulty: 'advanced', readTime: 10 }
    ]
  },
  {
    id: 'agents',
    title: 'AGENT TIZIMLAR',
    icon: 'robot',
    sections: [
      { id: 'agent-tizimlar', title: 'AGENT NIMA?', difficulty: 'advanced', readTime: 10 },
      { id: 'tool-use', title: 'TOOL USE', difficulty: 'advanced', readTime: 12 },
      { id: 'orchestration', title: 'ORCHESTRATION', difficulty: 'advanced', readTime: 15 }
    ]
  },
  {
    id: 'rag',
    title: 'RAG TEXNOLOGIYASI',
    icon: 'database',
    sections: [
      { id: 'rag-asoslari', title: 'RAG NIMA?', difficulty: 'intermediate', readTime: 10 },
      { id: 'vektor-qidiruv', title: 'VEKTOR QIDIRUV', difficulty: 'advanced', readTime: 12 },
      { id: 'hybrid-search', title: 'HYBRID SEARCH', difficulty: 'advanced', readTime: 10 }
    ]
  },
  {
    id: 'tanqidiy',
    title: 'TANQIDIY FIKRLASH',
    icon: 'brain',
    sections: [
      { id: 'baholash', title: 'NATIJALARNI BAHOLASH', difficulty: 'intermediate', readTime: 8 },
      { id: 'taqqoslash', title: 'MODELLARNI TAQQOSLASH', difficulty: 'intermediate', readTime: 10 },
      { id: 'xato-analiz', title: 'XATOLARNI TAHLIL QILISH', difficulty: 'intermediate', readTime: 9 }
    ]
  },
  {
    id: 'modellar',
    title: 'AI MODELLAR',
    icon: 'network',
    sections: [
      { id: 'gpt-oilasi', title: 'GPT OILASI', difficulty: 'beginner', readTime: 8 },
      { id: 'claude-oilasi', title: 'CLAUDE OILASI', difficulty: 'beginner', readTime: 8 },
      { id: 'ochiq-modellar', title: 'OCHIQ MODELLAR', difficulty: 'intermediate', readTime: 10 }
    ]
  },
  {
    id: 'xavfsizlik',
    title: 'XAVFSIZLIK',
    icon: 'shield',
    sections: [
      { id: 'xavfsizlik-tamoyillari', title: 'XAVFSIZLIK TAMOYILLARI', difficulty: 'beginner', readTime: 7 },
      { id: 'jailbreaking', title: 'JAILBREAKING HAQIDA', difficulty: 'advanced', readTime: 10 },
      { id: 'responsible-ai', title: 'MAS\'ULIYATLI AI', difficulty: 'intermediate', readTime: 8 }
    ]
  },
  {
    id: 'optimizatsiya',
    title: 'OPTIMIZATSIYA',
    icon: 'rocket',
    sections: [
      { id: 'narx-optimallashtirish', title: 'NARXNI KAMAYTIRISH', difficulty: 'intermediate', readTime: 8 },
      { id: 'tezlik-oshirish', title: 'TEZLIKNI OSHIRISH', difficulty: 'intermediate', readTime: 9 },
      { id: 'xotira-boshqaruv', title: 'XOTIRA BOSHQARUVI', difficulty: 'advanced', readTime: 10 }
    ]
  },
  {
    id: 'amaliyot',
    title: 'AMALIYOT',
    icon: 'code',
    sections: [
      { id: 'loyihalar', title: 'REAL LOYIHALAR', difficulty: 'intermediate', readTime: 15 },
      { id: 'debugging', title: 'DEBUGGING VA TESTING', difficulty: 'intermediate', readTime: 10 },
      { id: 'sohalar-amaliyot', title: 'TURLI SOHALARDA AMALIYOT', difficulty: 'advanced', readTime: 12 }
    ]
  },
  {
    id: 'resurslar',
    title: 'QO\'SHIMCHA RESURSLAR',
    icon: 'folder',
    sections: [
      { id: 'foydali-kutubxonalar', title: 'FOYDALI KUTUBXONALAR', difficulty: 'beginner', readTime: 8 },
      { id: 'dokumentatsiya', title: 'DOKUMENTATSIYA', difficulty: 'beginner', readTime: 6 },
      { id: 'hamjamiyat', title: 'HAMJAMIYAT', difficulty: 'beginner', readTime: 5 },
      { id: 'vositalar-api', title: 'VOSITALAR VA API', difficulty: 'intermediate', readTime: 7 },
      { id: 'ozbekiston-ai', title: 'O\'ZBEKISTONDA AI', difficulty: 'beginner', readTime: 5 }
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
      className="px-3 py-1 border-2 border-black bg-white font-mono text-xs hover:bg-gray-100 font-bold uppercase"
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
    <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] kb-card">
      <CardContent className="p-4">
        <h4 className="font-semibold text-lg mb-3">{question}</h4>
        <div className="space-y-2">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleSelect(index)}
              disabled={showResult}
              className={`w-full text-left p-4 border-2 transition-none ${
                showResult && index === correctAnswer
                  ? 'border-black bg-[#ffeb3b]'
                  : showResult && index === selected && index !== correctAnswer
                  ? 'border-red-600 bg-red-100'
                  : 'border-black hover:bg-gray-100'
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
          <Alert className="mt-4 border-2 border-black bg-gray-100">
            <AiIcon name="info" size={24} />
            <AlertDescription>{explanation}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

// Error Boundary Component
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Knowledge Base Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <AiIcon name="warning" size={48} className="mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">XATOLIK YUZ BERDI</h2>
            <p className="text-muted-foreground mb-6">
              Bilimlar bazasini yuklashda muammo yuz berdi. Sahifani qayta yuklang.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 border-2 border-black font-bold uppercase hover:bg-gray-100 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              QAYTA YUKLASH
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function KnowledgeBase() {
  const { user } = useAuth();
  const { tier } = useUserTier();
  const [, navigate] = useLocation();
  
  // Premium access check
  const isAdmin = user?.email === 'hurshidbey@gmail.com' || user?.email === 'mustafaabdurahmonov7777@gmail.com';
  const isPremiumUser = tier === 'paid' || isAdmin;
  
  // Force light mode for knowledge base
  useEffect(() => {
    const htmlElement = document.documentElement;
    const originalTheme = htmlElement.classList.contains('dark') ? 'dark' : 'light';
    
    // Remove dark class to force light mode
    htmlElement.classList.remove('dark');
    
    // Restore original theme when leaving the page
    return () => {
      if (originalTheme === 'dark') {
        htmlElement.classList.add('dark');
      }
    };
  }, []);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['kirish']));
  const [isLoading, setIsLoading] = useState(true);
  const [isContentLoading, setIsContentLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('kirish');
  const [activeSection, setActiveSection] = useState('nima-uchun-muhim');
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Navigation Functions
  function navigateToSection(categoryId: string, sectionId: string) {
    setIsContentLoading(true);
    setActiveCategory(categoryId);
    setActiveSection(sectionId);
    setSidebarOpen(false);
    saveLastVisited(categoryId, sectionId);
    
    // Expand category if not expanded
    setExpandedCategories(prev => new Set(Array.from(prev).concat(categoryId)));
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Simulate content loading
    setTimeout(() => setIsContentLoading(false), 300);
  }

  function navigateToNext() {
    const currentCategoryIndex = knowledgeBaseStructure.findIndex(c => c.id === activeCategory);
    const currentCategory = knowledgeBaseStructure[currentCategoryIndex];
    const currentSectionIndex = currentCategory.sections.findIndex(s => s.id === activeSection);
    
    if (currentSectionIndex < currentCategory.sections.length - 1) {
      const nextSection = currentCategory.sections[currentSectionIndex + 1];
      navigateToSection(activeCategory, nextSection.id);
    } else if (currentCategoryIndex < knowledgeBaseStructure.length - 1) {
      const nextCategory = knowledgeBaseStructure[currentCategoryIndex + 1];
      navigateToSection(nextCategory.id, nextCategory.sections[0].id);
    }
  }

  function navigateToPrevious() {
    const currentCategoryIndex = knowledgeBaseStructure.findIndex(c => c.id === activeCategory);
    const currentCategory = knowledgeBaseStructure[currentCategoryIndex];
    const currentSectionIndex = currentCategory.sections.findIndex(s => s.id === activeSection);
    
    if (currentSectionIndex > 0) {
      const prevSection = currentCategory.sections[currentSectionIndex - 1];
      navigateToSection(activeCategory, prevSection.id);
    } else if (currentCategoryIndex > 0) {
      const prevCategory = knowledgeBaseStructure[currentCategoryIndex - 1];
      const lastSection = prevCategory.sections[prevCategory.sections.length - 1];
      navigateToSection(prevCategory.id, lastSection.id);
    }
  }

  function hasNext() {
    const currentCategoryIndex = knowledgeBaseStructure.findIndex(c => c.id === activeCategory);
    const currentCategory = knowledgeBaseStructure[currentCategoryIndex];
    const currentSectionIndex = currentCategory.sections.findIndex(s => s.id === activeSection);
    
    return currentSectionIndex < currentCategory.sections.length - 1 || 
           currentCategoryIndex < knowledgeBaseStructure.length - 1;
  }

  function hasPrevious() {
    const currentCategoryIndex = knowledgeBaseStructure.findIndex(c => c.id === activeCategory);
    const currentCategory = knowledgeBaseStructure[currentCategoryIndex];
    const currentSectionIndex = currentCategory.sections.findIndex(s => s.id === activeSection);
    
    return currentSectionIndex > 0 || currentCategoryIndex > 0;
  }

  // Touch handlers for swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const diffX = touchStartX.current - touchEndX.current;
    const threshold = 50;

    if (Math.abs(diffX) > threshold) {
      if (diffX > 0 && hasNext()) {
        navigateToNext();
      } else if (diffX < 0 && hasPrevious()) {
        navigateToPrevious();
      }
    }
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  // Progress Management
  function saveProgress(sectionKey: string) {
    const progress = loadProgress();
    progress.completedSections.add(sectionKey);
    progress.lastVisited = sectionKey;
    localStorage.setItem(STORAGE_KEY.PROGRESS, JSON.stringify({
      ...progress,
      completedSections: Array.from(progress.completedSections)
    }));
  }

  function loadProgress(): UserProgress {
    const saved = localStorage.getItem(STORAGE_KEY.PROGRESS);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        completedSections: new Set(parsed.completedSections || [])
      };
    }
    return {
      completedSections: new Set(),
      sectionScores: {},
      timeSpent: {},
      lastVisited: '',
      bookmarks: []
    };
  }

  function saveLastVisited(categoryId: string, sectionId: string) {
    localStorage.setItem(STORAGE_KEY.LAST_VISITED, `${categoryId}:${sectionId}`);
  }

  function getCurrentSection() {
    const category = knowledgeBaseStructure.find(c => c.id === activeCategory);
    return category?.sections.find(s => s.id === activeSection);
  }

  useEffect(() => {
    const lastVisited = localStorage.getItem(STORAGE_KEY.LAST_VISITED);
    if (lastVisited) {
      const [categoryId, sectionId] = lastVisited.split(':');
      if (categoryId && sectionId) {
        setActiveCategory(categoryId);
        setActiveSection(sectionId);
        setExpandedCategories(new Set([categoryId]));
      }
    }
    // Initial load complete
    setTimeout(() => setIsLoading(false), 500);
  }, []);

  useEffect(() => {
    const sectionKey = `${activeCategory}:${activeSection}`;
    const timer = setTimeout(() => {
      saveProgress(sectionKey);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [activeCategory, activeSection]);

  // Progress Calculation
  function isSectionCompleted(categoryId: string, sectionId: string) {
    const progress = loadProgress();
    return progress.completedSections.has(`${categoryId}:${sectionId}`);
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
    // If searching and no results
    if (searchQuery && searchResults.length === 0) {
      const suggestions = knowledgeBaseStructure
        .flatMap(cat => cat.sections.map(sec => ({
          categoryId: cat.id,
          sectionId: sec.id,
          title: sec.title
        })))
        .slice(0, 3); // Show first 3 sections as suggestions
        
      return (
        <NoResults 
          searchQuery={searchQuery}
          suggestions={suggestions}
          onSuggestionClick={(catId, secId) => {
            setSearchQuery('');
            navigateToSection(catId, secId);
          }}
        />
      );
    }
    
    // Get content from the modular system
    const content = getContent(activeCategory, activeSection);
    
    // Check if user is premium
    if (!isPremiumUser) {
      // Show blurred preview for free users
      return (
        <div className="relative min-h-[400px] sm:min-h-[500px]">
          {/* Blurred content preview - mobile optimized */}
          <div className="relative overflow-hidden rounded-lg border-2 border-black">
            <div className="p-4 sm:p-6 filter blur-[3px] opacity-60 select-none pointer-events-none">
              {content && content.sections && content.sections.length > 0 ? (
                <div>
                  <h3 className="text-lg sm:text-xl font-bold mb-3">Premium Content Preview</h3>
                  <p className="text-base sm:text-lg mb-4">
                    Bu bo'limda siz {getCurrentSection()?.title} haqida to'liq ma'lumot olishingiz mumkin.
                  </p>
                  <div className="text-sm sm:text-base space-y-2 mb-3">
                    <p>• AI texnologiyalari bilan ishlash usullari</p>
                    <p>• Amaliy misollar va kod namunalari</p>
                    <p>• Professional maslahatlar va yo'riqnomalar</p>
                    <p>• Interaktiv mashqlar va testlar</p>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Premium obuna bilan barcha bilimlar bazasiga to'liq kirish imkoniyatiga ega bo'ling...
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-base sm:text-lg">Premium content mavjud...</p>
                </div>
              )}
            </div>
            
            {/* Gradient overlay */}
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none"></div>
          </div>
          
          {/* Premium CTA - positioned below content on mobile */}
          <div className="mt-6 sm:mt-8">
            <div className="text-center mb-4">
              <p className="text-sm sm:text-base font-medium text-black/80">
                Bu {getCurrentSection()?.difficulty === 'beginner' ? 'boshlang\'ich' : 
                     getCurrentSection()?.difficulty === 'intermediate' ? 'o\'rta' :
                     'murakkab'} darajadagi {getCurrentSection()?.readTime} daqiqalik dars
              </p>
            </div>
            <UpgradeCTA 
              variant="card"
              title="Premium bilimlar bazasi"
              description={`"${getCurrentSection()?.title}" va boshqa 100+ darslarni o'qish uchun Premium obuna kerak`}
              reason="Barcha AI prompting texnikalarini o'rganing"
              showFeatures={false}
              className="max-w-md mx-auto"
            />
          </div>
          
          {/* Watermark behind content */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
            <Lock className="w-32 h-32 sm:w-48 sm:h-48" />
          </div>
        </div>
      );
    }
    
    // Premium users see full content
    if (content && content.sections && content.sections.length > 0) {
      const section = content.sections[0];
      if (section.type === 'custom' && section.content.render) {
        return section.content.render();
      }
    }
    
    // No content available - show placeholder
    return (
      <div className="text-center py-12">
        <AiIcon name="construction" size={48} className="mx-auto mb-4 text-black" />
        <p className="text-lg text-black font-black uppercase">Bu bo'lim hozircha tayyorlanmoqda...</p>
      </div>
    );
  }

  // We no longer block access entirely - free users can browse the structure

  return (
    <div className="min-h-screen bg-background kb-container">
      <AppHeader />
      
      {/* Mobile Header with Menu Button */}
      <div className="lg:hidden sticky top-[64px] z-40 bg-black text-white border-b-2 border-black">
        <div className="flex items-center justify-between p-3 h-14">
          <h1 className="text-lg sm:text-xl font-black uppercase tracking-tight">BILIMLAR BAZASI</h1>
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-11 h-11 sm:w-12 sm:h-12 border-2 border-white bg-black text-white hover:bg-white hover:text-black transition-colors touch-manipulation flex items-center justify-center"
            aria-label="Menyuni ochish"
            type="button"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
      
      <div className="flex h-[calc(100vh-128px)] lg:h-[calc(100vh-64px)]">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-[300px] border-r-2 border-black bg-white overflow-y-auto">
          {/* Progress Bar - Only for Premium Users */}
          {isPremiumUser ? (
            <div className="kb-sidebar-section-header border-b-2 border-black bg-black text-white">
              <div className="mb-2 flex justify-between items-center">
                <span className="text-base font-black uppercase tracking-tight">PROGRESS</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black font-mono tabular-nums">{calculateOverallProgress()}%</span>
                </div>
              </div>
              <div className="h-5 bg-white border-2 border-black relative overflow-hidden">
                <div 
                  className="h-full bg-[#ffeb3b] relative transition-all duration-500 ease-out"
                  style={{ width: `${calculateOverallProgress()}%` }}
                >
                  {/* Striped pattern for progress */}
                  <div className="absolute inset-0 bg-repeating-linear-gradient-45 from-transparent via-transparent to-black/20 bg-size-10"></div>
                </div>
                {/* Progress markers every 25% */}
                <div className="absolute inset-0 flex">
                  <div className="w-1/4 border-r-2 border-black"></div>
                  <div className="w-1/4 border-r-2 border-black"></div>
                  <div className="w-1/4 border-r-2 border-black"></div>
                </div>
              </div>
              <div className="mt-2 text-xs font-bold">
                {loadProgress().completedSections.size} / {knowledgeBaseStructure.reduce((sum, cat) => sum + cat.sections.length, 0)} BO'LIM O'QILDI
              </div>
            </div>
          ) : (
            <div className="kb-sidebar-section-header border-b-2 border-black bg-accent">
              <div className="p-3 flex items-center justify-center gap-2">
                <Crown className="w-4 h-4" />
                <span className="text-sm font-black uppercase">Premium Content</span>
              </div>
            </div>
          )}

          {/* Search */}
          <div className="kb-sidebar-section border-b-2 border-black">
            <div className="relative">
              <input
                type="text"
                placeholder="Qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 px-3 pr-10 border-2 border-black bg-white text-sm font-bold text-black placeholder:text-black/50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-white"
                  aria-label="Qidirishni tozalash"
                >
                  <AiIcon name="close" size={16} />
                </button>
              )}
            </div>
            {searchQuery && searchResults.length > 0 && (
              <div className="mt-2 text-sm leading-tight text-black font-black uppercase">
                {searchResults.length} ta natija topildi
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="kb-sidebar-section">
            {knowledgeBaseStructure.map((category) => (
              <div key={category.id} className="mb-3 relative">
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full text-left p-3 border-2 border-black font-bold uppercase hover:bg-white hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
                  type="button"
                >
                  <div className="flex items-center gap-2">
                    <AiIcon name={category.icon as any} size={24} />
                    <span>{category.title}</span>
                    <span className="ml-auto mr-8 text-xs text-black/60 font-bold">
                      {category.sections.filter(s => isSectionCompleted(category.id, s.id)).length}/{category.sections.length}
                    </span>
                  </div>
                  <AiIcon 
                    name={expandedCategories.has(category.id) ? 'chevron-down' : 'chevron-right'} 
                    size={16} 
                  />
                </button>
                
                {expandedCategories.has(category.id) && (
                  <div className="ml-4 mt-1">
                    {category.sections.map((section) => (
                      <button
                        key={section.id}
                        onClick={() => navigateToSection(category.id, section.id)}
                        className={`w-full text-left p-2 min-h-[40px] text-sm hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-inset transition-shadow ${
                          activeCategory === category.id && activeSection === section.id
                            ? 'bg-black text-white font-bold'
                            : 'bg-white'
                        }`}
                        type="button"
                        aria-current={activeCategory === category.id && activeSection === section.id ? 'page' : undefined}
                      >
                        <span className="flex items-center gap-2">
                          {section.title}
                          {!isPremiumUser && (
                            <Crown className="w-3 h-3 text-accent" aria-label="Premium content" />
                          )}
                        </span>
                        {isSectionCompleted(category.id, section.id) && isPremiumUser && (
                          <div className="flex items-center gap-1">
                            <AiIcon name="checked" size={16} className="text-[#ffeb3b]" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-6 lg:p-8 pb-28 lg:pb-8">
            {/* Learning Prompt Hero for Premium Users */}
            {isPremiumUser && activeCategory === 'kirish' && activeSection === 'nima-uchun-muhim' && (
              <LearningPromptHero />
            )}
            
            {/* Breadcrumb */}
            <nav className="mb-6 sm:mb-4" aria-label="Breadcrumb">
              <div className="text-sm sm:text-base text-black flex flex-wrap items-center gap-2 font-medium">
                <Link href="/">
                  <span className="hover:text-black/80 cursor-pointer underline underline-offset-2">Bosh sahifa</span>
                </Link>
                <span className="text-black/60">/</span>
                <span className="text-black/80">
                  {knowledgeBaseStructure.find(c => c.id === activeCategory)?.title}
                </span>
              </div>
            </nav>

            {/* Section Header */}
            <div className="mb-4">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-2 leading-none uppercase tracking-tight">
                {getCurrentSection()?.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-black">
                <span className="px-2 py-1 border-2 border-black bg-white font-black uppercase text-xs" aria-label="Qiyinlik darajasi">
                  {getCurrentSection()?.difficulty === 'beginner' && 'Boshlang\'ich'}
                  {getCurrentSection()?.difficulty === 'intermediate' && 'O\'rta'}
                  {getCurrentSection()?.difficulty === 'advanced' && 'Murakkab'}
                </span>
                <span className="flex items-center gap-1" aria-label="O'qish vaqti">
                  <AiIcon name="clock" size={16} aria-hidden="true" />
                  {getCurrentSection()?.readTime} daqiqa
                </span>
              </div>
            </div>

            {/* Dynamic Content */}
            <div 
              className="prose prose-lg max-w-none kb-prose kb-content-spacing"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {isContentLoading ? <ContentSkeleton /> : renderCurrentContent()}
            </div>

            {/* Navigation Buttons */}
            <div className="mt-6 flex justify-between items-center">
              <button
                onClick={navigateToPrevious}
                disabled={!hasPrevious()}
                type="button"
                className="h-10 px-4 border-2 border-black bg-white font-black uppercase flex items-center gap-2 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <AiIcon name="arrow-left" size={24} />
                OLDINGI
              </button>
              
              <button
                onClick={navigateToNext}
                disabled={!hasNext()}
                type="button"
                className="h-10 px-4 border-2 border-black bg-black text-white font-black uppercase flex items-center gap-2 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                KEYINGI
                <AiIcon name="arrow-right" size={24} />
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-[300px] bg-white h-full overflow-y-auto border-r-2 border-black">
            {/* Mobile sidebar content - same as desktop */}
            <div className="p-4 border-b-2 border-black flex justify-between items-center">
              <h2 className="text-xl font-black uppercase tracking-tight">MUNDARIJA</h2>
              <button onClick={() => setSidebarOpen(false)} aria-label="Menyuni yopish" type="button">
                <AiIcon name="close" size={24} />
              </button>
            </div>
            
            <nav className="p-4">
              {knowledgeBaseStructure.map((category) => (
                <div key={category.id} className="mb-3 relative">
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="w-full text-left p-3 border-2 border-black font-bold uppercase hover:bg-gray-100 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffeb3b] focus-visible:ring-offset-2"
                    type="button"
                  >
                    <div className="flex items-center gap-2">
                      <AiIcon name={category.icon as any} size={24} />
                      <span>{category.title}</span>
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
                          className={`w-full text-left p-3 min-h-[44px] text-sm hover:bg-muted flex items-center justify-between ${
                            activeCategory === category.id && activeSection === section.id
                              ? 'bg-accent text-accent-foreground font-bold'
                              : ''
                          }`}
                          type="button"
                          aria-current={activeCategory === category.id && activeSection === section.id ? 'page' : undefined}
                        >
                          <span className="flex items-center gap-2">
                            {section.title}
                            {!isPremiumUser && (
                              <Crown className="w-3 h-3 text-accent" aria-label="Premium content" />
                            )}
                          </span>
                          {isSectionCompleted(category.id, section.id) && isPremiumUser && (
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
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-black p-3 sm:p-4">
        <div className="flex justify-between items-center gap-2">
          <button
            onClick={navigateToPrevious}
            disabled={!hasPrevious()}
            className="w-11 h-11 sm:w-12 sm:h-12 border-2 border-black bg-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-shadow touch-manipulation"
            aria-label="Oldingi sahifa"
            type="button"
          >
            <AiIcon name="arrow-left" size={20} />
          </button>
          
          <button
            onClick={() => setSidebarOpen(true)}
            className="h-11 sm:h-12 px-4 sm:px-6 border-2 border-black bg-white font-black text-sm sm:text-base uppercase touch-manipulation hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-shadow"
            type="button"
          >
            MUNDARIJA
          </button>
          
          <button
            onClick={navigateToNext}
            disabled={!hasNext()}
            className="w-11 h-11 sm:w-12 sm:h-12 border-2 border-black bg-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-shadow touch-manipulation"
            aria-label="Keyingi sahifa"
            type="button"
          >
            <AiIcon name="arrow-right" size={20} />
          </button>
        </div>
      </div>
      
      <AppFooter />
    </div>
  );
}