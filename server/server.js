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

// Root & /api Index Handlers (Supports both JSON API clients and browser interactive view)
app.get(['/', '/api', '/api/'], (req, res) => {
  if (req.accepts('html') && req.query.format !== 'json') {
    const dir = getApiDirectory();
    res.type('html').send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${GAME_NAME} — API Server</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; background: #0f172a; color: #f8fafc; padding: 2rem 1rem; min-height: 100vh; line-height: 1.6; }
    .container { max-width: 900px; margin: 0 auto; background: #1e293b; border-radius: 1rem; border: 1px solid #334155; padding: 2rem; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }
    .header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.5rem; padding-bottom: 1.5rem; border-bottom: 1px solid #334155; }
    .title-group { display: flex; align-items: center; gap: 0.75rem; }
    .badge-online { background: #065f46; color: #34d399; font-size: 0.8rem; font-weight: 700; padding: 0.35rem 0.75rem; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.05em; border: 1px solid #059669; }
    h1 { font-size: 1.75rem; color: #38bdf8; font-weight: 800; letter-spacing: -0.025em; }
    p.subtitle { color: #94a3b8; font-size: 0.95rem; }
    .action-bar { display: flex; gap: 1rem; margin-bottom: 2rem; flex-wrap: wrap; }
    .btn { display: inline-flex; align-items: center; gap: 0.5rem; background: #38bdf8; color: #0f172a; font-weight: 700; padding: 0.75rem 1.25rem; border-radius: 0.5rem; text-decoration: none; transition: all 0.2s; font-size: 0.95rem; }
    .btn:hover { background: #7dd3fc; transform: translateY(-1px); }
    .btn-secondary { background: #334155; color: #f8fafc; border: 1px solid #475569; }
    .btn-secondary:hover { background: #475569; color: #ffffff; }
    .section-title { font-size: 1.15rem; color: #f1f5f9; font-weight: 700; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
    .endpoints { display: grid; grid-template-columns: 1fr; gap: 0.75rem; margin-bottom: 2rem; }
    .endpoint-card { background: #0f172a; border: 1px solid #334155; border-radius: 0.5rem; padding: 0.85rem 1rem; display: flex; align-items: center; justify-content: space-between; text-decoration: none; color: #e2e8f0; transition: all 0.15s; }
    .endpoint-card:hover { border-color: #38bdf8; background: #1e293b; }
    .method-badge { font-family: monospace; font-weight: 700; font-size: 0.85rem; padding: 0.2rem 0.5rem; border-radius: 0.25rem; }
    .method-get { background: #1e3a8a; color: #60a5fa; }
    .method-post { background: #064e3b; color: #34d399; }
    .path-label { font-family: monospace; font-size: 0.95rem; color: #f8fafc; margin-left: 0.5rem; }
    .desc-label { font-size: 0.85rem; color: #94a3b8; }
    .footer { font-size: 0.85rem; color: #64748b; border-top: 1px solid #334155; padding-top: 1rem; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="title-group">
        <h1>🎯 ${GAME_NAME}</h1>
        <span class="badge-online">● Backend Online</span>
      </div>
      <div>
        <a href="/api?format=json" class="btn btn-secondary" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;">View Raw JSON API</a>
      </div>
    </div>

    <p class="subtitle" style="margin-bottom: 1.5rem;">
      Full-Stack Bubble Shooter Game Backend Engine, JWT Auth, Anti-Cheat Verification, and Persistence Services.
    </p>

    <div class="action-bar">
      <a href="http://localhost:5173" class="btn" target="_blank">
        🎮 Play Game Frontend (Port 5173) &rarr;
      </a>
      <a href="/api/health" class="btn btn-secondary">
        🩺 Health Check
      </a>
      <a href="/api/levels" class="btn btn-secondary">
        🗺️ Levels (40)
      </a>
      <a href="/api/leaderboard" class="btn btn-secondary">
        🏆 Leaderboard
      </a>
    </div>

    <h2 class="section-title">📡 Core API Endpoints</h2>
    <div class="endpoints">
      <a href="/api/health" class="endpoint-card">
        <div>
          <span class="method-badge method-get">GET</span>
          <span class="path-label">/api/health</span>
        </div>
        <span class="desc-label">Realtime server status and uptime</span>
      </a>
      <a href="/api/levels" class="endpoint-card">
        <div>
          <span class="method-badge method-get">GET</span>
          <span class="path-label">/api/levels</span>
        </div>
        <span class="desc-label">List all 40 progression levels</span>
      </a>
      <a href="/api/leaderboard" class="endpoint-card">
        <div>
          <span class="method-badge method-get">GET</span>
          <span class="path-label">/api/leaderboard</span>
        </div>
        <span class="desc-label">Global & weekly top champions</span>
      </a>
      <a href="/api/achievements" class="endpoint-card">
        <div>
          <span class="method-badge method-get">GET</span>
          <span class="path-label">/api/achievements</span>
        </div>
        <span class="desc-label">10 master unlockable achievements</span>
      </a>
      <a href="/api/daily-challenge" class="endpoint-card">
        <div>
          <span class="method-badge method-get">GET</span>
          <span class="path-label">/api/daily-challenge</span>
        </div>
        <span class="desc-label">Procedurally generated daily puzzle</span>
      </a>
      <div class="endpoint-card" style="cursor: default;">
        <div>
          <span class="method-badge method-post">POST</span>
          <span class="path-label">/api/games/complete</span>
        </div>
        <span class="desc-label">Anti-cheat validated score submission</span>
      </div>
      <div class="endpoint-card" style="cursor: default;">
        <div>
          <span class="method-badge method-post">POST</span>
          <span class="path-label">/api/auth/login</span>
        </div>
        <span class="desc-label">JWT player authentication</span>
      </div>
    </div>

    <div class="footer">
      <span>Game Name: <strong>${GAME_NAME}</strong> (Configured via backend env)</span>
      <span>Vite Frontend Target: <code>${dir.frontendUrl}</code></span>
    </div>
  </div>
</body>
</html>`);
    return;
  }
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
