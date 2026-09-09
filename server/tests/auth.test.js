import assert from 'node:assert';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import app from '../src/app.js';
import User, { ROLES } from '../src/models/User.js';
import { env } from '../src/config/env.js';

const TEST_PORT = 5055;
const BASE_URL = `http://localhost:${TEST_PORT}/api`;

let server;

async function setup() {
  console.log('🧪 Setting up Auth & RBAC test suite...');
  
  // Connect to MongoDB
  const mongoUri = env.MONGODB_URI || 'mongodb://127.0.0.1:27017/playportal_test';
  await mongoose.connect(mongoUri);
  console.log('✅ Connected to MongoDB for testing');

  // Clear test users
  await User.deleteMany({ email: /@test\.com$/ });

  // Start temporary test server
  await new Promise((resolve) => {
    server = app.listen(TEST_PORT, () => {
      console.log(`✅ Test server running on port ${TEST_PORT}`);
      resolve();
    });
  });
}

async function teardown() {
  console.log('🧹 Cleaning up test database and closing server...');
  await User.deleteMany({ email: /@test\.com$/ });
  await mongoose.connection.close();
  await new Promise((resolve) => server.close(resolve));
  console.log('✅ Test suite cleanup completed');
}

async function runTests() {
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
  console.log('RUNNING AUTHENTICATION & RBAC TESTS');
  console.log('========================================\n');

  // --- 1. REGISTRATION TESTS ---
  console.log('--- 1. Registration Tests ---');

  await test('POST /api/auth/register - Successfully registers a PLAYER user', async () => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Alice Player',
        email: 'alice@test.com',
        password: 'Password123!',
      }),
    });

    const data = await res.json();
    assert.strictEqual(res.status, 201);
    assert.strictEqual(data.success, true);
    assert.ok(data.token, 'Expected JWT token to be returned');
    assert.strictEqual(data.user.name, 'Alice Player');
    assert.strictEqual(data.user.email, 'alice@test.com');
    assert.strictEqual(data.user.role, 'PLAYER');
    assert.strictEqual(data.user.isActive, true);
    assert.strictEqual(data.user.passwordHash, undefined, 'passwordHash must never be returned');
  });

  await test('Database Verification - Password is saved as bcrypt hash and not plaintext', async () => {
    const dbUser = await User.findOne({ email: 'alice@test.com' }).select('+passwordHash');
    assert.ok(dbUser, 'User must exist in database');
    assert.notStrictEqual(dbUser.passwordHash, 'Password123!', 'Password must NOT be plaintext');
    const isBcryptHash = dbUser.passwordHash.startsWith('$2');
    assert.ok(isBcryptHash, 'Password must be a bcrypt hash string');
    const isMatch = await bcrypt.compare('Password123!', dbUser.passwordHash);
    assert.strictEqual(isMatch, true, 'bcrypt.compare must validate candidate password');
  });

  await test('Security - Role tampering during registration is ignored (defaults to PLAYER)', async () => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Sneaky Hacker',
        email: 'hacker@test.com',
        password: 'Password123!',
        role: 'ADMIN', // Attempt privilege escalation
      }),
    });

    const data = await res.json();
    assert.strictEqual(res.status, 201);
    assert.strictEqual(data.user.role, 'PLAYER', 'Role must remain PLAYER regardless of payload');

    const dbUser = await User.findOne({ email: 'hacker@test.com' });
    assert.strictEqual(dbUser.role, 'PLAYER', 'Database role must be strictly PLAYER');
  });

  await test('POST /api/auth/register - Rejects duplicate email', async () => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Duplicate Alice',
        email: 'alice@test.com',
        password: 'Password123!',
      }),
    });

    const data = await res.json();
    assert.strictEqual(res.status, 400);
    assert.strictEqual(data.success, false);
    assert.ok(data.message.includes('already registered'));
  });

  await test('POST /api/auth/register - Rejects invalid email', async () => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Invalid Email User',
        email: 'not-an-email',
        password: 'Password123!',
      }),
    });

    const data = await res.json();
    assert.strictEqual(res.status, 400);
    assert.strictEqual(data.success, false);
    assert.ok(data.errors.some((e) => e.field === 'email'));
  });

  await test('POST /api/auth/register - Rejects missing name', async () => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'noname@test.com',
        password: 'Password123!',
      }),
    });

    const data = await res.json();
    assert.strictEqual(res.status, 400);
    assert.strictEqual(data.success, false);
    assert.ok(data.errors.some((e) => e.field === 'name'));
  });

  await test('POST /api/auth/register - Rejects short password (< 6 chars)', async () => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Short Pass',
        email: 'shortpass@test.com',
        password: '123',
      }),
    });

    const data = await res.json();
    assert.strictEqual(res.status, 400);
    assert.strictEqual(data.success, false);
    assert.ok(data.errors.some((e) => e.field === 'password'));
  });

  // --- 2. LOGIN TESTS ---
  console.log('\n--- 2. Login Tests ---');

  let playerToken = '';

  await test('POST /api/auth/login - Successfully logs in valid user', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'alice@test.com',
        password: 'Password123!',
      }),
    });

    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(data.token);
    assert.strictEqual(data.user.email, 'alice@test.com');
    assert.strictEqual(data.user.passwordHash, undefined);
    playerToken = data.token;
  });

  await test('POST /api/auth/login - Rejects incorrect password', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'alice@test.com',
        password: 'WrongPassword!',
      }),
    });

    const data = await res.json();
    assert.strictEqual(res.status, 401);
    assert.strictEqual(data.success, false);
    assert.strictEqual(data.message, 'Invalid email or password');
  });

  await test('POST /api/auth/login - Rejects non-existent email', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'nobody@test.com',
        password: 'Password123!',
      }),
    });

    const data = await res.json();
    assert.strictEqual(res.status, 401);
    assert.strictEqual(data.success, false);
    assert.strictEqual(data.message, 'Invalid email or password');
  });

  await test('POST /api/auth/login - Rejects deactivated user', async () => {
    // Deactivate alice
    await User.updateOne({ email: 'alice@test.com' }, { isActive: false });

    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'alice@test.com',
        password: 'Password123!',
      }),
    });

    const data = await res.json();
    assert.strictEqual(res.status, 403);
    assert.strictEqual(data.success, false);
    assert.ok(data.message.includes('deactivated'));

    // Reactivate alice for subsequent tests
    await User.updateOne({ email: 'alice@test.com' }, { isActive: true });
  });

  // --- 3. AUTHENTICATION & /me TESTS ---
  console.log('\n--- 3. Authentication & /api/auth/me Tests ---');

  await test('GET /api/auth/me - Successfully retrieves profile with valid token', async () => {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${playerToken}` },
    });

    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.user.email, 'alice@test.com');
    assert.strictEqual(data.user.role, 'PLAYER');
    assert.strictEqual(data.user.passwordHash, undefined);
  });

  await test('GET /api/auth/me - Rejects missing Authorization header', async () => {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      method: 'GET',
    });

    const data = await res.json();
    assert.strictEqual(res.status, 401);
    assert.strictEqual(data.success, false);
    assert.ok(data.message.includes('token required'));
  });

  await test('GET /api/auth/me - Rejects malformed/invalid token', async () => {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      method: 'GET',
      headers: { Authorization: 'Bearer invalid_fake_token_value' },
    });

    const data = await res.json();
    assert.strictEqual(res.status, 401);
    assert.strictEqual(data.success, false);
    assert.ok(data.message.includes('Invalid or expired'));
  });

  await test('GET /api/auth/me - Rejects deactivated user holding valid token', async () => {
    // Temporarily deactivate alice
    await User.updateOne({ email: 'alice@test.com' }, { isActive: false });

    const res = await fetch(`${BASE_URL}/auth/me`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${playerToken}` },
    });

    const data = await res.json();
    assert.strictEqual(res.status, 403);
    assert.strictEqual(data.success, false);
    assert.ok(data.message.includes('deactivated'));

    // Reactivate alice
    await User.updateOne({ email: 'alice@test.com' }, { isActive: true });
  });

  // --- 4. ROLE-BASED ACCESS CONTROL (RBAC) TESTS ---
  console.log('\n--- 4. Role-Based Access Control (RBAC) Tests ---');

  // Create DEVELOPER user
  const devHash = await User.hashPassword('Password123!');
  const devUser = await User.create({
    name: 'Bob Developer',
    email: 'bob@test.com',
    passwordHash: devHash,
    role: ROLES.DEVELOPER,
    isActive: true,
  });

  // Create ADMIN user
  const adminHash = await User.hashPassword('Password123!');
  const adminUser = await User.create({
    name: 'Charlie Admin',
    email: 'charlie@test.com',
    passwordHash: adminHash,
    role: ROLES.ADMIN,
    isActive: true,
  });

  // Login DEVELOPER and ADMIN to obtain tokens
  const devLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'bob@test.com', password: 'Password123!' }),
  });
  const devToken = (await devLoginRes.json()).token;

  const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'charlie@test.com', password: 'Password123!' }),
  });
  const adminToken = (await adminLoginRes.json()).token;

  // PLAYER access checks
  await test('RBAC - PLAYER can access /api/auth/test/player', async () => {
    const res = await fetch(`${BASE_URL}/auth/test/player`, {
      headers: { Authorization: `Bearer ${playerToken}` },
    });
    assert.strictEqual(res.status, 200);
  });

  await test('RBAC - PLAYER CANNOT access /api/auth/test/developer (403)', async () => {
    const res = await fetch(`${BASE_URL}/auth/test/developer`, {
      headers: { Authorization: `Bearer ${playerToken}` },
    });
    const data = await res.json();
    assert.strictEqual(res.status, 403);
    assert.strictEqual(data.success, false);
  });

  await test('RBAC - PLAYER CANNOT access /api/auth/test/admin (403)', async () => {
    const res = await fetch(`${BASE_URL}/auth/test/admin`, {
      headers: { Authorization: `Bearer ${playerToken}` },
    });
    const data = await res.json();
    assert.strictEqual(res.status, 403);
    assert.strictEqual(data.success, false);
  });

  // DEVELOPER access checks
  await test('RBAC - DEVELOPER can access /api/auth/test/player', async () => {
    const res = await fetch(`${BASE_URL}/auth/test/player`, {
      headers: { Authorization: `Bearer ${devToken}` },
    });
    assert.strictEqual(res.status, 200);
  });

  await test('RBAC - DEVELOPER can access /api/auth/test/developer', async () => {
    const res = await fetch(`${BASE_URL}/auth/test/developer`, {
      headers: { Authorization: `Bearer ${devToken}` },
    });
    assert.strictEqual(res.status, 200);
  });

  await test('RBAC - DEVELOPER CANNOT access /api/auth/test/admin (403)', async () => {
    const res = await fetch(`${BASE_URL}/auth/test/admin`, {
      headers: { Authorization: `Bearer ${devToken}` },
    });
    const data = await res.json();
    assert.strictEqual(res.status, 403);
    assert.strictEqual(data.success, false);
  });

  // ADMIN access checks
  await test('RBAC - ADMIN can access /api/auth/test/player', async () => {
    const res = await fetch(`${BASE_URL}/auth/test/player`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 200);
  });

  await test('RBAC - ADMIN can access /api/auth/test/developer', async () => {
    const res = await fetch(`${BASE_URL}/auth/test/developer`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 200);
  });

  await test('RBAC - ADMIN can access /api/auth/test/admin', async () => {
    const res = await fetch(`${BASE_URL}/auth/test/admin`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 200);
  });

  // --- 5. HEALTH CHECK INTEGRITY TEST ---
  console.log('\n--- 5. Health Check Integrity Test ---');

  await test('GET /api/health - Baseline endpoint still functions', async () => {
    const res = await fetch(`${BASE_URL}/health`);
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.status, 'ok');
    assert.strictEqual(data.database, 'connected');
  });

  console.log('\n========================================');
  console.log(`TEST SUMMARY: ${passed} passed, ${failed} failed`);
  console.log('========================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

async function main() {
  try {
    await setup();
    await runTests();
  } catch (err) {
    console.error('Fatal test error:', err);
    process.exit(1);
  } finally {
    await teardown();
  }
}

main();
