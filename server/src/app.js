import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
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

// Enable CORS
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || origin === env.CLIENT_URL || env.isDevelopment) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
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

// Root route for quick verification
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to PlayPortal API Server',
    health: '/api/health',
    version: '1.0.0',
  });
});

// Mount API routes
app.use('/api', apiRouter);

// Catch 404 routes
app.use(notFoundHandler);

// Central error handler
app.use(errorHandler);

export default app;
