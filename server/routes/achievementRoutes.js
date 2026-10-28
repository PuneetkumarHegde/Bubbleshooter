import express from 'express';
import { getAchievements, getMyAchievements } from '../controllers/achievementController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getAchievements);
router.get('/me', authenticateToken, getMyAchievements);

export default router;
