import React from 'react';
import { Play, RotateCcw, Settings, LogOut, Volume2, VolumeX, Music } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';

export default function PauseModal({ onResume, onRestart, onExit }) {
  const { soundEnabled, musicEnabled, toggleSound, toggleMusic } = useSettingsStore();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-700/80 rounded-3xl max-w-xs w-full p-6 text-center shadow-2xl">
        <h2 className="text-2xl font-black uppercase tracking-wider text-slate-100 mb-4">
          Game Paused
        </h2>

        {/* Audio Quick Toggles in Pause Menu */}
        <div className="flex items-center justify-center gap-3 bg-slate-900/90 py-2.5 px-4 rounded-2xl border border-slate-800 mb-6">
          <button
            onClick={toggleSound}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-colors ${
              soundEnabled ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-800 text-slate-500'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span>SFX</span>
          </button>
          <button
            onClick={toggleMusic}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-colors ${
              musicEnabled ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-slate-800 text-slate-500'
            }`}
          >
            <Music className="w-4 h-4" />
            <span>Music</span>
          </button>
        </div>

        {/* Navigation Action Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={onResume}
            className="w-full py-3 px-4 rounded-xl font-extrabold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 transition-transform transform active:scale-95"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Resume Game</span>
          </button>

          <button
            onClick={onRestart}
            className="w-full py-2.5 px-4 rounded-xl font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-2 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restart Level</span>
          </button>

          <button
            onClick={onExit}
            className="w-full py-2.5 px-4 rounded-xl font-bold bg-slate-800/80 hover:bg-slate-700 text-rose-300 border border-slate-700/60 flex items-center justify-center gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Exit to Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
}

