import mongoose from 'mongoose';

export const GAME_STATUS = Object.freeze({
  PENDING: 'PENDING',
  PUBLISHED: 'PUBLISHED',
  REJECTED: 'REJECTED',
});

export const GAME_CATEGORIES = Object.freeze([
  'Action',
  'Arcade',
  'Puzzle',
  'Strategy',
  'Sports',
  'Casual',
  'Retro',
  'Card',
]);

const gameSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Game title is required'],
      trim: true,
      minlength: [2, 'Title must be at least 2 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Game description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: GAME_CATEGORIES,
      default: 'Casual',
    },
    thumbnail: {
      type: String,
      default: '',
      trim: true,
    },
    gameUrl: {
      type: String,
      default: '',
      trim: true,
    },
    developer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(GAME_STATUS),
      default: GAME_STATUS.PENDING,
      index: true,
    },
    supportsScores: {
      type: Boolean,
      default: true,
    },
    supportsMultiplayer: {
      type: Boolean,
      default: false,
    },
    playCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for search and category filtering
gameSchema.index({ status: 1, category: 1, createdAt: -1 });
gameSchema.index({ title: 'text', description: 'text' });

const Game = mongoose.model('Game', gameSchema);

export default Game;
