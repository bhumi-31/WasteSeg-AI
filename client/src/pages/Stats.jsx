import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, Leaf, Recycle, AlertTriangle, Flame, Trophy, 
  Target, BarChart3, ArrowRight, Sprout, TreePine, Globe, Zap, Gem, Check
} from 'lucide-react';
import { getStats, getBadges, getBadgeDefinitions, getWeeklyProgress, fetchStatsFromDb } from '../lib/storage';

// Map icon names to Lucide components
const BADGE_ICONS = {
  Sprout, Leaf, TreePine, Globe, Flame, Zap, Gem, Recycle, AlertTriangle
};

export default function Stats() {
  const [stats, setStats] = useState(null);
  const [badges, setBadges] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const badgeDefinitions = getBadgeDefinitions();

  useEffect(() => {
    // First load from localStorage (instant)
    setStats(getStats());
    setBadges(getBadges());
    setWeeklyData(getWeeklyProgress());
    
    // Then fetch from database (async update)
    async function loadFromDb() {
      try {
        const dbStats = await fetchStatsFromDb();
        if (dbStats && dbStats.totalScans > 0) {
          setStats(dbStats);
          if (dbStats.badges) setBadges(dbStats.badges);
        }
      } catch (error) {
        console.log('Using localStorage stats');
      }
    }
    loadFromDb();
  }, []);

  if (!stats) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center pt-24">
        <div className="animate-pulse text-white/60">Loading stats...</div>
      </div>
    );
  }

  const categoryData = [
    { 
      name: 'Recyclable', 
      value: stats.categoryBreakdown.recyclable, 
      color: 'bg-[hsl(var(--recyclable))]',
      icon: Recycle,
      textColor: 'text-[hsl(var(--recyclable))]'
    },
    { 
      name: 'Organic', 
      value: stats.categoryBreakdown.organic, 
      color: 'bg-[hsl(var(--organic))]',
      icon: Leaf,
      textColor: 'text-[hsl(var(--organic))]'
    },
    { 
      name: 'Hazardous', 
      value: stats.categoryBreakdown.hazardous, 
      color: 'bg-[hsl(var(--hazardous))]',
      icon: AlertTriangle,
      textColor: 'text-[hsl(var(--hazardous))]'
    },
  ];

  const totalCategoryScans = categoryData.reduce((a, b) => a + b.value, 0);
  const maxWeeklyScans = Math.max(...weeklyData.map(w => w.scans), 1);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 pt-24 sm:px-6 sm:pt-28">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold text-white sm:text-3xl">
          Your Impact Dashboard
        </h1>
        <p className="mt-2 text-white/60">
          Track your environmental contributions
        </p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          icon={Target}
          label="Total Scans"
          value={stats.totalScans}
          color="bg-primary/10 text-primary"
        />
        <StatCard 
          icon={Trophy}
          label="Total Points"
          value={stats.totalPoints}
          color="bg-accent/10 text-accent"
        />
        <StatCard 
          icon={Flame}
          label="Current Streak"
          value={`${stats.currentStreak} days`}
          color="bg-[hsl(var(--hazardous-light))] text-[hsl(var(--hazardous))]"
        />
        <StatCard 
          icon={Leaf}
          label="CO₂ Saved"
          value={`${stats.co2Saved.toFixed(1)} kg`}
          color="bg-[hsl(var(--organic-light))] text-[hsl(var(--organic))]"
        />
      </div>

      {/* Category Breakdown */}
      <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="mb-4 flex items-center gap-2 font-heading text-lg font-semibold text-white">
          <BarChart3 className="h-5 w-5 text-emerald-400" />
          Category Breakdown
        </h2>
        
        {totalCategoryScans === 0 ? (
          <div className="py-8 text-center text-white/60">
            <p>No scans yet. Start scanning to see your breakdown!</p>
            <Link 
              to="/scan"
              className="mt-4 inline-flex items-center gap-2 text-emerald-400 hover:underline"
            >
              Start Scanning <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {categoryData.map((cat) => (
              <div key={cat.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <cat.icon className={`h-4 w-4 ${cat.textColor}`} />
                    <span className="font-medium text-white">{cat.name}</span>
                  </div>
                  <span className="text-white/60">
                    {cat.value} ({totalCategoryScans > 0 ? Math.round((cat.value / totalCategoryScans) * 100) : 0}%)
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-white/10">
                  <div 
                    className={`h-full ${cat.color} transition-all duration-500`}
                    style={{ width: `${totalCategoryScans > 0 ? (cat.value / totalCategoryScans) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Weekly Progress */}
      <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="mb-4 flex items-center gap-2 font-heading text-lg font-semibold text-white">
          <TrendingUp className="h-5 w-5 text-emerald-400" />
          Weekly Progress
        </h2>
        
        <div className="flex h-40 items-end gap-2">
          {weeklyData.map((week, index) => (
            <div key={week.week} className="flex flex-1 flex-col items-center gap-2">
              <div 
                className="w-full rounded-t-lg bg-emerald-500/80 transition-all duration-300 hover:bg-emerald-500"
                style={{ 
                  height: `${maxWeeklyScans > 0 ? (week.scans / maxWeeklyScans) * 100 : 0}%`,
                  minHeight: week.scans > 0 ? '8px' : '2px'
                }}
              />
              <span className="text-[10px] text-white/50">
                W{index + 1}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-xs text-white/50">
          Last 8 weeks activity
        </p>
      </div>

      {/* Badges Section */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="mb-4 flex items-center gap-2 font-heading text-lg font-semibold text-white">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Achievements
        </h2>
        
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(badgeDefinitions).map(([key, badge]) => {
            const earned = badges.includes(key);
            const IconComponent = BADGE_ICONS[badge.iconName] || Leaf;
            return (
              <div 
                key={key}
                className={`flex items-center gap-3 rounded-xl border p-3 transition-all ${
                  earned 
                    ? 'border-emerald-500/30 bg-emerald-500/10' 
                    : 'border-white/10 bg-white/5 opacity-50'
                }`}
              >
                <div className={`p-2 rounded-lg ${earned ? 'bg-emerald-500/20' : 'bg-white/10'}`}>
                  <IconComponent className={`h-5 w-5 ${earned ? 'text-emerald-400' : 'text-white/40'}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-medium ${earned ? 'text-white' : 'text-white/50'}`}>
                    {badge.name}
                  </p>
                  <p className="truncate text-xs text-white/50">
                    {badge.description}
                  </p>
                </div>
                {earned && (
                  <Check className="h-5 w-5 text-emerald-400" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Longest Streak */}
      {stats.longestStreak > 0 && (
        <div className="mt-6 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 p-4 text-white">
          <div className="flex items-center gap-3">
            <Flame className="h-8 w-8" />
            <div>
              <p className="text-sm opacity-90">Longest Streak</p>
              <p className="text-2xl font-bold">{stats.longestStreak} days</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 lift-card">
      <div className={`mb-3 inline-flex rounded-xl p-2.5 ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-sm text-white/60">{label}</p>
    </div>
  );
}
