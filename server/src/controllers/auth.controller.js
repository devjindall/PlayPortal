import * as authService from '../services/auth.service.js';

/**
 * Register new user
 * POST /api/auth/register
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const result = await authService.registerUser({ name, email, password });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token: result.token,
      user: result.user,
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
 * Authenticate user & login
 * POST /api/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser({ email, password });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token: result.token,
      user: result.user,
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
 * Get current authenticated user profile
 * GET /api/auth/me
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
 * Role access test handler for PLAYER
 * GET /api/auth/test/player
 */
export const testPlayerAccess = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Player endpoint access granted',
    role: req.user.role,
  });
};

/**
 * Role access test handler for DEVELOPER
 * GET /api/auth/test/developer
 */
export const testDeveloperAccess = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Developer endpoint access granted',
    role: req.user.role,
  });
};

/**
 * Role access test handler for ADMIN
 * GET /api/auth/test/admin
 */
export const testAdminAccess = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Admin endpoint access granted',
    role: req.user.role,
  });
};
