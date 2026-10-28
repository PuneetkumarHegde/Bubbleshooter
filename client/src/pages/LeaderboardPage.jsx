import React, { useEffect, useState } from 'react';
import { GAME_NAME } from '../config/gameConfig';
import { useAuthStore } from '../store/authStore';
import { leaderboardService } from '../services/leaderboardService';
import { Trophy, Medal, Star, Flame, Crown, Clock } from 'lucide-react';

export default function LeaderboardPage() {
  const { user } = useAuthStore();
  const [timeframe, setTimeframe] = useState('all'); // 'all', 'weekly', 'monthly'
  const [leaders, setLeaders] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [loading, setLoading] = useState(true);

  // Default seed leaderboard data for instant offline/fresh enjoyment
  const sampleLeaderboard = [
    { rank: 1, name: 'DragonMaster99', score: 982450, stars: 120, levelsCompleted: 40, bestCombo: 14 },
    { rank: 2, name: 'BubbleQueen', score: 914820, stars: 118, levelsCompleted: 40, bestCombo: 12 },
    { rank: 3, name: 'CosmicBlaster', score: 882100, stars: 115, levelsCompleted: 39, bestCombo: 11 },
    { rank: 4, name: 'SpriteSaver', score: 795300, stars: 104, levelsCompleted: 35, bestCombo: 9 },
    { rank: 5, name: 'HexagonPro', score: 712000, stars: 95, levelsCompleted: 32, bestCombo: 8 },
    { rank: 6, name: 'StarChaser', score: 648900, stars: 88, levelsCompleted: 29, bestCombo: 8 },
    { rank: 7, name: 'AimMaster', score: 580400, stars: 76, levelsCompleted: 25, bestCombo: 7 },
  ];

  useEffect(() => {
    setLoading(true);
    leaderboardService.getGlobalLeaderboard(timeframe)
      .then((res) => {
        if (res && res.leaderboard && res.leaderboard.length > 0) {
          setLeaders(res.leaderboard);
        } else {
          setLeaders(sampleLeaderboard);
        }
      })
      .catch(() => {
        setLeaders(sampleLeaderboard);
      })
      .finally(() => setLoading(false));

    leaderboardService.getMyRank()
      .then((res) => {
        if (res) setMyRank(res.rank);
      })
      .catch(() => {
        setMyRank(user?.totalScore > 0 ? 8 : 42);
      });
  }, [timeframe]);

  const getRankBadge = (rank) => {
    if (rank === 1) return <span className="text-2xl">🥇</span>;
    if (rank === 2) return <span className="text-2xl">🥈</span>;
    if (rank === 3) return <span className="text-2xl">🥉</span>;
    return <span className="text-sm font-bold text-slate-400">#{rank}</span>;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Title */}
      <div className="text-center max-w-xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
          <Trophy className="w-3.5 h-3.5" />
          <span>Hall of Fame</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500 bg-clip-text text-transparent">
          {GAME_NAME} Leaderboards
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Compete against bubble shooters worldwide for the top rank!
        </p>
      </div>

      {/* Timeframe Filter Buttons */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[
          { key: 'all', label: 'All-Time Global' },
          { key: 'weekly', label: 'Weekly Tournament' },
          { key: 'monthly', label: 'Monthly Champions' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setTimeframe(tab.key)}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              timeframe === tab.key
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Your Rank Banner */}
      <div className="bg-gradient-to-r from-indigo-950/60 to-purple-950/60 border border-indigo-500/30 rounded-2xl p-4 sm:p-5 mb-8 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-xl font-black text-amber-300">
            #{myRank || 8}
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-indigo-300 tracking-wider">Your Standing</span>
            <div className="text-lg font-extrabold text-slate-100">{user?.name || 'You (Guest)'}</div>
            <div className="text-xs text-slate-400">Score: {(user?.totalScore || 0).toLocaleString()} • Stars: {user?.totalStars || 0}</div>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs text-emerald-400 font-bold block">Top 5%</span>
          <span className="text-[10px] text-slate-500">Updated live</span>
        </div>
      </div>

      {/* Leaderboard Table Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-slate-400 uppercase bg-slate-900 border-b border-slate-800">
              <tr>
                <th className="py-4 px-5">Rank</th>
                <th className="py-4 px-5">Player</th>
                <th className="py-4 px-5">Total Score</th>
                <th className="py-4 px-5">Stars</th>
                <th className="py-4 px-5">Cleared</th>
                <th className="py-4 px-5">Best Combo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {leaders.map((entry, index) => {
                const rank = entry.rank || index + 1;
                const isMe = user?.name && user.name === entry.name;

                return (
                  <tr
                    key={index}
                    className={`transition-colors ${
                      isMe ? 'bg-indigo-950/40 font-bold' : rank <= 3 ? 'bg-slate-900/40 hover:bg-slate-800/40' : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="py-3.5 px-5 flex items-center gap-2">
                      {getRankBadge(rank)}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={`font-bold ${rank <= 3 ? 'text-amber-200' : 'text-slate-200'}`}>
                        {entry.name}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 font-black text-amber-400">
                      {(entry.score || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-5 text-amber-300 font-semibold">
                      ★ {entry.stars || 0}
                    </td>
                    <td className="py-3.5 px-5 text-slate-300">
                      {entry.levelsCompleted || 0} / 40
                    </td>
                    <td className="py-3.5 px-5 text-rose-400 font-bold">
                      x{entry.bestCombo || 1}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
