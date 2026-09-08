import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './config/env.js';
import apiRouter from './routes/index.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Allow HTML5 game iframe loading
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Centralized CORS origin validator
export const corsOriginChecker = (origin, callback) => {
  if (!origin || env.isDevelopment) {
    return callback(null, true);
  }

  const allowed = (env.CLIENT_URL || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  if (allowed.includes('*') || allowed.includes(origin)) {
    return callback(null, true);
  }

  if (
    origin.endsWith('.vercel.app') ||
    origin.endsWith('.onrender.com') ||
    origin.endsWith('.netlify.app') ||
    origin.endsWith('.railway.app')
  ) {
    return callback(null, true);
  }

  return callback(new Error(`Origin ${origin} not allowed by CORS`));
};

// Enable CORS
app.use(
  cors({
    origin: corsOriginChecker,
    credentials: true,
  })
);

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Request body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP request logger in development
if (env.isDevelopment && process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Serve uploaded game assets and thumbnails statically
const uploadsDir = path.resolve(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsDir));

// Mount API routes
app.use('/api', apiRouter);

// Frontend static serving for production / unified deployments
const clientDistCandidates = [
  path.resolve(__dirname, '../../client/dist'),
  path.resolve(__dirname, '../client/dist'),
  path.resolve(__dirname, '../../dist'),
];

const clientDistDir = clientDistCandidates.find((d) => fs.existsSync(path.join(d, 'index.html')));

if (clientDistDir) {
  const indexHtml = path.join(clientDistDir, 'index.html');
  app.use(express.static(clientDistDir));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(indexHtml);
  });
} else {
  // Root route for quick verification when frontend is hosted separately
  app.get('/', (req, res) => {
    res.status(200).json({
      message: 'Welcome to PlayPortal API Server',
      health: '/api/health',
      version: '1.0.0',
    });
  });
}

// Catch 404 routes
app.use(notFoundHandler);

// Central error handler
app.use(errorHandler);

export default app;
