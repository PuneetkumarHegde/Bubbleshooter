import React from 'react';
import { useGameStore, GAME_STATUS } from '../../store/gameStore';
import soundManager from '../../game/audioEngine';

export default function BoosterBar() {
  const { boosterInventory, activeBooster, activateBooster, gameStatus } = useGameStore();

  const boosters = [
    { type: 'bomb', label: 'Bomb', icon: '💣', keyNum: '1', count: boosterInventory.bomb || 0, desc: 'Pops radius of 7 bubbles' },
    { type: 'rainbow', label: 'Rainbow', icon: '🌈', keyNum: '2', count: boosterInventory.rainbow || 0, desc: 'Matches any color' },
    { type: 'aimGuide', label: 'Aim Guide', icon: '🎯', keyNum: '3', count: boosterInventory.aimGuide || 0, desc: 'Extended bank bounce preview' },
    { type: 'extraShot', label: '+5 Shots', icon: '➕', keyNum: '4', count: boosterInventory.extraShot || 0, desc: 'Add 5 shots instantly' },
    { type: 'shuffle', label: 'Shuffle', icon: '🔀', keyNum: '5', count: boosterInventory.shuffle || 0, desc: 'Scramble bubble colors' },
  ];

  const handleBoosterClick = (type) => {
    if (gameStatus !== GAME_STATUS.READY && gameStatus !== GAME_STATUS.AIMING) return;
    const ok = activateBooster(type);
    if (ok) {
      soundManager.playBooster();
    }
  };

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3 py-2 px-3 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 shadow-lg">
      {boosters.map((b) => {
        const isActive = activeBooster === b.type;
        const isDisabled = b.count <= 0;
        return (
          <button
            key={b.type}
            onClick={() => handleBoosterClick(b.type)}
            disabled={isDisabled}
            title={`${b.label} (Key: ${b.keyNum}): ${b.desc}`}
            className={`relative flex flex-col items-center justify-center w-12 h-14 sm:w-14 sm:h-16 rounded-xl font-bold transition-all transform active:scale-95 cursor-pointer ${
              isActive
                ? 'bg-gradient-to-b from-amber-500 to-orange-600 text-white ring-2 ring-amber-300 scale-105 shadow-lg shadow-orange-500/40'
                : isDisabled
                ? 'bg-slate-800/40 text-slate-500 border border-slate-700/40 cursor-not-allowed opacity-50'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-500 shadow-sm'
            }`}
          >
            <span className="text-xl sm:text-2xl">{b.icon}</span>
            <span className="text-[10px] sm:text-xs font-semibold">{b.label}</span>
            {/* Quantity Badge */}
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-indigo-600 text-[10px] text-white flex items-center justify-center font-extrabold border border-slate-900 shadow">
              {b.count}
            </span>
            {/* Hotkey Tag */}
            <span className="hidden sm:block absolute -bottom-1 text-[8px] font-mono text-slate-400 bg-slate-900/90 px-1 rounded border border-slate-700/80">
              {b.keyNum}
            </span>
          </button>
        );
      })}
    </div>
  );
}
