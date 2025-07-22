import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useUserTier } from '@/hooks/use-user-tier';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppHeader from '@/components/app-header';
import AppFooter from '@/components/app-footer';
import { PromptCard, type Prompt } from '@/components/prompt-card';
import { UpgradeCTA } from '@/components/upgrade-cta';
import { Search, Crown, ArrowRight, BookOpen, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { Link } from 'wouter';

function InstructionsSection() {
  return (
    <Card className="bg-card border-2 sm:border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none mb-6 sm:mb-8">
      <CardHeader className="bg-accent border-b-2 sm:border-b-4 border-black p-4 sm:p-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-2 sm:p-3 bg-black flex-shrink-0">
            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <CardTitle className="text-lg sm:text-xl lg:text-2xl font-black uppercase text-black">
            Promptlardan Foydalanish Bo'yicha Qo'llanma
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Important Note */}
        <div className="bg-yellow-50 border-2 border-black p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-black mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <p className="font-bold text-black uppercase">Muhim eslatma:</p>
              <p className="text-black">
                Promptlar <span className="font-bold bg-yellow-200 px-1">INGLIZ TILIDA</span> yozilgan, chunki AI modellari ingliz tilida eng yaxshi natija beradi. 
                Lekin AI ning javoblari <span className="font-bold bg-yellow-200 px-1">O'ZBEK TILIDA</span> bo'ladi.
              </p>
            </div>
          </div>
        </div>

        {/* How to Use */}
        <div className="space-y-4">
          <h3 className="text-lg font-black uppercase flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Qanday Foydalanish Kerak?
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="bg-primary text-primary-foreground w-8 h-8 flex items-center justify-center font-black text-sm flex-shrink-0">
                1
              </div>
              <div>
                <p className="font-bold mb-1">Promptni nusxalang</p>
                <p className="text-sm text-muted-foreground">
                  "Nusxalash" tugmasini bosing va prompt matnini clipboard ga oling.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-primary text-primary-foreground w-8 h-8 flex items-center justify-center font-black text-sm flex-shrink-0">
                2
              </div>
              <div>
                <p className="font-bold mb-1">Placeholderlarni almashtiring</p>
                <p className="text-sm text-muted-foreground mb-2">
                  Promptdagi <span className="font-mono bg-gray-100 px-1 text-xs">[KVADRAT_QAVS]</span> ichidagi qismlarni o'zingizga mos ma'lumotlar bilan almashtiring.
                </p>
                <div className="bg-gray-50 border-2 border-black p-3 text-sm font-mono">
                  <p className="text-gray-600 mb-1">Misol:</p>
                  <p className="text-red-600 line-through">[KOMPANIYA_NOMI]</p>
                  <p className="text-green-600">→ Protokol 57</p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-primary text-primary-foreground w-8 h-8 flex items-center justify-center font-black text-sm flex-shrink-0">
                3
              </div>
              <div>
                <p className="font-bold mb-1">AI ga yuboring</p>
                <p className="text-sm text-muted-foreground">
                  Tayyor promptni ChatGPT, Claude yoki boshqa AI xizmatiga joylashtiring va natijani oling.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Best Practices */}
        <div className="border-t-2 border-black pt-4">
          <h3 className="text-lg font-black uppercase flex items-center gap-2 mb-3">
            <CheckCircle className="w-5 h-5" />
            Eng Yaxshi Natijalar Uchun
          </h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-accent font-black">•</span>
              <span>Placeholderlarni iloji boricha <strong>batafsil</strong> to'ldiring</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent font-black">•</span>
              <span>Agar kerak bo'lsa, promptga <strong>qo'shimcha kontekst</strong> qo'shing</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent font-black">•</span>
              <span>AI javobini tekshiring va kerak bo'lsa <strong>aniqlashtiruvchi savollar</strong> bering</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent font-black">•</span>
              <span>Har bir prompt o'z <strong>vazifasiga moslashtirilgan</strong>, maqsadga mos promptni tanlang</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

function UpgradeBanner() {
  return (
    <Card className="bg-card border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-none">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary">
              <Crown className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg font-black uppercase">Premium Promptlarga kirish</CardTitle>
              <CardDescription>
                Maxsus tayyorlangan premium promptlar bilan ishlash samaradorligingizni oshiring
              </CardDescription>
            </div>
          </div>
          <Link href="/payment">
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold uppercase border-2 border-accent h-[44px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              Premium olish
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </CardHeader>
    </Card>
  );
}

export default function PremiumPrompts() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { tier } = useUserTier();

  // Always fetch all prompts, we'll handle access control in the UI
  const { data: prompts = [], isLoading, error } = useQuery<Prompt[]>({
    queryKey: [`/api/prompts`, { tier: 'paid' }], // Fetch all prompts with correct parameter name
  });

  // Filter prompts based on search and category
  const filteredPrompts = prompts.filter(prompt => {
    const matchesSearch = prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         prompt.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (prompt.description && prompt.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || prompt.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(prompts.map(p => p.category)))];
  
  // Separate free and premium prompts based on user tier
  // For paid users, show all prompts. For free users, only show the free prompts
  const freePrompts = tier === 'free' 
    ? filteredPrompts.filter(p => p.id === 25 || p.id === 26 || p.id === 27)
    : []; // Don't separate for paid users
  const premiumPrompts = tier === 'free'
    ? filteredPrompts.filter(p => p.id !== 25 && p.id !== 26 && p.id !== 27)
    : filteredPrompts; // Show all prompts for paid users

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <section className="pt-8 pb-12">
            <div className="animate-pulse space-y-8">
              <div className="h-8 bg-primary w-64"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-64 bg-card border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"></div>
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <section className="pt-16 pb-16">
            <div className="text-center max-w-md mx-auto">
              <h2 className="text-2xl font-black text-foreground uppercase mb-4">
                Xatolik yuz berdi
              </h2>
              <p className="text-foreground mb-8">
                Promptlarni yuklashda xatolik yuz berdi. Iltimos, qayta urinib ko'ring.
              </p>
              <Button onClick={() => window.location.reload()} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase border-2 border-black h-[44px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                Qayta yuklash
              </Button>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <section className="pt-6 sm:pt-8 pb-6 sm:pb-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-foreground uppercase leading-tight mb-3 sm:mb-4">
              Premium Promptlar
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-foreground leading-relaxed mb-6 sm:mb-8 px-4 sm:px-0">
              AI bilan ishlash uchun maxsus tayyorlangan professional promptlar to'plami
            </p>

            {/* Show upgrade banner for free users */}
            {tier === 'free' && (
              <div className="px-4 sm:px-0">
                <UpgradeCTA 
                  variant="banner" 
                  title="Premium Promptlarga kirish"
                  description="Maxsus tayyorlangan premium promptlar bilan ishlash samaradorligingizni oshiring"
                />
              </div>
            )}
          </div>
        </section>

        {/* Instructions Section */}
        <InstructionsSection />

        {/* Search and Filters */}
        <section className="pb-6 sm:pb-8">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Promptlar bo'yicha qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-2 border-black font-bold text-sm sm:text-base uppercase placeholder:font-normal placeholder:normal-case focus:ring-2 focus:ring-black rounded-none h-[44px]"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 sm:px-4 py-2 border-2 border-black bg-card text-foreground font-bold text-sm sm:text-base uppercase focus:outline-none focus:ring-2 focus:ring-black h-[44px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
              aria-label="Kategoriya tanlash"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'Barcha kategoriyalar' : category}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* Prompts Display - Different layout for free vs paid users */}
        {tier === 'paid' ? (
          // For paid users, show all prompts in one section
          <section className="pb-12 sm:pb-16">
            <div className="mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-black text-foreground uppercase mb-1 sm:mb-2">
                Barcha Promptlar ({filteredPrompts.length})
              </h2>
              <p className="text-sm sm:text-base text-foreground">
                Premium obuna bilan barcha promptlarga kirish imkoniga egasiz
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredPrompts.map((prompt) => (
                <PromptCard key={prompt.id} prompt={prompt} showFullContent={true} />
              ))}
            </div>
          </section>
        ) : (
          // For free users, show separated sections
          <>
            {/* Free Prompts Section */}
            {freePrompts.length > 0 && (
              <section className="pb-12 sm:pb-16">
                <div className="mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl font-black text-foreground uppercase mb-1 sm:mb-2">
                    Bepul Promptlar
                  </h2>
                  <p className="text-sm sm:text-base text-foreground">
                    Barcha foydalanuvchilar uchun ochiq promptlar
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {freePrompts.map((prompt) => (
                    <PromptCard key={prompt.id} prompt={prompt} showFullContent={true} />
                  ))}
                </div>
              </section>
            )}

            {/* Premium Prompts Section */}
            {premiumPrompts.length > 0 && (
              <section className="pb-12 sm:pb-16">
                <div className="mb-4 sm:mb-6">
                  <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                    <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
                    <h2 className="text-xl sm:text-2xl font-black text-foreground uppercase">
                      Premium Promptlar
                    </h2>
                  </div>
                  <p className="text-sm sm:text-base text-foreground">
                    Premium obuna egalariga maxsus promptlar
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {premiumPrompts.map((prompt) => (
                    <PromptCard key={prompt.id} prompt={prompt} showFullContent={false} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* Empty State */}
        {filteredPrompts.length === 0 && (
          <section className="pb-16">
            <div className="text-center max-w-md mx-auto bg-card border-2 border-black p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="w-16 h-16 bg-primary flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="font-black text-lg uppercase mb-2">Hech narsa topilmadi</h3>
              <p className="text-foreground">
                Qidiruv so'rov yoki kategoriya bo'yicha promptlar topilmadi.
              </p>
            </div>
          </section>
        )}
      </main>

      <AppFooter />
    </div>
  );
}