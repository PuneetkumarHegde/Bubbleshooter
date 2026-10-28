// Objective Evaluation and Progress Tracking

export class ObjectiveManager {
  constructor(objectiveConfig) {
    this.config = objectiveConfig || { type: 'clear_all' };
    this.type = this.config.type;
    this.target = this.config.target || 0;
    this.targetColor = this.config.color || null;
    this.current = 0;
  }

  // Update progress after each shot resolution
  updateProgress({ board, poppedBubbles = [], currentScore = 0, currentCombo = 0 }) {
    if (this.type === 'clear_all') {
      let remainingBubbles = 0;
      for (const row of board) {
        if (!row) continue;
        for (const cell of row) {
          if (cell && !cell.isPopped) remainingBubbles++;
        }
      }
      return {
        completed: remainingBubbles === 0,
        progressText: `${remainingBubbles} bubbles remaining`,
        progressPercent: Math.max(0, 100 - remainingBubbles * 5),
      };
    }

    if (this.type === 'rescue') {
      const newlyRescued = poppedBubbles.filter(b => b.bubble && b.bubble.isRescue).length;
      this.current += newlyRescued;
      return {
        completed: this.current >= this.target,
        progressText: `${this.current} / ${this.target} Sprites Rescued`,
        progressPercent: Math.min(100, Math.round((this.current / this.target) * 100)),
        rescuedCount: this.current,
      };
    }

    if (this.type === 'drop_targets') {
      const newlyDropped = poppedBubbles.filter(b => b.bubble && b.bubble.isTarget).length;
      this.current += newlyDropped;
      return {
        completed: this.current >= this.target,
        progressText: `${this.current} / ${this.target} Targets Cleared`,
        progressPercent: Math.min(100, Math.round((this.current / this.target) * 100)),
      };
    }

    if (this.type === 'color_hunt') {
      const newlyHunted = poppedBubbles.filter(b => b.bubble && b.bubble.color === this.targetColor).length;
      this.current += newlyHunted;
      return {
        completed: this.current >= this.target,
        progressText: `${this.current} / ${this.target} ${this.targetColor.toUpperCase()} Cleared`,
        progressPercent: Math.min(100, Math.round((this.current / this.target) * 100)),
      };
    }

    if (this.type === 'combo_challenge') {
      if (currentCombo > this.current) this.current = currentCombo;
      return {
        completed: this.current >= this.target,
        progressText: `Max Combo: x${this.current} / x${this.target}`,
        progressPercent: Math.min(100, Math.round((this.current / this.target) * 100)),
      };
    }

    if (this.type === 'score_challenge') {
      this.current = currentScore;
      return {
        completed: this.current >= this.target,
        progressText: `${this.current} / ${this.target} Points`,
        progressPercent: Math.min(100, Math.round((this.current / this.target) * 100)),
      };
    }

    return { completed: false, progressText: '', progressPercent: 0 };
  }
}
