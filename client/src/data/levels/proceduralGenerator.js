// Procedural Level Generator for Level 41+ and Daily Challenges
import { GAME_CONSTANTS } from '../../config/gameConfig';

export function generateProceduralLevel(levelNumber) {
  const allColors = GAME_CONSTANTS.COLOR_KEYS;
  // Difficulty escalates with level
  const numColors = Math.min(allColors.length, 4 + Math.floor(levelNumber / 15));
  const activeColors = allColors.slice(0, numColors);

  const objectiveTypes = ['clear_all', 'rescue', 'drop_targets', 'color_hunt', 'combo_challenge', 'score_challenge'];
  const objType = objectiveTypes[levelNumber % objectiveTypes.length];

  let objective = { type: objType };
  if (objType === 'rescue') {
    objective.target = 2 + (levelNumber % 4);
    objective.label = `Rescue ${objective.target} Star Sprites`;
  } else if (objType === 'color_hunt') {
    const huntColor = activeColors[levelNumber % activeColors.length];
    objective.color = huntColor;
    objective.target = 10 + (levelNumber % 10);
    objective.label = `Pop ${objective.target} ${huntColor.toUpperCase()} bubbles`;
  } else if (objType === 'drop_targets') {
    objective.target = 6 + (levelNumber % 8);
    objective.label = `Drop ${objective.target} target orbs`;
  } else if (objType === 'combo_challenge') {
    objective.target = 3 + (levelNumber % 4);
    objective.label = `Reach a x${objective.target} Combo`;
  } else if (objType === 'score_challenge') {
    objective.target = 2500 + levelNumber * 120;
    objective.label = `Score ${objective.target} points`;
  } else {
    objective.label = `Clear all bubbles`;
  }

  const rows = Math.min(9, 5 + Math.floor(levelNumber / 8));
  const board = [];

  let placedRescues = 0;
  let placedTargets = 0;

  for (let r = 0; r < rows; r++) {
    const row = [];
    const colsInRow = r % 2 === 0 ? GAME_CONSTANTS.GRID_COLS : GAME_CONSTANTS.GRID_COLS - 1;
    for (let c = 0; c < colsInRow; c++) {
      // Clustering color algorithm for natural bubble shooter formations
      let color;
      if (r > 0 && Math.random() < 0.65 && board[r - 1][Math.min(c, board[r - 1].length - 1)]) {
        color = board[r - 1][Math.min(c, board[r - 1].length - 1)].color;
      } else if (c > 0 && Math.random() < 0.5 && row[c - 1]) {
        color = row[c - 1].color;
      } else {
        color = activeColors[Math.floor(Math.random() * activeColors.length)];
      }

      let isRescue = false;
      let isTarget = false;
      let special = null;

      if (objType === 'rescue' && r >= 2 && placedRescues < objective.target && Math.random() < 0.25) {
        isRescue = true;
        placedRescues++;
      } else if (objType === 'drop_targets' && r >= 3 && placedTargets < objective.target && Math.random() < 0.3) {
        isTarget = true;
        placedTargets++;
      } else if (Math.random() < 0.04) {
        special = Math.random() < 0.5 ? 'bomb' : 'rainbow';
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

  // Ensure minimum targets placed if required
  if (objType === 'rescue' && placedRescues < objective.target) {
    objective.target = Math.max(1, placedRescues);
    objective.label = `Rescue ${objective.target} Star Sprites`;
  }

  const shots = Math.max(14, 28 - Math.floor(levelNumber / 6));
  const targetScore = 2000 + levelNumber * 100;

  return {
    id: levelNumber,
    name: `Mystic Peak #${levelNumber}`,
    difficulty: levelNumber > 35 ? 'expert' : levelNumber > 25 ? 'hard' : 'medium',
    objective,
    shots,
    colors: activeColors,
    board,
    targetScore,
    starThresholds: [
      Math.floor(targetScore * 0.5),
      Math.floor(targetScore * 0.8),
      targetScore,
    ],
    availableBoosters: ['bomb', 'rainbow', 'aimGuide', 'extraShot', 'shuffle'],
  };
}

export function generateDailyChallenge(dateString) {
  // Deterministic seed based on date (YYYY-MM-DD)
  let seed = 0;
  for (let i = 0; i < dateString.length; i++) {
    seed = (seed * 31 + dateString.charCodeAt(i)) & 0xffffffff;
  }
  const pseudoRandom = Math.abs(seed) % 1000 + 1;
  const level = generateProceduralLevel(pseudoRandom);
  level.id = 'daily';
  level.name = `Daily Challenge (${dateString})`;
  level.reward = { coins: 500, booster: 'rainbow' };
  return level;
}
