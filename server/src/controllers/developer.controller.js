import * as developerService from '../services/developer.service.js';

/**
 * POST /api/developer/games
 * Upload a new game ZIP and metadata
 */
export const uploadGame = async (req, res, next) => {
  try {
    const { title, description, category, supportsScores } = req.body;
    const thumbnailFile = req.files?.thumbnail?.[0] || null;
    const zipFile = req.files?.gameFile?.[0] || null;

    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and category are required fields',
      });
    }

    if (!zipFile) {
      return res.status(400).json({
        success: false,
        message: 'Game ZIP archive (gameFile) is required',
      });
    }

    const result = await developerService.createGameSubmission({
      developerId: req.user._id,
      title,
      description,
      category,
      supportsScores,
      thumbnailFile,
      zipFile,
    });

    res.status(201).json({
      success: true,
      message: 'Game uploaded and submitted for admin review successfully',
      data: result,
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
 * GET /api/developer/games
 * Get all games submitted by the authenticated developer
 */
export const getMyGames = async (req, res, next) => {
  try {
    const games = await developerService.getDeveloperGames(req.user._id);

    res.status(200).json({
      success: true,
      data: games,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/developer/games/:id
 * Get single developer game details
 */
export const getMyGameDetails = async (req, res, next) => {
  try {
    const details = await developerService.getDeveloperGameDetails(
      req.user._id,
      req.params.id
    );

    res.status(200).json({
      success: true,
      data: details,
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
 * PATCH /api/developer/games/:id
 * Update developer game metadata
 */
export const updateMyGame = async (req, res, next) => {
  try {
    const updatedGame = await developerService.updateDeveloperGame(
      req.user._id,
      req.params.id,
      req.body
    );

    res.status(200).json({
      success: true,
      message: 'Game metadata updated successfully',
      data: updatedGame,
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
