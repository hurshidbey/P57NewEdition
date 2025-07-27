import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/auth-context";
import { useUserTier } from "@/hooks/use-user-tier";
import { Crown, Star, FileText, BookOpen, LogOut, Home } from "lucide-react";

export default function AppHeader() {
  const { user, signOut, isAuthenticated, refreshUser } = useAuth();
  const { tier, getTierStatus } = useUserTier();
  const [, setLocation] = useLocation();
  
  // Check if current user is admin
  const isAdmin = user?.email === 'hurshidbey@gmail.com' || user?.email === 'mustafaabdurahmonov7777@gmail.com';
  
  const tierStatus = getTierStatus();
  
  const handleSignOut = async () => {
    await signOut();
    // Redirect to auth page after logout
    setLocation('/auth');
  };

  // If authenticated but no user data, try to refresh
  useEffect(() => {
    if (isAuthenticated && !user) {
      console.log('[AppHeader] Authenticated but no user data, refreshing...');
      refreshUser();
    }
  }, [isAuthenticated, user, refreshUser]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <header className="border-b border-theme bg-background sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          <div className="flex items-center">
            <Link href="/">
              <img 
                src="https://bazptglwzqstppwlvmvb.supabase.co/storage/v1/object/public/assets/protokol57-logo.svg" 
                alt="Protokol 57 Logo" 
                className="h-7 sm:h-8 w-auto transition-transform hover:scale-105 cursor-pointer"
              />
            </Link>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
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
            
            {/* Protokollar - Home link */}
            <Link href="/">
              <Button 
                variant="ghost" 
                className="text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground min-h-[44px] min-w-[44px] px-2 sm:px-3 touch-manipulation"
                title="Protokollar"
              >
                <Home className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Protokollar</span>
              </Button>
            </Link>
            
            {/* O'rganish - Show for all users */}
            <Link href="/knowledge-base">
              <Button 
                variant="ghost" 
                className="text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground min-h-[44px] min-w-[44px] px-2 sm:px-3 touch-manipulation"
              >
                <BookOpen className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">O'rganish</span>
              </Button>
            </Link>
            
            <Link href="/premium-prompts">
              <Button 
                variant="ghost" 
                className="text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground min-h-[44px] min-w-[44px] px-2 sm:px-3 touch-manipulation"
                title="Promptlar"
              >
                <FileText className="w-4 h-4 sm:mr-1" />
                <span className="hidden sm:inline">Promptlar</span>
              </Button>
            </Link>
            
            {/* Upgrade button for free tier only */}
            {tier === 'free' && (
              <Link href="/payment">
                <Button 
                  variant="default" 
                  size="sm"
                  className="bg-accent hover:bg-accent/90 text-accent-foreground text-xs sm:text-sm font-medium min-h-[44px] min-w-[44px] px-3 sm:px-4 touch-manipulation"
                  title="Premium upgrade"
                >
                  <Crown className="w-4 h-4 sm:mr-1" />
                  <span className="hidden sm:inline">Upgrade</span>
                </Button>
              </Link>
            )}
            {isAdmin && (
              <Link href="/admin">
                <Button 
                  variant="ghost" 
                  className="hidden sm:flex text-sm font-medium text-muted-foreground hover:text-foreground min-h-[44px] min-w-[44px] px-3 touch-manipulation"
                >
                  Boshqaruv
                </Button>
              </Link>
            )}
            <Button 
              variant="ghost" 
              className="text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground min-h-[44px] min-w-[44px] px-2 sm:px-3 touch-manipulation"
              onClick={handleSignOut}
              title="Chiqish"
            >
              <LogOut className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Chiqish</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
