import mongoose from 'mongoose';

const levelSchema = new mongoose.Schema({
  levelNumber: {
    type: Number,
    required: true,
    unique: true,
  },
  difficulty: {
    type: String,
    enum: ['tutorial', 'beginner', 'easy', 'medium', 'hard', 'expert'],
    default: 'easy',
  },
  objective: {
    type: { type: String, required: true },
    target: { type: Number },
    color: { type: String },
    label: { type: String },
  },
  shots: {
    type: Number,
    required: true,
  },
  colors: {
    type: [String],
    default: ['red', 'blue', 'green'],
  },
  boardLayout: {
    type: Array,
    default: [],
  },
  bubbleQueue: {
    type: [String],
    default: [],
  },
  targetScore: {
    type: Number,
    default: 1000,
  },
  starThresholds: {
    type: [Number],
    default: [500, 800, 1200],
  },
  availableBoosters: {
    type: [String],
    default: ['bomb', 'rainbow', 'aimGuide', 'extraShot', 'shuffle'],
  },
  isPublished: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

export const Level = mongoose.model('Level', levelSchema);
export default Level;

