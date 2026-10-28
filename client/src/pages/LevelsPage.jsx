import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GAME_NAME } from '../config/gameConfig';
import { LEVELS } from '../data/levels/levels';
import { useAuthStore } from '../store/authStore';
import soundManager from '../game/audioEngine';
import { Star, Lock, Play, Calendar, Zap, Sparkles } from 'lucide-react';

export default function LevelsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const currentUnlockedLevel = user?.currentLevel || 1;
  const completedLevels = user?.completedLevels || {};

  const handleLevelClick = (levelId, isUnlocked) => {
    if (!isUnlocked) {
      soundManager.playCollision();
      return;
    }
    soundManager.playClick();
    navigate(`/game/${levelId}`);
  };

  const tiers = [
    { name: 'Tutorial', range: [1, 5], color: 'from-emerald-500 to-teal-600', badge: 'bg-emerald-500/20 text-emerald-300' },
    { name: 'Beginner', range: [6, 10], color: 'from-blue-500 to-indigo-600', badge: 'bg-blue-500/20 text-blue-300' },
    { name: 'Easy', range: [11, 20], color: 'from-indigo-500 to-purple-600', badge: 'bg-indigo-500/20 text-indigo-300' },
    { name: 'Medium', range: [21, 30], color: 'from-purple-500 to-pink-600', badge: 'bg-purple-500/20 text-purple-300' },
    { name: 'Hard', range: [31, 35], color: 'from-amber-500 to-orange-600', badge: 'bg-amber-500/20 text-amber-300' },
    { name: 'Expert', range: [36, 40], color: 'from-rose-500 to-red-600', badge: 'bg-rose-500/20 text-rose-300' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Title Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-amber-300 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
          {GAME_NAME} — Level Select
        </h1>
        <p className="text-sm text-slate-400 mt-2">
          Conquer 40+ levels, achieve 3-star ratings, and unlock the next realms of the adventure!
        </p>

        {/* Player summary banner */}
        <div className="inline-flex items-center gap-6 mt-4 bg-slate-900/90 border border-slate-800 px-6 py-2.5 rounded-2xl shadow-sm text-sm">
          <div className="flex items-center gap-1.5">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="font-extrabold text-amber-300">{user?.totalStars || 0}</span>
            <span className="text-slate-400">Total Stars</span>
          </div>
          <div className="h-4 w-px bg-slate-800" />
          <div className="flex items-center gap-1.5">
            <span className="text-base">🏆</span>
            <span className="font-extrabold text-slate-200">{(user?.totalScore || 0).toLocaleString()}</span>
            <span className="text-slate-400">Score</span>
          </div>
        </div>
      </div>

      {/* Daily Challenge Card */}
      <div className="mb-10 max-w-xl mx-auto">
        <div className="bg-gradient-to-r from-indigo-900/60 via-purple-900/60 to-slate-900 p-5 rounded-3xl border border-indigo-500/30 shadow-lg flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/40 border border-indigo-500/40 flex items-center justify-center text-2xl">
              📅
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Bonus Event</span>
              <h3 className="text-lg font-black text-slate-100">Today's Daily Challenge</h3>
              <p className="text-xs text-slate-400">Rescue 5 Star Sprites • Win +500 Coins & Rainbow Booster</p>
            </div>
          </div>
          <Link
            to="/game/daily"
            className="px-4 py-2.5 rounded-xl font-black text-xs bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md transition-all whitespace-nowrap"
          >
            PLAY DAILY
          </Link>
        </div>
      </div>

      {/* Tier Sections */}
      <div className="space-y-10">
        {tiers.map((tier) => {
          const tierLevels = LEVELS.filter(l => l.id >= tier.range[0] && l.id <= tier.range[1]);

          return (
            <div key={tier.name} className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-5 sm:p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-8 rounded-full bg-gradient-to-b ${tier.color}`} />
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-100">{tier.name} Realm</h2>
                    <span className="text-xs text-slate-400">Levels {tier.range[0]} – {tier.range[1]}</span>
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
                      className={`relative p-4 rounded-2xl flex flex-col items-center justify-between min-h-[110px] transition-all transform ${
                        isUnlocked
                          ? isCurrent
                            ? 'bg-gradient-to-b from-indigo-900/90 to-slate-900 border-2 border-indigo-400 shadow-lg shadow-indigo-500/20 scale-105 active:scale-95 cursor-pointer'
                            : 'bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-600 active:scale-95 cursor-pointer'
                          : 'bg-slate-950/60 border border-slate-800/40 opacity-40 cursor-not-allowed'
                      }`}
                    >
                      {/* Level Number & Indicator */}
                      <div className="w-full flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400">LVL</span>
                        {isUnlocked ? (
                          isCurrent ? (
                            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                          ) : stars > 0 ? (
                            <span className="text-emerald-400 text-xs">✓</span>
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
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-700'
                            }`}
                          />
                        ))}
                      </div>

                      {/* Objective hint */}
                      <span className="text-[9px] text-slate-500 mt-1 truncate max-w-full">
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
