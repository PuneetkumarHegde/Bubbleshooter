import DailyChallenge from '../models/DailyChallenge.js';
import User from '../models/User.js';

export async function getDailyChallenge(req, res, next) {
  try {
    const today = new Date().toISOString().split('T')[0];
    let challenge = await DailyChallenge.findOne({ dateString: today });

    if (!challenge) {
      challenge = new DailyChallenge({
        dateString: today,
        title: `Daily Quest (${today})`,
        objective: {
          type: 'rescue',
          target: 5,
          label: 'Rescue 5 Star Sprites',
        },
        shots: 20,
        reward: { coins: 500, booster: 'rainbow' },
      });
      await challenge.save();
    }

    res.status(200).json({ success: true, challenge });
  } catch (err) {
    next(err);
  }
}

export async function completeDailyChallenge(req, res, next) {
  try {
    const { score } = req.body;
    const today = new Date().toISOString().split('T')[0];
    let challenge = await DailyChallenge.findOne({ dateString: today });

    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge for today not found.' });
    }

    const alreadyCompleted = challenge.completions.some(
      c => c.userId.toString() === req.user._id.toString()
    );

    if (alreadyCompleted) {
      return res.status(400).json({ success: false, message: 'You have already completed today’s challenge!' });
    }

    challenge.completions.push({
      userId: req.user._id,
      score: score || 2500,
      completedAt: new Date(),
    });
    await challenge.save();

    // Reward player with booster
    const user = await User.findById(req.user._id);
    user.boosterInventory.rainbow = (user.boosterInventory.rainbow || 0) + 1;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Daily challenge completed! Reward credited.',
      reward: challenge.reward,
    });
  } catch (err) {
    next(err);
  }
}
