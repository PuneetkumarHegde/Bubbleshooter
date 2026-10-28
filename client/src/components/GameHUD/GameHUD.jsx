import React from 'react';
import { useGameStore, GAME_STATUS } from '../../store/gameStore';
import soundManager from '../../game/audioEngine';
import BoosterBar from './BoosterBar';
import { Pause, RotateCcw, Lightbulb, Repeat } from 'lucide-react';

export default function GameHUD({ onPause }) {
  const {
    levelId,
    level,
    score,
    shotsRemaining,
    combo,
    objectiveProgress,
    currentBubble,
    nextBubble,
    swapBubbles,
    undoShot,
    triggerHint,
    showHint,
    historyStack,
    gameStatus,
  } = useGameStore();

  const handleSwap = () => {
    swapBubbles();
    soundManager.playAim();
  };

  const handleUndo = () => {
    const success = undoShot();
    if (success) {
      soundManager.playClick();
    }
  };

  const handleHint = () => {
    triggerHint();
    soundManager.playClick();
  };

  return (
    <div className="w-full max-w-[480px] mx-auto flex flex-col gap-2 select-none">
      {/* Top Header Card */}
      <div className="bg-slate-900/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-800 shadow-md flex items-center justify-between">
        {/* Level & Shots */}
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600/30 border border-indigo-500/40 px-2.5 py-1 rounded-xl text-center">
            <div className="text-[10px] uppercase tracking-wider text-indigo-300 font-bold">Level</div>
            <div className="text-base font-extrabold text-white leading-none">#{levelId}</div>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/60">
            <span className="text-lg">🎯</span>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold leading-none">Shots</div>
              <div className={`text-base font-extrabold leading-none ${shotsRemaining <= 5 ? 'text-rose-400 animate-pulse' : 'text-slate-100'}`}>
                {shotsRemaining}
              </div>
            </div>
          </div>
        </div>

        {/* Score & Combo */}
        <div className="text-center">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Score</div>
          <div className="text-lg font-black text-amber-400 tracking-wide leading-none">
            {score.toLocaleString()}
          </div>
          {combo >= 2 && (
            <div className="text-[11px] font-black text-rose-400 animate-bounce leading-none mt-0.5">
              🔥 x{combo} COMBO!
            </div>
          )}
        </div>

        {/* Pause Button */}
        <button
          onClick={onPause}
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors shadow-sm"
          title="Pause Game"
        >
          <Pause className="w-5 h-5" />
        </button>
      </div>

      {/* Objective Progress Bar */}
      <div className="bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-800/80 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 font-semibold text-slate-300">
          <span className="text-base">🏆</span>
          <span>{objectiveProgress?.progressText || level?.objective?.label || 'Clear bubbles'}</span>
        </div>
        <div className="w-28 bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700">
          <div
            className="bg-gradient-to-r from-emerald-500 to-green-400 h-full rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, objectiveProgress?.progressPercent || 0)}%` }}
          />
        </div>
      </div>

      {/* Bottom Floating Bubble Controls & Queue Preview */}
      <div className="flex items-center justify-between gap-2 px-1">
        {/* Undo and Hint Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleUndo}
            disabled={historyStack.length === 0 || gameStatus !== GAME_STATUS.READY}
            className={`p-2.5 rounded-xl font-bold flex items-center gap-1 text-xs transition-all ${
              historyStack.length > 0 && gameStatus === GAME_STATUS.READY
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                : 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed opacity-40'
            }`}
            title="Undo Last Shot"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Undo</span>
          </button>
          <button
            onClick={handleHint}
            className={`p-2.5 rounded-xl font-bold flex items-center gap-1 text-xs transition-all ${
              showHint
                ? 'bg-amber-500 text-slate-950 border border-amber-400'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
            title="Show Hint"
          >
            <Lightbulb className="w-4 h-4" />
            <span className="hidden sm:inline">Hint</span>
          </button>
        </div>

        {/* Current & Next Bubble Queue Swapper */}
        <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-1.5 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2">
            <div className="text-center">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-semibold">Next</span>
              <div
                className="w-7 h-7 rounded-full shadow-inner border border-white/30 transform transition-transform"
                style={{
                  backgroundColor: nextBubble?.color === 'red' ? '#ef4444' :
                    nextBubble?.color === 'blue' ? '#3b82f6' :
                    nextBubble?.color === 'green' ? '#10b981' :
                    nextBubble?.color === 'yellow' ? '#f59e0b' :
                    nextBubble?.color === 'purple' ? '#8b5cf6' :
                    nextBubble?.color === 'orange' ? '#f97316' :
                    nextBubble?.color === 'pink' ? '#ec4899' : '#06b6d4'
                }}
              />
            </div>
            <button
              onClick={handleSwap}
              title="Swap Current & Next Bubble (Spacebar)"
              className="p-1.5 bg-slate-800 hover:bg-indigo-600 rounded-lg text-slate-300 hover:text-white transition-colors"
            >
              <Repeat className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Booster Dock */}
      <BoosterBar />
    </div>
  );
}
