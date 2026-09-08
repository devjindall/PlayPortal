import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { registerValidator, loginValidator } from '../validators/auth.validator.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { ROLES } from '../models/User.js';

const router = Router();

// Public authentication routes
router.post('/register', registerValidator, authController.register);
router.post('/login', loginValidator, authController.login);

// Protected authenticated routes
router.get('/me', authenticate, authController.getMe);

// Role verification test routes
router.get(
  '/test/player',
  authenticate,
  authorize(ROLES.PLAYER, ROLES.DEVELOPER, ROLES.ADMIN),
  authController.testPlayerAccess
);

router.get(
  '/test/developer',
  authenticate,
  authorize(ROLES.DEVELOPER, ROLES.ADMIN),
  authController.testDeveloperAccess
);

router.get(
  '/test/admin',
  authenticate,
  authorize(ROLES.ADMIN),
  authController.testAdminAccess
);

export default router;
