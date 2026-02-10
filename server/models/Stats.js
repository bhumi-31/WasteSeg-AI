import mongoose from 'mongoose';

const statsSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  totalScans: {
    type: Number,
    default: 0
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  lastScanDate: {
    type: String,
    default: null
  },
  categoryBreakdown: {
    recyclable: { type: Number, default: 0 },
    organic: { type: Number, default: 0 },
    hazardous: { type: Number, default: 0 }
  },
  co2Saved: {
    type: Number,
    default: 0
  },
  weeklyScans: {
    type: Map,
    of: Number,
    default: {}
  },
  badges: [{
    type: String
  }]
}, {
  timestamps: true
});

const Stats = mongoose.model('Stats', statsSchema);

export default Stats;
