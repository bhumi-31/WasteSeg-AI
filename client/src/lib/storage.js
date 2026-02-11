import { saveScanToDb, fetchScanHistory, fetchStats as fetchStatsFromApi, updateChallengeProgress, getUserId } from './api';

const STORAGE_KEY = 'wasteseg-history';
const STATS_KEY = 'wasteseg-stats';
const BADGES_KEY = 'wasteseg-badges';
const LAST_SYNC_KEY = 'wasteseg-last-sync';

// Default stats structure
const DEFAULT_STATS = {
  totalPoints: 0,
  totalScans: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastScanDate: null,
  categoryBreakdown: {
    recyclable: 0,
    organic: 0,
    hazardous: 0
  },
  co2Saved: 0, // in kg
  weeklyScans: {}, // { '2024-01': 5, '2024-02': 3 }
};

/**
 * Initialize and sync data from database
 * Should be called on app startup
 */
export async function initializeData() {
  const userId = getUserId();
  
  try {
    // Fetch fresh data from database
    const [dbHistory, dbStats] = await Promise.all([
      fetchScanHistory(100),
      fetchStatsFromApi()
    ]);
    
    // Update localStorage with DB data
    if (dbHistory && dbHistory.length > 0) {
      const formattedHistory = dbHistory.map(scan => ({
        id: scan._id,
        itemName: scan.itemName,
        name: scan.itemName,
        category: scan.category,
        confidence: scan.confidence,
        disposalMethod: scan.disposalMethod,
        disposal: scan.disposalMethod,
        tips: scan.tips,
        imageUrl: scan.imageUrl,
        timestamp: scan.timestamp
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formattedHistory));
    }
    
    if (dbStats && dbStats.totalScans > 0) {
      localStorage.setItem(STATS_KEY, JSON.stringify(dbStats));
      if (dbStats.badges) {
        localStorage.setItem(BADGES_KEY, JSON.stringify(dbStats.badges));
      }
    }
    
    localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
    return { synced: true, userId };
  } catch (error) {
    console.warn('[Storage] Could not sync from database:', error.message);
    return { synced: false, userId, error: error.message };
  }
}

// Badge definitions - using icon names for Lucide React
const BADGE_DEFINITIONS = {
  first_scan: { name: 'First Step', description: 'Complete your first scan', iconName: 'Sprout', requirement: 1 },
  ten_scans: { name: 'Getting Started', description: 'Complete 10 scans', iconName: 'Leaf', requirement: 10 },
  fifty_scans: { name: 'Eco Warrior', description: 'Complete 50 scans', iconName: 'TreePine', requirement: 50 },
  hundred_scans: { name: 'Planet Protector', description: 'Complete 100 scans', iconName: 'Globe', requirement: 100 },
  streak_3: { name: 'Consistent', description: '3-day streak', iconName: 'Flame', requirement: 3 },
  streak_7: { name: 'Week Warrior', description: '7-day streak', iconName: 'Zap', requirement: 7 },
  streak_30: { name: 'Monthly Master', description: '30-day streak', iconName: 'Gem', requirement: 30 },
  recycler: { name: 'Recycling Pro', description: 'Sort 20 recyclable items', iconName: 'Recycle', requirement: 20 },
  composter: { name: 'Compost King', description: 'Sort 20 organic items', iconName: 'Leaf', requirement: 20 },
  safety_first: { name: 'Safety First', description: 'Properly dispose 10 hazardous items', iconName: 'AlertTriangle', requirement: 10 },
};

// CO2 savings per item category (approximate kg)
const CO2_SAVINGS = {
  recyclable: 0.5,
  organic: 0.3,
  hazardous: 0.8,
};

export function getScanHistory() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function getStats() {
  try {
    const data = localStorage.getItem(STATS_KEY);
    return data ? { ...DEFAULT_STATS, ...JSON.parse(data) } : { ...DEFAULT_STATS };
  } catch {
    return { ...DEFAULT_STATS };
  }
}

export function getBadges() {
  try {
    const data = localStorage.getItem(BADGES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function getBadgeDefinitions() {
  return BADGE_DEFINITIONS;
}

function getWeekKey(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const week = Math.ceil((d.getDate() + new Date(year, d.getMonth(), 1).getDay()) / 7);
  return `${year}-W${String(week).padStart(2, '0')}`;
}

function getDayKey(date) {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}

function updateStreak(stats) {
  const today = getDayKey(new Date());
  const yesterday = getDayKey(new Date(Date.now() - 86400000));
  
  if (stats.lastScanDate === today) {
    // Already scanned today, no streak change
    return stats;
  } else if (stats.lastScanDate === yesterday) {
    // Consecutive day, increment streak
    stats.currentStreak += 1;
  } else {
    // Streak broken, reset to 1
    stats.currentStreak = 1;
  }
  
  // Update longest streak
  if (stats.currentStreak > stats.longestStreak) {
    stats.longestStreak = stats.currentStreak;
  }
  
  stats.lastScanDate = today;
  return stats;
}

function checkAndAwardBadges(stats) {
  const currentBadges = getBadges();
  const newBadges = [];
  
  // Check scan-based badges
  if (stats.totalScans >= 1 && !currentBadges.includes('first_scan')) newBadges.push('first_scan');
  if (stats.totalScans >= 10 && !currentBadges.includes('ten_scans')) newBadges.push('ten_scans');
  if (stats.totalScans >= 50 && !currentBadges.includes('fifty_scans')) newBadges.push('fifty_scans');
  if (stats.totalScans >= 100 && !currentBadges.includes('hundred_scans')) newBadges.push('hundred_scans');
  
  // Check streak-based badges
  if (stats.currentStreak >= 3 && !currentBadges.includes('streak_3')) newBadges.push('streak_3');
  if (stats.currentStreak >= 7 && !currentBadges.includes('streak_7')) newBadges.push('streak_7');
  if (stats.currentStreak >= 30 && !currentBadges.includes('streak_30')) newBadges.push('streak_30');
  
  // Check category-based badges
  if (stats.categoryBreakdown.recyclable >= 20 && !currentBadges.includes('recycler')) newBadges.push('recycler');
  if (stats.categoryBreakdown.organic >= 20 && !currentBadges.includes('composter')) newBadges.push('composter');
  if (stats.categoryBreakdown.hazardous >= 10 && !currentBadges.includes('safety_first')) newBadges.push('safety_first');
  
  if (newBadges.length > 0) {
    localStorage.setItem(BADGES_KEY, JSON.stringify([...currentBadges, ...newBadges]));
  }
  
  return newBadges;
}

export async function saveScanResult(result) {
  // Save to localStorage first (offline support)
  const history = getScanHistory();
  history.unshift(result);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 100)));
  
  // Update local stats
  let stats = getStats();
  stats.totalScans += 1;
  stats.totalPoints += 10; // 10 points per scan
  
  // Update category breakdown
  const category = result.category || 'recyclable';
  stats.categoryBreakdown[category] = (stats.categoryBreakdown[category] || 0) + 1;
  
  // Update CO2 savings
  stats.co2Saved += CO2_SAVINGS[category] || 0;
  
  // Update weekly stats
  const weekKey = getWeekKey(new Date());
  stats.weeklyScans[weekKey] = (stats.weeklyScans[weekKey] || 0) + 1;
  
  // Update streak
  stats = updateStreak(stats);
  
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  
  // Check for new badges
  const newBadges = checkAndAwardBadges(stats);
  
  // Also save to MongoDB (async, don't block)
  try {
    await saveScanToDb({
      itemName: result.itemName || result.name || 'Unknown Item',
      category: category,
      confidence: result.confidence || 0,
      disposalMethod: result.disposalMethod || result.disposal || '',
      tips: result.tips || [],
      imageUrl: result.imageUrl || ''
    });
    
    const challengeResult = await updateChallengeProgress(category);
  } catch (error) {
    console.warn('Failed to save to database, using localStorage:', error.message);
  }
  
  return { stats, newBadges };
}

// Async function to fetch history from database
export async function fetchHistoryFromDb() {
  try {
    const dbHistory = await fetchScanHistory(100);
    if (dbHistory && dbHistory.length > 0) {
      // Format DB data to match local format
      const formattedHistory = dbHistory.map(scan => ({
        id: scan._id,
        itemName: scan.itemName,
        name: scan.itemName,
        category: scan.category,
        confidence: scan.confidence,
        disposalMethod: scan.disposalMethod,
        disposal: scan.disposalMethod,
        tips: scan.tips,
        imageUrl: scan.imageUrl,
        timestamp: scan.timestamp
      }));
      // Update localStorage with DB data
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formattedHistory));
      return formattedHistory;
    }
    return getScanHistory();
  } catch (error) {
    console.warn('Failed to fetch from DB, using localStorage:', error);
    return getScanHistory();
  }
}

// Async function to fetch stats from database  
export async function fetchStatsFromDb() {
  try {
    const dbStats = await fetchStatsFromApi();
    if (dbStats && dbStats.totalScans > 0) {
      // Update localStorage with DB data
      localStorage.setItem(STATS_KEY, JSON.stringify(dbStats));
      if (dbStats.badges) {
        localStorage.setItem(BADGES_KEY, JSON.stringify(dbStats.badges));
      }
      return dbStats;
    }
    return getStats();
  } catch (error) {
    console.warn('Failed to fetch stats from DB, using localStorage:', error);
    return getStats();
  }
}
export function getScore() {
  return getStats().totalPoints;
}

export function getTotalScans() {
  return getStats().totalScans;
}

export function getWeeklyProgress() {
  const stats = getStats();
  const weeks = [];
  const now = new Date();
  
  // Get last 8 weeks
  for (let i = 7; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - (i * 7));
    const weekKey = getWeekKey(date);
    weeks.push({
      week: weekKey,
      scans: stats.weeklyScans[weekKey] || 0
    });
  }
  
  return weeks;
}
