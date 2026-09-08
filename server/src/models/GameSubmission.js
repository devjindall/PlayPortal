import mongoose from 'mongoose';

export const SUBMISSION_STATUS = Object.freeze({
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
});

const gameSubmissionSchema = new mongoose.Schema(
  {
    game: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Game',
      required: true,
      index: true,
    },
    developer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Submission title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Submission description is required'],
      trim: true,
    },
    category: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
      default: '',
    },
    gameFile: {
      type: String,
      required: [true, 'Game archive file path is required'],
    },
    status: {
      type: String,
      enum: Object.values(SUBMISSION_STATUS),
      default: SUBMISSION_STATUS.PENDING,
      index: true,
    },
    rejectionReason: {
      type: String,
      default: '',
      trim: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

gameSubmissionSchema.index({ status: 1, createdAt: -1 });

const GameSubmission = mongoose.model('GameSubmission', gameSubmissionSchema);

export default GameSubmission;
