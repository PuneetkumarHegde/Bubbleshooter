import express from 'express';
import cors from 'cors';
import { GAME_NAME, PORT } from './config/gameConfig.js';
import { connectDB } from './config/db.js';
import { seedInitialData } from './config/seedData.js';
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

// API Overview helper
const getApiDirectory = () => ({
  game: GAME_NAME,
  status: 'online',
  version: '1.0.0',
  description: `Official backend API services for ${GAME_NAME}`,
  frontendUrl: 'http://localhost:5173',
  documentation: {
    health: 'GET /api/health',
    authentication: {
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      currentUser: 'GET /api/auth/me (Bearer Token Required)',
      logout: 'POST /api/auth/logout',
    },
    levels: {
      list: 'GET /api/levels',
      detail: 'GET /api/levels/:id',
    },
    gameSessions: {
      start: 'POST /api/games/start (Bearer Token Required)',
      complete: 'POST /api/games/complete (Anti-Cheat Validated)',
      history: 'GET /api/games/history',
    },
    leaderboards: {
      global: 'GET /api/leaderboard?timeframe=all',
      weekly: 'GET /api/leaderboard?timeframe=weekly',
      myRank: 'GET /api/leaderboard/me (Bearer Token Required)',
    },
    achievements: {
      all: 'GET /api/achievements',
      userProgress: 'GET /api/achievements/me (Bearer Token Required)',
    },
    dailyChallenge: {
      today: 'GET /api/daily-challenge',
      complete: 'POST /api/daily-challenge/complete',
    },
    player: {
      progress: 'GET /api/player/progress (Bearer Token Required)',
    },
  },
  timestamp: new Date().toISOString(),
});

// Root & /api Index Handlers
app.get(['/', '/api', '/api/'], (req, res) => {
  res.json(getApiDirectory());
});

app.get('/api/health', (req, res) => {
  res.json({
    game: GAME_NAME,
    status: 'healthy',
    uptime: `${Math.round(process.uptime())}s`,
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

// Catch-all 404 for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found on this game server.`,
    availableEndpoints: '/api',
  });
});

// Error Handling Middleware
app.use(errorHandler);

// Start server after connecting to database
async function startServer() {
  try {
    await connectDB();
    await seedInitialData();
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
