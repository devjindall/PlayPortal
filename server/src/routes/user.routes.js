import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// All user routes require authentication
router.use(authenticate);

router.get('/me', userController.getMe);
router.patch('/me', userController.updateMe);
router.get('/me/history', userController.getMyHistory);

export default router;
