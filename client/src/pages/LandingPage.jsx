import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GAME_NAME } from '../config/gameConfig';
import { useAuthStore } from '../store/authStore';
import soundManager from '../game/audioEngine';
import { Play, Sparkles, Trophy, Award, ShieldCheck, Zap, Heart, Star, Target, Compass } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const currentLevel = user?.currentLevel || 1;

  const handlePlayNow = () => {
    soundManager.playClick();
    soundManager.startBGM();
    navigate(`/game/${currentLevel}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        {/* Glow backdrop circles */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-purple-600/15 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute top-10 right-10 w-72 h-72 bg-amber-500/15 blur-3xl rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-widest mb-6 shadow-sm">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Next-Gen Full-Stack HTML5 Game</span>
          </div>

          {/* Game Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-4">
            <span className="bg-gradient-to-r from-amber-300 via-pink-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-sm">
              {GAME_NAME}
            </span>
          </h1>

          {/* Tagline */}
          <p className="text-xl sm:text-2xl font-extrabold text-indigo-200/90 tracking-wide mb-3">
            Aim. Match. Pop. Rescue.
          </p>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto mb-8 font-medium">
            Immerse yourself in a vibrant cartoon puzzle universe! Blast clusters, execute strategic wall-bank shots, unleash explosive boosters, and rescue magical Star Sprites across 40+ handcrafted levels.
          </p>

          {/* Play CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handlePlayNow}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-lg bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-slate-950 shadow-xl shadow-amber-500/25 hover:from-amber-300 hover:to-yellow-300 transform hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer"
            >
              <Play className="w-6 h-6 fill-slate-950" />
              <span>PLAY NOW (LEVEL {currentLevel})</span>
            </button>

            <Link
              to="/levels"
              className="w-full sm:w-auto px-6 py-4 rounded-2xl font-bold text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 hover:border-slate-500 transition-all flex items-center justify-center gap-2"
            >
              <Compass className="w-5 h-5 text-indigo-400" />
              <span>Explore 40+ Levels</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Meet Your Companion */}
      <section className="py-12 px-4 max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-indigo-950/40 via-purple-950/40 to-slate-900/60 rounded-3xl p-6 sm:p-8 border border-indigo-500/20 shadow-xl flex flex-col sm:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-5xl shadow-inner animate-bounce-slow">
            🐲
          </div>
          <div className="flex-1 text-center sm:text-left">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Original Helper Companion</span>
            <h3 className="text-2xl font-black text-slate-100 mt-1">Meet Sparky the Bubble Drake!</h3>
            <p className="text-sm text-slate-300 mt-1">
              Sparky will guide your journey through Mystic Peaks! Clear surrounding bubbles to liberate his captured Star Sprite friends and watch him celebrate your high-score combos!
            </p>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex-1">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-slate-100">Why Players Love {GAME_NAME}</h2>
          <p className="text-sm text-slate-400 mt-2">Engineered with Phaser physics, Web Audio synthesizer, and secure full-stack persistence.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-slate-900/70 p-6 rounded-2xl border border-slate-800 hover:border-indigo-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-2xl mb-4">
              🎯
            </div>
            <h4 className="text-lg font-bold text-slate-100 mb-2">Dynamic Bank Shots</h4>
            <p className="text-sm text-slate-400">
              Real-time trajectory prediction raycasts off side walls to let you plan tricky bounces into dense clusters.
            </p>
          </div>

          <div className="bg-slate-900/70 p-6 rounded-2xl border border-slate-800 hover:border-indigo-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center text-2xl mb-4">
              ⭐
            </div>
            <h4 className="text-lg font-bold text-slate-100 mb-2">40+ Rich Levels</h4>
            <p className="text-sm text-slate-400">
              Handcrafted progression from Tutorial to Expert with multiple objectives: clear all, rescues, drops, and color hunts.
            </p>
          </div>

          <div className="bg-slate-900/70 p-6 rounded-2xl border border-slate-800 hover:border-indigo-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center text-2xl mb-4">
              💣
            </div>
            <h4 className="text-lg font-bold text-slate-100 mb-2">Explosive Boosters</h4>
            <p className="text-sm text-slate-400">
              Equip Bombs, Wildcard Rainbows, Extended Aim Guides, and Extra Shots to overcome challenging boards.
            </p>
          </div>

          <div className="bg-slate-900/70 p-6 rounded-2xl border border-slate-800 hover:border-indigo-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl mb-4">
              🛡️
            </div>
            <h4 className="text-lg font-bold text-slate-100 mb-2">Anti-Cheat Validated</h4>
            <p className="text-sm text-slate-400">
              Server-side mathematical bounds checks and session verification guarantee genuine leaderboards.
            </p>
          </div>
        </div>
      </section>

      {/* How to Play Guide */}
      <section className="py-12 bg-slate-900/40 border-t border-slate-800 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-8">How to Play in 3 Simple Steps</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800">
              <span className="text-4xl block mb-2">1️⃣</span>
              <h4 className="font-bold text-slate-200">Aim Your Launcher</h4>
              <p className="text-xs text-slate-400 mt-1">Move your mouse or drag with your finger. Follow the dotted trajectory line.</p>
            </div>
            <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800">
              <span className="text-4xl block mb-2">2️⃣</span>
              <h4 className="font-bold text-slate-200">Match 3 or More</h4>
              <p className="text-xs text-slate-400 mt-1">Connect 3 identical colors to pop them. Floating bubbles without ceiling support fall automatically!</p>
            </div>
            <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800">
              <span className="text-4xl block mb-2">3️⃣</span>
              <h4 className="font-bold text-slate-200">Rescue & Win 3 Stars</h4>
              <p className="text-xs text-slate-400 mt-1">Free Star Sprites, build combo chains, and finish with remaining shots for maximum star ratings!</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

