import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import Landing from '@/pages/Landing';
import Scan from '@/pages/Scan';
import Result from '@/pages/Result';
import History from '@/pages/History';
import Stats from '@/pages/Stats';
import FindCenters from '@/pages/FindCenters';
import Leaderboard from '@/pages/Leaderboard';
import Challenges from '@/pages/Challenges';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient();

/**
 * ProtectedRoute — Redirects to /login if not authenticated
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

/**
 * GuestRoute — Redirects to /scan if already authenticated
 */
function GuestRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/scan" replace />;
  }

  return children;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-background text-foreground">
              <Header />
              <main className="pt-20 pb-20 sm:pb-8">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Landing />} />
                  <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
                  <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
                  <Route path="/leaderboard" element={<Leaderboard />} />

                  {/* Protected Routes */}
                  <Route path="/scan" element={<ProtectedRoute><Scan /></ProtectedRoute>} />
                  <Route path="/result" element={<ProtectedRoute><Result /></ProtectedRoute>} />
                  <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
                  <Route path="/stats" element={<ProtectedRoute><Stats /></ProtectedRoute>} />
                  <Route path="/find" element={<ProtectedRoute><FindCenters /></ProtectedRoute>} />
                  <Route path="/challenges" element={<ProtectedRoute><Challenges /></ProtectedRoute>} />

                  {/* Fallback */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <BottomNav />
              <Toaster richColors position="top-center" />
            </div>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
