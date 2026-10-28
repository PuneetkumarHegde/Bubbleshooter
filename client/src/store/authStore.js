// Zustand Auth Store
import { create } from 'zustand';
import authService from '../services/authService';
import gameService from '../services/gameService';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  initAuth: async () => {
    const token = localStorage.getItem('bba_token');
    const cachedUser = localStorage.getItem('bba_user');

    if (!token) {
      // Set guest user state so gameplay works even before registering!
      const guestProgress = JSON.parse(localStorage.getItem('bba_guest_progress') || JSON.stringify({
        name: 'Adventurer',
        currentLevel: 1,
        totalScore: 0,
        totalStars: 0,
        completedLevels: {},
        bubblesPopped: 0,
        bestCombo: 0,
        boosterInventory: { bomb: 3, rainbow: 2, aimGuide: 3, extraShot: 2, shuffle: 2 },
      }));

      set({
        user: guestProgress,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
      return;
    }

    try {
      if (cachedUser) {
        set({ user: JSON.parse(cachedUser), token, isAuthenticated: true });
      }
      const data = await authService.getMe();
      if (data && data.user) {
        localStorage.setItem('bba_user', JSON.stringify(data.user));
        set({ user: data.user, token, isAuthenticated: true, isLoading: false });
      }
    } catch (e) {
      console.warn('Could not verify token, using cached session or guest:', e.message);
      if (cachedUser) {
        set({ user: JSON.parse(cachedUser), token, isAuthenticated: true, isLoading: false });
      } else {
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      }
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authService.login(email, password);
      localStorage.setItem('bba_token', res.token);
      localStorage.setItem('bba_user', JSON.stringify(res.user));
      set({ user: res.user, token: res.token, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      set({ error: msg, isLoading: false });
      return { success: false, error: msg };
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authService.register(name, email, password);
      localStorage.setItem('bba_token', res.token);
      localStorage.setItem('bba_user', JSON.stringify(res.user));
      set({ user: res.user, token: res.token, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      set({ error: msg, isLoading: false });
      return { success: false, error: msg };
    }
  },

  logout: async () => {
    await authService.logout();
    set({ user: null, token: null, isAuthenticated: false });
    // Reset back to guest progress
    get().initAuth();
  },

  updateLocalProgress: (levelId, stars, score, bubblesPopped, combo) => {
    const { user, isAuthenticated } = get();
    if (!user) return;

    const completed = { ...(user.completedLevels || {}) };
    const prevStars = completed[levelId]?.stars || 0;
    const prevScore = completed[levelId]?.score || 0;

    completed[levelId] = {
      stars: Math.max(prevStars, stars),
      score: Math.max(prevScore, score),
      completedAt: new Date().toISOString(),
    };

    const nextLevel = Math.max(user.currentLevel || 1, parseInt(levelId, 10) + 1);
    const starDelta = Math.max(0, stars - prevStars);
    const scoreDelta = Math.max(0, score - prevScore);

    const updatedUser = {
      ...user,
      currentLevel: nextLevel,
      totalStars: (user.totalStars || 0) + starDelta,
      totalScore: (user.totalScore || 0) + scoreDelta,
      bubblesPopped: (user.bubblesPopped || 0) + bubblesPopped,
      bestCombo: Math.max(user.bestCombo || 0, combo),
      completedLevels: completed,
    };

    set({ user: updatedUser });

    if (!isAuthenticated) {
      localStorage.setItem('bba_guest_progress', JSON.stringify(updatedUser));
    } else {
      localStorage.setItem('bba_user', JSON.stringify(updatedUser));
    }
  },
}));
