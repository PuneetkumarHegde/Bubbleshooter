import mongoose from 'mongoose';

const gameSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  levelId: {
    type: String,
    required: true,
  },
  sessionToken: {
    type: String,
    required: true,
    unique: true,
  },
  startedAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
  },
  durationSeconds: {
    type: Number,
  },
  shotsUsed: {
    type: Number,
    default: 0,
  },
  bubblesPopped: {
    type: Number,
    default: 0,
  },
  score: {
    type: Number,
    default: 0,
  },
  stars: {
    type: Number,
    default: 0,
  },
  bestCombo: {
    type: Number,
    default: 0,
  },
  boostersUsed: {
    type: [String],
    default: [],
  },
  completed: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'abandoned', 'invalidated'],
    default: 'active',
  },
  antiCheatFlagged: {
    type: Boolean,
    default: false,
  },
  antiCheatReason: {
    type: String,
    default: null,
  },
}, {
  timestamps: true,
});

export const GameSession = mongoose.model('GameSession', gameSessionSchema);
export default GameSession;

