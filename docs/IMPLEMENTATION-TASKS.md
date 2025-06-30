# P57 Knowledge Base Implementation Tasks

## Overview
This document provides a detailed, step-by-step implementation guide for transforming the onboarding.tsx page into a comprehensive knowledge base. Each task includes clear instructions suitable for junior developers.

---

## PHASE 1: PREPARATION & CLEANUP (Day 1-2)

### 1.1 Remove Animation Dependencies
- [ ] Open `/client/src/pages/onboarding.tsx`
- [ ] Remove import: `import { motion, AnimatePresence } from "framer-motion"`
- [ ] Search for all `motion.` components and replace with regular HTML/React components
  - `motion.div` → `div`
  - `motion.button` → `button`
  - Remove all animation props like `whileHover`, `whileTap`, `animate`, `initial`, `exit`
- [ ] Remove `AnimatePresence` wrapper components
- [ ] Test that page still loads without errors

### 1.2 Create Backup
- [ ] Copy current `onboarding.tsx` to `onboarding-backup.tsx`
- [ ] Commit backup file to git with message: "Backup: Original onboarding before KB transformation"

### 1.3 Update Visual Components
- [ ] Replace all emoji icons with icon references
  - Example: `🎯` → `<AiIcon name="target" size={20} />`
  - Use icons from PRD section 5.1:
    - teaching.svg, brain.svg, settings.svg, layers.svg, workflow.svg
    - network.svg, idea.svg, compare.svg, shield.svg, target.svg
    - puzzle.svg, folder.svg
- [ ] Update all rounded corners to sharp corners
  - Remove: `rounded-lg`, `rounded-xl`, `rounded-2xl`
  - Keep corners sharp (no rounded classes)

---

## PHASE 2: DATA STRUCTURE & NAVIGATION (Day 3-4)

### 2.1 Define Knowledge Base Structure
- [ ] At the top of onboarding.tsx, create the navigation structure:

```typescript
// Add this after imports
interface KBSection {
  id: string;
  title: string;
  icon: string;
  sections: {
    id: string;
    title: string;
    subsections?: string[];
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
      { id: 'nima-uchun-muhim', title: 'NIMA UCHUN BU MUHIM?' },
      { id: 'ai-inqilobi', title: 'AI INQILOBI VA O\'ZBEKISTON' },
      { id: 'prompting-nima', title: 'PROMPTING NIMA?' },
      { id: 'prompt-elementlari', title: 'PROMPT ELEMENTLARI' },
      { id: 'umumiy-maslahatlar', title: 'UMUMIY MASLAHATLAR' }
    ]
  },
  // Add all 12 categories here following PRD section 5.1
];
```

### 2.2 Create Navigation State
- [ ] Add state variables for navigation:

```typescript
// Inside the component, replace current state with:
const [activeCategory, setActiveCategory] = useState<string>('kirish');
const [activeSection, setActiveSection] = useState<string>('nima-uchun-muhim');
const [sidebarOpen, setSidebarOpen] = useState<boolean>(false); // mobile
const [searchQuery, setSearchQuery] = useState<string>('');
const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['kirish']));
```

### 2.3 Update Progress Tracking
- [ ] Modify progress tracking to support hierarchical structure:

```typescript
interface UserProgress {
  completedSections: Set<string>; // format: "category-id/section-id"
  sectionScores: Record<string, number>;
  timeSpent: Record<string, number>;
  lastVisited: string;
  bookmarks: string[];
}

// Update localStorage keys
const STORAGE_KEY = {
  PROGRESS: 'kb_progress',
  LAST_VISITED: 'kb_last_visited',
  BOOKMARKS: 'kb_bookmarks'
};
```

---

## PHASE 3: LAYOUT IMPLEMENTATION (Day 5-7)

### 3.1 Create Main Layout Structure
- [ ] Replace the current return statement with new layout:

```typescript
return (
  <div className="min-h-screen bg-white">
    <AppHeader />
    
    <div className="flex h-[calc(100vh-64px)]"> {/* Adjust based on header height */}
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-[300px] border-r-2 border-black bg-white">
        {/* Sidebar content - see 3.2 */}
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
        {/* Content area - see 3.3 */}
      </main>
    </div>
    
    {/* Mobile Sidebar Drawer */}
    {sidebarOpen && (
      <div className="lg:hidden fixed inset-0 z-40">
        {/* Mobile sidebar - see 3.4 */}
      </div>
    )}
    
    <AppFooter />
  </div>
);
```

### 3.2 Implement Desktop Sidebar
- [ ] Create sidebar component inside the aside tag:

```typescript
<aside className="hidden lg:block w-[300px] border-r-2 border-black bg-white overflow-y-auto">
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
  
  {/* Navigation Tree */}
  <nav className="p-4">
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
                className={`w-full text-left p-2 text-sm hover:bg-gray-100 ${
                  activeCategory === category.id && activeSection === section.id
                    ? 'bg-black text-white font-bold'
                    : ''
                }`}
              >
                {section.title}
              </button>
            ))}
          </div>
        )}
      </div>
    ))}
  </nav>
</aside>
```

### 3.3 Implement Content Area
- [ ] Create content display component:

```typescript
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
      {renderCurrentContent()}
    </article>
    
    {/* Navigation Footer */}
    <div className="mt-12 pt-6 border-t-2 border-black flex justify-between">
      <button
        onClick={navigateToPrevious}
        disabled={!hasPrevious()}
        className="flex items-center gap-2 px-4 py-2 border-2 border-black font-bold disabled:opacity-50"
      >
        <AiIcon name="arrow-left" size={16} />
        OLDINGI
      </button>
      
      <button
        onClick={navigateToNext}
        disabled={!hasNext()}
        className="flex items-center gap-2 px-4 py-2 border-2 border-black bg-black text-white font-bold disabled:opacity-50"
      >
        KEYINGI
        <AiIcon name="arrow-right" size={16} />
      </button>
    </div>
  </div>
</main>
```

### 3.4 Implement Mobile Sidebar
- [ ] Create mobile drawer:

```typescript
{sidebarOpen && (
  <div className="lg:hidden fixed inset-0 z-40">
    {/* Backdrop */}
    <div 
      className="absolute inset-0 bg-black bg-opacity-50"
      onClick={() => setSidebarOpen(false)}
    />
    
    {/* Drawer */}
    <div className="absolute left-0 top-0 h-full w-[280px] bg-white border-r-2 border-black">
      {/* Close button */}
      <div className="p-4 border-b-2 border-black flex justify-between items-center">
        <span className="font-black">MUNDARIJA</span>
        <button onClick={() => setSidebarOpen(false)}>
          <AiIcon name="close" size={24} />
        </button>
      </div>
      
      {/* Same navigation content as desktop sidebar */}
      {/* Copy navigation tree from 3.2 here */}
    </div>
  </div>
)}
```

---

## PHASE 4: COMPONENT UPDATES (Day 8-10)

### 4.1 Replace FlipCard Component
- [ ] Find the FlipCard component definition
- [ ] Replace with ExpandableCard:

```typescript
function ExpandableCard({ term, definition, icon, examples }: {
  term: string;
  definition: string;
  icon?: React.ReactNode;
  examples?: string[];
}) {
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
```

### 4.2 Update KnowledgeCheck Component
- [ ] Remove animations from KnowledgeCheck
- [ ] Update styling to brutalist design:

```typescript
// Update the button styles in KnowledgeCheck:
className={`w-full text-left p-4 border-2 transition-none ${
  showResult && index === correctAnswer
    ? 'border-green-600 bg-green-50'
    : showResult && index === selected && index !== correctAnswer
    ? 'border-red-600 bg-red-50'
    : 'border-black hover:bg-gray-50'
}`}

// Remove motion wrapper, use regular button
```

### 4.3 Update InteractiveExample Component
- [ ] Simplify to static code display:

```typescript
function CodeExample({ title, badExample, goodExample, explanation }: {
  title: string;
  badExample: string;
  goodExample: string;
  explanation: string;
}) {
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
          <pre className="bg-gray-50 border-2 border-black p-4 font-mono text-sm overflow-x-auto">
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
          <pre className="bg-gray-50 border-2 border-black p-4 font-mono text-sm overflow-x-auto">
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
```

### 4.4 Add Copy Button to Code Blocks
- [ ] Create CopyButton component:

```typescript
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

// Use in code blocks:
<div className="relative">
  <div className="absolute top-2 right-2">
    <CopyButton text={codeContent} />
  </div>
  <pre className="bg-gray-50 border-2 border-black p-4 font-mono text-sm">
    {codeContent}
  </pre>
</div>
```

---

## PHASE 5: CONTENT MIGRATION (Day 11-14)

### 5.1 Map Existing Content to New Structure
- [ ] Create content mapping object:

```typescript
// Create a mapping of existing content to new structure
const contentMapping = {
  'kirish': {
    'nima-uchun-muhim': () => (
      <>
        {/* Move content from current "Kirish" section */}
        {/* Include the "Nima uchun bu muhim?" card content */}
      </>
    ),
    'ai-inqilobi': () => (
      <>
        <h2 className="text-2xl font-black mb-4">AI INQILOBI VA O'ZBEKISTON</h2>
        {/* New content about AI revolution in Uzbekistan context */}
      </>
    ),
    // ... more sections
  },
  'asoslar': {
    'ai-qanday-ishlaydi': () => (
      <>
        {/* Move content from current "AI Asoslari" section */}
        {/* Split into subsections for neural networks, LLM architecture, etc. */}
      </>
    ),
    // ... more sections
  },
  // ... map all 12 categories
};
```

### 5.2 Create Content Renderer
- [ ] Implement dynamic content rendering:

```typescript
function renderCurrentContent() {
  const content = contentMapping[activeCategory]?.[activeSection];
  
  if (!content) {
    return (
      <div className="text-center py-12">
        <AiIcon name="warning" size={48} className="mx-auto mb-4" />
        <p className="text-xl font-bold">CONTENT MAVJUD EMAS</p>
        <p className="text-gray-600 mt-2">Bu bo'lim hali tayyorlanmoqda...</p>
      </div>
    );
  }
  
  return content();
}
```

### 5.3 Convert Existing Sections
- [ ] Take each existing section and split into new structure:

**Example for "AI Asoslari" section:**
```typescript
// Original: One big "AI Asoslari" section
// New: Split into multiple subsections

'ai-qanday-ishlaydi': {
  'neyron-tarmoqlar': () => (
    <>
      <h2 className="text-2xl font-black mb-4">NEYRON TARMOQLAR</h2>
      {/* Extract neural network content from original */}
    </>
  ),
  'llm-arxitekturasi': () => (
    <>
      <h2 className="text-2xl font-black mb-4">LLM ARXITEKTURASI</h2>
      {/* Extract LLM architecture content */}
    </>
  ),
  'transformer-modellari': () => (
    <>
      <h2 className="text-2xl font-black mb-4">TRANSFORMER MODELLARI</h2>
      {/* New content about transformers */}
    </>
  )
}
```

---

## PHASE 6: SEARCH FUNCTIONALITY (Day 15-16)

### 6.1 Implement Search Logic
- [ ] Create search function:

```typescript
function searchContent(query: string) {
  if (!query.trim()) return [];
  
  const results = [];
  const lowerQuery = query.toLowerCase();
  
  knowledgeBaseStructure.forEach(category => {
    category.sections.forEach(section => {
      // Search in title
      if (section.title.toLowerCase().includes(lowerQuery)) {
        results.push({
          categoryId: category.id,
          sectionId: section.id,
          categoryTitle: category.title,
          sectionTitle: section.title,
          matchType: 'title'
        });
      }
      
      // Search in content (if implemented)
      // This requires extracting text from content components
    });
  });
  
  return results;
}
```

### 6.2 Display Search Results
- [ ] Create search results component:

```typescript
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
```

---

## PHASE 7: PROGRESS & NAVIGATION HELPERS (Day 17-18)

### 7.1 Implement Navigation Functions
- [ ] Create helper functions:

```typescript
// Toggle category expansion
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

// Navigate to section
function navigateToSection(categoryId: string, sectionId: string) {
  setActiveCategory(categoryId);
  setActiveSection(sectionId);
  setSidebarOpen(false); // Close mobile sidebar
  
  // Save to progress
  const sectionKey = `${categoryId}/${sectionId}`;
  saveProgress(sectionKey);
  
  // Scroll to top
  window.scrollTo(0, 0);
}

// Get current category/section objects
function getCurrentCategory() {
  return knowledgeBaseStructure.find(c => c.id === activeCategory);
}

function getCurrentSection() {
  const category = getCurrentCategory();
  return category?.sections.find(s => s.id === activeSection);
}

// Navigation helpers
function getAdjacentSections() {
  const allSections = [];
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
```

### 7.2 Implement Progress Tracking
- [ ] Update progress functions:

```typescript
// Save progress
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

// Load progress
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

// Check if section is completed
function isSectionCompleted(categoryId: string, sectionId: string) {
  const progress = loadProgress();
  return progress.completedSections.has(`${categoryId}/${sectionId}`);
}
```

### 7.3 Add Progress Indicators
- [ ] Update sidebar to show progress:

```typescript
// In sidebar section button, add checkmark for completed sections
{isSectionCompleted(category.id, section.id) && (
  <AiIcon name="checked" size={16} className="ml-auto" />
)}

// Add overall progress bar
function calculateOverallProgress() {
  const totalSections = knowledgeBaseStructure.reduce(
    (sum, cat) => sum + cat.sections.length, 0
  );
  const completedCount = loadProgress().completedSections.size;
  return Math.round((completedCount / totalSections) * 100);
}

// Display progress bar at top of sidebar
<div className="p-4 border-b-2 border-black">
  <div className="mb-2 flex justify-between text-sm">
    <span className="font-bold">UMUMIY PROGRESS</span>
    <span className="font-mono">{calculateOverallProgress()}%</span>
  </div>
  <div className="h-2 bg-gray-200 border border-black">
    <div 
      className="h-full bg-black transition-width duration-300"
      style={{ width: `${calculateOverallProgress()}%` }}
    />
  </div>
</div>
```

---

## PHASE 8: MOBILE OPTIMIZATIONS (Day 19-20)

### 8.1 Add Touch Gestures
- [ ] Implement swipe navigation for mobile:

```typescript
// Add touch event handlers
const [touchStart, setTouchStart] = useState(0);
const [touchEnd, setTouchEnd] = useState(0);

function handleTouchStart(e: React.TouchEvent) {
  setTouchStart(e.targetTouches[0].clientX);
}

function handleTouchMove(e: React.TouchEvent) {
  setTouchEnd(e.targetTouches[0].clientX);
}

function handleTouchEnd() {
  if (!touchStart || !touchEnd) return;
  
  const distance = touchStart - touchEnd;
  const isLeftSwipe = distance > 50;
  const isRightSwipe = distance < -50;
  
  if (isLeftSwipe) {
    navigateToNext();
  } else if (isRightSwipe) {
    navigateToPrevious();
  }
}

// Add to main content div
<main 
  className="flex-1 overflow-y-auto"
  onTouchStart={handleTouchStart}
  onTouchMove={handleTouchMove}
  onTouchEnd={handleTouchEnd}
>
```

### 8.2 Optimize Mobile Navigation
- [ ] Add bottom navigation for mobile:

```typescript
// Add fixed bottom nav on mobile
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
```

---

## PHASE 9: FINAL POLISH & TESTING (Day 21-22)

### 9.1 Performance Optimizations
- [ ] Remove all console.log statements
- [ ] Implement React.memo for heavy components:

```typescript
const MemoizedContentSection = React.memo(({ content }: { content: React.ReactNode }) => {
  return <>{content}</>;
});
```

- [ ] Add loading states for content:

```typescript
const [isLoading, setIsLoading] = useState(false);

// Show loading state when switching sections
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
```

### 9.2 Accessibility Improvements
- [ ] Add keyboard navigation:

```typescript
// Add keyboard event listener
useEffect(() => {
  function handleKeyPress(e: KeyboardEvent) {
    // Arrow keys for navigation
    if (e.key === 'ArrowLeft' && hasPrevious()) {
      navigateToPrevious();
    } else if (e.key === 'ArrowRight' && hasNext()) {
      navigateToNext();
    }
    // Slash for search focus
    else if (e.key === '/' && e.target !== searchInputRef.current) {
      e.preventDefault();
      searchInputRef.current?.focus();
    }
    // Escape to close mobile menu
    else if (e.key === 'Escape') {
      setSidebarOpen(false);
    }
  }
  
  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, [activeCategory, activeSection]);
```

- [ ] Add ARIA labels:

```typescript
// Add to navigation buttons
aria-label="Oldingi bo'lim"
aria-label="Keyingi bo'lim"

// Add to sidebar
role="navigation"
aria-label="Asosiy navigatsiya"

// Add to search
aria-label="Qidiruv"
```

### 9.3 Error Handling
- [ ] Add error boundaries:

```typescript
// Create ErrorBoundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center">
          <AiIcon name="warning" size={48} className="mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">XATOLIK YUZ BERDI</h2>
          <p className="text-gray-600 mb-4">Sahifani qayta yuklang</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 border-2 border-black font-bold"
          >
            QAYTA YUKLASH
          </button>
        </div>
      );
    }
    
    return this.props.children;
  }
}

// Wrap main content with ErrorBoundary
<ErrorBoundary>
  {renderCurrentContent()}
</ErrorBoundary>
```

---

## PHASE 10: CONTENT ADDITION (Day 23-25)

### 10.1 Add Missing Content Categories
- [ ] Create content for new categories not in original:
  - AGENTS VA SISTEMALAR
  - RAG VA ILGOR TEXNIKALAR
  - MODELLAR TAQQOSLASH
  - XAVFSIZLIK VA ETIKA
  - OPTIMIZATSIYA
  - QO'SHIMCHA RESURSLAR

### 10.2 Expand Existing Categories
- [ ] Add subsections to existing content
- [ ] Create practical examples for each technique
- [ ] Add "Try It Yourself" sections

### 10.3 Content Templates
- [ ] Create consistent templates for each content type:

```typescript
// Technique template
function TechniqueTemplate({ 
  title, 
  overview, 
  howItWorks, 
  examples, 
  commonMistakes,
  exercises 
}: TechniqueProps) {
  return (
    <>
      <h2 className="text-2xl font-black mb-4 uppercase">{title}</h2>
      
      <section className="mb-8">
        <h3 className="text-xl font-bold mb-4">UMUMIY MA'LUMOT</h3>
        <p className="text-lg leading-relaxed">{overview}</p>
      </section>
      
      <section className="mb-8">
        <h3 className="text-xl font-bold mb-4">QANDAY ISHLAYDI</h3>
        {howItWorks}
      </section>
      
      <section className="mb-8">
        <h3 className="text-xl font-bold mb-4">AMALIY MISOLLAR</h3>
        {examples.map((example, idx) => (
          <CodeExample key={idx} {...example} />
        ))}
      </section>
      
      <section className="mb-8">
        <h3 className="text-xl font-bold mb-4">KENG TARQALGAN XATOLAR</h3>
        <ul className="space-y-2">
          {commonMistakes.map((mistake, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <AiIcon name="warning" size={20} className="mt-1 flex-shrink-0" />
              <span>{mistake}</span>
            </li>
          ))}
        </ul>
      </section>
      
      <section className="mb-8">
        <h3 className="text-xl font-bold mb-4">MASHQLAR</h3>
        {exercises}
      </section>
    </>
  );
}
```

---

## TESTING CHECKLIST

### Desktop Testing
- [ ] Navigation works correctly
- [ ] Search returns relevant results
- [ ] Progress saves and loads
- [ ] All content displays properly
- [ ] Keyboard shortcuts work
- [ ] No console errors

### Mobile Testing (320px - 768px)
- [ ] Hamburger menu opens/closes
- [ ] Touch navigation works
- [ ] Content is readable
- [ ] Bottom navigation visible
- [ ] Search works on mobile
- [ ] No horizontal scroll

### Cross-browser Testing
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

### Performance Testing
- [ ] Page loads < 3 seconds
- [ ] Search responds < 200ms
- [ ] Smooth scrolling
- [ ] No memory leaks

---

## DEPLOYMENT CHECKLIST

- [ ] Remove all TODO comments
- [ ] Remove console.log statements
- [ ] Test all navigation paths
- [ ] Verify all content is present
- [ ] Check responsive design
- [ ] Test offline functionality
- [ ] Update meta tags for SEO
- [ ] Create git commit: "Transform onboarding to knowledge base"
- [ ] Deploy to staging
- [ ] Final QA testing
- [ ] Deploy to production

---

## HELPFUL RESOURCES FOR JUNIOR DEVELOPERS

### Tailwind Classes Used
- `border-2 border-black` - 2px black border
- `font-black` - Inter Black 900 weight
- `uppercase` - Transform text to uppercase
- `font-mono` - JetBrains Mono font
- `hover:bg-gray-50` - Light gray on hover
- `p-4` - padding 16px
- `p-6` - padding 24px
- `space-y-4` - 16px vertical spacing between children

### React Patterns Used
- `useState` - For managing component state
- `useEffect` - For side effects like localStorage
- `React.memo` - For performance optimization
- Conditional rendering with `&&` and ternary operators
- Event handlers (onClick, onChange, etc.)

### Common Issues & Solutions
1. **Icons not showing**: Make sure to import from `@/components/ai-icon`
2. **Styling not applying**: Check Tailwind class names are correct
3. **State not updating**: Ensure you're using setState correctly
4. **Navigation breaking**: Check categoryId and sectionId match structure

---

**Total Estimated Time**: 25 days (5 weeks) for junior developer
**With Senior Guidance**: 15-18 days (3-4 weeks)