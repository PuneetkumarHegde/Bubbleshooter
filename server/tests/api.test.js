import test from 'node:test';
import assert from 'node:assert/strict';
import { connectDB, disconnectDB } from '../config/db.js';
import User from '../models/User.js';
import GameSession from '../models/GameSession.js';
import { AntiCheatService } from '../services/antiCheatService.js';
import { GAME_NAME } from '../config/gameConfig.js';

test('Bubble Blast Adventure Server Integration Test Suite', async (t) => {
  await t.test('1. Setup database connection', async () => {
    await connectDB();
    assert.ok(true, 'Database connected successfully');
  });

  let testUser;
  let testSessionToken;

  await t.test('2. User Model and Registration', async () => {
    // Clean up any previous test user
    await User.deleteMany({ email: 'tester@bubbleshooter.test' });

    testUser = new User({
      name: 'BraveShooter',
      email: 'tester@bubbleshooter.test',
      passwordHash: 'hashed_secret_test_password',
      currentLevel: 1,
      totalScore: 0,
      totalStars: 0,
    });
    await testUser.save();

    assert.equal(testUser.name, 'BraveShooter');
    assert.equal(testUser.currentLevel, 1);
    assert.equal(testUser.boosterInventory.bomb, 3);
  });

  await t.test('3. Game Session Lifecycle', async () => {
    const session = new GameSession({
      userId: testUser._id,
      levelId: '1',
      sessionToken: 'test-session-uuid-1234',
      status: 'active',
    });
    await session.save();
    testSessionToken = session.sessionToken;

    assert.equal(session.status, 'active');
    assert.equal(session.completed, false);
  });

  await t.test('4. Anti-Cheat Score Validation - Genuine Submission', async () => {
    const session = await GameSession.findOne({ sessionToken: testSessionToken });
    const levelData = { id: 1, shots: 25, starThresholds: [300, 500, 750] };

    const genuineSubmission = {
      score: 650,
      stars: 2,
      shotsUsed: 14,
      durationSeconds: 22,
      bubblesPopped: 18,
      bestCombo: 3,
      boostersUsed: [],
    };

    const result = AntiCheatService.validateSubmission({
      session,
      user: testUser,
      levelData,
      submission: genuineSubmission,
    });

    assert.equal(result.valid, true);
    assert.equal(result.verifiedScore, 650);
    assert.equal(result.verifiedStars, 2);
  });

  await t.test('5. Anti-Cheat Score Validation - Reject Absurd Score', async () => {
    const session = await GameSession.findOne({ sessionToken: testSessionToken });
    const levelData = { id: 1, shots: 25, starThresholds: [300, 500, 750] };

    const hackedSubmission = {
      score: 999999999, // Impossible cheated score!
      stars: 3,
      shotsUsed: 1,
      durationSeconds: 2,
      bubblesPopped: 3,
      bestCombo: 1,
    };

    const result = AntiCheatService.validateSubmission({
      session,
      user: testUser,
      levelData,
      submission: hackedSubmission,
    });

    assert.equal(result.valid, false);
    assert.match(result.reason, /exceeds mathematical ceiling/i);
  });

  await t.test('6. Anti-Cheat - Reject Impossible Fast Completion Time', async () => {
    const session = await GameSession.findOne({ sessionToken: testSessionToken });
    const levelData = { id: 1, shots: 25, starThresholds: [300, 500, 750] };

    const speedhackSubmission = {
      score: 500,
      stars: 2,
      shotsUsed: 20,
      durationSeconds: 1.5, // 20 shots in 1.5 seconds is impossible humanly!
      bubblesPopped: 15,
      bestCombo: 2,
    };

    const result = AntiCheatService.validateSubmission({
      session,
      user: testUser,
      levelData,
      submission: speedhackSubmission,
    });

    assert.equal(result.valid, false);
    assert.match(result.reason, /Impossible completion time/i);
  });

  await t.test('7. Centralized GAME_NAME Export Check', async () => {
    assert.ok(GAME_NAME, 'GAME_NAME is exported');
    assert.equal(typeof GAME_NAME, 'string');
    assert.ok(GAME_NAME.length > 0);
  });

  await t.test('8. Teardown test environment', async () => {
    await User.deleteMany({ email: 'tester@bubbleshooter.test' });
    await GameSession.deleteMany({ sessionToken: testSessionToken });
    await disconnectDB();
    assert.ok(true, 'Database disconnected cleanly');
  });
});
