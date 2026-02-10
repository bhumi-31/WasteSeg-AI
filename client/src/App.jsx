import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { Header } from "./components/Header";
import { BottomNav } from "./components/BottomNav";
import { initializeData } from "./lib/storage";
import Landing from "./pages/Landing";
import Scan from "./pages/Scan";
import Result from "./pages/Result";
import History from "./pages/History";
import Stats from "./pages/Stats";
import FindCenters from "./pages/FindCenters";
import Leaderboard from "./pages/Leaderboard";
import Challenges from "./pages/Challenges";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppContent() {
  const location = useLocation();
  
  useEffect(() => {
    // Initialize and sync data from database on app load
    initializeData().then(result => {
      if (result.synced) {
        console.log('[App] Data synced successfully');
      } else {
        console.log('[App] Using local data (offline mode)');
      }
    });
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-[#0a1f1a] via-[#0f2f26] to-[#0a1f1a] min-h-screen">
      <Header />
      <main className="flex-1 pb-20 sm:pb-0">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/scan" element={<Scan />} />
          <Route path="/result" element={<Result />} />
          <Route path="/history" element={<History />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/find" element={<FindCenters />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/challenges" element={<Challenges />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
