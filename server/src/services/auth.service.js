import jwt from 'jsonwebtoken';
import User, { ROLES } from '../models/User.js';
import { env } from '../config/env.js';

/**
 * Generate JWT token for an authenticated user
 */
export const generateToken = (user) => {
  if (!env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured on the server');
  }

  const payload = {
    id: user._id.toString(),
    role: user.role,
  };

  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * Register a new user with default PLAYER role
 */
export const registerUser = async ({ name, email, password }) => {
  const normalizedEmail = email.toLowerCase().trim();

  // Check for existing user
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    const error = new Error('Email is already registered');
    error.statusCode = 400;
    throw error;
  }

  // Hash password
  const passwordHash = await User.hashPassword(password);

  // Create user (Strictly enforce PLAYER role for public registration)
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    role: ROLES.PLAYER,
    isActive: true,
  });

  // Generate JWT token
  const token = generateToken(user);

  return {
    user: user.toJSON(),
    token,
  };
};

/**
 * Authenticate existing user and issue token
 */
export const loginUser = async ({ email, password }) => {
  const normalizedEmail = email.toLowerCase().trim();

  // Find user and explicitly select passwordHash
  const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');
  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  // Check active status
  if (!user.isActive) {
    const error = new Error('Account has been deactivated. Please contact support.');
    error.statusCode = 403;
    throw error;
  }

  // Validate password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  // Generate JWT token
  const token = generateToken(user);

  return {
    user: user.toJSON(),
    token,
  };
};

/**
 * Retrieve user profile by ID
 */
export const getUserById = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  if (!user.isActive) {
    const error = new Error('Account has been deactivated');
    error.statusCode = 403;
    throw error;
  }

  return user.toJSON();
};
