import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import Home from "@/pages/home";
import ProtocolDetail from "@/pages/protocol-detail";
import Admin from "@/pages/admin";
import AuthPage from "@/pages/auth";
import EmailConfirmPage from "@/pages/email-confirm";
import NotFound from "@/pages/not-found";
import Onboarding from "@/pages/onboarding";
import PaymentPage from "@/pages/payment";
import LandingPage from "@/pages/landing";
import LandingSimple from "@/pages/landing-simple";

function AppContent() {
  const { isAuthenticated, loading } = useAuth();

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-gray-600">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/landing" component={LandingPage} />
      <Route path="/test" component={LandingSimple} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/auth/confirm" component={EmailConfirmPage} />
      <Route path="/">
        {isAuthenticated ? <Home /> : <AuthPage />}
      </Route>
      <Route path="/protocols/:id">
        {isAuthenticated ? <ProtocolDetail /> : <AuthPage />}
      </Route>
      <Route path="/admin">
        {isAuthenticated ? <Admin /> : <AuthPage />}
      </Route>
      <Route path="/onboarding">
        {isAuthenticated ? <Onboarding /> : <AuthPage />}
      </Route>
      <Route path="/payment">
        {isAuthenticated ? <PaymentPage /> : <AuthPage />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <AppContent />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
