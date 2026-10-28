import React from 'react';
import { GAME_NAME } from '../config/gameConfig';
import { HelpCircle, Target, Sparkles, Zap, Shield, Info } from 'lucide-react';

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Game Guide & Knowledge Base</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-amber-300 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
          How to Play {GAME_NAME}
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Master trajectories, understand combo multipliers, and discover tactical booster strategies!
        </p>
      </div>

      {/* Rules Overview */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div>
          <h2 className="text-xl font-black text-slate-100 mb-3 flex items-center gap-2">
            <span>🎯</span>
            <span>Core Game Mechanics</span>
          </h2>
          <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
            <p>
              <strong className="text-indigo-400">Aiming & Trajectory:</strong> Move your mouse or touch and drag on your screen to guide the launcher arrow. Dotted trajectory lines show exactly where your bubble will travel.
            </p>
            <p>
              <strong className="text-indigo-400">Wall Bouncing (Bank Shots):</strong> Bubbles bounce elastically off the left and right walls. Use bank shots to navigate around obstacles and strike hidden clusters behind shields.
            </p>
            <p>
              <strong className="text-indigo-400">Matching 3+ Bubbles:</strong> When a shot attaches to 2 or more neighboring bubbles of identical color, a BFS connected-component algorithm triggers a cluster pop!
            </p>
            <p>
              <strong className="text-indigo-400">Floating / Unsupported Bubbles:</strong> Any bubbles that lose all physical connections back to the ceiling row will detach, drop downwards with gravitational acceleration, and reward huge bonus points!
            </p>
          </div>
        </div>

        {/* Booster Guide */}
        <div className="pt-6 border-t border-slate-800">
          <h2 className="text-xl font-black text-slate-100 mb-4 flex items-center gap-2">
            <span>💣</span>
            <span>Tactical Boosters & Specials</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-2 text-rose-400 font-bold mb-1">
                <span className="text-xl">💣</span>
                <span>Bomb Bubble</span>
              </div>
              <p className="text-xs text-slate-400">
                Detonates on contact, obliterating all neighboring bubbles in a wide circular blast radius regardless of their color.
              </p>
            </div>

            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-2 text-purple-400 font-bold mb-1">
                <span className="text-xl">🌈</span>
                <span>Rainbow Wildcard</span>
              </div>
              <p className="text-xs text-slate-400">
                Matches with any adjacent color group. Perfect for breaking tricky multi-colored bottlenecks.
              </p>
            </div>

            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-2 text-amber-400 font-bold mb-1">
                <span className="text-xl">🎯</span>
                <span>Extended Aim Guide</span>
              </div>
              <p className="text-xs text-slate-400">
                Extends trajectory guide across multiple wall bounces with a precise landing target indicator.
              </p>
            </div>

            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-2 text-emerald-400 font-bold mb-1">
                <span className="text-xl">➕</span>
                <span>+5 Extra Shots</span>
              </div>
              <p className="text-xs text-slate-400">
                Instantly grants 5 additional ammo bubbles to help you seal victory when shots run low.
              </p>
            </div>
          </div>
        </div>

        {/* Scoring Breakdown */}
        <div className="pt-6 border-t border-slate-800">
          <h2 className="text-xl font-black text-slate-100 mb-4 flex items-center gap-2">
            <span>⭐</span>
            <span>Scoring & Star Ratings</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
              <span className="font-black text-amber-400 text-lg block">+10 pts</span>
              <span className="text-slate-400">Per Bubble Popped</span>
            </div>
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
              <span className="font-black text-indigo-400 text-lg block">+20 pts</span>
              <span className="text-slate-400">Per Floating Bubble Dropped</span>
            </div>
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
              <span className="font-black text-emerald-400 text-lg block">+150 pts</span>
              <span className="text-slate-400">Star Sprite Rescued</span>
            </div>
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
              <span className="font-black text-rose-400 text-lg block">+50 pts</span>
              <span className="text-slate-400">Per Leftover Shot</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
