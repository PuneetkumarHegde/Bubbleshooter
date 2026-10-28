// Server-Side Anti-Cheat and Score Validation Service

export class AntiCheatService {
  /**
   * Performs exhaustive server-side validation against game session submission.
   */
  static validateSubmission({ session, user, levelData, submission }) {
    const {
      score,
      stars,
      shotsUsed,
      durationSeconds = 10,
      bubblesPopped = 0,
      bestCombo = 1,
      boostersUsed = [],
    } = submission;

    // 1. Session Ownership Check
    if (session.userId.toString() !== user._id.toString()) {
      return { valid: false, reason: 'Session does not belong to the authenticated user.' };
    }

    // 2. Single-Use Session & Status Check (Prevents Replay / Duplicate Completion)
    if (session.completed || session.status !== 'active') {
      return { valid: false, reason: 'Game session has already been completed or invalidated.' };
    }

    // 3. Level Consistency Check
    if (String(session.levelId) !== String(levelData.id || levelData.levelNumber)) {
      return { valid: false, reason: 'Session level identifier mismatch.' };
    }

    // 4. Shot Count Boundary Check
    const extraShotBoosters = (boostersUsed || []).filter(b => b === 'extraShot').length;
    const maxAllowedShots = (levelData.shots || 25) + extraShotBoosters * 5;

    if (shotsUsed <= 0) {
      return { valid: false, reason: 'Impossible shot count (zero or negative).' };
    }

    if (shotsUsed > maxAllowedShots) {
      return { valid: false, reason: `Excessive shots used (${shotsUsed} > allowed ${maxAllowedShots}).` };
    }

    // 5. Completion Timing / Bot Detection Check
    // A genuine human player cannot aim and fire faster than 0.35s per shot
    const minPlausibleDuration = shotsUsed * 0.35;
    if (durationSeconds < minPlausibleDuration) {
      return { valid: false, reason: `Impossible completion time (${durationSeconds}s for ${shotsUsed} shots).` };
    }

    // 6. Mathematical Score Ceiling Calculation
    // Calculates theoretical maximum points achievable on this board
    const maxTheoreticalBubbles = Math.max(120, (levelData.shots || 25) * 8);
    if (bubblesPopped > maxTheoreticalBubbles) {
      return { valid: false, reason: `Reported bubbles popped exceeds plausible board capacity (${bubblesPopped}).` };
    }

    // Theoretical maximum points formula:
    // (bubblesPopped * 10 + 80 match bonus + 150 rescue) * (1 + maxCombo * 0.5) + leftover shots * 50
    const maxComboMultiplier = Math.max(1, 1 + Math.min(bestCombo, 15) * 0.5);
    const maxPlausibleScore = Math.round(
      (bubblesPopped * 150 + 1000) * maxComboMultiplier + maxAllowedShots * 100 + 2000
    );

    if (score < 0 || score > maxPlausibleScore) {
      return { valid: false, reason: `Submitted score (${score}) exceeds mathematical ceiling (${maxPlausibleScore}).` };
    }

    // 7. Verify Star Rating
    const thresholds = levelData.starThresholds || [500, 800, 1200];
    let expectedStars = 1;
    if (score >= thresholds[2]) expectedStars = 3;
    else if (score >= thresholds[1]) expectedStars = 2;

    const verifiedStars = Math.max(1, Math.min(3, expectedStars));

    return {
      valid: true,
      verifiedScore: score,
      verifiedStars,
    };
  }
}

export default AntiCheatService;

