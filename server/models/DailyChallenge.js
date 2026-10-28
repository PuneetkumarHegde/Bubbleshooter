import mongoose from 'mongoose';

const dailyChallengeSchema = new mongoose.Schema({
  dateString: {
    type: String,
    required: true,
    unique: true, // YYYY-MM-DD
  },
  title: {
    type: String,
    default: 'Daily Bubble Odyssey',
  },
  objective: {
    type: { type: String, default: 'rescue' },
    target: { type: Number, default: 5 },
    label: { type: String, default: 'Rescue 5 Star Sprites' },
  },
  shots: {
    type: Number,
    default: 20,
  },
  reward: {
    coins: { type: Number, default: 500 },
    booster: { type: String, default: 'rainbow' },
  },
  completions: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    score: Number,
    completedAt: { type: Date, default: Date.now },
  }],
}, {
  timestamps: true,
});

export const DailyChallenge = mongoose.model('DailyChallenge', dailyChallengeSchema);
export default DailyChallenge;
