import express from 'express';
import cors from 'cors';
import { GAME_NAME, PORT } from './config/gameConfig.js';
import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import levelRoutes from './routes/levelRoutes.js';
import gameRoutes from './routes/gameRoutes.js';
import leaderboardRoutes from './routes/leaderboardRoutes.js';
import achievementRoutes from './routes/achievementRoutes.js';
import dailyRoutes from './routes/dailyRoutes.js';
import playerRoutes from './routes/playerRoutes.js';

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Basic health check endpoints
app.get('/', (req, res) => {
  res.json({
    game: GAME_NAME,
    status: 'online',
    version: '1.0.0',
    description: `Official backend API for ${GAME_NAME}`,
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    game: GAME_NAME,
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Mount modular API routes
app.use('/api/auth', authRoutes);
app.use('/api/levels', levelRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/daily-challenge', dailyRoutes);
app.use('/api/player', playerRoutes);

// Error Handling Middleware
app.use(errorHandler);

// Start server after connecting to database
async function startServer() {
  try {
    await connectDB();
    const server = app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`🎮 [${GAME_NAME}] Server running on port ${PORT}`);
      console.log(`🚀 API Base URL: http://localhost:${PORT}/api`);
      console.log(`====================================================`);
    });
    return server;
  } catch (err) {
    console.error(`Failed to launch [${GAME_NAME}] server:`, err.message);
    process.exit(1);
  }
}

// Only auto-start when executed directly
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
