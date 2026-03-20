import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ReactNode } from "react";
import Index from "./pages/Index";
import Watchlist from "./pages/Watchlist";
import Portfolio from "./pages/Portfolio";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import MarketOverview from "./pages/MarketOverview";
import TechnicalAnalysis from "./pages/TechnicalAnalysis";
import SectorCounter from "./pages/SectorCounter";
import News from "./pages/News";
import FinancialSnapshot from "./pages/FinancialSnapshot";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Redirect authenticated users away from auth pages
function PublicRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  return isAuthenticated ? <Navigate to="/" replace /> : <>{children}</>;
}

// Redirect unauthenticated users to /login
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public auth routes */}
            <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

            {/* Protected dashboard routes */}
            <Route path="/"                  element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/watchlist"          element={<ProtectedRoute><Watchlist /></ProtectedRoute>} />
            <Route path="/portfolio"          element={<ProtectedRoute><Portfolio /></ProtectedRoute>} />
            <Route path="/analytics"          element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/market-overview"    element={<ProtectedRoute><MarketOverview /></ProtectedRoute>} />
            <Route path="/technical-analysis" element={<ProtectedRoute><TechnicalAnalysis /></ProtectedRoute>} />
            <Route path="/sectors"            element={<ProtectedRoute><SectorCounter /></ProtectedRoute>} />
            <Route path="/news"               element={<ProtectedRoute><News /></ProtectedRoute>} />
            <Route path="/financials"         element={<ProtectedRoute><FinancialSnapshot /></ProtectedRoute>} />
            <Route path="/settings"           element={<ProtectedRoute><Settings /></ProtectedRoute>} />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
