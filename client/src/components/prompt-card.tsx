import React, { useState } from 'react';
import { useUserTier } from '@/hooks/use-user-tier';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, CheckIcon, Lock, Crown, Eye } from 'lucide-react';
import { Link } from 'wouter';

export interface Prompt {
  id: number;
  title: string;
  content: string;
  description?: string;
  category: string;
  isPremium: boolean;
  isPublic: boolean;
  createdAt: string;
}

interface PromptCardProps {
  prompt: Prompt;
  variant?: 'default' | 'compact' | 'featured';
  showFullContent?: boolean;
}

export function PromptCard({ prompt, variant = 'default', showFullContent = false }: PromptCardProps) {
  const [copied, setCopied] = useState(false);
  const [showContent, setShowContent] = useState(showFullContent);
  const { tier } = useUserTier();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(prompt.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {

    }
  };

  // Free users can only access prompts with ID 25, 26, or 27
  const canAccess = tier === 'paid' || prompt.id === 25 || prompt.id === 26 || prompt.id === 27;

  if (variant === 'compact') {
    return (
      <Card className="relative bg-card border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all rounded-none">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="text-base font-semibold line-clamp-1">
              {prompt.title}
            </CardTitle>
            <div className="flex gap-1">
              <Badge variant="outline" className="text-xs font-bold uppercase border border-black bg-card hover:bg-secondary">
                {prompt.category}
              </Badge>
              {(prompt.id !== 25 && prompt.id !== 26 && prompt.id !== 27) && (
                <Badge className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold uppercase">
                  <Crown className="w-2 h-2 mr-1" />
                  Premium
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground line-clamp-1">
              {prompt.description || 'AI prompt'}
            </p>
            {canAccess ? (
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                className="gap-1 text-xs h-[32px] font-bold uppercase border border-black hover:bg-primary hover:text-primary-foreground transition-all rounded-none"
              >
                {copied ? (
                  <>
                    <CheckIcon className="w-3 h-3" />
                    Nusxalandi
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    Nusxalash
                  </>
                )}
              </Button>
            ) : (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Lock className="w-3 h-3" />
                Yopiq
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'featured') {
    return (
      <Card className="relative bg-card border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all rounded-none">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-5 h-5 text-accent" />
                <Badge className="bg-accent text-foreground hover:bg-accent/90 font-bold uppercase">
                  Tavsiya etiladi
                </Badge>
              </div>
              <CardTitle className="text-xl font-bold line-clamp-2">
                {prompt.title}
              </CardTitle>
              {prompt.description && (
                <CardDescription className="mt-2 line-clamp-2">
                  {prompt.description}
                </CardDescription>
              )}
            </div>
            <Badge variant="outline" className="text-xs font-bold uppercase border-2 border-black bg-card hover:bg-secondary">
              {prompt.category}
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          <div className="relative">
            <div className={`bg-gray-50 p-4 ${!canAccess ? 'filter blur-sm' : ''}`}>
              <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono line-clamp-3">
                {prompt.content}
              </pre>
            </div>

            {!canAccess && (
              <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                <div className="bg-card border-2 border-black p-4 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <Lock className="w-8 h-8 text-foreground mx-auto mb-2" />
                  <p className="text-sm font-bold uppercase text-foreground mb-2">Premium prompt</p>
                  <Link href="/payment">
                    <Button size="sm" className="bg-accent hover:bg-accent/90 text-foreground font-bold uppercase border-2 border-black h-[36px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      <Crown className="w-3 h-3 mr-1" />
                      Premium olish
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {canAccess && (
              <div className="flex justify-end items-center mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                  className="gap-2 bg-card font-bold uppercase border border-black h-[36px] hover:bg-primary hover:text-primary-foreground transition-all rounded-none"
                >
                  {copied ? (
                    <>
                      <CheckIcon className="w-4 h-4" />
                      Nusxalandi
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Nusxalash
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default variant
  return (
    <Card className="relative h-full group bg-card border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all rounded-none">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <CardTitle className="text-lg font-bold line-clamp-2 group-hover:text-primary transition-colors">
              {prompt.title}
            </CardTitle>
            {prompt.description && (
              <CardDescription className="mt-2 line-clamp-2">
                {prompt.description}
              </CardDescription>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Badge variant="outline" className="text-xs font-bold uppercase border-2 border-black bg-card hover:bg-secondary">
              {prompt.category}
            </Badge>
            {(prompt.id !== 25 && prompt.id !== 26 && prompt.id !== 27) && (
              <Badge className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase border-2 border-black">
                <Crown className="w-3 h-3 mr-1" />
                Premium
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="relative">
          {showContent ? (
            <div className={`bg-gray-50 p-4 ${!canAccess ? 'filter blur-sm' : ''}`}>
              <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono max-h-64 overflow-y-auto">
                {prompt.content}
              </pre>
            </div>
          ) : (
            <div className="bg-gray-50 p-8">
              <div className="text-center">
                <Eye className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 font-medium mb-3">
                  Prompt matnini ko'rish uchun bosing
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowContent(true)}
                  disabled={!canAccess}
                  className="font-bold uppercase border border-black h-[36px] hover:bg-primary hover:text-primary-foreground transition-all"
                >
                  {canAccess ? 'Promptni ko\'rish' : 'Premium kerak'}
                </Button>
              </div>
            </div>
          )}

          {!canAccess && showContent && (
            <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
              <div className="bg-card border-2 border-black p-4 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Lock className="w-8 h-8 text-foreground mx-auto mb-2" />
                <p className="text-sm font-bold uppercase text-foreground mb-2">Premium prompt</p>
                <p className="text-xs text-foreground mb-3">
                  Bu promptni ko'rish uchun Premium obuna kerak
                </p>
                <Link href="/payment">
                  <Button size="sm" className="bg-accent hover:bg-accent/90 text-foreground font-bold uppercase border-2 border-black h-[36px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <Crown className="w-3 h-3 mr-1" />
                    Premium olish
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {canAccess && showContent && (
            <div className="flex justify-end items-center mt-4">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowContent(false)}
                  className="font-bold uppercase border border-black h-[36px] hover:bg-primary hover:text-primary-foreground transition-all rounded-none"
                >
                  Yashirish
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                  className="gap-2 font-bold uppercase border border-black h-[36px] hover:bg-primary hover:text-primary-foreground transition-all rounded-none"
                >
                  {copied ? (
                    <>
                      <CheckIcon className="w-4 h-4" />
                      Nusxalandi
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Nusxalash
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default PromptCard;