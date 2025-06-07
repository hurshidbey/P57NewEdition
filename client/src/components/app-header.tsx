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
              <img 
                src="https://bazptglwzqstppwlvmvb.supabase.co/storage/v1/object/public/assets/protokol57-logo.svg" 
                alt="Protokol 57 Logo" 
                className="h-8 w-auto transition-transform hover:scale-105 cursor-pointer"
              />
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 hidden sm:block">
              Salom, {user?.name || user?.email}
            </span>
            <Link href="/onboarding">
              <Button 
                variant="ghost" 
                className="text-sm font-medium text-gray-700 hover:text-white"
              >
                O'rganish
              </Button>
            </Link>
            <Link href="/admin">
              <Button 
                variant="ghost" 
                className="text-sm font-medium text-gray-700 hover:text-white"
              >
                Boshqaruv
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              className="text-sm font-medium text-gray-700 hover:text-white"
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
