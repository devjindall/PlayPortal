import mongoose from 'mongoose';

const scoreSchema = new mongoose.Schema(
  {
    game: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Game',
      required: [true, 'Game ID is required'],
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    score: {
      type: Number,
      required: [true, 'Score value is required'],
      min: [0, 'Score cannot be negative'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for game leaderboards and user player history
scoreSchema.index({ game: 1, score: -1, createdAt: -1 });
scoreSchema.index({ user: 1, createdAt: -1 });

const Score = mongoose.model('Score', scoreSchema);

export default Score;
