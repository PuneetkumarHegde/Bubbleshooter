import crypto from 'crypto';
import GameSession from '../models/GameSession.js';
import User from '../models/User.js';
import Level from '../models/Level.js';
import AntiCheatService from '../services/antiCheatService.js';

export async function startGameSession(req, res, next) {
  try {
    const { levelId } = req.body;
    if (!levelId) {
      return res.status(400).json({ success: false, message: 'levelId is required to start a game session.' });
    }

    const sessionToken = crypto.randomUUID();

    const session = new GameSession({
      userId: req.user._id,
      levelId: String(levelId),
      sessionToken,
      startedAt: new Date(),
      status: 'active',
      completed: false,
    });

    await session.save();

    res.status(201).json({
      success: true,
      session: {
        sessionId: session._id,
        sessionToken,
        levelId: session.levelId,
        startedAt: session.startedAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function completeGameSession(req, res, next) {
  try {
    const {
      sessionToken,
      levelId,
      score,
      stars,
      shotsUsed,
      durationSeconds,
      bubblesPopped,
      bestCombo,
      boostersUsed,
    } = req.body;

    if (!sessionToken) {
      return res.status(400).json({ success: false, message: 'sessionToken is required.' });
    }

    const session = await GameSession.findOne({ sessionToken });
    if (!session) {
      return res.status(404).json({ success: false, message: 'Game session not found.' });
    }

    // Attempt to load level metadata from DB or fallback default
    let levelData = await Level.findOne({ levelNumber: parseInt(levelId, 10) });
    if (!levelData) {
      // Default fallback envelope for procedural or custom levels
      levelData = {
        id: levelId,
        shots: 25,
        targetScore: 2000,
        starThresholds: [600, 1000, 1500],
      };
    }

    // Run Server-Side Anti-Cheat & Scoring Validation
    const validationResult = AntiCheatService.validateSubmission({
      session,
      user: req.user,
      levelData,
      submission: {
        score,
        stars,
        shotsUsed,
        durationSeconds,
        bubblesPopped,
        bestCombo,
        boostersUsed,
      },
    });

    if (!validationResult.valid) {
      session.status = 'invalidated';
      session.antiCheatFlagged = true;
      session.antiCheatReason = validationResult.reason;
      await session.save();

      return res.status(400).json({
        success: false,
        message: `Anti-Cheat Violation: ${validationResult.reason}`,
      });
    }

    // Update Session
    session.completed = true;
    session.status = 'completed';
    session.completedAt = new Date();
    session.durationSeconds = durationSeconds;
    session.shotsUsed = shotsUsed;
    session.bubblesPopped = bubblesPopped || 0;
    session.score = validationResult.verifiedScore;
    session.stars = validationResult.verifiedStars;
    session.bestCombo = bestCombo || 1;
    session.boostersUsed = boostersUsed || [];
    await session.save();

    // Update Player Progress
    const user = await User.findById(req.user._id);
    const completedMap = user.completedLevels || new Map();
    const prevRecord = completedMap.get(String(levelId));
    const prevStars = prevRecord?.stars || 0;
    const prevScore = prevRecord?.score || 0;

    const starGain = Math.max(0, validationResult.verifiedStars - prevStars);
    const scoreGain = Math.max(0, validationResult.verifiedScore - prevScore);

    completedMap.set(String(levelId), {
      stars: Math.max(prevStars, validationResult.verifiedStars),
      score: Math.max(prevScore, validationResult.verifiedScore),
      completedAt: new Date(),
    });

    user.completedLevels = completedMap;
    user.totalStars += starGain;
    user.totalScore += scoreGain;
    user.bubblesPopped += (bubblesPopped || 0);
    user.bestCombo = Math.max(user.bestCombo || 0, bestCombo || 0);
    user.currentLevel = Math.max(user.currentLevel, parseInt(levelId, 10) + 1);

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Level session successfully validated and saved!',
      result: {
        verifiedScore: validationResult.verifiedScore,
        verifiedStars: validationResult.verifiedStars,
        totalScore: user.totalScore,
        totalStars: user.totalStars,
        currentLevel: user.currentLevel,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getGameHistory(req, res, next) {
  try {
    const history = await GameSession.find({ userId: req.user._id, completed: true })
      .sort({ completedAt: -1 })
      .limit(20)
      .select('levelId score stars shotsUsed bestCombo completedAt startedAt');

    res.status(200).json({ success: true, history });
  } catch (err) {
    next(err);
  }
}

export async function getGameById(req, res, next) {
  try {
    const session = await GameSession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found.' });
    }
    res.status(200).json({ success: true, session });
  } catch (err) {
    next(err);
  }
}

