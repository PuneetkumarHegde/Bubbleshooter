import React from 'react';
import { Link } from 'react-router-dom';
import { GAME_NAME } from '../config/gameConfig';
import { Sparkles, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 py-8 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <span className="font-bold text-slate-200 tracking-wide">{GAME_NAME}</span>
          <span className="text-xs text-slate-500">© {new Date().getFullYear()} All rights reserved.</span>
        </div>

        <div className="flex items-center gap-6">
          <Link to="/levels" className="hover:text-indigo-400 transition-colors">Play Levels</Link>
          <Link to="/leaderboard" className="hover:text-indigo-400 transition-colors">Leaderboard</Link>
          <Link to="/achievements" className="hover:text-indigo-400 transition-colors">Achievements</Link>
          <Link to="/help" className="hover:text-indigo-400 transition-colors">Help & Rules</Link>
          <Link to="/settings" className="hover:text-indigo-400 transition-colors">Settings</Link>
        </div>

        <div className="flex items-center gap-1 text-xs text-slate-500">
          <span>Crafted with</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          <span>for VELoop Rewards Full-Stack Challenge</span>
        </div>
      </div>
    </footer>
  );
}

