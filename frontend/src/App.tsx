import { lazy, Suspense, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

// ─── Eager-loaded (critical path) ────────────────────────────────────────────
import Index    from "./pages/Index";
import Login    from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

// ─── Lazy-loaded (heavy routes) ───────────────────────────────────────────────
const Watchlist         = lazy(() => import("./pages/Watchlist"));
const Portfolio         = lazy(() => import("./pages/Portfolio"));
const Analytics         = lazy(() => import("./pages/Analytics"));
const MarketOverview    = lazy(() => import("./pages/MarketOverview"));
const TechnicalAnalysis = lazy(() => import("./pages/TechnicalAnalysis"));
const SectorCounter     = lazy(() => import("./pages/SectorCounter"));
const News              = lazy(() => import("./pages/News"));
const FinancialSnapshot = lazy(() => import("./pages/FinancialSnapshot"));
const Settings          = lazy(() => import("./pages/Settings"));

// ─── Query client ─────────────────────────────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// ─── Route skeleton (shown during lazy-load suspension) ───────────────────────
function PageSkeleton() {
  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header placeholder */}
      <div className="h-14 border-b border-border/15 flex items-center px-6 gap-4">
        <Skeleton className="h-5 w-32 bg-secondary/30 rounded" />
        <Skeleton className="h-5 w-20 bg-secondary/20 rounded ml-auto" />
      </div>
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar placeholder */}
        <div className="w-56 border-r border-border/15 p-4 space-y-2 hidden md:block">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-8 rounded-lg bg-secondary/20" />
          ))}
        </div>
        {/* Content placeholder */}
        <div className="flex-1 p-6 space-y-4 overflow-auto">
          <Skeleton className="h-8 w-48 bg-secondary/30 rounded" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl bg-secondary/20" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-xl bg-secondary/15" />
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <Skeleton className="h-48 rounded-xl bg-secondary/15" />
            <Skeleton className="h-48 rounded-xl bg-secondary/15" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Auth guards ──────────────────────────────────────────────────────────────

/** Redirects authenticated users away from login/register. */
function PublicRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <PageSkeleton />;
  return isAuthenticated ? <Navigate to="/" replace /> : <>{children}</>;
}

/** Redirects unauthenticated users to /login — fires BEFORE data fetches. */
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <PageSkeleton />;
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

// ─── App ──────────────────────────────────────────────────────────────────────

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<PageSkeleton />}>
            <Routes>
              {/* Public auth routes */}
              <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

              {/* Protected — critical path (eager) */}
              <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />

              {/* Protected — lazy loaded */}
              <Route path="/watchlist"          element={<ProtectedRoute><Watchlist /></ProtectedRoute>} />
              <Route path="/portfolio"          element={<ProtectedRoute><Portfolio /></ProtectedRoute>} />
              <Route path="/analytics"          element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
              <Route path="/market-overview"    element={<ProtectedRoute><MarketOverview /></ProtectedRoute>} />
              <Route path="/technical-analysis" element={<ProtectedRoute><TechnicalAnalysis /></ProtectedRoute>} />
              <Route path="/sectors"            element={<ProtectedRoute><SectorCounter /></ProtectedRoute>} />
              <Route path="/news"               element={<ProtectedRoute><News /></ProtectedRoute>} />
              <Route path="/financials"         element={<ProtectedRoute><FinancialSnapshot /></ProtectedRoute>} />
              <Route path="/settings"           element={<ProtectedRoute><Settings /></ProtectedRoute>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
