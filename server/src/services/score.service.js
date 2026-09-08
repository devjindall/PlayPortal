import Score from '../models/Score.js';
import Game, { GAME_STATUS } from '../models/Game.js';
import mongoose from 'mongoose';

/**
 * Submit a score for a specific game
 */
export const submitScore = async ({ gameId, userId, score }) => {
  const numericScore = Number(score);
  if (isNaN(numericScore) || numericScore < 0) {
    const error = new Error('Score must be a non-negative number');
    error.statusCode = 400;
    throw error;
  }

  // Validate game
  const game = await Game.findById(gameId);
  if (!game) {
    const error = new Error('Game not found');
    error.statusCode = 404;
    throw error;
  }

  if (game.status !== GAME_STATUS.PUBLISHED) {
    const error = new Error('Cannot submit scores for unpublished games');
    error.statusCode = 400;
    throw error;
  }

  if (!game.supportsScores) {
    const error = new Error('This game does not support score submissions');
    error.statusCode = 400;
    throw error;
  }

  // Create score record
  const newScore = await Score.create({
    game: gameId,
    user: userId,
    score: numericScore,
  });

  return newScore;
};

/**
 * Get game leaderboard with ranked players
 */
export const getGameLeaderboard = async ({ gameId, limit = 20 }) => {
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

  // Get distinct highest score per user for this game
  const leaderboard = await Score.aggregate([
    { $match: { game: new mongoose.Types.ObjectId(gameId) } },
    { $sort: { score: -1, createdAt: 1 } },
    {
      $group: {
        _id: '$user',
        highScore: { $first: '$score' },
        achievedAt: { $first: '$createdAt' },
        scoreId: { $first: '$_id' },
      },
    },
    { $sort: { highScore: -1, achievedAt: 1 } },
    { $limit: limitNum },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'player',
      },
    },
    { $unwind: '$player' },
    {
      $project: {
        _id: '$scoreId',
        userId: '$_id',
        score: '$highScore',
        createdAt: '$achievedAt',
        'player.name': 1,
        'player.avatar': 1,
      },
    },
  ]);

  // Attach 1-based rank
  const rankedLeaderboard = leaderboard.map((entry, index) => ({
    rank: index + 1,
    ...entry,
  }));

  return rankedLeaderboard;
};

/**
 * Get user's personal best and recent scores for a game
 */
export const getUserGameScores = async ({ gameId, userId }) => {
  const [personalBest, recentScores] = await Promise.all([
    Score.findOne({ game: gameId, user: userId }).sort({ score: -1 }),
    Score.find({ game: gameId, user: userId })
      .sort({ createdAt: -1 })
      .limit(10),
  ]);

  // Determine user rank if personal best exists
  let rank = null;
  if (personalBest) {
    const higherCount = await Score.aggregate([
      { $match: { game: new mongoose.Types.ObjectId(gameId) } },
      { $group: { _id: '$user', maxScore: { $max: '$score' } } },
      { $match: { maxScore: { $gt: personalBest.score } } },
      { $count: 'count' },
    ]);
    rank = (higherCount[0]?.count || 0) + 1;
  }

  return {
    personalBest: personalBest ? { score: personalBest.score, createdAt: personalBest.createdAt, rank } : null,
    recentScores,
  };
};
