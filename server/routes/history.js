import express from 'express';
import Scan from '../models/Scan.js';
import Stats from '../models/Stats.js';

const router = express.Router();

// CO2 savings per item category (approximate kg)
const CO2_SAVINGS = {
  recyclable: 0.5,
  organic: 0.3,
  hazardous: 0.8,
  general: 0.1
};

// Badge definitions
const BADGE_DEFINITIONS = {
  first_scan: { name: 'First Step', description: 'Complete your first scan', requirement: 1 },
  ten_scans: { name: 'Getting Started', description: 'Complete 10 scans', requirement: 10 },
  fifty_scans: { name: 'Eco Warrior', description: 'Complete 50 scans', requirement: 50 },
  hundred_scans: { name: 'Planet Protector', description: 'Complete 100 scans', requirement: 100 },
  streak_3: { name: 'Consistent', description: '3-day streak', requirement: 3 },
  streak_7: { name: 'Week Warrior', description: '7-day streak', requirement: 7 },
  streak_30: { name: 'Monthly Master', description: '30-day streak', requirement: 30 },
  recycler: { name: 'Recycling Pro', description: 'Sort 20 recyclable items', requirement: 20 },
  composter: { name: 'Compost King', description: 'Sort 20 organic items', requirement: 20 },
  safety_first: { name: 'Safety First', description: 'Properly dispose 10 hazardous items', requirement: 10 },
};

// Helper functions
function getDayKey(date) {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}

function getWeekKey(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const week = Math.ceil((d.getDate() + new Date(year, d.getMonth(), 1).getDay()) / 7);
  return `${year}-W${String(week).padStart(2, '0')}`;
}

function checkBadges(stats) {
  const currentBadges = stats.badges || [];
  const newBadges = [];
  
  if (stats.totalScans >= 1 && !currentBadges.includes('first_scan')) newBadges.push('first_scan');
  if (stats.totalScans >= 10 && !currentBadges.includes('ten_scans')) newBadges.push('ten_scans');
  if (stats.totalScans >= 50 && !currentBadges.includes('fifty_scans')) newBadges.push('fifty_scans');
  if (stats.totalScans >= 100 && !currentBadges.includes('hundred_scans')) newBadges.push('hundred_scans');
  
  if (stats.currentStreak >= 3 && !currentBadges.includes('streak_3')) newBadges.push('streak_3');
  if (stats.currentStreak >= 7 && !currentBadges.includes('streak_7')) newBadges.push('streak_7');
  if (stats.currentStreak >= 30 && !currentBadges.includes('streak_30')) newBadges.push('streak_30');
  
  if (stats.categoryBreakdown.recyclable >= 20 && !currentBadges.includes('recycler')) newBadges.push('recycler');
  if (stats.categoryBreakdown.organic >= 20 && !currentBadges.includes('composter')) newBadges.push('composter');
  if (stats.categoryBreakdown.hazardous >= 10 && !currentBadges.includes('safety_first')) newBadges.push('safety_first');
  
  return newBadges;
}

// POST - Save a new scan
router.post('/scans', async (req, res) => {
  try {
    const { userId, itemName, category, confidence, disposalMethod, tips, imageUrl } = req.body;
    
    if (!userId || !itemName || !category) {
      return res.status(400).json({ error: 'userId, itemName, and category are required' });
    }

    // Save scan to database
    const scan = new Scan({
      userId,
      itemName,
      category,
      confidence: confidence || 0,
      disposalMethod: disposalMethod || '',
      tips: tips || [],
      imageUrl: imageUrl || ''
    });
    await scan.save();

    // Update or create stats
    let stats = await Stats.findOne({ userId });
    const today = getDayKey(new Date());
    const yesterday = getDayKey(new Date(Date.now() - 86400000));
    const weekKey = getWeekKey(new Date());
    
    if (!stats) {
      stats = new Stats({ 
        userId,
        totalScans: 1,
        totalPoints: 10,
        currentStreak: 1,
        longestStreak: 1,
        lastScanDate: today,
        categoryBreakdown: { recyclable: 0, organic: 0, hazardous: 0 },
        co2Saved: CO2_SAVINGS[category] || 0,
        weeklyScans: new Map([[weekKey, 1]]),
        badges: []
      });
      stats.categoryBreakdown[category] = 1;
    } else {
      stats.totalScans += 1;
      stats.totalPoints += 10;
      
      // Update category breakdown
      stats.categoryBreakdown[category] = (stats.categoryBreakdown[category] || 0) + 1;
      
      // Update CO2 savings
      stats.co2Saved += CO2_SAVINGS[category] || 0;
      
      // Update weekly scans
      const currentWeekScans = stats.weeklyScans.get(weekKey) || 0;
      stats.weeklyScans.set(weekKey, currentWeekScans + 1);
      
      // Update streak
      if (stats.lastScanDate !== today) {
        if (stats.lastScanDate === yesterday) {
          stats.currentStreak += 1;
        } else {
          stats.currentStreak = 1;
        }
        stats.lastScanDate = today;
      }
      
      if (stats.currentStreak > stats.longestStreak) {
        stats.longestStreak = stats.currentStreak;
      }
    }
    
    // Check for new badges
    const newBadges = checkBadges(stats);
    if (newBadges.length > 0) {
      stats.badges = [...(stats.badges || []), ...newBadges];
    }
    
    await stats.save();

    res.status(201).json({ 
      scan, 
      stats: {
        totalScans: stats.totalScans,
        totalPoints: stats.totalPoints,
        currentStreak: stats.currentStreak,
        longestStreak: stats.longestStreak,
        categoryBreakdown: stats.categoryBreakdown,
        co2Saved: stats.co2Saved,
        badges: stats.badges
      },
      newBadges 
    });
  } catch (error) {
    console.error('Error saving scan:', error);
    res.status(500).json({ error: 'Failed to save scan' });
  }
});

// GET - Fetch scan history for a user
router.get('/scans/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, skip = 0 } = req.query;
    
    const scans = await Scan.find({ userId })
      .sort({ timestamp: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));
    
    const total = await Scan.countDocuments({ userId });
    
    res.json({ scans, total });
  } catch (error) {
    console.error('Error fetching scans:', error);
    res.status(500).json({ error: 'Failed to fetch scan history' });
  }
});

// GET - Fetch stats for a user
router.get('/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    let stats = await Stats.findOne({ userId });
    
    if (!stats) {
      // Return default stats if user has no history
      return res.json({
        totalPoints: 0,
        totalScans: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastScanDate: null,
        categoryBreakdown: { recyclable: 0, organic: 0, hazardous: 0 },
        co2Saved: 0,
        weeklyScans: {},
        badges: []
      });
    }
    
    // Convert Map to object for response
    const weeklyScansObj = {};
    if (stats.weeklyScans) {
      stats.weeklyScans.forEach((value, key) => {
        weeklyScansObj[key] = value;
      });
    }
    
    res.json({
      totalPoints: stats.totalPoints,
      totalScans: stats.totalScans,
      currentStreak: stats.currentStreak,
      longestStreak: stats.longestStreak,
      lastScanDate: stats.lastScanDate,
      categoryBreakdown: stats.categoryBreakdown,
      co2Saved: stats.co2Saved,
      weeklyScans: weeklyScansObj,
      badges: stats.badges || []
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// DELETE - Delete a specific scan
router.delete('/scans/:scanId', async (req, res) => {
  try {
    const { scanId } = req.params;
    await Scan.findByIdAndDelete(scanId);
    res.json({ message: 'Scan deleted successfully' });
  } catch (error) {
    console.error('Error deleting scan:', error);
    res.status(500).json({ error: 'Failed to delete scan' });
  }
});

export default router;
