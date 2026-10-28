import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GAME_NAME } from '../config/gameConfig';
import { LEVELS } from '../data/levels/levels';
import { useAuthStore } from '../store/authStore';
import soundManager from '../game/audioEngine';
import { Star, Lock, Play, Calendar, Zap, Sparkles, Filter } from 'lucide-react';

export default function LevelsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const currentUnlockedLevel = user?.currentLevel || 1;
  const completedLevels = user?.completedLevels || {};

  const [activeTierFilter, setActiveTierFilter] = useState('all');

  const handleLevelClick = (levelId, isUnlocked) => {
    if (!isUnlocked) {
      soundManager.playCollision();
      return;
    }
    soundManager.playClick();
    navigate(`/game/${levelId}`);
  };

  const tiers = [
    { id: 'tutorial', name: 'Tutorial', range: [1, 5], color: 'from-emerald-500 to-teal-600', badge: 'bg-emerald-500/20 text-emerald-300' },
    { id: 'beginner', name: 'Beginner', range: [6, 10], color: 'from-blue-500 to-indigo-600', badge: 'bg-blue-500/20 text-blue-300' },
    { id: 'easy', name: 'Easy', range: [11, 20], color: 'from-indigo-500 to-purple-600', badge: 'bg-indigo-500/20 text-indigo-300' },
    { id: 'medium', name: 'Medium', range: [21, 30], color: 'from-purple-500 to-pink-600', badge: 'bg-purple-500/20 text-purple-300' },
    { id: 'hard', name: 'Hard', range: [31, 35], color: 'from-amber-500 to-orange-600', badge: 'bg-amber-500/20 text-amber-300' },
    { id: 'expert', name: 'Expert', range: [36, 40], color: 'from-rose-500 to-red-600', badge: 'bg-rose-500/20 text-rose-300' },
  ];

  const filteredTiers = activeTierFilter === 'all'
    ? tiers
    : tiers.filter(t => t.id === activeTierFilter);

  const totalMaxStars = 40 * 3;
  const userStars = user?.totalStars || 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Title Header */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-amber-300 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
          {GAME_NAME} — Level Select
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-2">
          Conquer 40+ handcrafted levels, earn 3-star mastery, and unlock new realms of the adventure!
        </p>

        {/* Player summary banner */}
        <div className="inline-flex items-center gap-6 mt-4 bg-slate-900/90 border border-slate-800 px-6 py-2.5 rounded-2xl shadow-lg text-sm">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="font-extrabold text-amber-300">{userStars} / {totalMaxStars}</span>
            <span className="text-slate-400 text-xs">Stars</span>
          </div>
          <div className="h-4 w-px bg-slate-800" />
          <div className="flex items-center gap-2">
            <span className="text-base">🏆</span>
            <span className="font-extrabold text-slate-200">{(user?.totalScore || 0).toLocaleString()}</span>
            <span className="text-slate-400 text-xs">Score</span>
          </div>
        </div>
      </div>

      {/* Daily Challenge Bonus Card */}
      <div className="mb-8 max-w-2xl mx-auto">
        <div className="bg-gradient-to-r from-indigo-950/70 via-purple-950/70 to-slate-900 p-5 rounded-3xl border border-indigo-500/30 shadow-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/40 border border-indigo-500/50 flex items-center justify-center text-2xl shadow-inner">
              📅
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Daily Quest Event</span>
              <h3 className="text-base sm:text-lg font-black text-slate-100">Today's Daily Challenge</h3>
              <p className="text-xs text-slate-400">Rescue 5 Star Sprites • Win +500 Coins & Rainbow Booster</p>
            </div>
          </div>
          <Link
            to="/game/daily"
            className="px-4 py-2.5 rounded-xl font-black text-xs bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md transition-all hover:scale-105 active:scale-95 whitespace-nowrap cursor-pointer"
          >
            PLAY QUEST
          </Link>
        </div>
      </div>

      {/* Quick Tier Navigation Filters */}
      <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-8 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTierFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTierFilter === 'all'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          All Realms (40)
        </button>
        {tiers.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTierFilter(t.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTierFilter === t.id
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>

      {/* Tier Sections */}
      <div className="space-y-8">
        {filteredTiers.map((tier) => {
          const tierLevels = LEVELS.filter(l => l.id >= tier.range[0] && l.id <= tier.range[1]);
          const clearedInTier = tierLevels.filter(l => completedLevels[l.id]?.stars > 0).length;

          return (
            <div key={tier.name} className="bg-slate-900/50 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-md">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className={`w-3.5 h-8 rounded-full bg-gradient-to-b ${tier.color}`} />
                  <div>
                    <h2 className="text-lg sm:text-xl font-extrabold text-slate-100">{tier.name} Realm</h2>
                    <span className="text-xs text-slate-400">
                      Levels {tier.range[0]} – {tier.range[1]} • {clearedInTier} / {tierLevels.length} Cleared
                    </span>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${tier.badge}`}>
                  {tier.name}
                </span>
              </div>

              {/* Grid of Level Tiles */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                {tierLevels.map((lvl) => {
                  const isUnlocked = lvl.id <= currentUnlockedLevel;
                  const record = completedLevels[lvl.id];
                  const stars = record?.stars || 0;
                  const isCurrent = lvl.id === currentUnlockedLevel;

                  return (
                    <button
                      key={lvl.id}
                      onClick={() => handleLevelClick(lvl.id, isUnlocked)}
                      disabled={!isUnlocked}
                      className={`relative p-4 rounded-2xl flex flex-col items-center justify-between min-h-[115px] transition-all transform ${
                        isUnlocked
                          ? isCurrent
                            ? 'bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-900 border-2 border-indigo-400 shadow-xl shadow-indigo-500/25 scale-105 active:scale-95 cursor-pointer ring-2 ring-indigo-400/40'
                            : 'bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-600 active:scale-95 cursor-pointer shadow-sm'
                          : 'bg-slate-950/60 border border-slate-800/40 opacity-40 cursor-not-allowed'
                      }`}
                    >
                      {/* Level Number & Indicator */}
                      <div className="w-full flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-400">LVL</span>
                        {isUnlocked ? (
                          isCurrent ? (
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                          ) : stars > 0 ? (
                            <span className="text-emerald-400 text-xs font-black">✓</span>
                          ) : null
                        ) : (
                          <Lock className="w-3.5 h-3.5 text-slate-600" />
                        )}
                      </div>

                      <div className="text-2xl sm:text-3xl font-black text-slate-100 my-1">
                        {lvl.id}
                      </div>

                      {/* Stars Rating */}
                      <div className="flex items-center gap-1">
                        {[1, 2, 3].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= stars
                                ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]'
                                : 'text-slate-700'
                            }`}
                          />
                        ))}
                      </div>

                      {/* Objective hint */}
                      <span className="text-[9px] text-slate-500 mt-1 truncate max-w-full font-medium">
                        {lvl.objective.type.replace('_', ' ')}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
