import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { useGameStore } from '../../store/gameStore';
import soundManager from '../../game/audioEngine';
import { ScoreManager } from '../../game/scoreManager';
import { Star, RotateCcw, ArrowRight, Grid, Sparkles, Trophy } from 'lucide-react';

export default function LevelCompleteModal({ onNextLevel, onReplay, onLevelSelect }) {
  const { level, score, shotsRemaining, bestCombo } = useGameStore();

  const finalScore = score;
  const targetStars = ScoreManager.calculateStars(finalScore, level?.starThresholds);
  const shotsUsed = Math.max(0, (level?.shots || 25) - shotsRemaining);

  const [revealedStars, setRevealedStars] = useState(0);

  useEffect(() => {
    // Blast victory confetti
    try {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'],
      });
    } catch (e) {}

    // Progressive star reveal timers with sound chimes
    const t1 = setTimeout(() => {
      setRevealedStars(1);
      soundManager.playStar(1);
    }, 350);

    let t2 = null;
    if (targetStars >= 2) {
      t2 = setTimeout(() => {
        setRevealedStars(2);
        soundManager.playStar(2);
      }, 750);
    }

    let t3 = null;
    if (targetStars >= 3) {
      t3 = setTimeout(() => {
        setRevealedStars(3);
        soundManager.playStar(3);
        try {
          confetti({
            particleCount: 60,
            spread: 100,
            origin: { y: 0.4 },
          });
        } catch (e) {}
      }, 1150);
    }

    return () => {
      clearTimeout(t1);
      if (t2) clearTimeout(t2);
      if (t3) clearTimeout(t3);
    };
  }, [targetStars]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-700/80 rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl relative overflow-hidden">
        {/* Glow behind modal */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-52 h-52 bg-amber-500/25 blur-3xl rounded-full pointer-events-none" />

        <div className="text-4xl mb-2 animate-bounce">🎉</div>
        <h2 className="text-2xl font-black uppercase tracking-wider bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent">
          Level Complete!
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">{level?.name || `Level #${level?.id}`}</p>

        {/* Animated Progressive Stars */}
        <div className="flex items-center justify-center gap-3 my-5">
          {[1, 2, 3].map((starIndex) => {
            const isRevealed = starIndex <= revealedStars;
            return (
              <div
                key={starIndex}
                className={`transform transition-all duration-300 ${
                  isRevealed
                    ? 'scale-115 text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.8)] rotate-0'
                    : 'scale-80 text-slate-700 -rotate-12 opacity-40'
                }`}
              >
                <Star className={`w-11 h-11 ${isRevealed ? 'fill-amber-400' : 'fill-slate-800'}`} />
              </div>
            );
          })}
        </div>

        {/* Final Score Details */}
        <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 mb-5 shadow-inner">
          <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Final Score</div>
          <div className="text-3xl font-black text-amber-300 tracking-wide">
            {finalScore.toLocaleString()}
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800 text-xs text-slate-300">
            <div>
              <span className="text-slate-500 block">Shots Used</span>
              <span className="font-extrabold text-slate-200">{shotsUsed} ({shotsRemaining} bonus)</span>
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
            className="w-full py-3.5 px-4 rounded-xl font-black text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 transition-transform transform active:scale-95 cursor-pointer"
          >
            <span>Next Level</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onReplay}
              className="py-2.5 px-3 rounded-xl font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Replay</span>
            </button>
            <button
              onClick={onLevelSelect}
              className="py-2.5 px-3 rounded-xl font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
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
