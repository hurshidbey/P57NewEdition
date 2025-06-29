import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/auth-context";
import { useUserTier } from "@/hooks/use-user-tier";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Crown, Star, FileText } from "lucide-react";

export default function AppHeader() {
  const { user, signOut, isAuthenticated } = useAuth();
  const { tier, getTierStatus } = useUserTier();
  
  // Check if current user is admin
  const isAdmin = user?.email === 'hurshidbey@gmail.com' || user?.email === 'mustafaabdurahmonov7777@gmail.com';
  
  const tierStatus = getTierStatus();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <header className="border-b border-border bg-background sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <img 
                src="https://bazptglwzqstppwlvmvb.supabase.co/storage/v1/object/public/assets/protokol57-logo.svg" 
                alt="Protokol 57 Logo" 
                className="h-8 w-auto transition-transform hover:scale-105 cursor-pointer"
              />
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {/* User greeting and tier badge - only show premium badge for premium users */}
            <div className="hidden sm:flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                Salom, {user?.name || user?.email}
              </span>
              {tier === 'paid' && (
                <Badge className={`${tierStatus.color} text-xs font-medium`}>
                  <Crown className="w-3 h-3 mr-1" /> {tierStatus.displayName}
                </Badge>
              )}
            </div>
            
            <Link href="/onboarding">
              <Button 
                variant="ghost" 
                className="text-sm font-medium text-muted-foreground hover:text-foreground min-h-[44px] px-3 touch-manipulation"
              >
                O'rganish
              </Button>
            </Link>
            
            <Link href="/premium-prompts">
              <Button 
                variant="ghost" 
                className="text-sm font-medium text-muted-foreground hover:text-foreground min-h-[44px] px-3 touch-manipulation"
              >
                <FileText className="w-4 h-4 mr-1" />
                Promptlar
              </Button>
            </Link>
            
            {/* Upgrade button for free tier only */}
            {tier === 'free' && (
              <Link href="/atmos-payment">
                <Button 
                  variant="default" 
                  size="sm"
                  className="bg-accent hover:bg-accent/90 text-accent-foreground text-sm font-medium min-h-[44px] px-4 touch-manipulation"
                >
                  <Crown className="w-3 h-3 mr-1" />
                  Upgrade
                </Button>
              </Link>
            )}
            {isAdmin && (
              <Link href="/admin">
                <Button 
                  variant="ghost" 
                  className="text-sm font-medium text-muted-foreground hover:text-foreground min-h-[44px] px-3 touch-manipulation"
                >
                  Boshqaruv
                </Button>
              </Link>
            )}
            <ThemeToggle />
            <Button 
              variant="ghost" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground min-h-[44px] px-3 touch-manipulation"
              onClick={signOut}
            >
              Chiqish
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
