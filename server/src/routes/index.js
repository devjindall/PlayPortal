import { Router } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import gameRoutes from './game.routes.js';
import developerRoutes from './developer.routes.js';
import adminRoutes from './admin.routes.js';

const apiRouter = Router();

// Mount API route groups
apiRouter.use('/health', healthRoutes);
apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/games', gameRoutes);
apiRouter.use('/developer', developerRoutes);
apiRouter.use('/admin', adminRoutes);

export default apiRouter;
