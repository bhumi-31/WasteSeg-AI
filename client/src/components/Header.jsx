import { Link, useLocation } from 'react-router-dom';
import { Leaf, Menu, X, Camera, LogOut, LogIn } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();

  const links = [
    { to: '/scan', label: 'Scan', protected: true },
    { to: '/challenges', label: 'Challenges', protected: true },
    { to: '/leaderboard', label: 'Leaderboard', protected: false },
    { to: '/stats', label: 'Stats', protected: true },
    { to: '/find', label: 'Find', protected: true },
    { to: '/history', label: 'History', protected: true },
  ];

  // Only show protected links if authenticated
  const visibleLinks = links.filter(link => !link.protected || isAuthenticated);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-4 safe-area-top">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between rounded-2xl bg-black/30 backdrop-blur-xl border border-white/10 px-4 sm:px-6 py-3">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 font-heading text-lg font-bold text-white">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500">
              <Leaf className="h-5 w-5 text-white" />
            </div>
            <span className="hidden sm:inline">WasteSeg AI</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {visibleLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isActive(link.to)
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side buttons */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Link
                  to="/scan"
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-medium text-sm rounded-xl transition-colors"
                >
                  <Camera className="w-4 h-4" />
                  <span className="hidden sm:inline">Scan Now</span>
                </Link>

                {/* User info + Logout (desktop) */}
                <div className="hidden md:flex items-center gap-2">
                  <span className="text-sm text-white/70 max-w-[100px] truncate">
                    {user?.name}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-medium text-sm rounded-xl transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            )}

            {/* Mobile toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="rounded-lg p-2 text-white/70 hover:text-white hover:bg-white/10 md:hidden"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {menuOpen && (
          <nav className="mt-2 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 p-3 md:hidden animate-fade-in">
            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className={`block rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${isActive('/')
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
            >
              Home
            </Link>
            {visibleLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={`block rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${isActive(link.to)
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Mobile auth actions */}
            <div className="mt-2 pt-2 border-t border-white/10">
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full rounded-lg px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout ({user?.name})
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-lg px-4 py-2.5 text-sm font-medium text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-lg px-4 py-2.5 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    Create Account
                  </Link>
                </>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
