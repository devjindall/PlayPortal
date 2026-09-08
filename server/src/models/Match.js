import mongoose from 'mongoose';

export const MATCH_STATUS = Object.freeze({
  WAITING: 'WAITING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
});

export const MATCH_RESULT = Object.freeze({
  WIN: 'WIN',
  DRAW: 'DRAW',
  ABANDONED: 'ABANDONED',
  IN_PROGRESS: 'IN_PROGRESS',
});

const matchSchema = new mongoose.Schema(
  {
    gameType: {
      type: String,
      default: 'TIC_TAC_TOE',
      required: true,
    },
    roomId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    players: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          default: null,
        },
        name: {
          type: String,
          required: true,
        },
        symbol: {
          type: String,
          enum: ['X', 'O'],
          required: true,
        },
        socketId: {
          type: String,
          default: '',
        },
      },
    ],
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    winnerSymbol: {
      type: String,
      default: null,
    },
    result: {
      type: String,
      enum: Object.values(MATCH_RESULT),
      default: MATCH_RESULT.IN_PROGRESS,
    },
    status: {
      type: String,
      enum: Object.values(MATCH_STATUS),
      default: MATCH_STATUS.WAITING,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    endedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

matchSchema.index({ 'players.user': 1, createdAt: -1 });

const Match = mongoose.model('Match', matchSchema);

export default Match;
