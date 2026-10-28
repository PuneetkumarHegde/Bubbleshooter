// Centralized Game Configuration
// The game name is read dynamically from the environment variable as per specification requirement.
export const GAME_NAME = import.meta.env.VITE_GAME_NAME || "BUBBLE BLAST ADVENTURE";
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Gameplay parameters
export const GAME_CONSTANTS = {
  GRID_ROWS: 14,
  GRID_COLS: 8,
  BUBBLE_RADIUS: 24, // Diameter = 48px
  ROW_HEIGHT: 41.5, // sqrt(3)/2 * diameter approx 41.56px for hexagonal packing
  BUBBLE_SPEED: 950,
  LAUNCHER_Y_OFFSET: 70, // from bottom
  SWAP_KEY: 'Space',
  COLORS: {
    RED: '#ef4444',
    BLUE: '#3b82f6',
    GREEN: '#10b981',
    YELLOW: '#f59e0b',
    PURPLE: '#8b5cf6',
    ORANGE: '#f97316',
    PINK: '#ec4899',
    CYAN: '#06b6d4',
  },
  COLOR_KEYS: ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'cyan'],
  BOOSTERS: {
    BOMB: 'bomb',
    RAINBOW: 'rainbow',
    AIM_GUIDE: 'aimGuide',
    EXTRA_SHOT: 'extraShot',
    SHUFFLE: 'shuffle',
  },
  POINTS: {
    BUBBLE_POP: 10,
    MATCH_3: 30,
    MATCH_4: 50,
    MATCH_5: 80,
    FLOATING_DROP: 20,
    RESCUE: 150,
    REMAINING_SHOT_BONUS: 50,
  }
};
