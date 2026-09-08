import * as scoreService from '../services/score.service.js';

/**
 * POST /api/games/:id/scores
 * Submit score for a game
 */
export const submitGameScore = async (req, res, next) => {
  try {
    const { score } = req.body;
    const gameId = req.params.id;
    const userId = req.user._id;

    const newScore = await scoreService.submitScore({
      gameId,
      userId,
      score,
    });

    res.status(201).json({
      success: true,
      message: 'Score submitted successfully',
      data: newScore,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * GET /api/games/:id/leaderboard
 * Get game leaderboard
 */
export const getLeaderboard = async (req, res, next) => {
  try {
    const gameId = req.params.id;
    const { limit } = req.query;

    const leaderboard = await scoreService.getGameLeaderboard({
      gameId,
      limit,
    });

    res.status(200).json({
      success: true,
      data: leaderboard,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/games/:id/scores/me
 * Get current user scores for a game
 */
export const getMyGameScores = async (req, res, next) => {
  try {
    const gameId = req.params.id;
    const userId = req.user._id;

    const scores = await scoreService.getUserGameScores({
      gameId,
      userId,
    });

    res.status(200).json({
      success: true,
      data: scores,
    });
  } catch (error) {
    next(error);
  }
};
