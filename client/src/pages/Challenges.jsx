import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Target, ArrowLeft, Loader2, CheckCircle2, Clock, 
  Zap, Gift, Recycle, Leaf, AlertTriangle, Scan,
  Trophy, Star, Flame, ChevronRight
} from 'lucide-react';
import { fetchChallenges, claimChallengeReward } from '../lib/api';
import { toast } from 'sonner';

const CATEGORY_ICONS = {
  any: Scan,
  recyclable: Recycle,
  organic: Leaf,
  hazardous: AlertTriangle
};

const CATEGORY_COLORS = {
  any: 'text-emerald-400 bg-emerald-500/20',
  recyclable: 'text-blue-400 bg-blue-500/20',
  organic: 'text-green-400 bg-green-500/20',
  hazardous: 'text-red-400 bg-red-500/20'
};

export default function Challenges() {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    loadChallenges();
  }, []);

  useEffect(() => {
    // Update countdown timer
    const updateTimer = () => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      
      const diff = endOfDay - now;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeLeft(`${hours}h ${minutes}m`);
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadChallenges = async () => {
    setLoading(true);
    try {
      const data = await fetchChallenges();
      setChallenges(data);
    } catch (err) {
      console.error('Failed to load challenges:', err);
      toast.error('Failed to load challenges');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimReward = async (challengeId) => {
    setClaiming(challengeId);
    try {
      const result = await claimChallengeReward(challengeId);
      toast.success(`+${result.pointsAwarded} points claimed!`);
      
      // Update local state
      setChallenges(prev => 
        prev.map(c => 
          c.id === challengeId 
            ? { ...c, rewardClaimed: true }
            : c
        )
      );
    } catch (err) {
      toast.error(err.message || 'Failed to claim reward');
    } finally {
      setClaiming(null);
    }
  };

  const completedCount = challenges.filter(c => c.completed).length;
  const totalPoints = challenges.reduce((sum, c) => sum + (c.completed ? c.points : 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-400 mx-auto mb-4" />
          <p className="text-white/60">Loading challenges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-2xl px-4 py-6 pt-24 pb-24 sm:px-6 sm:pt-28">
        <div className="flex items-center gap-4 mb-6">
          <Link 
            to="/"
            className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-white/60" />
          </Link>
          <div className="flex-1">
            <h1 className="font-heading text-2xl font-bold text-white flex items-center gap-2">
              <Target className="h-7 w-7 text-emerald-400" />
              Daily Challenges
            </h1>
            <p className="text-sm text-white/60">Complete tasks to earn bonus points</p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl shadow-lg p-5 mb-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-white/70" />
              <span className="text-white/70">Resets in</span>
              <span className="font-bold">{timeLeft}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full">
              <Flame className="h-4 w-4 text-orange-300" />
              <span className="text-sm font-medium">{completedCount}/{challenges.length}</span>
            </div>
          </div>
          
          <div className="mb-3">
            <div className="h-3 bg-white/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${(completedCount / challenges.length) * 100}%` }}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/70">Daily Progress</span>
            <span className="font-bold flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-300" />
              {totalPoints} / {challenges.reduce((sum, c) => sum + c.points, 0)} pts
            </span>
          </div>
        </div>

        {completedCount === challenges.length && challenges.length > 0 && (
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-5 mb-6 text-white text-center">
            <Trophy className="h-12 w-12 mx-auto mb-2 text-yellow-300" />
            <h3 className="text-xl font-bold font-heading mb-1">All Challenges Complete!</h3>
            <p className="text-white/80">Amazing work! Come back tomorrow for new challenges.</p>
          </div>
        )}

        <div className="space-y-4">
          {challenges.map((challenge) => {
            const CategoryIcon = CATEGORY_ICONS[challenge.category] || Scan;
            const colorClass = CATEGORY_COLORS[challenge.category] || CATEGORY_COLORS.any;
            const progress = Math.min((challenge.progress / challenge.target) * 100, 100);
            
            return (
              <div
                key={challenge.id}
                className={`bg-white/5 rounded-2xl shadow-lg overflow-hidden border-2 transition-all ${
                  challenge.completed 
                    ? 'border-green-500' 
                    : 'border-transparent hover:border-emerald-500/30'
                }`}
              >
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClass}`}>
                      <CategoryIcon className="h-6 w-6" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-heading font-semibold text-white">
                          {challenge.title}
                        </h3>
                        {challenge.completed && (
                          <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-white/60 mb-3">
                        {challenge.description}
                      </p>
                      
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-white/60">
                            {challenge.progress} / {challenge.target}
                          </span>
                          <span className={`font-medium ${
                            challenge.completed ? 'text-green-400' : 'text-emerald-400'
                          }`}>
                            {Math.round(progress)}%
                          </span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              challenge.completed 
                                ? 'bg-green-500' 
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-sm">
                          <Gift className="h-4 w-4 text-emerald-400" />
                          <span className="font-medium text-emerald-400">
                            +{challenge.points} points
                          </span>
                        </div>
                        
                        {challenge.completed && !challenge.rewardClaimed && (
                          <button
                            onClick={() => handleClaimReward(challenge.id)}
                            disabled={claiming === challenge.id}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50"
                          >
                            {claiming === challenge.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Zap className="h-4 w-4" />
                                Claim
                              </>
                            )}
                          </button>
                        )}
                        
                        {challenge.rewardClaimed && (
                          <span className="flex items-center gap-1 text-sm text-green-400">
                            <CheckCircle2 className="h-4 w-4" />
                            Claimed
                          </span>
                        )}
                        
                        {!challenge.completed && (
                          <Link
                            to="/scan"
                            className="flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300"
                          >
                            Scan now
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {challenges.length === 0 && !loading && (
          <div className="bg-white/5 rounded-2xl p-8 text-center border border-white/10 shadow-lg">
            <Target className="h-12 w-12 text-white/30 mx-auto mb-3" />
            <h3 className="font-heading text-lg font-semibold text-white mb-2">
              No Challenges Available
            </h3>
            <p className="text-white/60 mb-4">
              Check back soon for new daily challenges!
            </p>
            <Link
              to="/scan"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-black rounded-xl font-medium hover:opacity-90"
            >
              <Scan className="h-5 w-5" />
              Start Scanning
            </Link>
          </div>
        )}

        <div className="mt-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5">
          <h3 className="font-heading font-semibold text-white mb-3 flex items-center gap-2">
            <Zap className="h-5 w-5 text-emerald-400" />
            Pro Tips
          </h3>
          <ul className="space-y-2 text-sm text-white/60">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400">•</span>
              Complete all daily challenges for maximum points
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400">•</span>
              Challenges reset at midnight - don't miss out!
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400">•</span>
              Scan different waste types to complete category challenges
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
