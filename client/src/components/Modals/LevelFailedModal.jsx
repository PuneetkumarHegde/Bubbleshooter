import React from 'react';
import { RotateCcw, PlusCircle, Grid } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';

export default function LevelFailedModal({ onRetry, onUseBooster, onLevelSelect }) {
  const { level, boosterInventory } = useGameStore();

  const extraShotCount = boosterInventory.extraShot || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-700/80 rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl relative overflow-hidden">
        <div className="text-4xl mb-2">💔</div>
        <h2 className="text-2xl font-black uppercase tracking-wider text-rose-500">
          Level Failed!
        </h2>
        <p className="text-xs text-slate-400 mt-1">Out of shots before completing objective!</p>

        <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 my-5">
          <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Target Objective</div>
          <div className="text-base font-extrabold text-amber-300">
            {level?.objective?.label || 'Clear all bubbles'}
          </div>
          <div className="text-xs text-rose-400 font-semibold mt-1">Status: Incomplete</div>
        </div>

        <div className="flex flex-col gap-2.5">
          <button
            onClick={onRetry}
            className="w-full py-3 px-4 rounded-xl font-extrabold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-transform transform active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Again</span>
          </button>

          {extraShotCount > 0 && (
            <button
              onClick={onUseBooster}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-amber-300 bg-amber-950/50 hover:bg-amber-900/50 border border-amber-600/40 flex items-center justify-center gap-2 transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Use +5 Shots ({extraShotCount} available)</span>
            </button>
          )}

          <button
            onClick={onLevelSelect}
            className="w-full py-2.5 px-4 rounded-xl font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center justify-center gap-2 transition-colors"
          >
            <Grid className="w-4 h-4" />
            <span>Level Select</span>
          </button>
        </div>
      </div>
    </div>
  );
}
