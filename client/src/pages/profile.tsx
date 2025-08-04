import { useAuth } from "@/contexts/auth-context";
import { useUserTier } from "@/hooks/use-user-tier";
import AppHeader from "@/components/app-header";
import AppFooter from "@/components/app-footer";
import ProgressDashboard from "@/components/progress-dashboard";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Calendar, Crown } from "lucide-react";
import { format } from "date-fns";
import { uz } from "date-fns/locale";
import { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load notification section for better initial page load
const NotificationSection = lazy(() => import("@/components/notification-section"));

export default function ProfilePage() {
  const { user } = useAuth();
  const { tier, getTierStatus } = useUserTier();
  const tierStatus = getTierStatus();

  // Format join date - using paidAt as a fallback since createdAt might not be available
  const joinDate = user?.paidAt 
    ? format(new Date(user.paidAt), "d MMMM yyyy", { locale: uz })
    : "Yangi foydalanuvchi";

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page Title */}
        <h1 className="text-3xl font-black uppercase">Mening Profilim</h1>
        
        {/* User Info Card - Brutalist Style */}
        <Card className="border-2 border-black rounded-none shadow-brutal">
          <CardContent className="p-8">
            <div className="flex items-start gap-6">
              {/* Avatar Placeholder */}
              <div className="w-20 h-20 bg-black text-white flex items-center justify-center rounded-none">
                <User className="w-10 h-10" />
              </div>
              
              {/* User Details */}
              <div className="flex-1 space-y-3">
                <div>
                  <h2 className="text-2xl font-black">{user?.name || user?.email?.split('@')[0]}</h2>
                  <p className="text-muted-foreground">{user?.email}</p>
                </div>
                
                <div className="flex items-center gap-4 flex-wrap">
                  {/* Tier Badge */}
                  <Badge className={`${tierStatus.color} text-sm font-bold uppercase rounded-none px-3 py-1`}>
                    {tier === 'paid' && <Crown className="w-4 h-4 mr-1" />}
                    {tierStatus.displayName}
                  </Badge>
                  
                  {/* Member Since - only show if we have a date */}
                  {user?.paidAt && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>A'zo bo'lgan: {joinDate}</span>
                    </div>
                  )}
                </div>
                
                {/* Paid Date if Premium */}
                {tier === 'paid' && user?.paidAt && (
                  <p className="text-sm text-muted-foreground">
                    Premium faollashtirilgan: {format(new Date(user.paidAt), "d MMMM yyyy", { locale: uz })}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Notifications Section */}
        <Suspense fallback={
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        }>
          <NotificationSection />
        </Suspense>
        
        {/* Progress Dashboard - Moved from Home */}
        <div>
          <h2 className="text-2xl font-black uppercase mb-4">O'rganish Jarayoni</h2>
          <ProgressDashboard totalProtocols={57} />
        </div>
      </main>
      
      <AppFooter />
    </div>
  );
}