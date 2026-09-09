import { Router } from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { ROLES } from '../models/User.js';

const router = Router();

// Restrict all admin routes strictly to ADMIN role
router.use(authenticate, authorize(ROLES.ADMIN));

router.get('/submissions', adminController.getSubmissions);
router.get('/submissions/:id', adminController.getSubmissionById);
router.patch('/submissions/:id/approve', adminController.approveSubmission);
router.patch('/submissions/:id/reject', adminController.rejectSubmission);

router.get('/users', adminController.getUsers);
router.patch('/users/:id/status', adminController.toggleUserStatus);

// Game moderation
router.delete('/games/:id', adminController.deleteGame);

export default router;
