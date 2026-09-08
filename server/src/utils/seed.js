import mongoose from 'mongoose';
import User, { ROLES } from '../models/User.js';
import Game, { GAME_STATUS } from '../models/Game.js';
import GameSubmission, { SUBMISSION_STATUS } from '../models/GameSubmission.js';
import Score from '../models/Score.js';
import Match, { MATCH_STATUS, MATCH_RESULT } from '../models/Match.js';
import { env } from '../config/env.js';

export const seedDatabase = async () => {
  try {
    console.log('🌱 Seeding PlayPortal database...');

    // Clear existing collections
    await User.deleteMany({});
    await Game.deleteMany({});
    await GameSubmission.deleteMany({});
    await Score.deleteMany({});
    await Match.deleteMany({});

    // 1. Create Users
    const adminPasswordHash = await User.hashPassword('Admin123!');
    const devPasswordHash = await User.hashPassword('Dev123!');
    const playerPasswordHash = await User.hashPassword('Player123!');

    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@playportal.com',
      passwordHash: adminPasswordHash,
      role: ROLES.ADMIN,
      isActive: true,
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Admin',
    });

    const developer = await User.create({
      name: 'Pixel Studio Dev',
      email: 'dev@playportal.com',
      passwordHash: devPasswordHash,
      role: ROLES.DEVELOPER,
      isActive: true,
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Developer',
    });

    const player1 = await User.create({
      name: 'Alex Player',
      email: 'player@playportal.com',
      passwordHash: playerPasswordHash,
      role: ROLES.PLAYER,
      isActive: true,
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Alex',
    });

    const player2 = await User.create({
      name: 'Cyber Sam',
      email: 'gamer99@playportal.com',
      passwordHash: playerPasswordHash,
      role: ROLES.PLAYER,
      isActive: true,
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Sam',
    });

    console.log('✅ Created 4 seed users (Admin, Developer, 2 Players)');

    // 2. Create Published Games
    const game1 = await Game.create({
      title: 'Cyber Dodger',
      description:
        'Fast-paced space arcade dodger! Pilot your starfighter through dangerous asteroid fields, evade pulse hazards, and collect energizing crystals.',
      category: 'Action',
      thumbnail: '/uploads/thumbnails/thumb-cyber-dodger.svg',
      gameUrl: '/uploads/games/game-cyber-dodger/index.html',
      developer: developer._id,
      status: GAME_STATUS.PUBLISHED,
      supportsScores: true,
      supportsMultiplayer: false,
      playCount: 142,
    });

    const game2 = await Game.create({
      title: 'Neon Flap',
      description:
        'Test your reflexes in this vibrant neon arcade runner! Tap to flap your wings and navigate narrow cyber-pipes with precision timing.',
      category: 'Arcade',
      thumbnail: '/uploads/thumbnails/thumb-neon-flap.svg',
      gameUrl: '/uploads/games/game-neon-flap/index.html',
      developer: developer._id,
      status: GAME_STATUS.PUBLISHED,
      supportsScores: true,
      supportsMultiplayer: false,
      playCount: 289,
    });

    const game3 = await Game.create({
      title: 'Memory Matrix',
      description:
        'Cyberpunk themed tile matching memory puzzle! Train your mind, uncover matched pairs quickly, and set unbeatable efficiency high scores.',
      category: 'Puzzle',
      thumbnail: '/uploads/thumbnails/thumb-memory-matrix.svg',
      gameUrl: '/uploads/games/game-memory-matrix/index.html',
      developer: developer._id,
      status: GAME_STATUS.PUBLISHED,
      supportsScores: true,
      supportsMultiplayer: false,
      playCount: 95,
    });

    console.log('✅ Created 3 playable seed games');

    // 3. Create Approved Game Submissions
    await GameSubmission.create([
      {
        game: game1._id,
        developer: developer._id,
        title: game1.title,
        description: game1.description,
        category: game1.category,
        thumbnail: game1.thumbnail,
        gameFile: 'cyber-dodger.zip',
        status: SUBMISSION_STATUS.APPROVED,
        reviewedBy: admin._id,
        reviewedAt: new Date(),
      },
      {
        game: game2._id,
        developer: developer._id,
        title: game2.title,
        description: game2.description,
        category: game2.category,
        thumbnail: game2.thumbnail,
        gameFile: 'neon-flap.zip',
        status: SUBMISSION_STATUS.APPROVED,
        reviewedBy: admin._id,
        reviewedAt: new Date(),
      },
      {
        game: game3._id,
        developer: developer._id,
        title: game3.title,
        description: game3.description,
        category: game3.category,
        thumbnail: game3.thumbnail,
        gameFile: 'memory-matrix.zip',
        status: SUBMISSION_STATUS.APPROVED,
        reviewedBy: admin._id,
        reviewedAt: new Date(),
      },
    ]);

    // 4. Create Leaderboard Scores
    await Score.create([
      { game: game1._id, user: player1._id, score: 980 },
      { game: game1._id, user: player2._id, score: 740 },
      { game: game1._id, user: developer._id, score: 520 },
      { game: game2._id, user: player2._id, score: 320 },
      { game: game2._id, user: player1._id, score: 210 },
      { game: game3._id, user: player1._id, score: 1850 },
      { game: game3._id, user: player2._id, score: 1600 },
    ]);

    console.log('✅ Created sample leaderboard scores');

    // 5. Create Sample Multiplayer Match Record
    await Match.create({
      gameType: 'TIC_TAC_TOE',
      roomId: 'DEMO01',
      players: [
        { user: player1._id, name: player1.name, symbol: 'X', socketId: 'demo-s1' },
        { user: player2._id, name: player2.name, symbol: 'O', socketId: 'demo-s2' },
      ],
      winner: player1._id,
      winnerSymbol: 'X',
      result: MATCH_RESULT.WIN,
      status: MATCH_STATUS.COMPLETED,
      startedAt: new Date(Date.now() - 3600000),
      endedAt: new Date(Date.now() - 3300000),
    });

    console.log('✅ Seed completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    throw error;
  }
};

// If run directly via node command: node src/utils/seed.js
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  const uri = env.MONGODB_URI || 'mongodb://127.0.0.1:27017/playportal';
  mongoose.connect(uri).then(async () => {
    await seedDatabase();
    await mongoose.connection.close();
    process.exit(0);
  });
}
