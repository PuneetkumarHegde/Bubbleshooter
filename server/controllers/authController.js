import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { JWT_SECRET, GAME_NAME } from '../config/gameConfig.js';

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields (name, email, password) are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email address already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      currentLevel: 1,
      totalScore: 0,
      totalStars: 0,
      boosterInventory: { bomb: 3, rainbow: 2, aimGuide: 3, extraShot: 2, shuffle: 2 },
    });

    await user.save();

    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      message: `Welcome to ${GAME_NAME}!`,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        currentLevel: user.currentLevel,
        totalScore: user.totalScore,
        totalStars: user.totalStars,
        boosterInventory: user.boosterInventory,
        completedLevels: user.completedLevels,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
      success: true,
      message: `Welcome back to ${GAME_NAME}!`,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        currentLevel: user.currentLevel,
        totalScore: user.totalScore,
        totalStars: user.totalStars,
        bubblesPopped: user.bubblesPopped,
        bestCombo: user.bestCombo,
        rescuedObjects: user.rescuedObjects,
        boosterInventory: user.boosterInventory,
        completedLevels: user.completedLevels,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req, res, next) {
  try {
    const user = req.user;
    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        currentLevel: user.currentLevel,
        totalScore: user.totalScore,
        totalStars: user.totalStars,
        bubblesPopped: user.bubblesPopped,
        bestCombo: user.bestCombo,
        rescuedObjects: user.rescuedObjects,
        boosterInventory: user.boosterInventory,
        completedLevels: user.completedLevels,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res) {
  res.status(200).json({ success: true, message: 'Logged out successfully.' });
}

