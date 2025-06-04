import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function AppHeader() {
  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <h1 className="text-2xl font-black text-black cursor-pointer">Protokol 57</h1>
            </Link>
            <span className="text-sm text-gray-600 hidden sm:block">AI Protocol Learning</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/admin">
              <Button 
                variant="ghost" 
                className="text-sm font-medium text-gray-700 hover:text-accent"
              >
                Admin
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              className="text-sm font-medium text-gray-700 hover:text-accent"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
