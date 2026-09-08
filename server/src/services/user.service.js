import User from '../models/User.js';
import Score from '../models/Score.js';
import Match from '../models/Match.js';
import Game from '../models/Game.js';

/**
 * Update user profile
 */
export const updateUserProfile = async (userId, { name, avatar }) => {
  const updates = {};
  if (name && name.trim()) updates.name = name.trim();
  if (avatar !== undefined) updates.avatar = avatar.trim();

  const user = await User.findByIdAndUpdate(userId, updates, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return user.toJSON();
};

/**
 * Get comprehensive player activity history:
 * - Recent scores submitted
 * - Unique games played
 * - Multiplayer matches played with stats
 */
export const getUserHistory = async (userId) => {
  // Recent scores with populated game details
  const recentScores = await Score.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(20)
    .populate('game', 'title thumbnail category');

  // Top personal best per game
  const personalBests = await Score.aggregate([
    { $match: { user: userId } },
    { $sort: { score: -1 } },
    {
      $group: {
        _id: '$game',
        bestScore: { $first: '$score' },
        achievedAt: { $first: '$createdAt' },
      },
    },
    {
      $lookup: {
        from: 'games',
        localField: '_id',
        foreignField: '_id',
        as: 'game',
      },
    },
    { $unwind: '$game' },
    {
      $project: {
        _id: 1,
        bestScore: 1,
        achievedAt: 1,
        'game.title': 1,
        'game.thumbnail': 1,
        'game.category': 1,
      },
    },
  ]);

  // Multiplayer matches history
  const matches = await Match.find({ 'players.user': userId })
    .sort({ createdAt: -1 })
    .limit(15)
    .populate('players.user', 'name avatar')
    .populate('winner', 'name avatar');

  // Calculate multiplayer stats
  const totalMatches = await Match.countDocuments({ 'players.user': userId, status: 'COMPLETED' });
  const wins = await Match.countDocuments({ winner: userId, status: 'COMPLETED' });
  const draws = await Match.countDocuments({
    'players.user': userId,
    result: 'DRAW',
    status: 'COMPLETED',
  });

  return {
    recentScores,
    personalBests,
    matches,
    multiplayerStats: {
      totalMatches,
      wins,
      draws,
      losses: Math.max(0, totalMatches - wins - draws),
    },
  };
};
