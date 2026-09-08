import assert from 'node:assert';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import AdmZip from 'adm-zip';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import app from '../src/app.js';
import User, { ROLES } from '../src/models/User.js';
import Game, { GAME_STATUS } from '../src/models/Game.js';
import GameSubmission, { SUBMISSION_STATUS } from '../src/models/GameSubmission.js';
import Score from '../src/models/Score.js';
import Match from '../src/models/Match.js';
import { env } from '../src/config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEST_PORT = 5066;
const BASE_URL = `http://localhost:${TEST_PORT}/api`;

let server;

// Sample ZIP creation helper for upload testing
const createTestGameZip = (hasIndexHtml = true, isMalicious = false) => {
  const zip = new AdmZip();
  if (hasIndexHtml) {
    zip.addFile('index.html', Buffer.from('<!DOCTYPE html><html><body><h1>Test Game</h1></body></html>', 'utf8'));
    zip.addFile('game.js', Buffer.from('console.log("game loaded");', 'utf8'));
  } else {
    zip.addFile('readme.txt', Buffer.from('No index html here', 'utf8'));
  }

  if (isMalicious) {
    // Attempt directory traversal entry name
    zip.addFile('../../../etc/evil.txt', Buffer.from('malicious payload', 'utf8'));
  }

  const zipPath = path.resolve(__dirname, `test-game-${Date.now()}.zip`);
  zip.writeZip(zipPath);
  return zipPath;
};

async function setup() {
  console.log('🧪 Setting up Complete PlayPortal E2E Test Suite...');
  const mongoUri = env.MONGODB_URI || 'mongodb://127.0.0.1:27017/playportal_test';
  await mongoose.connect(mongoUri);

  // Clear test data
  await User.deleteMany({ email: /@test\.com$/ });
  await Game.deleteMany({ title: /Test/ });
  await GameSubmission.deleteMany({ title: /Test/ });
  await Score.deleteMany({});
  await Match.deleteMany({ roomId: /^TEST/ });

  await new Promise((resolve) => {
    server = app.listen(TEST_PORT, resolve);
  });
  console.log(`✅ Test server listening on port ${TEST_PORT}`);
}

async function teardown() {
  console.log('🧹 Teardown and cleaning up test resources...');
  await User.deleteMany({ email: /@test\.com$/ });
  await Game.deleteMany({ title: /Test/ });
  await GameSubmission.deleteMany({ title: /Test/ });
  await Score.deleteMany({});
  await Match.deleteMany({ roomId: /^TEST/ });
  await mongoose.connection.close();
  await new Promise((resolve) => server.close(resolve));
  console.log('✅ Cleanup finished');
}

async function runAllTests() {
  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ ${name}`);
      console.error(`    Error: ${err.message}`);
      if (err.stack) console.error(err.stack);
      failed++;
    }
  }

  console.log('\n========================================');
  console.log('PLAYPORTAL COMPLETE E2E INTEGRATION SUITE');
  console.log('========================================\n');

  let playerToken, devToken, adminToken;
  let playerId, devId, adminId;
  let testGameId, testSubmissionId;

  // ----------------------------------------
  // 1. AUTHENTICATION & RBAC TESTS
  // ----------------------------------------
  console.log('--- 1. Authentication & RBAC ---');

  await test('Register Player user (POST /api/auth/register)', async () => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test Player', email: 'player@test.com', password: 'Password123!' }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 201);
    assert.strictEqual(data.user.role, 'PLAYER');
    playerToken = data.token;
    playerId = data.user._id;
  });

  await test('Create & Login Developer user', async () => {
    const hash = await User.hashPassword('Password123!');
    const dev = await User.create({
      name: 'Test Dev',
      email: 'dev@test.com',
      passwordHash: hash,
      role: ROLES.DEVELOPER,
      isActive: true,
    });
    devId = dev._id.toString();

    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'dev@test.com', password: 'Password123!' }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    devToken = data.token;
  });

  await test('Create & Login Admin user', async () => {
    const hash = await User.hashPassword('Password123!');
    const admin = await User.create({
      name: 'Test Admin',
      email: 'admin@test.com',
      passwordHash: hash,
      role: ROLES.ADMIN,
      isActive: true,
    });
    adminId = admin._id.toString();

    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@test.com', password: 'Password123!' }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    adminToken = data.token;
  });

  await test('Get Authenticated Profile (GET /api/auth/me)', async () => {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${playerToken}` },
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.user.email, 'player@test.com');
  });

  // ----------------------------------------
  // 2. DEVELOPER UPLOAD & SUBMISSION TESTS
  // ----------------------------------------
  console.log('\n--- 2. Developer Upload & Moderation Workflow ---');

  await test('Developer Upload HTML5 Game ZIP (POST /api/developer/games)', async () => {
    const validZipPath = createTestGameZip(true, false);

    const formData = new FormData();
    formData.append('title', 'Test Space Raider');
    formData.append('description', 'An exciting test arcade game');
    formData.append('category', 'Action');
    formData.append('supportsScores', 'true');

    const fileBuffer = fs.readFileSync(validZipPath);
    formData.append('gameFile', new Blob([fileBuffer], { type: 'application/zip' }), 'test-game.zip');

    const res = await fetch(`${BASE_URL}/developer/games`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${devToken}` },
      body: formData,
    });

    if (fs.existsSync(validZipPath)) fs.unlinkSync(validZipPath);

    const data = await res.json();
    assert.strictEqual(res.status, 201);
    assert.strictEqual(data.data.game.status, 'PENDING');
    assert.strictEqual(data.data.submission.status, 'PENDING');
    assert.ok(data.data.game.gameUrl.includes('index.html'));

    testGameId = data.data.game._id;
    testSubmissionId = data.data.submission._id;
  });

  await test('Security - Reject ZIP without index.html', async () => {
    const invalidZipPath = createTestGameZip(false, false);

    const formData = new FormData();
    formData.append('title', 'Invalid Game');
    formData.append('description', 'Missing index.html');
    formData.append('category', 'Puzzle');

    const fileBuffer = fs.readFileSync(invalidZipPath);
    formData.append('gameFile', new Blob([fileBuffer], { type: 'application/zip' }), 'invalid-game.zip');

    const res = await fetch(`${BASE_URL}/developer/games`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${devToken}` },
      body: formData,
    });

    if (fs.existsSync(invalidZipPath)) fs.unlinkSync(invalidZipPath);

    const data = await res.json();
    assert.strictEqual(res.status, 500); // Storage validation throws safe error
    assert.ok(data.message.includes('index.html'));
  });

  await test('Developer List Own Games (GET /api/developer/games)', async () => {
    const res = await fetch(`${BASE_URL}/developer/games`, {
      headers: { Authorization: `Bearer ${devToken}` },
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.ok(data.data.some((g) => g._id === testGameId));
  });

  // ----------------------------------------
  // 3. ADMIN MODERATION & APPROVAL TESTS
  // ----------------------------------------
  console.log('\n--- 3. Admin Moderation & Approval ---');

  await test('Admin List Submissions (GET /api/admin/submissions)', async () => {
    const res = await fetch(`${BASE_URL}/admin/submissions?status=PENDING`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.ok(data.data.some((s) => s._id === testSubmissionId));
  });

  await test('Admin Approve Submission (PATCH /api/admin/submissions/:id/approve)', async () => {
    const res = await fetch(`${BASE_URL}/admin/submissions/${testSubmissionId}/approve`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.data.submission.status, 'APPROVED');
    assert.strictEqual(data.data.game.status, 'PUBLISHED');
  });

  // ----------------------------------------
  // 4. GAME CATALOG & LEADERBOARD TESTS
  // ----------------------------------------
  console.log('\n--- 4. Public Catalog & Score Submissions ---');

  await test('Public Game Discovery (GET /api/games)', async () => {
    const res = await fetch(`${BASE_URL}/games?category=Action`);
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.ok(data.data.some((g) => g._id === testGameId));
  });

  await test('Get Game Details (GET /api/games/:id)', async () => {
    const res = await fetch(`${BASE_URL}/games/${testGameId}`);
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.data.title, 'Test Space Raider');
  });

  await test('Submit Score for Published Game (POST /api/games/:id/scores)', async () => {
    const res = await fetch(`${BASE_URL}/games/${testGameId}/scores`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${playerToken}`,
      },
      body: JSON.stringify({ score: 1250 }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 201);
    assert.strictEqual(data.data.score, 1250);
  });

  await test('Get Game Leaderboard (GET /api/games/:id/leaderboard)', async () => {
    const res = await fetch(`${BASE_URL}/games/${testGameId}/leaderboard`);
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.data.length, 1);
    assert.strictEqual(data.data[0].rank, 1);
    assert.strictEqual(data.data[0].score, 1250);
    assert.strictEqual(data.data[0].player.name, 'Test Player');
  });

  await test('Get Personal Game Scores (GET /api/games/:id/scores/me)', async () => {
    const res = await fetch(`${BASE_URL}/games/${testGameId}/scores/me`, {
      headers: { Authorization: `Bearer ${playerToken}` },
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.data.personalBest.score, 1250);
    assert.strictEqual(data.data.personalBest.rank, 1);
  });

  // ----------------------------------------
  // 5. USER PROFILE & HISTORY TESTS
  // ----------------------------------------
  console.log('\n--- 5. User Profile & Player History ---');

  await test('Update User Profile (PATCH /api/users/me)', async () => {
    const res = await fetch(`${BASE_URL}/users/me`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${playerToken}`,
      },
      body: JSON.stringify({ name: 'Alex SuperPlayer' }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.user.name, 'Alex SuperPlayer');
  });

  await test('Get Player History (GET /api/users/me/history)', async () => {
    const res = await fetch(`${BASE_URL}/users/me/history`, {
      headers: { Authorization: `Bearer ${playerToken}` },
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.ok(data.data.recentScores.length >= 1);
    assert.ok(data.data.personalBests.length >= 1);
  });

  // ----------------------------------------
  // 6. ADMIN USER MANAGEMENT TESTS
  // ----------------------------------------
  console.log('\n--- 6. Admin User Management ---');

  await test('Admin List Users (GET /api/admin/users)', async () => {
    const res = await fetch(`${BASE_URL}/admin/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.ok(data.data.length >= 3);
  });

  await test('Admin Toggle User Status (PATCH /api/admin/users/:id/status)', async () => {
    const res = await fetch(`${BASE_URL}/admin/users/${playerId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ isActive: false }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.data.isActive, false);

    // Verify deactivated user cannot query /me
    const blockedRes = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${playerToken}` },
    });
    assert.strictEqual(blockedRes.status, 403);
  });

  console.log('\n========================================');
  console.log(`TEST SUMMARY: ${passed} passed, ${failed} failed`);
  console.log('========================================\n');

  if (failed > 0) process.exit(1);
}

async function main() {
  try {
    await setup();
    await runAllTests();
  } catch (err) {
    console.error('Fatal E2E test failure:', err);
    process.exit(1);
  } finally {
    await teardown();
  }
}

main();
