import express from 'express';
import { getDailyChallenge, completeDailyChallenge } from '../controllers/dailyController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getDailyChallenge);
router.post('/complete', authenticateToken, completeDailyChallenge);

export default router;
