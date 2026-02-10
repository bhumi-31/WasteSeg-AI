import { Link, useLocation } from 'react-router-dom';
import { Leaf, Menu, X, Camera } from 'lucide-react';
import { useState } from 'react';

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const links = [
    { to: '/scan', label: 'Scan' },
    { to: '/challenges', label: 'Challenges' },
    { to: '/leaderboard', label: 'Leaderboard' },
    { to: '/stats', label: 'Stats' },
    { to: '/find', label: 'Find' },
    { to: '/history', label: 'History' },
  ];

  const isActive = (path) => location.pathname === path;

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
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive(link.to)
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA Button */}
          <div className="flex items-center gap-2">
            <Link
              to="/scan"
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-medium text-sm rounded-xl transition-colors"
            >
              <Camera className="w-4 h-4" />
              <span className="hidden sm:inline">Scan Now</span>
            </Link>

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
              className={`block rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                isActive('/')
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              Home
            </Link>
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={`block rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                  isActive(link.to)
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
