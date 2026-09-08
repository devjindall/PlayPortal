import { Router } from 'express';
import { getDbDiagnostics } from '../config/db.js';
import { env } from '../config/env.js';

const router = Router();

/**
 * @route   GET /api/health
 * @desc    Check API health and connectivity status
 * @access  Public
 */
router.get('/', async (req, res) => {
  const dbStatus = await getDbDiagnostics();

  res.status(200).json({
    status: 'ok',
    version: '1.0.1-cross-origin-ready',
    message: 'PlayPortal API is running',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    database: dbStatus.connected ? 'connected' : 'disconnected',
    dbDetails: dbStatus,
  });
});

export default router;
