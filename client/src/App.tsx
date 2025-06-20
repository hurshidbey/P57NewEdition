import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { ThemeProvider } from "@/contexts/theme-context";
import Home from "@/pages/home";
import ProtocolDetail from "@/pages/protocol-detail";
import Admin from "@/pages/admin";
import AuthPage from "@/pages/auth";
import EmailConfirmPage from "@/pages/email-confirm";
import AuthCallback from "@/pages/auth-callback";
import NotFound from "@/pages/not-found";
import Onboarding from "@/pages/onboarding";
import PaymentPage from "@/pages/payment";
import AtmosPayment from "@/pages/atmos-payment";
import LandingPage from "@/pages/landing";
import LandingSimple from "@/pages/landing-simple";
import LandingConversion from "@/pages/landing-conversion";
import LandingTildaNew from "@/pages/landing-tilda-new";

function AppContent() {
  const { isAuthenticated, loading, user } = useAuth();

  // Check if current user is admin
  const isAdmin = user?.email === 'hurshidbey@gmail.com';
  
  // DEBUG: Log current user and admin status
  console.log('🔍 DEBUG ADMIN CHECK:');
  console.log('- User email:', user?.email);
  console.log('- Expected admin email: hurshidbey@gmail.com');
  console.log('- Email match:', user?.email === 'hurshidbey@gmail.com');
  console.log('- isAdmin:', isAdmin);
  console.log('- isAuthenticated:', isAuthenticated);
  console.log('- Should show admin?', isAuthenticated && isAdmin);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/landing" component={LandingPage} />
      <Route path="/landing-conversion" component={LandingConversion} />
      <Route path="/landing-tilda" component={LandingTildaNew} />
      <Route path="/test" component={LandingSimple} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/auth/confirm" component={EmailConfirmPage} />
      <Route path="/auth/callback" component={AuthCallback} />
      <Route path="/protocols/:id">
        {isAuthenticated ? <ProtocolDetail /> : <AuthPage />}
      </Route>
      <Route path="/admin">
        {isAuthenticated && isAdmin ? <Admin /> : <AuthPage />}
      </Route>
      <Route path="/onboarding">
        {isAuthenticated ? <Onboarding /> : <AuthPage />}
      </Route>
      <Route path="/atmos-payment" component={AtmosPayment} />
      <Route path="/payment">
        {isAuthenticated ? <PaymentPage /> : <AuthPage />}
      </Route>
      <Route path="/">
        {isAuthenticated ? <Home /> : <AuthPage />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider defaultTheme="system" storageKey="protokol57-theme">
          <TooltipProvider>
            <Toaster />
            <AppContent />
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
