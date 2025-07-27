import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { ThemeProvider } from "@/contexts/theme-context";
import { ProgressProvider } from "@/contexts/progress-context";
import { ProtocolsProvider } from "@/contexts/protocols-context";
import { lazy, Suspense, useEffect } from "react";

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
import MaintenancePage from "@/pages/maintenance";

// Dynamic imports for authenticated pages - ensures they're included in build
const Home = lazy(() => import("@/pages/home"));
const ProtocolDetail = lazy(() => import("@/pages/protocol-detail"));
const Admin = lazy(() => import("@/pages/admin"));
// Onboarding now redirects to knowledge-base
const KnowledgeBase = lazy(() => import("@/pages/knowledge-base"));
const AtmosPayment = lazy(() => import("@/pages/atmos-payment"));
const Payment = lazy(() => import("@/pages/payment"));
const PaymentProcessing = lazy(() => import("@/pages/payment-processing"));
const PaymentSuccess = lazy(() => import("@/pages/payment-success"));
const PaymentFailed = lazy(() => import("@/pages/payment-failed"));
const PaymentCrossBrowserHelp = lazy(() => import("@/pages/payment-cross-browser-help"));
const PremiumPrompts = lazy(() => import("@/pages/premium-prompts"));
const Profile = lazy(() => import("@/pages/profile"));

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

  // TEMPORARY: Enable maintenance mode
  const MAINTENANCE_MODE = false;
  const MAINTENANCE_ALLOWED_PATHS = ['/admin', '/auth/callback'];
  const MAINTENANCE_ALLOWED_EMAILS = ['hurshidbey@gmail.com', 'mustafaabdurahmonov7777@gmail.com'];
  
  // Check if current path is allowed during maintenance
  const currentPath = window.location.pathname;
  const isAllowedPath = MAINTENANCE_ALLOWED_PATHS.some(path => currentPath.startsWith(path));
  const isAllowedUser = user?.email && MAINTENANCE_ALLOWED_EMAILS.includes(user.email);
  
  // Show maintenance page unless user/path is allowed
  if (MAINTENANCE_MODE && !isAllowedPath && !isAllowedUser) {
    return <MaintenancePage />;
  }

  // Check if current user is admin
  const isAdmin = user?.email === 'hurshidbey@gmail.com' || user?.email === 'mustafaabdurahmonov7777@gmail.com';
  
  // Check user tier for premium content access
  const userTier = user?.tier || 'free';
  const isPremiumUser = userTier === 'paid' || isAdmin;
  
  // Show loading while checking auth OR if authenticated but user data not loaded yet
  if (loading || (isAuthenticated && !user)) {
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
        {isAuthenticated && isAdmin ? (
          <Suspense fallback={<PageLoader />}>
            <Admin />
          </Suspense>
        ) : (
          <AuthPage />
        )}
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
      
      <Route path="/payment">
        <Suspense fallback={<PageLoader />}>
          <Payment />
        </Suspense>
      </Route>
      
      <Route path="/payment/processing">
        <Suspense fallback={<PageLoader />}>
          <PaymentProcessing />
        </Suspense>
      </Route>
      
      <Route path="/payment/success">
        <Suspense fallback={<PageLoader />}>
          <PaymentSuccess />
        </Suspense>
      </Route>
      
      <Route path="/payment/cross-browser-help">
        <Suspense fallback={<PageLoader />}>
          <PaymentCrossBrowserHelp />
        </Suspense>
      </Route>
      
      <Route path="/payment/failed">
        <Suspense fallback={<PageLoader />}>
          <PaymentFailed />
        </Suspense>
      </Route>
      
      <Route path="/profile">
        {isAuthenticated ? (
          <Suspense fallback={<PageLoader />}>
            <Profile />
          </Suspense>
        ) : (
          <AuthPage />
        )}
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
  // Cache refresh logic
  useEffect(() => {
    const STORAGE_KEY = 'protokol57-version';
    const CURRENT_VERSION = 'v2025-01-20-atmos-fix';
    
    // Get stored version
    const storedVersion = localStorage.getItem(STORAGE_KEY);
    
    // If version doesn't match, clear everything and reload
    if (storedVersion !== CURRENT_VERSION) {
      
      // Clear all caches
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => {
            caches.delete(name);
          });
        });
      }
      
      // Clear sessionStorage
      sessionStorage.clear();
      
      // Set new version
      localStorage.setItem(STORAGE_KEY, CURRENT_VERSION);
      
      // Force reload with cache bypass
      window.location.reload();
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ProgressProvider>
          <ProtocolsProvider>
            <ThemeProvider>
              <TooltipProvider>
                <Toaster />
                <AppContent />
              </TooltipProvider>
            </ThemeProvider>
          </ProtocolsProvider>
        </ProgressProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;