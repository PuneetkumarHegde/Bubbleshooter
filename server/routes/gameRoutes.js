import express from 'express';
import { startGameSession, completeGameSession, getGameHistory, getGameById } from '../controllers/gameController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/start', authenticateToken, startGameSession);
router.post('/complete', authenticateToken, completeGameSession);
router.get('/history', authenticateToken, getGameHistory);
router.get('/:id', authenticateToken, getGameById);

export default router;
