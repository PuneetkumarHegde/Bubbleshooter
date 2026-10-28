import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { GAME_NAME } from '../config/gameConfig';
import { useAuthStore } from '../store/authStore';
import { gameService } from '../services/gameService';
import { Play, Star, Trophy, Award, Target, Flame, RotateCcw, Sparkles } from 'lucide-react';

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuthStore();
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-800">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Player Headquarters</span>
          <h1 className="text-3xl font-black text-slate-100 mt-1">
            {user?.name || 'Adventurer'}'s Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Your progress & adventure stats in {GAME_NAME}
          </p>
        </div>

        <Link
          to={`/game/${currentLevel}`}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-black text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95"
        >
          <Play className="w-5 h-5 fill-slate-950" />
          <span>CONTINUE LEVEL {currentLevel}</span>
        </Link>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-10">
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl text-center">
          <div className="text-2xl mb-1">🗺️</div>
          <div className="text-xs text-slate-400 font-bold uppercase">Current Level</div>
          <div className="text-2xl font-black text-indigo-400 mt-1">#{currentLevel}</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl text-center">
          <div className="text-2xl mb-1">⭐</div>
          <div className="text-xs text-slate-400 font-bold uppercase">Total Stars</div>
          <div className="text-2xl font-black text-amber-400 mt-1">{totalStars}</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl text-center">
          <div className="text-2xl mb-1">🏆</div>
          <div className="text-xs text-slate-400 font-bold uppercase">Total Score</div>
          <div className="text-2xl font-black text-slate-100 mt-1">{totalScore.toLocaleString()}</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl text-center">
          <div className="text-2xl mb-1">✅</div>
          <div className="text-xs text-slate-400 font-bold uppercase">Completed</div>
          <div className="text-2xl font-black text-emerald-400 mt-1">{completedCount}</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl text-center">
          <div className="text-2xl mb-1">💥</div>
          <div className="text-xs text-slate-400 font-bold uppercase">Popped</div>
          <div className="text-2xl font-black text-sky-400 mt-1">{bubblesPopped.toLocaleString()}</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl text-center">
          <div className="text-2xl mb-1">🔥</div>
          <div className="text-xs text-slate-400 font-bold uppercase">Best Combo</div>
          <div className="text-2xl font-black text-rose-400 mt-1">x{bestCombo || 1}</div>
        </div>
      </div>

      {/* Booster Inventory Section */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 mb-10">
        <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
          <span>🎒</span>
          <span>Booster Inventory</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { icon: '💣', name: 'Bomb', count: user?.boosterInventory?.bomb ?? 3 },
            { icon: '🌈', name: 'Rainbow', count: user?.boosterInventory?.rainbow ?? 2 },
            { icon: '🎯', name: 'Aim Guide', count: user?.boosterInventory?.aimGuide ?? 3 },
            { icon: '➕', name: 'Extra Shot', count: user?.boosterInventory?.extraShot ?? 2 },
            { icon: '🔀', name: 'Shuffle', count: user?.boosterInventory?.shuffle ?? 2 },
          ].map((item) => (
            <div key={item.name} className="bg-slate-900 p-3 rounded-2xl border border-slate-800 text-center">
              <span className="text-2xl">{item.icon}</span>
              <div className="text-xs font-bold text-slate-300 mt-1">{item.name}</div>
              <div className="text-sm font-extrabold text-indigo-400">{item.count} available</div>
            </div>
          ))}
        </div>
      </div>

      {/* Game History Table */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <span>📜</span>
            <span>Recent Game Sessions</span>
          </h3>
          <span className="text-xs text-slate-500">
            {history.length} sessions logged
          </span>
        </div>

        {history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-slate-400 uppercase bg-slate-900/80 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Level</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Stars</th>
                  <th className="py-3 px-4">Shots</th>
                  <th className="py-3 px-4">Best Combo</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {history.slice(0, 10).map((s, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-bold text-indigo-400">Level {s.levelId}</td>
                    <td className="py-3 px-4 font-extrabold text-amber-300">{(s.score || 0).toLocaleString()}</td>
                    <td className="py-3 px-4 text-amber-400">{'★'.repeat(s.stars || 1)}</td>
                    <td className="py-3 px-4 text-slate-300">{s.shotsUsed}</td>
                    <td className="py-3 px-4 text-rose-400 font-bold">x{s.bestCombo || 1}</td>
                    <td className="py-3 px-4 text-xs text-slate-400">
                      {new Date(s.completedAt || s.startedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10 text-slate-500 text-sm">
            No game sessions logged yet. Hit "PLAY NOW" to record your first game!
          </div>
        )}
      </div>
    </div>
  );
}
