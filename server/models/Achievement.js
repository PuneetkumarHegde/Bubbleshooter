import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    default: '🏆',
  },
  targetValue: {
    type: Number,
    required: true,
  },
  metric: {
    type: String,
    enum: ['bubblesPopped', 'levelsCompleted', 'totalStars', 'bestCombo', 'totalScore', 'boosterCount'],
    required: true,
  },
  reward: {
    type: String,
    default: '+100 Coins',
  },
});

export const Achievement = mongoose.model('Achievement', achievementSchema);
export default Achievement;

