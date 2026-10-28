// Leaderboard API Service
import api from './api';

export const leaderboardService = {
  async getGlobalLeaderboard(timeframe = 'all') {
    const res = await api.get(`/leaderboard?timeframe=${timeframe}`);
    return res.data;
  },

  async getMyRank() {
    const res = await api.get('/leaderboard/me');
    return res.data;
  },
};

export default leaderboardService;

