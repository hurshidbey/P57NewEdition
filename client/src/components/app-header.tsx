import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function AppHeader() {
  const { user, signOut, isAuthenticated } = useAuth();
  
  // Check if current user is admin
  const isAdmin = user?.email === 'hurshidbey@gmail.com';

  if (!isAuthenticated) {
    return null;
  }

  return (
    <header className="border-b border-border bg-background sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
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
            <span className="text-sm text-muted-foreground hidden sm:block">
              Salom, {user?.name || user?.email}
            </span>
            <Link href="/onboarding">
              <Button 
                variant="ghost" 
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                O'rganish
              </Button>
            </Link>
            <Link href="/payment">
              <Button 
                variant="ghost" 
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Premium
              </Button>
            </Link>
            {isAdmin && (
              <Link href="/admin">
                <Button 
                  variant="ghost" 
                  className="text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  Boshqaruv
                </Button>
              </Link>
            )}
            <ThemeToggle />
            <Button 
              variant="ghost" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
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
