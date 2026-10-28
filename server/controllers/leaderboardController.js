import User from '../models/User.js';

export async function getLeaderboard(req, res, next) {
  try {
    const { timeframe } = req.query; // 'all', 'weekly', 'monthly'

    const topUsers = await User.find({ totalScore: { $gt: 0 } })
      .sort({ totalScore: -1 })
      .limit(50)
      .select('name totalScore totalStars currentLevel bestCombo completedLevels');

    const leaderboard = topUsers.map((u, idx) => ({
      rank: idx + 1,
      name: u.name,
      score: u.totalScore,
      stars: u.totalStars,
      levelsCompleted: u.completedLevels ? Object.keys(u.completedLevels).length : 0,
      bestCombo: u.bestCombo || 1,
    }));

    res.status(200).json({ success: true, count: leaderboard.length, leaderboard });
  } catch (err) {
    next(err);
  }
}

export async function getMyRank(req, res, next) {
  try {
    const user = req.user;
    const higherScoreCount = await User.countDocuments({ totalScore: { $gt: user.totalScore } });
    const rank = higherScoreCount + 1;

    res.status(200).json({
      success: true,
      rank,
      score: user.totalScore,
      stars: user.totalStars,
    });
  } catch (err) {
    next(err);
  }
}

