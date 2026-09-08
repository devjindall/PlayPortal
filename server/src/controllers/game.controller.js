import * as gameService from '../services/game.service.js';

/**
 * GET /api/games
 * List published games with search, filter, and pagination
 */
export const getGames = async (req, res, next) => {
  try {
    const { search, category, page, limit, sort } = req.query;
    const result = await gameService.getPublishedGames({
      search,
      category,
      page,
      limit,
      sort,
    });

    res.status(200).json({
      success: true,
      data: result.games,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/games/:id
 * Get single published game details
 */
export const getGameById = async (req, res, next) => {
  try {
    const game = await gameService.getGameById(req.params.id);

    res.status(200).json({
      success: true,
      data: game,
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
