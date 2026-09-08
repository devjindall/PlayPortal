import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { initTicTacToeSocket } from './sockets/ticTacToe.socket.js';

const startServer = async () => {
  // Attempt Database Connection
  await connectDB();

  // Create HTTP Server
  const httpServer = http.createServer(app);

  // Initialize Socket.IO Server
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || origin === env.CLIENT_URL || env.isDevelopment) {
          callback(null, true);
        } else {
          callback(new Error(`Origin ${origin} not allowed by CORS`));
        }
      },
      credentials: true,
    },
  });

  // Attach Tic-Tac-Toe multiplayer socket handlers
  initTicTacToeSocket(io);

  // Start HTTP Server
  const server = httpServer.listen(env.PORT, () => {
    console.log(`🚀 PlayPortal Server running in [${env.NODE_ENV}] mode on port ${env.PORT}`);
    console.log(`📡 Health endpoint: http://localhost:${env.PORT}/api/health`);
    console.log(`🎮 Socket.IO ready for real-time multiplayer gaming`);
  });

  // Handle Unhandled Promise Rejections
  process.on('unhandledRejection', (err) => {
    console.error(`Unhandled Rejection Error: ${err.message}`);
    server.close(() => process.exit(1));
  });
};

startServer();
