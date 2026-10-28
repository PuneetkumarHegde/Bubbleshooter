import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useGameStore } from '../../store/gameStore';
import soundManager from '../../game/audioEngine';
import { ScoreManager } from '../../game/scoreManager';
import { Star, Trophy, RotateCcw, ArrowRight, Grid } from 'lucide-react';

export default function LevelCompleteModal({ onNextLevel, onReplay, onLevelSelect }) {
  const { level, score, shotsRemaining, bestCombo, bubblesPoppedTotal, rescuedTotal } = useGameStore();

  const finalScore = score;
  const starsEarned = ScoreManager.calculateStars(finalScore, level?.starThresholds);
  const shotsUsed = Math.max(0, (level?.shots || 25) - shotsRemaining);

  useEffect(() => {
    // Blast victory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'],
      });
    } catch (e) {}
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-700/80 rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl relative overflow-hidden">
        {/* Glow behind modal */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/20 blur-3xl rounded-full pointer-events-none" />

        <div className="text-4xl mb-2">🎉</div>
        <h2 className="text-2xl font-black uppercase tracking-wider bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent">
          Level Complete!
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">{level?.name || `Level #${level?.id}`}</p>

        {/* Animated Stars */}
        <div className="flex items-center justify-center gap-3 my-5">
          {[1, 2, 3].map((starIndex) => {
            const hasStar = starIndex <= starsEarned;
            return (
              <div
                key={starIndex}
                className={`transform transition-all duration-500 ${
                  hasStar ? 'scale-110 text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]' : 'scale-90 text-slate-700'
                }`}
              >
                <Star className={`w-10 h-10 ${hasStar ? 'fill-amber-400' : 'fill-slate-800'}`} />
              </div>
            );
          })}
        </div>

        {/* Final Score */}
        <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 mb-5">
          <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Final Score</div>
          <div className="text-3xl font-black text-amber-300 tracking-wide">
            {finalScore.toLocaleString()}
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800 text-xs text-slate-300">
            <div>
              <span className="text-slate-500 block">Shots Used</span>
              <span className="font-extrabold text-slate-200">{shotsUsed} ({shotsRemaining} left)</span>
            </div>
            <div>
              <span className="text-slate-500 block">Best Combo</span>
              <span className="font-extrabold text-rose-400">x{bestCombo || 1}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={onNextLevel}
            className="w-full py-3.5 px-4 rounded-xl font-black text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 transition-transform transform active:scale-95"
          >
            <span>Next Level</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onReplay}
              className="py-2.5 px-3 rounded-xl font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Replay</span>
            </button>
            <button
              onClick={onLevelSelect}
              className="py-2.5 px-3 rounded-xl font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Grid className="w-4 h-4" />
              <span>Levels</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
