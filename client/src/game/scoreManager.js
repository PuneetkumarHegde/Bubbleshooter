// Score, Combo, and Star Rating Manager
import { GAME_CONSTANTS } from '../config/gameConfig';

export class ScoreManager {
  static calculateShotScore({ matchesCount = 0, floatingCount = 0, rescueCount = 0, combo = 1 }) {
    let scoreGained = 0;

    if (matchesCount >= 3) {
      scoreGained += matchesCount * GAME_CONSTANTS.POINTS.BUBBLE_POP;
      if (matchesCount === 3) scoreGained += GAME_CONSTANTS.POINTS.MATCH_3;
      else if (matchesCount === 4) scoreGained += GAME_CONSTANTS.POINTS.MATCH_4;
      else scoreGained += GAME_CONSTANTS.POINTS.MATCH_5;
    }

    if (floatingCount > 0) {
      scoreGained += floatingCount * GAME_CONSTANTS.POINTS.FLOATING_DROP;
      // Extra cascading bonus
      if (floatingCount >= 3) scoreGained += 50;
      if (floatingCount >= 6) scoreGained += 150;
    }

    if (rescueCount > 0) {
      scoreGained += rescueCount * GAME_CONSTANTS.POINTS.RESCUE;
    }

    // Apply combo multiplier
    const comboMultiplier = Math.max(1, 1 + (combo - 1) * 0.5);
    return Math.round(scoreGained * comboMultiplier);
  }

  static calculateFinalScore(currentScore, shotsRemaining) {
    const leftoverBonus = shotsRemaining * GAME_CONSTANTS.POINTS.REMAINING_SHOT_BONUS;
    return currentScore + leftoverBonus;
  }

  static calculateStars(finalScore, thresholds = [500, 800, 1200]) {
    if (finalScore >= thresholds[2]) return 3;
    if (finalScore >= thresholds[1]) return 2;
    if (finalScore >= thresholds[0]) return 1;
    return 1; // 1 star minimum for level completion
  }
}

