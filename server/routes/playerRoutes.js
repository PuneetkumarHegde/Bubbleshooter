import express from 'express';
import { getPlayerProgress } from '../controllers/playerController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/progress', authenticateToken, getPlayerProgress);

export default router;

