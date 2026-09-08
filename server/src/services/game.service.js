import Game, { GAME_STATUS } from '../models/Game.js';

/**
 * Fetch published games with filtering, search, and pagination
 */
export const getPublishedGames = async ({
  search = '',
  category = '',
  page = 1,
  limit = 12,
  sort = 'popular',
}) => {
  const query = { status: GAME_STATUS.PUBLISHED };

  if (category && category !== 'All') {
    query.category = category;
  }

  if (search && search.trim()) {
    query.$or = [
      { title: { $regex: search.trim(), $options: 'i' } },
      { description: { $regex: search.trim(), $options: 'i' } },
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
  const skip = (pageNum - 1) * limitNum;

  let sortCriteria = { playCount: -1, createdAt: -1 };
  if (sort === 'newest') sortCriteria = { createdAt: -1 };
  if (sort === 'title') sortCriteria = { title: 1 };

  const [games, total] = await Promise.all([
    Game.find(query)
      .sort(sortCriteria)
      .skip(skip)
      .limit(limitNum)
      .populate('developer', 'name avatar'),
    Game.countDocuments(query),
  ]);

  return {
    games,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      hasMore: pageNum * limitNum < total,
    },
  };
};

/**
 * Fetch single game by ID
 */
export const getGameById = async (gameId) => {
  const game = await Game.findById(gameId).populate('developer', 'name avatar');
  if (!game) {
    const error = new Error('Game not found');
    error.statusCode = 404;
    throw error;
  }

  // Increment play count asynchronously
  Game.findByIdAndUpdate(gameId, { $inc: { playCount: 1 } }).exec();

  return game;
};
