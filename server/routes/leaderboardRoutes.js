import express from 'express';
import { getLeaderboard, getMyRank } from '../controllers/leaderboardController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getLeaderboard);
router.get('/me', authenticateToken, getMyRank);

export default router;
