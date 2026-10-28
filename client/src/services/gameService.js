// Game Session and Level Progression API Service
import api from './api';

export const gameService = {
  async getLevels() {
    const res = await api.get('/levels');
    return res.data;
  },

  async getLevel(levelId) {
    const res = await api.get(`/levels/${levelId}`);
    return res.data;
  },

  async startGameSession(levelId) {
    const res = await api.post('/games/start', { levelId });
    return res.data;
  },

  async completeGameSession(sessionPayload) {
    const res = await api.post('/games/complete', sessionPayload);
    return res.data;
  },

  async getGameHistory() {
    const res = await api.get('/games/history');
    return res.data;
  },

  async getPlayerProgress() {
    const res = await api.get('/player/progress');
    return res.data;
  },

  async getDailyChallenge() {
    const res = await api.get('/daily-challenge');
    return res.data;
  },

  async completeDailyChallenge(payload) {
    const res = await api.post('/daily-challenge/complete', payload);
    return res.data;
  },

  async getAchievements() {
    const res = await api.get('/achievements');
    return res.data;
  },

  async getMyAchievements() {
    const res = await api.get('/achievements/me');
    return res.data;
  },
};

export default gameService;
