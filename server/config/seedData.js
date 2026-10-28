// Automatic Database Seeder for Levels, Achievements, and Hall-of-Fame Champions
import Level from '../models/Level.js';
import User from '../models/User.js';
import Achievement from '../models/Achievement.js';
import bcrypt from 'bcryptjs';

export async function seedInitialData() {
  try {
    // 1. Seed Levels if empty
    const levelCount = await Level.countDocuments();
    if (levelCount === 0) {
      console.log('[Seeder] Seeding 40 handcrafted levels into database...');
      const levelsToInsert = [];

      const colorPalettes = [
        ['red', 'blue', 'green'],
        ['red', 'blue', 'green', 'yellow'],
        ['red', 'blue', 'green', 'purple'],
        ['blue', 'yellow', 'purple', 'orange'],
        ['red', 'green', 'purple', 'orange', 'cyan'],
        ['red', 'blue', 'yellow', 'purple', 'orange', 'pink'],
      ];

      const objectiveRotation = [
        { type: 'clear_all', getLabel: () => 'Clear all bubbles' },
        { type: 'rescue', getLabel: (t) => `Rescue ${t} Star Sprites` },
        { type: 'color_hunt', getLabel: (t, c) => `Pop ${t} ${c.toUpperCase()} bubbles` },
        { type: 'drop_targets', getLabel: (t) => `Drop ${t} Target Orbs` },
        { type: 'combo_challenge', getLabel: (t) => `Reach a x${t} Combo` },
        { type: 'score_challenge', getLabel: (t) => `Reach ${t} Points` },
      ];

      for (let i = 1; i <= 40; i++) {
        let tier = 'tutorial';
        if (i > 35) tier = 'expert';
        else if (i > 30) tier = 'hard';
        else if (i > 20) tier = 'medium';
        else if (i > 10) tier = 'easy';
        else if (i > 5) tier = 'beginner';

        const palette = colorPalettes[Math.min(colorPalettes.length - 1, Math.floor((i - 1) / 7))];
        const objMeta = objectiveRotation[i % objectiveRotation.length];

        let targetVal = 2;
        let targetColor = palette[0];
        if (objMeta.type === 'rescue') targetVal = 2 + (i % 3);
        if (objMeta.type === 'drop_targets') targetVal = 3 + (i % 4);
        if (objMeta.type === 'color_hunt') {
          targetVal = 8 + (i % 6);
          targetColor = palette[i % palette.length];
        }
        if (objMeta.type === 'combo_challenge') targetVal = Math.min(6, 3 + Math.floor(i / 10));
        if (objMeta.type === 'score_challenge') targetVal = 1500 + i * 140;

        const shots = Math.max(15, 30 - Math.floor(i * 0.35));
        const targetScore = 1200 + i * 140;

        levelsToInsert.push({
          levelNumber: i,
          difficulty: tier,
          objective: {
            type: objMeta.type,
            target: targetVal,
            color: targetColor,
            label: objMeta.getLabel(targetVal, targetColor),
          },
          shots,
          colors: palette,
          boardLayout: [],
          targetScore,
          starThresholds: [
            Math.floor(targetScore * 0.45),
            Math.floor(targetScore * 0.75),
            targetScore,
          ],
          availableBoosters: ['bomb', 'rainbow', 'aimGuide', 'extraShot', 'shuffle'],
          isPublished: true,
        });
      }

      await Level.insertMany(levelsToInsert);
      console.log(`[Seeder] Successfully seeded ${levelsToInsert.length} levels.`);
    }

    // 2. Seed Leaderboard Champions if no high scores exist
    const scoredUsersCount = await User.countDocuments({ totalScore: { $gt: 0 } });
    if (scoredUsersCount === 0) {
      console.log('[Seeder] Seeding global hall-of-fame champions...');
      const dummySalt = await bcrypt.genSalt(6);
      const dummyHash = await bcrypt.hash('champion_pass_2026', dummySalt);

      const champions = [
        {
          name: 'DragonMaster99',
          email: 'dragonmaster@adventure.net',
          passwordHash: dummyHash,
          currentLevel: 40,
          totalScore: 982450,
          totalStars: 120,
          bubblesPopped: 5420,
          bestCombo: 14,
          rescuedObjects: 48,
          completedLevels: { '1': { stars: 3, score: 950 }, '40': { stars: 3, score: 8500 } },
        },
        {
          name: 'BubbleQueen',
          email: 'queen@adventure.net',
          passwordHash: dummyHash,
          currentLevel: 40,
          totalScore: 914820,
          totalStars: 118,
          bubblesPopped: 4890,
          bestCombo: 12,
          rescuedObjects: 45,
          completedLevels: { '1': { stars: 3, score: 920 } },
        },
        {
          name: 'CosmicBlaster',
          email: 'cosmic@adventure.net',
          passwordHash: dummyHash,
          currentLevel: 39,
          totalScore: 882100,
          totalStars: 115,
          bubblesPopped: 4610,
          bestCombo: 11,
          rescuedObjects: 42,
          completedLevels: { '1': { stars: 3, score: 880 } },
        },
        {
          name: 'SpriteSaver',
          email: 'saver@adventure.net',
          passwordHash: dummyHash,
          currentLevel: 35,
          totalScore: 795300,
          totalStars: 104,
          bubblesPopped: 4120,
          bestCombo: 9,
          rescuedObjects: 39,
          completedLevels: { '1': { stars: 3, score: 850 } },
        },
        {
          name: 'HexagonPro',
          email: 'hex@adventure.net',
          passwordHash: dummyHash,
          currentLevel: 32,
          totalScore: 712000,
          totalStars: 95,
          bubblesPopped: 3750,
          bestCombo: 8,
          rescuedObjects: 34,
          completedLevels: { '1': { stars: 3, score: 810 } },
        },
      ];

      await User.insertMany(champions);
      console.log(`[Seeder] Seeded ${champions.length} hall-of-fame champions.`);
    }

    // 3. Seed Achievements if empty
    const achCount = await Achievement.countDocuments();
    if (achCount === 0) {
      const achievementsList = [
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
      await Achievement.insertMany(achievementsList);
      console.log(`[Seeder] Seeded ${achievementsList.length} master achievements.`);
    }
  } catch (err) {
    console.warn('[Seeder] Seeding warning:', err.message);
  }
}
