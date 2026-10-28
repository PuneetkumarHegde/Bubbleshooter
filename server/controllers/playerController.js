import User from '../models/User.js';

export async function getPlayerProgress(req, res, next) {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.status(200).json({
      success: true,
      progress: {
        currentLevel: user.currentLevel,
        totalScore: user.totalScore,
        totalStars: user.totalStars,
        bubblesPopped: user.bubblesPopped,
        bestCombo: user.bestCombo,
        rescuedObjects: user.rescuedObjects,
        completedLevels: user.completedLevels,
        boosterInventory: user.boosterInventory,
      },
    });
  } catch (err) {
    next(err);
  }
}

