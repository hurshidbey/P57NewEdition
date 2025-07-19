import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { ThemeProvider } from "@/contexts/theme-context";
import { lazy, Suspense } from "react";

// Static imports for non-authenticated pages
import AuthPage from "@/pages/auth";
import EmailConfirmPage from "@/pages/email-confirm";
import AuthCallback from "@/pages/auth-callback";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";
import LandingSimple from "@/pages/landing-simple";
import LandingConversion from "@/pages/landing-conversion";
import LandingTildaNew from "@/pages/landing-tilda-new";
import TermsOfService from "@/pages/terms-of-service";

// Dynamic imports for authenticated pages - ensures they're included in build
const Home = lazy(() => import("@/pages/home"));
const ProtocolDetail = lazy(() => import("@/pages/protocol-detail"));
const Admin = lazy(() => import("@/pages/admin"));
// Onboarding now redirects to knowledge-base
const KnowledgeBase = lazy(() => import("@/pages/knowledge-base"));
const AtmosPayment = lazy(() => import("@/pages/atmos-payment"));
const PremiumPrompts = lazy(() => import("@/pages/premium-prompts"));

// Loading component for Suspense
function PageLoader() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
        <p className="text-muted-foreground">Yuklanmoqda...</p>
      </div>
    </div>
  );
}

function AppContent() {
  const { isAuthenticated, loading, user } = useAuth();

  // Check if current user is admin
  const isAdmin = user?.email === 'hurshidbey@gmail.com' || user?.email === 'mustafaabdurahmonov7777@gmail.com';
  
  // Check user tier for premium content access
  const userTier = user?.tier || 'free';
  const isPremiumUser = userTier === 'paid' || isAdmin;
  
  // Debug logging
  console.log('[AppContent] Auth state:', { 
    isAuthenticated, 
    loading, 
    userEmail: user?.email,
    isAdmin,
    user
  });
  
  // Show loading while checking auth OR if authenticated but user data not loaded yet
  if (loading || (isAuthenticated && !user)) {
    console.log('[AppContent] Waiting for user data to load...');
    return <PageLoader />;
  }

  return (
    <Switch>
      {/* Non-authenticated routes - static imports */}
      <Route path="/landing" component={LandingPage} />
      <Route path="/landing-conversion" component={LandingConversion} />
      <Route path="/landing-tilda" component={LandingTildaNew} />
      <Route path="/test" component={LandingSimple} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/auth/confirm" component={EmailConfirmPage} />
      <Route path="/auth/callback" component={AuthCallback} />
      <Route path="/terms" component={TermsOfService} />
      <Route path="/oferta" component={TermsOfService} />
      
      {/* Authenticated routes - dynamic imports with Suspense */}
      <Route path="/protocols/:id">
        {isAuthenticated ? (
          <Suspense fallback={<PageLoader />}>
            <ProtocolDetail />
          </Suspense>
        ) : (
          <AuthPage />
        )}
      </Route>
      
      <Route path="/admin">
        {(() => {
          console.log('[Admin Route Check]', {
            path: '/admin',
            isAuthenticated,
            isAdmin,
            userEmail: user?.email,
            shouldShowAdmin: isAuthenticated && isAdmin
          });
          
          if (isAuthenticated && isAdmin) {
            return (
              <Suspense fallback={<PageLoader />}>
                <Admin />
              </Suspense>
            );
          } else {
            console.log('[Admin Route] Access denied, showing AuthPage');
            return <AuthPage />;
          }
        })()}
      </Route>
      
      <Route path="/onboarding">
        {isAuthenticated ? (
          <Redirect to="/knowledge-base" />
        ) : (
          <AuthPage />
        )}
      </Route>
      
      <Route path="/knowledge-base">
        {isAuthenticated ? (
          <Suspense fallback={<PageLoader />}>
            <KnowledgeBase />
          </Suspense>
        ) : (
          <AuthPage />
        )}
      </Route>
      
      <Route path="/premium-prompts">
        {isAuthenticated ? (
          <Suspense fallback={<PageLoader />}>
            <PremiumPrompts />
          </Suspense>
        ) : (
          <AuthPage />
        )}
      </Route>
      
      <Route path="/prompts">
        {isAuthenticated ? (
          <Suspense fallback={<PageLoader />}>
            <PremiumPrompts />
          </Suspense>
        ) : (
          <AuthPage />
        )}
      </Route>
      
      <Route path="/atmos-payment">
        <Suspense fallback={<PageLoader />}>
          <AtmosPayment />
        </Suspense>
      </Route>
      
      <Route path="/">
        {isAuthenticated ? (
          <Suspense fallback={<PageLoader />}>
            <Home />
          </Suspense>
        ) : (
          <AuthPage />
        )}
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
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