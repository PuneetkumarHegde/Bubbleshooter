import express from 'express';
import { getLevels, getLevelById } from '../controllers/levelController.js';

const router = express.Router();

router.get('/', getLevels);
router.get('/:id', getLevelById);

export default router;

