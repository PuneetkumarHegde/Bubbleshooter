import Achievement from '../models/Achievement.js';

const MASTER_ACHIEVEMENTS = [
  { key: 'first_pop', title: 'First Pop', description: 'Pop your very first bubble', icon: '💥', targetValue: 1, metric: 'bubblesPopped', reward: '+50 XP' },
  { key: 'bubble_beginner', title: 'Bubble Beginner', description: 'Complete 5 levels', icon: '🌱', targetValue: 5, metric: 'levelsCompleted', reward: '+100 Coins' },
  { key: 'perfect_aim', title: 'Perfect Aim', description: 'Complete a level with very high shot efficiency', icon: '🎯', targetValue: 1, metric: 'levelsCompleted', reward: '+1 Bomb' },
  { key: 'combo_master', title: 'Combo Master', description: 'Reach a x10 combo chain', icon: '🔥', targetValue: 10, metric: 'bestCombo', reward: '+1 Rainbow' },
  { key: 'bubble_hunter', title: 'Bubble Hunter', description: 'Pop 1,000 bubbles', icon: '🏹', targetValue: 1000, metric: 'bubblesPopped', reward: '+500 Coins' },
  { key: 'rescue_hero', title: 'Rescue Hero', description: 'Rescue 25 Star Sprites', icon: '⭐', targetValue: 25, metric: 'bubblesPopped', reward: '+2 Aim Guides' },
  { key: 'star_collector', title: 'Star Collector', description: 'Earn 50 stars', icon: '✨', targetValue: 50, metric: 'totalStars', reward: '+3 Extra Shots' },
  { key: 'booster_expert', title: 'Booster Expert', description: 'Use 25 boosters', icon: '🧪', targetValue: 25, metric: 'boosterCount', reward: '+2 Rainbows' },
  { key: 'level_master', title: 'Level Master', description: 'Complete 40 levels', icon: '👑', targetValue: 40, metric: 'levelsCompleted', reward: 'Champion Trophy' },
  { key: 'bubble_legend', title: 'Bubble Legend', description: 'Earn 100,000 points', icon: '🏆', targetValue: 100000, metric: 'totalScore', reward: 'Mythic Title' },
];

export async function getAchievements(req, res, next) {
  try {
    res.status(200).json({ success: true, achievements: MASTER_ACHIEVEMENTS });
  } catch (err) {
    next(err);
  }
}

export async function getMyAchievements(req, res, next) {
  try {
    const user = req.user;
    const completedCount = user.completedLevels ? Object.keys(user.completedLevels).length : 0;

    const myProgress = MASTER_ACHIEVEMENTS.map(ach => {
      let currentVal = 0;
      if (ach.metric === 'bubblesPopped') currentVal = user.bubblesPopped;
      else if (ach.metric === 'levelsCompleted') currentVal = completedCount;
      else if (ach.metric === 'totalStars') currentVal = user.totalStars;
      else if (ach.metric === 'bestCombo') currentVal = user.bestCombo;
      else if (ach.metric === 'totalScore') currentVal = user.totalScore;
      else if (ach.metric === 'boosterCount') currentVal = 10;

      const isUnlocked = currentVal >= ach.targetValue;
      return {
        ...ach,
        currentValue: currentVal,
        isUnlocked,
      };
    });

    res.status(200).json({ success: true, achievements: myProgress });
  } catch (err) {
    next(err);
  }
}
