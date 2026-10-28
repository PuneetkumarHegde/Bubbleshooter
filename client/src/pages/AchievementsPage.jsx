import React from 'react';
import { GAME_NAME } from '../config/gameConfig';
import { useAuthStore } from '../store/authStore';
import { Award, CheckCircle2, Lock, Sparkles, Star } from 'lucide-react';

export default function AchievementsPage() {
  const { user } = useAuthStore();

  const totalScore = user?.totalScore || 0;
  const totalStars = user?.totalStars || 0;
  const bubblesPopped = user?.bubblesPopped || 0;
  const bestCombo = user?.bestCombo || 0;
  const levelsCount = Object.keys(user?.completedLevels || {}).length;

  const achievementsList = [
    {
      id: 'first_pop',
      title: 'First Pop',
      desc: 'Pop your very first bubble in the game.',
      icon: '💥',
      current: Math.min(1, bubblesPopped),
      target: 1,
      reward: '+50 XP',
    },
    {
      id: 'bubble_beginner',
      title: 'Bubble Beginner',
      desc: 'Successfully complete 5 adventure levels.',
      icon: '🌱',
      current: levelsCount,
      target: 5,
      reward: '+100 Coins',
    },
    {
      id: 'perfect_aim',
      title: 'Perfect Aim',
      desc: 'Complete a level with more than 10 shots remaining.',
      icon: '🎯',
      current: levelsCount > 0 ? 1 : 0,
      target: 1,
      reward: '+1 Bomb Booster',
    },
    {
      id: 'combo_master',
      title: 'Combo Master',
      desc: 'Trigger a consecutive chain reaction of x10 combo.',
      icon: '🔥',
      current: bestCombo,
      target: 10,
      reward: '+1 Rainbow Booster',
    },
    {
      id: 'bubble_hunter',
      title: 'Bubble Hunter',
      desc: 'Pop an aggregate total of 1,000 bubbles.',
      icon: '🏹',
      current: bubblesPopped,
      target: 1000,
      reward: '+500 Coins',
    },
    {
      id: 'rescue_hero',
      title: 'Rescue Hero',
      desc: 'Rescue 25 Star Sprites from bubble prisons.',
      icon: '⭐',
      current: Math.min(25, Math.floor(bubblesPopped / 20)),
      target: 25,
      reward: '+2 Aim Guides',
    },
    {
      id: 'star_collector',
      title: 'Star Collector',
      desc: 'Collect 50 gold stars from completed levels.',
      icon: '✨',
      current: totalStars,
      target: 50,
      reward: '+3 Extra Shots',
    },
    {
      id: 'booster_expert',
      title: 'Booster Expert',
      desc: 'Deploy 25 tactical boosters during puzzle matches.',
      icon: '🧪',
      current: 8,
      target: 25,
      reward: '+2 Wildcard Rainbows',
    },
    {
      id: 'level_master',
      title: 'Level Master',
      desc: 'Complete all 40 levels in the primary campaign.',
      icon: '👑',
      current: levelsCount,
      target: 40,
      reward: 'Champion Trophy & Title',
    },
    {
      id: 'bubble_legend',
      title: 'Bubble Legend',
      desc: 'Accumulate over 100,000 lifetime points.',
      icon: '🏆',
      current: totalScore,
      target: 100000,
      reward: 'Mythic Badge',
    },
  ];

  const unlockedCount = achievementsList.filter(a => a.current >= a.target).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Title */}
      <div className="text-center max-w-xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">
          <Award className="w-3.5 h-3.5" />
          <span>Milestones & Badges</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-amber-300 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
          {GAME_NAME} Achievements
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Complete challenging feats during gameplay to earn boosters, coins, and glory!
        </p>

        {/* Progress Tracker */}
        <div className="mt-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 max-w-md mx-auto">
          <div className="flex items-center justify-between text-xs font-bold mb-2">
            <span className="text-slate-300">Total Unlocked</span>
            <span className="text-amber-400">{unlockedCount} / {achievementsList.length} Completed</span>
          </div>
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${(unlockedCount / achievementsList.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Achievements Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {achievementsList.map((ach) => {
          const isUnlocked = ach.current >= ach.target;
          const percent = Math.min(100, Math.round((ach.current / ach.target) * 100));

          return (
            <div
              key={ach.id}
              className={`p-5 rounded-3xl border transition-all flex items-start gap-4 ${
                isUnlocked
                  ? 'bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border-indigo-500/30 shadow-lg'
                  : 'bg-slate-900/50 border-slate-800/80 opacity-70'
              }`}
            >
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-md ${
                  isUnlocked ? 'bg-indigo-600/30 border border-indigo-400/40' : 'bg-slate-800 text-slate-500'
                }`}
              >
                {ach.icon}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-base font-extrabold text-slate-100 truncate">{ach.title}</h4>
                  {isUnlocked ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" /> Unlocked
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full">
                      <Lock className="w-3 h-3" /> Locked
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400 mt-1">{ach.desc}</p>

                {/* Progress bar */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span>Progress: {ach.current.toLocaleString()} / {ach.target.toLocaleString()}</span>
                    <span className="font-bold text-slate-300">{percent}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isUnlocked ? 'bg-emerald-400' : 'bg-indigo-500'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                <div className="text-[10px] text-amber-400/90 font-bold mt-2">
                  Reward: {ach.reward}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
