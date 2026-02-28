import express from 'express';
import Stats from '../models/Stats.js';
import { Challenge, UserChallenge } from '../models/Challenge.js';
import { authMiddleware } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { challengeUpdateSchema, challengeClaimSchema } from '../validators/schemas.js';

const router = express.Router();

// Predefined challenge templates
const CHALLENGE_TEMPLATES = [
  { title: 'Quick Scanner', description: 'Scan 3 items today', type: 'scan_count', target: 3, points: 30, category: 'any' },
  { title: 'Recycling Hero', description: 'Identify 2 recyclable items', type: 'category_scan', target: 2, points: 25, category: 'recyclable' },
  { title: 'Green Thumb', description: 'Find 2 organic/compostable items', type: 'category_scan', target: 2, points: 25, category: 'organic' },
  { title: 'Safety Expert', description: 'Identify 1 hazardous item', type: 'category_scan', target: 1, points: 35, category: 'hazardous' },
  { title: 'Eco Warrior', description: 'Scan 5 items today', type: 'scan_count', target: 5, points: 50, category: 'any' },
  { title: 'Streak Builder', description: 'Maintain your daily streak', type: 'streak', target: 1, points: 20, category: 'any' },
  { title: 'Triple Recycler', description: 'Identify 3 recyclable items', type: 'category_scan', target: 3, points: 40, category: 'recyclable' },
  { title: 'Compost Champion', description: 'Find 3 organic items', type: 'category_scan', target: 3, points: 40, category: 'organic' },
  { title: 'Waste Detective', description: 'Scan 7 items today', type: 'scan_count', target: 7, points: 70, category: 'any' },
  { title: 'Category Explorer', description: 'Scan items from 2 different categories', type: 'scan_count', target: 2, points: 35, category: 'any' },
];

// Helper: Get today's date key
function getTodayKey() {
  return new Date().toISOString().split('T')[0];
}

// Helper: Get end of day timestamp
function getEndOfDay() {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return end;
}

// Helper: Generate daily challenges (3 random challenges)
async function generateDailyChallenges() {
  const today = getTodayKey();
  const existingChallenges = await Challenge.find({
    expiresAt: { $gte: new Date() }
  });

  if (existingChallenges.length >= 3) {
    return existingChallenges.slice(0, 3);
  }

  const shuffled = CHALLENGE_TEMPLATES.sort(() => Math.random() - 0.5);
  const selectedTemplates = shuffled.slice(0, 3);
  const endOfDay = getEndOfDay();

  const newChallenges = [];
  for (let i = 0; i < selectedTemplates.length; i++) {
    const template = selectedTemplates[i];
    const challengeId = `${today}-${i}`;

    let challenge = await Challenge.findOne({ challengeId });

    if (!challenge) {
      challenge = new Challenge({
        challengeId,
        title: template.title,
        description: template.description,
        type: template.type,
        target: template.target,
        category: template.category,
        points: template.points,
        expiresAt: endOfDay
      });
      await challenge.save();
    }
    newChallenges.push(challenge);
  }

  return newChallenges;
}

/**
 * GET /api/leaderboard — Top users by points (public)
 */
router.get('/leaderboard', async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const leaderboard = await Stats.find({})
      .sort({ totalPoints: -1 })
      .limit(parseInt(limit))
      .select('userId totalPoints totalScans currentStreak badges co2Saved');

    const formattedLeaderboard = leaderboard.map((user, index) => ({
      rank: index + 1,
      userId: user.userId,
      displayName: `Eco Warrior ${user.userId.slice(-4).toUpperCase()}`,
      totalPoints: user.totalPoints,
      totalScans: user.totalScans,
      currentStreak: user.currentStreak,
      badgeCount: user.badges?.length || 0,
      co2Saved: user.co2Saved || 0
    }));

    res.json({ leaderboard: formattedLeaderboard });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

/**
 * GET /api/leaderboard/rank — User rank on leaderboard (protected)
 */
router.get('/leaderboard/rank', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const userStats = await Stats.findOne({ userId });
    if (!userStats) {
      return res.json({ rank: null, totalUsers: 0 });
    }

    const rank = await Stats.countDocuments({
      totalPoints: { $gt: userStats.totalPoints }
    }) + 1;

    const totalUsers = await Stats.countDocuments({});

    res.json({
      rank,
      totalUsers,
      percentile: Math.round((1 - (rank / totalUsers)) * 100)
    });
  } catch (error) {
    console.error('Error fetching user rank:', error);
    res.status(500).json({ error: 'Failed to fetch user rank' });
  }
});

/**
 * GET /api/challenges — Daily challenges (public)
 */
router.get('/challenges', async (req, res) => {
  try {
    const challenges = await generateDailyChallenges();

    res.json({
      challenges: challenges.map(c => ({
        id: c.challengeId,
        title: c.title,
        description: c.description,
        type: c.type,
        target: c.target,
        category: c.category,
        points: c.points,
        expiresAt: c.expiresAt
      }))
    });
  } catch (error) {
    console.error('Error fetching challenges:', error);
    res.status(500).json({ error: 'Failed to fetch challenges' });
  }
});

/**
 * GET /api/challenges/progress — User's challenge progress (protected)
 */
router.get('/challenges/progress', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const challenges = await generateDailyChallenges();
    const challengeIds = challenges.map(c => c.challengeId);

    const userProgress = await UserChallenge.find({
      userId,
      challengeId: { $in: challengeIds }
    });

    const progressMap = {};
    userProgress.forEach(up => {
      progressMap[up.challengeId] = {
        progress: up.progress,
        completed: up.completed,
        completedAt: up.completedAt,
        rewardClaimed: up.rewardClaimed
      };
    });

    const challengesWithProgress = challenges.map(c => ({
      id: c.challengeId,
      title: c.title,
      description: c.description,
      type: c.type,
      target: c.target,
      category: c.category,
      points: c.points,
      expiresAt: c.expiresAt,
      progress: progressMap[c.challengeId]?.progress || 0,
      completed: progressMap[c.challengeId]?.completed || false,
      completedAt: progressMap[c.challengeId]?.completedAt || null,
      rewardClaimed: progressMap[c.challengeId]?.rewardClaimed || false
    }));

    res.json({ challenges: challengesWithProgress });
  } catch (error) {
    console.error('Error fetching challenge progress:', error);
    res.status(500).json({ error: 'Failed to fetch challenge progress' });
  }
});

/**
 * POST /api/challenges/update — Update challenge progress after a scan (protected)
 */
router.post('/challenges/update', authMiddleware, validate(challengeUpdateSchema), async (req, res) => {
  try {
    const userId = req.user.id;
    const { category } = req.body;

    const challenges = await generateDailyChallenges();
    const updatedChallenges = [];
    const newlyCompleted = [];

    for (const challenge of challenges) {
      let userChallenge = await UserChallenge.findOne({
        userId,
        challengeId: challenge.challengeId
      });

      if (!userChallenge) {
        userChallenge = new UserChallenge({
          userId,
          challengeId: challenge.challengeId,
          progress: 0,
          completed: false
        });
      }

      if (userChallenge.completed) {
        updatedChallenges.push({
          id: challenge.challengeId,
          progress: userChallenge.progress,
          completed: true,
          rewardClaimed: userChallenge.rewardClaimed
        });
        continue;
      }

      let shouldIncrement = false;

      if (challenge.type === 'scan_count') {
        shouldIncrement = true;
      } else if (challenge.type === 'category_scan' && challenge.category === category) {
        shouldIncrement = true;
      } else if (challenge.type === 'streak') {
        const userStats = await Stats.findOne({ userId });
        if (userStats && userStats.currentStreak >= 1) {
          shouldIncrement = true;
          userChallenge.progress = userStats.currentStreak;
        }
      }

      if (shouldIncrement && challenge.type !== 'streak') {
        userChallenge.progress += 1;
      }

      if (userChallenge.progress >= challenge.target && !userChallenge.completed) {
        userChallenge.completed = true;
        userChallenge.completedAt = new Date();
        newlyCompleted.push({
          id: challenge.challengeId,
          title: challenge.title,
          points: challenge.points
        });
      }

      await userChallenge.save();

      updatedChallenges.push({
        id: challenge.challengeId,
        progress: userChallenge.progress,
        completed: userChallenge.completed,
        rewardClaimed: userChallenge.rewardClaimed
      });
    }

    res.json({
      challenges: updatedChallenges,
      newlyCompleted
    });
  } catch (error) {
    console.error('Error updating challenge progress:', error);
    res.status(500).json({ error: 'Failed to update challenge progress' });
  }
});

/**
 * POST /api/challenges/claim — Claim reward for completed challenge (protected)
 */
router.post('/challenges/claim', authMiddleware, validate(challengeClaimSchema), async (req, res) => {
  try {
    const userId = req.user.id;
    const { challengeId } = req.body;

    const challenge = await Challenge.findOne({ challengeId });
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    const userChallenge = await UserChallenge.findOne({ userId, challengeId });
    if (!userChallenge || !userChallenge.completed) {
      return res.status(400).json({ error: 'Challenge not completed' });
    }

    if (userChallenge.rewardClaimed) {
      return res.status(400).json({ error: 'Reward already claimed' });
    }

    let stats = await Stats.findOne({ userId });
    if (!stats) {
      stats = new Stats({ userId, totalPoints: 0 });
    }

    stats.totalPoints += challenge.points;
    await stats.save();

    userChallenge.rewardClaimed = true;
    await userChallenge.save();

    res.json({
      success: true,
      pointsAwarded: challenge.points,
      newTotalPoints: stats.totalPoints
    });
  } catch (error) {
    console.error('Error claiming reward:', error);
    res.status(500).json({ error: 'Failed to claim reward' });
  }
});

export default router;
