import mongoose from 'mongoose';

// Daily challenge schema (global challenges for all users)
const challengeSchema = new mongoose.Schema({
  challengeId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['scan_count', 'category_scan', 'streak', 'time_based'],
    required: true
  },
  target: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    enum: ['recyclable', 'organic', 'hazardous', 'any'],
    default: 'any'
  },
  points: {
    type: Number,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// User challenge progress schema
const userChallengeSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  challengeId: {
    type: String,
    required: true
  },
  progress: {
    type: Number,
    default: 0
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date,
    default: null
  },
  rewardClaimed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
userChallengeSchema.index({ userId: 1, challengeId: 1 }, { unique: true });

export const Challenge = mongoose.model('Challenge', challengeSchema);
export const UserChallenge = mongoose.model('UserChallenge', userChallengeSchema);
