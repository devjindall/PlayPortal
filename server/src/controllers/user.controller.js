import * as userService from '../services/user.service.js';

/**
 * GET /api/users/me
 * Returns current authenticated user profile
 */
export const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/users/me
 * Updates current user profile (name, avatar)
 */
export const updateMe = async (req, res, next) => {
  try {
    const { name, avatar } = req.body;
    const updatedUser = await userService.updateUserProfile(req.user._id, { name, avatar });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser,
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
 * GET /api/users/me/history
 * Returns user game history, personal bests, and match stats
 */
export const getMyHistory = async (req, res, next) => {
  try {
    const history = await userService.getUserHistory(req.user._id);

    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};
