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
import { Search, Crown, ArrowRight } from 'lucide-react';
import { Link } from 'wouter';

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
          <Link href="/atmos-payment">
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
    queryKey: [`/api/prompts`, { userTier: 'paid' }], // Fetch all prompts
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
  
  // Separate free and premium prompts based on specific IDs
  const freePrompts = filteredPrompts.filter(p => p.id === 25 || p.id === 26 || p.id === 27);
  const premiumPrompts = filteredPrompts.filter(p => p.id !== 25 && p.id !== 26 && p.id !== 27);

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
        <section className="pt-8 pb-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-black text-foreground uppercase leading-tight mb-4">
              Premium Promptlar
            </h1>
            <p className="text-lg text-foreground leading-relaxed mb-8">
              AI bilan ishlash uchun maxsus tayyorlangan professional promptlar to'plami
            </p>

            {/* Show upgrade banner for free users */}
            {tier === 'free' && (
              <UpgradeCTA 
                variant="banner" 
                title="Premium Promptlarga kirish"
                description="Maxsus tayyorlangan premium promptlar bilan ishlash samaradorligingizni oshiring"
              />
            )}
          </div>
        </section>

        {/* Search and Filters */}
        <section className="pb-8">
          <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Promptlar bo'yicha qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-2 border-black font-bold uppercase placeholder:font-normal placeholder:normal-case focus:ring-2 focus:ring-black rounded-none h-[44px]"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border-2 border-black bg-card text-foreground font-bold uppercase focus:outline-none focus:ring-2 focus:ring-black h-[44px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'Barcha kategoriyalar' : category}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* Free Prompts Section */}
        {freePrompts.length > 0 && (
          <section className="pb-16">
            <div className="mb-6">
              <h2 className="text-2xl font-black text-foreground uppercase mb-2">
                Bepul Promptlar
              </h2>
              <p className="text-foreground">
                Barcha foydalanuvchilar uchun ochiq promptlar
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {freePrompts.map((prompt) => (
                <PromptCard key={prompt.id} prompt={prompt} showFullContent={true} />
              ))}
            </div>
          </section>
        )}

        {/* Premium Prompts Section */}
        {premiumPrompts.length > 0 && (
          <section className="pb-16">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <Crown className="w-6 h-6 text-accent" />
                <h2 className="text-2xl font-black text-foreground uppercase">
                  Premium Promptlar
                </h2>
              </div>
              <p className="text-foreground">
                Premium obuna egalariga maxsus promptlar
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {premiumPrompts.map((prompt) => (
                <PromptCard key={prompt.id} prompt={prompt} showFullContent={true} />
              ))}
            </div>
          </section>
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