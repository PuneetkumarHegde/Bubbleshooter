import React, { useState } from 'react';
import { GAME_NAME } from '../config/gameConfig';
import { useAuthStore } from '../store/authStore';
import soundManager from '../game/audioEngine';
import { User, Star, Trophy, Sparkles, Shield, LogOut, Check } from 'lucide-react';

export default function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [selectedAvatar, setSelectedAvatar] = useState('🐲');

  const avatars = ['🐲', '🦊', '🦄', '🦁', '🐼', '🐸', '🚀', '⭐'];

  const handleSelectAvatar = (a) => {
    setSelectedAvatar(a);
    soundManager.playClick();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl mb-8">
        {/* Profile Card Header */}
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-800">
          <div className="w-24 h-24 rounded-3xl bg-indigo-600/30 border-2 border-indigo-500/50 flex items-center justify-center text-5xl shadow-inner shadow-indigo-500/20">
            {selectedAvatar}
          </div>
          <div className="text-center sm:text-left flex-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/30 mb-1">
              <Shield className="w-3.5 h-3.5" />
              <span>{isAuthenticated ? 'Authenticated Adventurer' : 'Guest Player'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-100">
              {user?.name || 'Adventurer'}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Playing on {GAME_NAME}
            </p>
          </div>

          {isAuthenticated && (
            <button
              onClick={logout}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-950/40 text-rose-300 border border-rose-800/50 hover:bg-rose-900/40 transition-colors flex items-center gap-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          )}
        </div>

        {/* Avatar Customization */}
        <div className="py-6 border-b border-slate-800">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3">
            Choose Your Companion Avatar
          </h3>
          <div className="flex items-center gap-2.5 overflow-x-auto pb-2">
            {avatars.map((a) => (
              <button
                key={a}
                onClick={() => handleSelectAvatar(a)}
                className={`w-12 h-12 rounded-2xl text-2xl flex items-center justify-center transition-all ${
                  selectedAvatar === a
                    ? 'bg-indigo-600 text-white ring-2 ring-indigo-400 scale-105 shadow-md'
                    : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700'
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        {/* Detailed Stats Overview */}
        <div className="pt-6">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">
            Campaign Statistics
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-500 block">Total Stars</span>
              <span className="text-xl font-black text-amber-400">★ {user?.totalStars || 0}</span>
            </div>
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-500 block">Current Level</span>
              <span className="text-xl font-black text-indigo-400">#{user?.currentLevel || 1}</span>
            </div>
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-500 block">Total Score</span>
              <span className="text-xl font-black text-slate-100">{(user?.totalScore || 0).toLocaleString()}</span>
            </div>
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-500 block">Best Combo Chain</span>
              <span className="text-xl font-black text-rose-400">x{user?.bestCombo || 1}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
