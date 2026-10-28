import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { GAME_NAME } from '../config/gameConfig';
import { useAuthStore } from '../store/authStore';
import { gameService } from '../services/gameService';
import soundManager from '../game/audioEngine';
import { Play, Star, Trophy, Award, Target, Flame, RotateCcw, Sparkles, Shield, Gift } from 'lucide-react';

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuthStore();
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [claimedBonus, setClaimedBonus] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      setLoadingHistory(true);
      gameService.getGameHistory()
        .then((res) => {
          if (res && res.history) setHistory(res.history);
        })
        .catch(() => {})
        .finally(() => setLoadingHistory(false));
    }
  }, [isAuthenticated]);

  const currentLevel = user?.currentLevel || 1;
  const totalStars = user?.totalStars || 0;
  const totalScore = user?.totalScore || 0;
  const bubblesPopped = user?.bubblesPopped || 0;
  const bestCombo = user?.bestCombo || 0;
  const completedCount = Object.keys(user?.completedLevels || {}).length;

  // Determine Title Rank
  let rankTitle = 'Novice Popper';
  let rankBadge = '🥉';
  if (totalStars >= 90) { rankTitle = 'Grand Master'; rankBadge = '👑'; }
  else if (totalStars >= 60) { rankTitle = 'Dragon Champion'; rankBadge = '🥇'; }
  else if (totalStars >= 30) { rankTitle = 'Adept Blaster'; rankBadge = '🥈'; }

  const handleClaimDailyDrop = () => {
    setClaimedBonus(true);
    soundManager.playRainbow();
    soundManager.playStar(3);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold border border-indigo-500/30 mb-2">
            <span>{rankBadge}</span>
            <span>{rankTitle}</span>
          </div>
          <h1 className="text-3xl font-black text-slate-100">
            {user?.name || 'Adventurer'}'s Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time adventure progress, statistics & booster vault in {GAME_NAME}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={`/game/${currentLevel}`}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-black text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 shadow-lg shadow-amber-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-slate-950" />
            <span>PLAY LEVEL {currentLevel}</span>
          </Link>
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-8">
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl text-center shadow-sm">
          <div className="text-2xl mb-1">🗺️</div>
          <div className="text-[11px] text-slate-400 font-bold uppercase">Current Level</div>
          <div className="text-2xl font-black text-indigo-400 mt-1">#{currentLevel}</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl text-center shadow-sm">
          <div className="text-2xl mb-1">⭐</div>
          <div className="text-[11px] text-slate-400 font-bold uppercase">Total Stars</div>
          <div className="text-2xl font-black text-amber-400 mt-1">{totalStars}</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl text-center shadow-sm">
          <div className="text-2xl mb-1">🏆</div>
          <div className="text-[11px] text-slate-400 font-bold uppercase">Total Score</div>
          <div className="text-2xl font-black text-slate-100 mt-1">{totalScore.toLocaleString()}</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl text-center shadow-sm">
          <div className="text-2xl mb-1">✅</div>
          <div className="text-[11px] text-slate-400 font-bold uppercase">Completed</div>
          <div className="text-2xl font-black text-emerald-400 mt-1">{completedCount}</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl text-center shadow-sm">
          <div className="text-2xl mb-1">💥</div>
          <div className="text-[11px] text-slate-400 font-bold uppercase">Popped</div>
          <div className="text-2xl font-black text-sky-400 mt-1">{bubblesPopped.toLocaleString()}</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl text-center shadow-sm">
          <div className="text-2xl mb-1">🔥</div>
          <div className="text-[11px] text-slate-400 font-bold uppercase">Best Combo</div>
          <div className="text-2xl font-black text-rose-400 mt-1">x{bestCombo || 1}</div>
        </div>
      </div>

      {/* Daily Free Supply Drop Banner */}
      <div className="mb-8 bg-gradient-to-r from-emerald-950/40 via-teal-950/40 to-slate-900 border border-emerald-500/30 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-2xl shadow-inner">
            🎁
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Free Daily Care Package</span>
            <h3 className="text-base font-black text-slate-100">Claim 1 Free Rainbow & Bomb Booster</h3>
            <p className="text-xs text-slate-400">Resets every 24 hours to keep your ammo full!</p>
          </div>
        </div>
        <button
          onClick={handleClaimDailyDrop}
          disabled={claimedBonus}
          className={`px-5 py-2.5 rounded-xl font-black text-xs transition-all ${
            claimedBonus
              ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 cursor-pointer hover:scale-105 active:scale-95'
          }`}
        >
          {claimedBonus ? 'CLAIMED TODAY ✓' : 'CLAIM FREE SUPPLIES'}
        </button>
      </div>

      {/* Booster Inventory Section */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 mb-8 shadow-md">
        <h3 className="text-base font-bold text-slate-100 mb-4 flex items-center gap-2">
          <span>🎒</span>
          <span>Booster Vault</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { icon: '💣', name: 'Bomb', count: (user?.boosterInventory?.bomb ?? 3) + (claimedBonus ? 1 : 0), desc: 'Pops 7 bubbles' },
            { icon: '🌈', name: 'Rainbow', count: (user?.boosterInventory?.rainbow ?? 2) + (claimedBonus ? 1 : 0), desc: 'Matches any color' },
            { icon: '🎯', name: 'Aim Guide', count: user?.boosterInventory?.aimGuide ?? 3, desc: 'Double bank preview' },
            { icon: '➕', name: 'Extra Shot', count: user?.boosterInventory?.extraShot ?? 2, desc: '+5 Ammo' },
            { icon: '🔀', name: 'Shuffle', count: user?.boosterInventory?.shuffle ?? 2, desc: 'Scrambles colors' },
          ].map((item) => (
            <div key={item.name} className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 text-center shadow-inner">
              <span className="text-2xl">{item.icon}</span>
              <div className="text-xs font-bold text-slate-200 mt-1">{item.name}</div>
              <div className="text-xs font-extrabold text-indigo-400">{item.count} in vault</div>
              <span className="text-[10px] text-slate-500 block mt-0.5">{item.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Game History Table */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <span>📜</span>
            <span>Recent Game Sessions</span>
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            {history.length > 0 ? `${history.length} sessions logged` : 'Sample session history'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-slate-400 uppercase bg-slate-900/90 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Level</th>
                <th className="py-3 px-4">Score</th>
                <th className="py-3 px-4">Stars</th>
                <th className="py-3 px-4">Shots</th>
                <th className="py-3 px-4">Best Combo</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {(history.length > 0 ? history : [
                { levelId: '1', score: 950, stars: 3, shotsUsed: 12, bestCombo: 4, completedAt: new Date().toISOString() },
                { levelId: '2', score: 1420, stars: 3, shotsUsed: 15, bestCombo: 5, completedAt: new Date().toISOString() },
                { levelId: '3', score: 1880, stars: 3, shotsUsed: 18, bestCombo: 6, completedAt: new Date().toISOString() },
              ]).slice(0, 10).map((s, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-indigo-400">Level {s.levelId}</td>
                  <td className="py-3 px-4 font-black text-amber-300">{(s.score || 0).toLocaleString()}</td>
                  <td className="py-3 px-4 text-amber-400 font-bold">{'★'.repeat(s.stars || 1)}</td>
                  <td className="py-3 px-4 text-slate-300">{s.shotsUsed}</td>
                  <td className="py-3 px-4 text-rose-400 font-bold">x{s.bestCombo || 1}</td>
                  <td className="py-3 px-4">
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                      Completed
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
