import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Trophy, Medal, Crown, ArrowLeft, Loader2, 
  TrendingUp, Recycle, Flame, Leaf, Users,
  ChevronUp, Star
} from 'lucide-react';
import { fetchLeaderboard, fetchUserRank, getUserId } from '../lib/api';

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentUserId = getUserId();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [leaders, rank] = await Promise.all([
        fetchLeaderboard(50),
        fetchUserRank()
      ]);
      setLeaderboard(leaders);
      setUserRank(rank);
    } catch (err) {
      setError('Failed to load leaderboard');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-white/60">#{rank}</span>;
    }
  };

  const getRankBackground = (rank) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-500/20 border-yellow-500/30';
      case 2:
        return 'bg-gray-500/20 border-gray-500/30';
      case 3:
        return 'bg-amber-500/20 border-amber-500/30';
      default:
        return 'bg-white/5 border-white/10';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-400 mx-auto mb-4" />
          <p className="text-white/60">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-2xl px-4 py-6 pt-24 pb-24 sm:px-6 sm:pt-28">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link 
            to="/"
            className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-white/60" />
          </Link>
          <div>
            <h1 className="font-heading text-2xl font-bold text-white flex items-center gap-2">
              <Trophy className="h-7 w-7 text-yellow-500" />
              Leaderboard
            </h1>
            <p className="text-sm text-white/60">Top eco warriors this month</p>
          </div>
        </div>

        {/* User Rank Card */}
        {userRank && userRank.rank && (
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl shadow-lg p-5 mb-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-foreground/70 text-sm mb-1">Your Ranking</p>
                <div className="flex items-center gap-3">
                  <span className="text-4xl font-bold font-heading">#{userRank.rank}</span>
                  <div className="text-primary-foreground/70 text-sm">
                    <p>out of {userRank.totalUsers} users</p>
                    {userRank.percentile > 0 && (
                      <p className="flex items-center gap-1">
                        <ChevronUp className="h-4 w-4" />
                        Top {100 - userRank.percentile}%
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="w-16 h-16 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                <TrendingUp className="h-8 w-8" />
              </div>
            </div>
          </div>
        )}

        {/* Top 3 Podium */}
        {leaderboard.length >= 3 && (
          <div className="flex items-end justify-center gap-4 mb-8">
            {/* 2nd Place */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-gray-500/20 flex items-center justify-center mb-2 shadow-lg border border-gray-500/30">
                <span className="text-2xl font-bold text-gray-300">2</span>
              </div>
              <div className="bg-gray-500/20 rounded-t-lg w-20 h-20 flex flex-col items-center justify-center border border-gray-500/30">
                <Medal className="h-5 w-5 text-gray-300 mb-1" />
                <p className="text-xs font-medium text-white text-center px-1 truncate w-full">
                  {leaderboard[1]?.displayName?.split(' ')[2] || 'Player'}
                </p>
                <p className="text-xs text-white/60">{leaderboard[1]?.totalPoints} pts</p>
              </div>
            </div>

            {/* 1st Place */}
            <div className="flex flex-col items-center -mt-4">
              <Crown className="h-8 w-8 text-yellow-500 mb-1" />
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-300 to-amber-400 flex items-center justify-center mb-2 shadow-elevated ring-4 ring-yellow-200 dark:ring-yellow-700">
                <span className="text-3xl font-bold text-yellow-800">1</span>
              </div>
              <div className="bg-gradient-to-b from-yellow-300 to-amber-400 rounded-t-lg w-24 h-28 flex flex-col items-center justify-center">
                <Trophy className="h-6 w-6 text-yellow-700 mb-1" />
                <p className="text-xs font-bold text-yellow-800 text-center px-1 truncate w-full">
                  {leaderboard[0]?.displayName?.split(' ')[2] || 'Champion'}
                </p>
                <p className="text-sm font-bold text-yellow-700">{leaderboard[0]?.totalPoints} pts</p>
              </div>
            </div>

            {/* 3rd Place */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-2 shadow-card">
                <span className="text-2xl font-bold text-amber-800">3</span>
              </div>
              <div className="bg-gradient-to-b from-amber-300 to-orange-400 rounded-t-lg w-20 h-16 flex flex-col items-center justify-center">
                <Medal className="h-5 w-5 text-amber-700 mb-1" />
                <p className="text-xs font-medium text-amber-800 text-center px-1 truncate w-full">
                  {leaderboard[2]?.displayName?.split(' ')[2] || 'Player'}
                </p>
                <p className="text-xs text-amber-700">{leaderboard[2]?.totalPoints} pts</p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white/5 rounded-xl p-4 text-center shadow-lg border border-white/10">
            <Users className="h-5 w-5 text-emerald-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white font-heading">{leaderboard.length}</p>
            <p className="text-xs text-white/60">Players</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-center shadow-lg border border-white/10">
            <Recycle className="h-5 w-5 text-emerald-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white font-heading">
              {leaderboard.reduce((sum, u) => sum + u.totalScans, 0)}
            </p>
            <p className="text-xs text-white/60">Total Scans</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-center shadow-lg border border-white/10">
            <Leaf className="h-5 w-5 text-emerald-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white font-heading">
              {leaderboard.reduce((sum, u) => sum + (u.co2Saved || 0), 0).toFixed(1)}kg
            </p>
            <p className="text-xs text-white/60">CO₂ Saved</p>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
            <p className="text-red-400 text-center">{error}</p>
            <button
              onClick={loadData}
              className="mt-2 px-4 py-2 bg-red-500 text-white rounded-lg mx-auto block text-sm"
            >
              Retry
            </button>
          </div>
        )}

        {/* Leaderboard List */}
        <div className="bg-white/5 rounded-2xl shadow-lg overflow-hidden border border-white/10">
          <div className="p-4 border-b border-white/10">
            <h2 className="font-heading font-semibold text-white flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              All Rankings
            </h2>
          </div>
          
          {leaderboard.length === 0 ? (
            <div className="p-8 text-center">
              <Trophy className="h-12 w-12 text-white/30 mx-auto mb-3" />
              <p className="text-white/60">No users yet. Be the first!</p>
              <Link
                to="/scan"
                className="mt-4 inline-block px-6 py-2 bg-emerald-500 text-black rounded-xl font-medium"
              >
                Start Scanning
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {leaderboard.map((user) => {
                const isCurrentUser = user.userId === currentUserId;
                return (
                  <div
                    key={user.userId}
                    className={`flex items-center gap-4 p-4 transition-colors ${
                      getRankBackground(user.rank)
                    } ${isCurrentUser ? 'ring-2 ring-emerald-500 ring-inset' : ''}`}
                  >
                    {/* Rank */}
                    <div className="w-10 flex items-center justify-center">
                      {getRankIcon(user.rank)}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium truncate ${
                        isCurrentUser 
                          ? 'text-emerald-400' 
                          : 'text-white'
                      }`}>
                        {user.displayName}
                        {isCurrentUser && (
                          <span className="ml-2 text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                            You
                          </span>
                        )}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-white/60 mt-1">
                        <span className="flex items-center gap-1">
                          <Recycle className="h-3 w-3" />
                          {user.totalScans} scans
                        </span>
                        <span className="flex items-center gap-1">
                          <Flame className="h-3 w-3 text-orange-500" />
                          {user.currentStreak} streak
                        </span>
                        {user.badgeCount > 0 && (
                          <span className="flex items-center gap-1">
                            <Medal className="h-3 w-3 text-emerald-400" />
                            {user.badgeCount}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Points */}
                    <div className="text-right">
                      <p className={`text-lg font-bold font-heading ${
                        user.rank <= 3 
                          ? 'text-yellow-400' 
                          : 'text-white'
                      }`}>
                        {user.totalPoints}
                      </p>
                      <p className="text-xs text-white/60">points</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
