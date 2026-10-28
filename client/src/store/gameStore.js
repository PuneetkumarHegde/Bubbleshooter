// Zustand Game Store & State Machine
import { create } from 'zustand';

export const GAME_STATUS = {
  LOADING: 'LOADING',
  READY: 'READY',
  AIMING: 'AIMING',
  SHOOTING: 'SHOOTING',
  RESOLVING: 'RESOLVING',
  COMBO: 'COMBO',
  LEVEL_COMPLETE: 'LEVEL_COMPLETE',
  LEVEL_FAILED: 'LEVEL_FAILED',
  PAUSED: 'PAUSED',
};

export const useGameStore = create((set, get) => ({
  gameStatus: GAME_STATUS.LOADING,
  level: null,
  levelId: 1,
  board: [],
  currentBubble: null,
  nextBubble: null,
  bubbleQueue: [],
  aimAngle: -Math.PI / 2, // 90 deg straight up
  shotsRemaining: 25,
  score: 0,
  combo: 0,
  bestCombo: 0,
  bubblesPoppedTotal: 0,
  rescuedTotal: 0,
  objectiveProgress: {
    completed: false,
    progressText: '',
    progressPercent: 0,
    rescuedCount: 0,
  },
  activeBooster: null, // null | 'bomb' | 'rainbow' | 'aimGuide' | 'extraShot' | 'shuffle'
  boosterInventory: {
    bomb: 3,
    rainbow: 2,
    aimGuide: 3,
    extraShot: 2,
    shuffle: 2,
  },
  showHint: false,
  suggestedAngle: null,
  historyStack: [], // For undo support
  sessionData: null,

  setGameStatus: (status) => set({ gameStatus: status }),

  setLevel: (level) => {
    // Deep clone board
    const boardClone = level.board.map(row => row.map(cell => ({ ...cell })));
    const colors = level.colors || ['red', 'blue', 'green'];
    const current = colors[Math.floor(Math.random() * colors.length)];
    const next = colors[Math.floor(Math.random() * colors.length)];

    set({
      level,
      levelId: level.id,
      board: boardClone,
      shotsRemaining: level.shots,
      currentBubble: { color: current, special: null },
      nextBubble: { color: next, special: null },
      score: 0,
      combo: 0,
      bestCombo: 0,
      bubblesPoppedTotal: 0,
      rescuedTotal: 0,
      objectiveProgress: {
        completed: false,
        progressText: level.objective.label || '',
        progressPercent: 0,
        rescuedCount: 0,
      },
      activeBooster: null,
      showHint: false,
      suggestedAngle: null,
      historyStack: [],
      gameStatus: GAME_STATUS.READY,
    });
  },

  setAimAngle: (angle) => set({ aimAngle: angle }),

  swapBubbles: () => {
    const { currentBubble, nextBubble, gameStatus } = get();
    if (gameStatus !== GAME_STATUS.READY && gameStatus !== GAME_STATUS.AIMING) return;
    set({
      currentBubble: nextBubble,
      nextBubble: currentBubble,
    });
  },

  decrementShots: () => {
    set((state) => ({ shotsRemaining: Math.max(0, state.shotsRemaining - 1) }));
  },

  addScore: (points) => {
    set((state) => ({ score: state.score + points }));
  },

  incrementCombo: () => {
    set((state) => {
      const newCombo = state.combo + 1;
      return {
        combo: newCombo,
        bestCombo: Math.max(state.bestCombo, newCombo),
      };
    });
  },

  resetCombo: () => set({ combo: 0 }),

  setObjectiveProgress: (progress) => set({ objectiveProgress: progress }),

  activateBooster: (boosterType) => {
    const { boosterInventory, gameStatus, currentBubble } = get();
    if (gameStatus !== GAME_STATUS.READY && gameStatus !== GAME_STATUS.AIMING) return false;
    if ((boosterInventory[boosterType] || 0) <= 0) return false;

    // Deduct 1 inventory
    set((state) => ({
      boosterInventory: {
        ...state.boosterInventory,
        [boosterType]: state.boosterInventory[boosterType] - 1,
      },
    }));

    if (boosterType === 'bomb') {
      set({
        currentBubble: { ...currentBubble, special: 'bomb' },
        activeBooster: 'bomb',
      });
    } else if (boosterType === 'rainbow') {
      set({
        currentBubble: { ...currentBubble, special: 'rainbow' },
        activeBooster: 'rainbow',
      });
    } else if (boosterType === 'extraShot') {
      set((state) => ({ shotsRemaining: state.shotsRemaining + 5 }));
    } else if (boosterType === 'aimGuide') {
      set({ activeBooster: 'aimGuide' });
    } else if (boosterType === 'shuffle') {
      set((state) => {
        // Shuffle active colors on board
        const cloned = state.board.map(r => r.map(c => ({ ...c })));
        const activeCells = [];
        for (const row of cloned) {
          for (const cell of row) {
            if (cell && !cell.isPopped && !cell.isRescue && !cell.isTarget) {
              activeCells.push(cell);
            }
          }
        }
        const colors = activeCells.map(c => c.color).sort(() => Math.random() - 0.5);
        activeCells.forEach((c, i) => {
          c.color = colors[i];
        });
        return { board: cloned };
      });
    }
    return true;
  },

  triggerHint: () => {
    const { board, currentBubble, showHint } = get();
    if (showHint) {
      set({ showHint: false, suggestedAngle: null });
      return;
    }
    // Search for a matching cluster to point toward
    const targetColor = currentBubble?.color;
    let foundAngle = -Math.PI / 2;
    for (let r = board.length - 1; r >= 0; r--) {
      for (let c = 0; c < board[r].length; c++) {
        const cell = board[r][c];
        if (cell && !cell.isPopped && cell.color === targetColor) {
          // Approximate angle towards this target
          const dx = (c - 4) * 48;
          const dy = -(600 - (r * 42));
          foundAngle = Math.atan2(dy, dx);
          break;
        }
      }
    }
    set({ showHint: true, suggestedAngle: foundAngle });
  },

  saveHistorySnapshot: () => {
    const state = get();
    const snapshot = {
      board: JSON.parse(JSON.stringify(state.board)),
      currentBubble: { ...state.currentBubble },
      nextBubble: { ...state.nextBubble },
      shotsRemaining: state.shotsRemaining,
      score: state.score,
      combo: state.combo,
      objectiveProgress: { ...state.objectiveProgress },
    };
    set((s) => ({ historyStack: [...s.historyStack.slice(-5), snapshot] }));
  },

  undoShot: () => {
    const { historyStack, gameStatus } = get();
    if (gameStatus !== GAME_STATUS.READY || historyStack.length === 0) return false;
    const last = historyStack[historyStack.length - 1];
    set((s) => ({
      board: last.board,
      currentBubble: last.currentBubble,
      nextBubble: last.nextBubble,
      shotsRemaining: last.shotsRemaining,
      score: last.score,
      combo: last.combo,
      objectiveProgress: last.objectiveProgress,
      historyStack: s.historyStack.slice(0, -1),
    }));
    return true;
  },

  setSessionData: (session) => set({ sessionData: session }),
}));
