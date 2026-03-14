import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/market-overview" element={<MarketOverview />} />
          <Route path="/technical-analysis" element={<TechnicalAnalysis />} />
          <Route path="/sectors" element={<SectorCounter />} />
          <Route path="/news" element={<News />} />
          <Route path="/financials" element={<FinancialSnapshot />} />
          <Route path="/settings" element={<Settings />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
