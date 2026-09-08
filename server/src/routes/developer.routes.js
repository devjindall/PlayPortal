import { Router } from 'express';
import * as developerController from '../controllers/developer.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { ROLES } from '../models/User.js';
import { uploadGameFiles } from '../utils/upload.js';

const router = Router();

// Restrict all developer routes to DEVELOPER and ADMIN
router.use(authenticate, authorize(ROLES.DEVELOPER, ROLES.ADMIN));

router.post('/games', uploadGameFiles, developerController.uploadGame);
router.get('/games', developerController.getMyGames);
router.get('/games/:id', developerController.getMyGameDetails);
router.patch('/games/:id', developerController.updateMyGame);

export default router;
