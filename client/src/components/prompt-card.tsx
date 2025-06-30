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
      <Card className="relative">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="text-base font-semibold line-clamp-1">
              {prompt.title}
            </CardTitle>
            <div className="flex gap-1">
              <Badge variant="outline" className="text-xs">
                {prompt.category}
              </Badge>
              {(prompt.id !== 25 && prompt.id !== 26 && prompt.id !== 27) && (
                <Badge className="bg-accent/20 text-accent hover:bg-accent/30 text-xs">
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
                className="gap-1 text-xs h-7"
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
      <Card className="relative bg-accent/5 border-accent/20">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-5 h-5 text-accent" />
                <Badge className="bg-accent/20 text-accent hover:bg-accent/30">
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
            <Badge variant="outline" className="text-xs">
              {prompt.category}
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          <div className="relative">
            <div className={`bg-background/80 rounded-lg p-4 ${!canAccess ? 'filter blur-sm' : ''}`}>
              <pre className="text-sm text-foreground whitespace-pre-wrap font-mono line-clamp-3">
                {prompt.content}
              </pre>
            </div>

            {!canAccess && (
              <div className="absolute inset-0 bg-black/10 rounded-lg flex items-center justify-center">
                <div className="bg-background rounded-lg p-4 text-center shadow-lg">
                  <Lock className="w-8 h-8 text-accent mx-auto mb-2" />
                  <p className="text-sm font-medium text-foreground mb-2">Premium prompt</p>
                  <Link href="/atmos-payment">
                    <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                      <Crown className="w-3 h-3 mr-1" />
                      Premium olish
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {canAccess && (
              <div className="flex justify-between items-center mt-4">
                <span className="text-xs text-muted-foreground">
                  {new Date(prompt.createdAt).toLocaleDateString('uz-UZ')}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                  className="gap-2 bg-background/80"
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
    <Card className="relative h-full group">
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
            <Badge variant="outline" className="text-xs">
              {prompt.category}
            </Badge>
            {(prompt.id !== 25 && prompt.id !== 26 && prompt.id !== 27) && (
              <Badge className="bg-accent/20 text-accent hover:bg-accent/30">
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
            <div className={`bg-muted/50 rounded-lg p-4 ${!canAccess ? 'filter blur-sm' : ''}`}>
              <pre className="text-sm text-foreground whitespace-pre-wrap font-mono max-h-64 overflow-y-auto">
                {prompt.content}
              </pre>
            </div>
          ) : (
            <div className="bg-muted/30 rounded-lg p-4 border-2 border-dashed border-muted-foreground/20">
              <div className="text-center py-4">
                <Eye className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-3">
                  Prompt matnini ko'rish uchun bosing
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowContent(true)}
                  disabled={!canAccess}
                >
                  {canAccess ? 'Promptni ko\'rish' : 'Premium kerak'}
                </Button>
              </div>
            </div>
          )}

          {!canAccess && showContent && (
            <div className="absolute inset-0 bg-black/10 rounded-lg flex items-center justify-center">
              <div className="bg-background dark:bg-gray-900 rounded-lg p-4 text-center shadow-lg">
                <Lock className="w-8 h-8 text-accent mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground mb-2">Premium prompt</p>
                <p className="text-xs text-muted-foreground mb-3">
                  Bu promptni ko'rish uchun Premium obuna kerak
                </p>
                <Link href="/atmos-payment">
                  <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                    <Crown className="w-3 h-3 mr-1" />
                    Premium olish
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {canAccess && showContent && (
            <div className="flex justify-between items-center mt-4">
              <span className="text-xs text-muted-foreground">
                {new Date(prompt.createdAt).toLocaleDateString('uz-UZ')}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowContent(false)}
                >
                  Yashirish
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                  className="gap-2"
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