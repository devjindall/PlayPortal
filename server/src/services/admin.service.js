import Game, { GAME_STATUS } from '../models/Game.js';
import GameSubmission, { SUBMISSION_STATUS } from '../models/GameSubmission.js';
import User from '../models/User.js';
import Score from '../models/Score.js';
import { deleteGameFiles, deleteThumbnailFile } from './storage.service.js';

/**
 * Get submissions list with filtering and pagination
 */
export const getSubmissions = async ({ status = '', page = 1, limit = 20 }) => {
  const query = {};
  if (status && Object.values(SUBMISSION_STATUS).includes(status)) {
    query.status = status;
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const [submissions, total] = await Promise.all([
    GameSubmission.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('developer', 'name email avatar')
      .populate('game', 'title thumbnail category gameUrl status')
      .populate('reviewedBy', 'name email'),
    GameSubmission.countDocuments(query),
  ]);

  return {
    submissions,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  };
};

/**
 * Get single submission details
 */
export const getSubmissionById = async (submissionId) => {
  const submission = await GameSubmission.findById(submissionId)
    .populate('developer', 'name email avatar')
    .populate('game')
    .populate('reviewedBy', 'name email');

  if (!submission) {
    const error = new Error('Submission not found');
    error.statusCode = 404;
    throw error;
  }

  return submission;
};

/**
 * Approve game submission and publish game
 */
export const approveSubmission = async ({ submissionId, adminId }) => {
  const submission = await GameSubmission.findById(submissionId);
  if (!submission) {
    const error = new Error('Submission not found');
    error.statusCode = 404;
    throw error;
  }

  submission.status = SUBMISSION_STATUS.APPROVED;
  submission.reviewedBy = adminId;
  submission.reviewedAt = new Date();
  submission.rejectionReason = '';
  await submission.save();

  // Publish corresponding game
  const game = await Game.findByIdAndUpdate(
    submission.game,
    { status: GAME_STATUS.PUBLISHED },
    { new: true }
  );

  return { submission, game };
};

/**
 * Reject game submission
 */
export const rejectSubmission = async ({ submissionId, adminId, rejectionReason }) => {
  const submission = await GameSubmission.findById(submissionId);
  if (!submission) {
    const error = new Error('Submission not found');
    error.statusCode = 404;
    throw error;
  }

  submission.status = SUBMISSION_STATUS.REJECTED;
  submission.reviewedBy = adminId;
  submission.reviewedAt = new Date();
  submission.rejectionReason = rejectionReason || 'Does not meet platform guidelines';
  await submission.save();

  // Update game status to REJECTED
  const game = await Game.findByIdAndUpdate(
    submission.game,
    { status: GAME_STATUS.REJECTED },
    { new: true }
  );

  return { submission, game };
};

/**
 * Get all users with search and filtering
 */
export const getUsers = async ({ search = '', role = '', page = 1, limit = 20 }) => {
  const query = {};
  if (role) query.role = role;
  if (search && search.trim()) {
    query.$or = [
      { name: { $regex: search.trim(), $options: 'i' } },
      { email: { $regex: search.trim(), $options: 'i' } },
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const [users, total] = await Promise.all([
    User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    User.countDocuments(query),
  ]);

  return {
    users,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  };
};

/**
 * Activate or deactivate user account
 */
export const toggleUserStatus = async ({ userId, isActive, currentAdminId }) => {
  if (userId.toString() === currentAdminId.toString() && isActive === false) {
    const error = new Error('Cannot deactivate your own administrator account');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { isActive: Boolean(isActive) },
    { new: true }
  );

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return user.toJSON();
};

/**
 * Delete a published game and clean up files and scores
 */
export const removeGame = async (gameId) => {
  const game = await Game.findById(gameId);
  if (!game) {
    const error = new Error('Game not found');
    error.statusCode = 404;
    throw error;
  }

  // delete uploaded game assets from disk
  deleteGameFiles(gameId);
  if (game.thumbnail) {
    deleteThumbnailFile(game.thumbnail);
  }

  // clean up submissions, scores, and the game record
  await Promise.all([
    GameSubmission.deleteMany({ game: gameId }),
    Score.deleteMany({ game: gameId }),
    Game.findByIdAndDelete(gameId),
  ]);

  return { id: gameId, title: game.title };
};
