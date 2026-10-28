import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  currentLevel: {
    type: Number,
    default: 1,
  },
  totalScore: {
    type: Number,
    default: 0,
  },
  totalStars: {
    type: Number,
    default: 0,
  },
  bubblesPopped: {
    type: Number,
    default: 0,
  },
  bestCombo: {
    type: Number,
    default: 0,
  },
  rescuedObjects: {
    type: Number,
    default: 0,
  },
  completedLevels: {
    type: Map,
    of: new mongoose.Schema({
      stars: { type: Number, default: 0 },
      score: { type: Number, default: 0 },
      completedAt: { type: Date, default: Date.now },
    }, { _id: false }),
    default: {},
  },
  boosterInventory: {
    bomb: { type: Number, default: 3 },
    rainbow: { type: Number, default: 2 },
    aimGuide: { type: Number, default: 3 },
    extraShot: { type: Number, default: 2 },
    shuffle: { type: Number, default: 2 },
  },
}, {
  timestamps: true,
});

export const User = mongoose.model('User', userSchema);
export default User;
