import React, { useEffect, useState } from 'react';
import { useGameStore, GAME_STATUS } from '../../store/gameStore';
import soundManager from '../../game/audioEngine';
import BoosterBar from './BoosterBar';
import { Pause, RotateCcw, Lightbulb, Repeat, Flame, Sparkles } from 'lucide-react';

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

  // Smooth animated rolling score ticker
  const [displayScore, setDisplayScore] = useState(score);

  useEffect(() => {
    if (displayScore === score) return;
    const diff = score - displayScore;
    const step = Math.ceil(diff / 8);
    const timer = setTimeout(() => {
      setDisplayScore((prev) => Math.min(score, prev + step));
    }, 20);
    return () => clearTimeout(timer);
  }, [score, displayScore]);

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
    <div className="w-full max-w-[480px] mx-auto flex flex-col gap-2 select-none px-1">
      {/* Top Header Card */}
      <div className="bg-slate-900/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-800 shadow-lg flex items-center justify-between">
        {/* Level & Shots Indicator */}
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-indigo-600/40 to-purple-600/40 border border-indigo-500/50 px-3 py-1 rounded-xl text-center shadow-inner">
            <div className="text-[9px] uppercase tracking-wider text-indigo-300 font-extrabold">Level</div>
            <div className="text-base font-black text-white leading-none">#{levelId}</div>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-700/80 shadow-inner">
            <span className="text-lg">🎯</span>
            <div>
              <div className="text-[9px] text-slate-400 uppercase font-bold leading-none">Shots</div>
              <div className={`text-base font-black leading-none ${shotsRemaining <= 5 ? 'text-rose-400 animate-pulse' : 'text-slate-100'}`}>
                {shotsRemaining}
              </div>
            </div>
          </div>
        </div>

        {/* Rolling Score & Combo Multiplier */}
        <div className="text-center">
          <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Score</div>
          <div className="text-xl font-black text-amber-400 tracking-wide leading-none drop-shadow-sm">
            {displayScore.toLocaleString()}
          </div>
          {combo >= 2 && (
            <div className="inline-flex items-center gap-1 text-[11px] font-black text-rose-400 animate-bounce leading-none mt-1 bg-rose-950/60 border border-rose-800/40 px-2 py-0.5 rounded-full">
              <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span>x{combo} COMBO!</span>
            </div>
          )}
        </div>

        {/* Pause Button */}
        <button
          onClick={onPause}
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-all hover:scale-105 active:scale-95 shadow-sm cursor-pointer"
          title="Pause Game (Esc / P)"
        >
          <Pause className="w-5 h-5" />
        </button>
      </div>

      {/* Objective Progress Bar */}
      <div className="bg-slate-900/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-slate-800 flex items-center justify-between gap-3 text-xs shadow-sm">
        <div className="flex items-center gap-2 font-bold text-slate-200">
          <span className="text-base">🏆</span>
          <span className="truncate">{objectiveProgress?.progressText || level?.objective?.label || 'Clear bubbles'}</span>
        </div>
        <div className="w-28 sm:w-36 bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700/80 shrink-0">
          <div
            className="bg-gradient-to-r from-emerald-500 to-green-400 h-full rounded-full transition-all duration-300 shadow-sm"
            style={{ width: `${Math.min(100, objectiveProgress?.progressPercent || 0)}%` }}
          />
        </div>
      </div>

      {/* Mid Utility Bar: Undo, Hint, Bubble Swap & Keyboard Hotkeys */}
      <div className="flex items-center justify-between gap-2 px-1">
        {/* Undo and Hint Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleUndo}
            disabled={historyStack.length === 0 || gameStatus !== GAME_STATUS.READY}
            className={`p-2 sm:px-3 sm:py-2 rounded-xl font-bold flex items-center gap-1.5 text-xs transition-all ${
              historyStack.length > 0 && gameStatus === GAME_STATUS.READY
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 shadow-sm cursor-pointer hover:scale-105 active:scale-95'
                : 'bg-slate-900 text-slate-600 border border-slate-800/80 cursor-not-allowed opacity-40'
            }`}
            title="Undo Last Shot (Key: U / Z)"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Undo</span>
            <span className="hidden sm:inline text-[9px] text-slate-400 bg-slate-700 px-1 rounded font-mono">U</span>
          </button>

          <button
            onClick={handleHint}
            className={`p-2 sm:px-3 sm:py-2 rounded-xl font-bold flex items-center gap-1.5 text-xs transition-all ${
              showHint
                ? 'bg-amber-400 text-slate-950 border border-amber-300 shadow-md scale-105'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 shadow-sm cursor-pointer hover:scale-105 active:scale-95'
            }`}
            title="Aim Hint (Key: H)"
          >
            <Lightbulb className="w-4 h-4" />
            <span className="hidden sm:inline">Hint</span>
            <span className="hidden sm:inline text-[9px] text-slate-400 bg-slate-700 px-1 rounded font-mono">H</span>
          </button>
        </div>

        {/* Current & Next Bubble Queue Swapper */}
        <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-1.5 rounded-2xl border border-slate-800 shadow-md">
          <div className="flex items-center gap-2">
            <div className="text-center">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-bold">Next</span>
              <div
                className="w-7 h-7 rounded-full shadow-md border-2 border-white/40 transform transition-transform"
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
              className="p-1.5 bg-slate-800 hover:bg-indigo-600 rounded-lg text-slate-300 hover:text-white transition-all transform hover:scale-110 active:scale-95 cursor-pointer shadow-sm"
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
