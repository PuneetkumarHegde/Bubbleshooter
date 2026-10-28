// Offline Queue & Resilience Service
import { gameService } from './gameService';

const QUEUE_KEY = 'bba_offline_progress_queue';

export const offlineService = {
  isOnline() {
    return navigator.onLine;
  },

  queueProgress(payload) {
    try {
      const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
      queue.push({ ...payload, queuedAt: Date.now() });
      localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    } catch (e) {
      console.error('Failed to queue offline progress', e);
    }
  },

  async syncQueuedProgress() {
    if (!this.isOnline()) return { synced: 0 };
    try {
      const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
      if (queue.length === 0) return { synced: 0 };

      let successCount = 0;
      const remaining = [];

      for (const item of queue) {
        try {
          await gameService.completeGameSession(item);
          successCount++;
        } catch (err) {
          // Keep item if it failed due to network
          if (!err.response) {
            remaining.push(item);
          }
        }
      }

      localStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
      return { synced: successCount };
    } catch (e) {
      return { synced: 0 };
    }
  },
};

// Auto-sync on window online event
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    offlineService.syncQueuedProgress();
  });
}

export default offlineService;

