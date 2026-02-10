import mongoose from 'mongoose';

const scanSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  itemName: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['recyclable', 'organic', 'hazardous', 'general'],
    required: true
  },
  confidence: {
    type: Number,
    default: 0
  },
  disposalMethod: {
    type: String,
    default: ''
  },
  tips: [{
    type: String
  }],
  imageUrl: {
    type: String,
    default: ''
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient querying
scanSchema.index({ userId: 1, timestamp: -1 });

const Scan = mongoose.model('Scan', scanSchema);

export default Scan;
