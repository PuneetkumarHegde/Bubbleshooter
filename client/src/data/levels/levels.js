// 40 Handcrafted Playable Levels for Bubble Blast Adventure
import { GAME_CONSTANTS } from '../../config/gameConfig';
import { generateProceduralLevel, generateDailyChallenge } from './proceduralGenerator';

// Helper to build rows easily
function createBoard(pattern, colorMap, specialMap = {}) {
  return pattern.map((rowStr, r) => {
    const cols = rowStr.trim().split(/\s+/);
    return cols.map((char, c) => {
      if (char === '.' || char === '_') return null;
      const color = colorMap[char] || 'blue';
      const isRescue = char === 'R';
      const isTarget = char === 'T';
      const special = specialMap[`${r},${c}`] || (char === 'B' ? 'bomb' : char === 'W' ? 'rainbow' : null);
      return {
        row: r,
        col: c,
        color: isRescue ? 'yellow' : isTarget ? 'purple' : color,
        isRescue,
        isTarget,
        special,
      };
    }).filter(cell => cell !== null);
  });
}

export const LEVELS = [];

// LEVEL 1: First Steps (Tutorial)
LEVELS.push({
  id: 1,
  name: "Sunny Meadows",
  difficulty: "tutorial",
  objective: { type: "clear_all", label: "Clear all bubbles" },
  shots: 25,
  colors: ["red", "blue", "green"],
  board: createBoard([
    "r r b b g g r r",
    "r b b g g r",
    "b b g g r r b b",
  ], { r: "red", b: "blue", g: "green" }),
  targetScore: 600,
  starThresholds: [300, 500, 750],
  availableBoosters: ["aimGuide", "extraShot"],
});

// LEVEL 2: Color Clusters (Tutorial)
LEVELS.push({
  id: 2,
  name: "Breezy Grove",
  difficulty: "tutorial",
  objective: { type: "clear_all", label: "Clear all bubbles" },
  shots: 24,
  colors: ["red", "blue", "green", "yellow"],
  board: createBoard([
    "r r r b b b g g",
    "y y y r r r",
    "b b b g g g y y",
    "r r g g b b",
  ], { r: "red", b: "blue", g: "green", y: "yellow" }),
  targetScore: 900,
  starThresholds: [450, 750, 1100],
  availableBoosters: ["aimGuide", "bomb"],
});

// LEVEL 3: First Rescue (Tutorial - Introduce Rescue)
LEVELS.push({
  id: 3,
  name: "Critter Haven",
  difficulty: "tutorial",
  objective: { type: "rescue", target: 2, label: "Rescue 2 Star Sprites" },
  shots: 22,
  colors: ["red", "blue", "yellow"],
  board: createBoard([
    "r r b b r r b b",
    "r R b b R r",
    "b b r r b b r r",
  ], { r: "red", b: "blue" }),
  targetScore: 1000,
  starThresholds: [500, 800, 1200],
  availableBoosters: ["aimGuide", "rainbow"],
});

// LEVEL 4: Bank Shot Practice (Tutorial - Wall Bouncing)
LEVELS.push({
  id: 4,
  name: "Echo Canyon",
  difficulty: "tutorial",
  objective: { type: "clear_all", label: "Clear all bubbles" },
  shots: 20,
  colors: ["red", "green", "yellow"],
  board: createBoard([
    "r r g g y y r r",
    ". . g g y y .",
    "r r . . . . r r",
    "y y . . . y y",
  ], { r: "red", g: "green", y: "yellow" }),
  targetScore: 1100,
  starThresholds: [600, 900, 1300],
  availableBoosters: ["aimGuide", "extraShot"],
});

// LEVEL 5: Combo Primer (Tutorial - Combo Bonus)
LEVELS.push({
  id: 5,
  name: "Harmonic Peaks",
  difficulty: "tutorial",
  objective: { type: "combo_challenge", target: 3, label: "Reach a x3 Combo" },
  shots: 22,
  colors: ["blue", "green", "yellow"],
  board: createBoard([
    "b b b g g g y y",
    "b b g g y y",
    "g g g y y y b b",
    "g g y y b b",
  ], { b: "blue", g: "green", y: "yellow" }),
  targetScore: 1200,
  starThresholds: [600, 950, 1400],
  availableBoosters: ["aimGuide", "bomb", "rainbow"],
});

// Generate handcrafted levels 6 through 40 with escalating variety and objectives
const colorPalettes = [
  ["red", "blue", "green", "yellow"],
  ["red", "blue", "green", "purple"],
  ["blue", "yellow", "purple", "orange"],
  ["red", "green", "purple", "orange", "cyan"],
  ["red", "blue", "yellow", "purple", "orange", "pink"],
];

const objectiveRotation = [
  { type: "clear_all", getLabel: () => "Clear all bubbles" },
  { type: "rescue", getLabel: (t) => `Rescue ${t} Star Sprites` },
  { type: "color_hunt", getLabel: (t, c) => `Pop ${t} ${c.toUpperCase()} bubbles` },
  { type: "drop_targets", getLabel: (t) => `Drop ${t} Target Orbs` },
  { type: "combo_challenge", getLabel: (t) => `Reach a x${t} Combo` },
  { type: "score_challenge", getLabel: (t) => `Reach ${t} Points` },
];

for (let i = 6; i <= 40; i++) {
  let tier = "beginner";
  if (i > 35) tier = "expert";
  else if (i > 30) tier = "hard";
  else if (i > 20) tier = "medium";
  else if (i > 10) tier = "easy";

  const palette = colorPalettes[Math.min(colorPalettes.length - 1, Math.floor((i - 1) / 8))];
  const objMeta = objectiveRotation[i % objectiveRotation.length];

  let targetVal = 2;
  let targetColor = palette[0];
  if (objMeta.type === "rescue") targetVal = 2 + (i % 3);
  if (objMeta.type === "drop_targets") targetVal = 3 + (i % 4);
  if (objMeta.type === "color_hunt") {
    targetVal = 8 + (i % 6);
    targetColor = palette[i % palette.length];
  }
  if (objMeta.type === "combo_challenge") targetVal = Math.min(6, 3 + Math.floor(i / 10));
  if (objMeta.type === "score_challenge") targetVal = 1500 + i * 150;

  const rows = Math.min(8, 4 + Math.floor(i / 8));
  const board = [];
  let rescueCount = 0;
  let targetCount = 0;

  for (let r = 0; r < rows; r++) {
    const row = [];
    const colsInRow = r % 2 === 0 ? GAME_CONSTANTS.GRID_COLS : GAME_CONSTANTS.GRID_COLS - 1;
    for (let c = 0; c < colsInRow; c++) {
      // Create interesting geometric patterns (arches, clusters, chevrons)
      let color = palette[(r + c + Math.floor(i / 3)) % palette.length];
      let isRescue = false;
      let isTarget = false;
      let special = null;

      if (objMeta.type === "rescue" && r >= 2 && rescueCount < targetVal && (r + c) % 3 === 0) {
        isRescue = true;
        rescueCount++;
        color = "yellow";
      } else if (objMeta.type === "drop_targets" && r >= 2 && targetCount < targetVal && (r * 2 + c) % 4 === 0) {
        isTarget = true;
        targetCount++;
        color = "purple";
      } else if (r === 1 && c === 2 && i % 4 === 0) {
        special = "bomb";
      } else if (r === 2 && c === 3 && i % 5 === 0) {
        special = "rainbow";
      }

      row.push({
        row: r,
        col: c,
        color,
        isRescue,
        isTarget,
        special,
      });
    }
    board.push(row);
  }

  const shots = Math.max(15, 30 - Math.floor(i * 0.35));
  const targetScore = 1200 + i * 140;

  LEVELS.push({
    id: i,
    name: `Mystic Cavern #${i}`,
    difficulty: tier,
    objective: {
      type: objMeta.type,
      target: targetVal,
      color: targetColor,
      label: objMeta.getLabel(targetVal, targetColor),
    },
    shots,
    colors: palette,
    board,
    targetScore,
    starThresholds: [
      Math.floor(targetScore * 0.45),
      Math.floor(targetScore * 0.75),
      targetScore,
    ],
    availableBoosters: ["bomb", "rainbow", "aimGuide", "extraShot", "shuffle"],
  });
}

// Function to fetch level by ID (including procedural for level 41+ and daily)
export function getLevelById(levelId) {
  if (levelId === 'daily' || levelId === 'daily-challenge') {
    const today = new Date().toISOString().split('T')[0];
    return generateDailyChallenge(today);
  }
  const numericId = parseInt(levelId, 10);
  if (isNaN(numericId) || numericId < 1) {
    return LEVELS[0];
  }
  if (numericId <= LEVELS.length) {
    return LEVELS[numericId - 1];
  }
  // Level > 40: Procedural generation!
  return generateProceduralLevel(numericId);
}

