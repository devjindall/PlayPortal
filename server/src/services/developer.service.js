import Game, { GAME_STATUS } from '../models/Game.js';
import GameSubmission, { SUBMISSION_STATUS } from '../models/GameSubmission.js';
import { extractAndValidateGameZip, deleteGameFiles, deleteThumbnailFile } from './storage.service.js';
import path from 'path';

/**
 * Handle new game upload and submission from a developer
 */
export const createGameSubmission = async ({
  developerId,
  title,
  description,
  category,
  supportsScores = true,
  thumbnailFile,
  zipFile,
}) => {
  if (!zipFile) {
    const error = new Error('Game ZIP archive is required');
    error.statusCode = 400;
    throw error;
  }

  const thumbnailRelUrl = thumbnailFile
    ? `/uploads/thumbnails/${path.basename(thumbnailFile.path)}`
    : '';

  let game = null;

  try {
    // 1. Create Game record in PENDING status
    game = await Game.create({
      title: title.trim(),
      description: description.trim(),
      category: category || 'Casual',
      thumbnail: thumbnailRelUrl,
      developer: developerId,
      status: GAME_STATUS.PENDING,
      supportsScores: String(supportsScores) === 'true' || supportsScores === true,
    });

    // 2. Safely extract and validate game ZIP archive
    const { relativeGameUrl } = await extractAndValidateGameZip(zipFile.path, game._id);

    // 3. Update game with extracted playable URL
    game.gameUrl = relativeGameUrl;
    await game.save();

    // 4. Create GameSubmission record for moderation queue
    const submission = await GameSubmission.create({
      game: game._id,
      developer: developerId,
      title: game.title,
      description: game.description,
      category: game.category,
      thumbnail: thumbnailRelUrl,
      gameFile: zipFile.originalname || 'game.zip',
      status: SUBMISSION_STATUS.PENDING,
    });

    return { game, submission };
  } catch (error) {
    // Cleanup if database or extraction failed
    if (game && game._id) {
      deleteGameFiles(game._id);
      await Game.findByIdAndDelete(game._id);
    }
    if (thumbnailRelUrl) {
      deleteThumbnailFile(thumbnailRelUrl);
    }
    throw error;
  }
};

/**
 * Get all games and submissions created by this developer
 */
export const getDeveloperGames = async (developerId) => {
  const games = await Game.find({ developer: developerId }).sort({ createdAt: -1 });

  const gameIds = games.map((g) => g._id);
  const submissions = await GameSubmission.find({ game: { $in: gameIds } }).sort({ createdAt: -1 });

  // Map submissions to games
  const submissionMap = {};
  submissions.forEach((sub) => {
    if (!submissionMap[sub.game.toString()]) {
      submissionMap[sub.game.toString()] = sub;
    }
  });

  return games.map((game) => ({
    ...game.toObject(),
    latestSubmission: submissionMap[game._id.toString()] || null,
  }));
};

/**
 * Get single developer game with submission details
 */
export const getDeveloperGameDetails = async (developerId, gameId) => {
  const game = await Game.findOne({ _id: gameId, developer: developerId });
  if (!game) {
    const error = new Error('Game not found or access unauthorized');
    error.statusCode = 404;
    throw error;
  }

  const submissions = await GameSubmission.find({ game: gameId }).sort({ createdAt: -1 });

  return {
    game,
    submissions,
  };
};

/**
 * Update metadata of an existing developer game
 */
export const updateDeveloperGame = async (developerId, gameId, updates) => {
  const game = await Game.findOne({ _id: gameId, developer: developerId });
  if (!game) {
    const error = new Error('Game not found or access unauthorized');
    error.statusCode = 404;
    throw error;
  }

  const allowedFields = ['title', 'description', 'category', 'supportsScores'];
  allowedFields.forEach((field) => {
    if (updates[field] !== undefined) {
      game[field] = updates[field];
    }
  });

  await game.save();
  return game;
};
