import { Link, useLocation } from 'react-router-dom';
import { Home, Camera, MapPin, Trophy, User } from 'lucide-react';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/find', icon: MapPin, label: 'Find' },
  { to: '/scan', icon: Camera, label: 'Scan', isMain: true },
  { to: '/leaderboard', icon: Trophy, label: 'Ranks' },
  { to: '/stats', icon: User, label: 'Profile' },
];

export function BottomNav() {
  const location = useLocation();
  
  // Hide on camera/scan active view
  if (location.pathname === '/scan' && location.state?.cameraActive) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 sm:hidden">
      {/* Blur background */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-xl border-t border-border/50" />
      
      {/* Safe area padding for iPhone */}
      <div className="relative flex items-center justify-around px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          const Icon = item.icon;
          
          if (item.isMain) {
            // Center scan button - prominent
            return (
              <Link
                key={item.to}
                to={item.to}
                className="relative -mt-6"
              >
                <div className={`
                  flex h-14 w-14 items-center justify-center rounded-full 
                  bg-gradient-to-br from-emerald-400 to-emerald-600
                  shadow-lg shadow-emerald-500/30
                  active:scale-95 transition-transform
                `}>
                  <Icon className="h-6 w-6 text-white" strokeWidth={2.5} />
                </div>
                <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-medium text-emerald-500">
                  {item.label}
                </span>
              </Link>
            );
          }
          
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`
                flex flex-col items-center gap-1 px-3 py-1 rounded-xl
                transition-colors
                ${isActive 
                  ? 'text-emerald-500' 
                  : 'text-muted-foreground active:text-foreground'
                }
              `}
            >
              <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.label}</span>
              {isActive && (
                <div className="absolute top-0 w-8 h-0.5 bg-emerald-500 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
