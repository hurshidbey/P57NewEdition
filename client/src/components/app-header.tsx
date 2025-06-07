import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";

export default function AppHeader() {
  const { user, signOut, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <h1 className="text-2xl font-black text-black cursor-pointer">Protokol 57</h1>
            </Link>
            <span className="text-sm text-gray-600 hidden sm:block">AI Protokollarini O'rganish</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 hidden sm:block">
              Salom, {user?.name || user?.email}
            </span>
            <Link href="/onboarding">
              <Button 
                variant="ghost" 
                className="text-sm font-medium text-gray-700 hover:text-accent"
              >
                O'rganish
              </Button>
            </Link>
            <Link href="/admin">
              <Button 
                variant="ghost" 
                className="text-sm font-medium text-gray-700 hover:text-accent"
              >
                Boshqaruv
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              className="text-sm font-medium text-gray-700 hover:text-accent"
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
