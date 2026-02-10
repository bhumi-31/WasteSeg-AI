import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Camera, Leaf, Trophy, Loader2 } from 'lucide-react';
import { getScanHistory, getScore, getTotalScans, fetchHistoryFromDb, fetchStatsFromDb } from '@/lib/storage';
import { HistoryCard } from '@/components/HistoryCard';

export default function History() {
  const [history, setHistory] = useState([]);
  const [score, setScore] = useState(0);
  const [totalScans, setTotalScans] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // First load from localStorage (instant)
    setHistory(getScanHistory());
    setScore(getScore());
    setTotalScans(getTotalScans());
    setLoading(false);
    
    // Then fetch from database (async update)
    async function loadFromDb() {
      try {
        const [dbHistory, dbStats] = await Promise.all([
          fetchHistoryFromDb(),
          fetchStatsFromDb()
        ]);
        if (dbHistory) setHistory(dbHistory);
        if (dbStats) {
          setScore(dbStats.totalPoints || 0);
          setTotalScans(dbStats.totalScans || 0);
        }
      } catch (error) {
        console.log('Using localStorage data');
      }
    }
    loadFromDb();
  }, []);

  const progressPercent = Math.min((totalScans / 20) * 100, 100);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 pt-24 sm:py-16 sm:pt-28">
      <h1 className="font-heading text-2xl font-bold text-white sm:text-3xl">Your Impact Dashboard</h1>
      <p className="mt-1 text-sm text-white/60">Track your sustainability journey.</p>

      {/* Gamification */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {/* Score Card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 lift-card">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20">
              <Trophy className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-white/60">Awareness Score</p>
              <p className="font-heading text-2xl font-bold text-white">{score}</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-white/50">+5 points per scan</p>
        </div>

        {/* Contribution Card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 lift-card">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20">
              <Leaf className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-white/60">Items Sorted</p>
              <p className="font-heading text-2xl font-bold text-white">{totalScans}</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-white/50">
            You have helped sort {totalScans} item{totalScans !== 1 ? 's' : ''} correctly!
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-white">Environmental Contribution</p>
          <p className="text-xs text-white/60">{totalScans}/20 scans</p>
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-700"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-white/50">
          {progressPercent >= 100
            ? 'Amazing! You have reached Eco Champion status!'
            : `${20 - totalScans} more scans to reach Eco Champion!`}
        </p>
      </div>

      {/* History */}
      <div className="mt-10">
        <h2 className="font-heading text-lg font-semibold text-white">Scan History</h2>

        {history.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-white/20 bg-white/5 py-12 text-center">
            <Camera className="mx-auto h-10 w-10 text-white/30" />
            <p className="mt-3 text-sm text-white/60">No scans yet. Start by scanning your first item!</p>
            <Link
              to="/scan"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-medium text-black"
            >
              <Camera className="h-4 w-4" />
              Scan Now
            </Link>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {history.map((item) => (
              <HistoryCard key={item.id} result={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
