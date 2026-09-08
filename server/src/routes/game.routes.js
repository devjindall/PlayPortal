import { Router } from 'express';
import * as gameController from '../controllers/game.controller.js';
import * as scoreController from '../controllers/score.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Public game browsing
router.get('/', gameController.getGames);
router.get('/:id', gameController.getGameById);

// Public leaderboard for a game
router.get('/:id/leaderboard', scoreController.getLeaderboard);

// Authenticated score routes
router.get('/:id/scores/me', authenticate, scoreController.getMyGameScores);
router.post('/:id/scores', authenticate, scoreController.submitGameScore);

export default router;
