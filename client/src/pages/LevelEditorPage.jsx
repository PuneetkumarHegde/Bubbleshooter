import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GAME_NAME, GAME_CONSTANTS } from '../config/gameConfig';
import { useGameStore } from '../store/gameStore';
import soundManager from '../game/audioEngine';
import { Play, Download, Trash2, Plus, Sparkles, Check } from 'lucide-react';

export default function LevelEditorPage() {
  const navigate = useNavigate();
  const { setLevel } = useGameStore();

  const [rows, setRows] = useState(6);
  const [cols, setCols] = useState(8);
  const [shots, setShots] = useState(25);
  const [objectiveType, setObjectiveType] = useState('clear_all');
  const [targetVal, setTargetVal] = useState(3);
  const [selectedTool, setSelectedTool] = useState('red');

  // Initialize empty grid (rows x cols alternating)
  const [grid, setGrid] = useState(() => {
    const initial = [];
    for (let r = 0; r < 6; r++) {
      const row = [];
      const colsInRow = r % 2 === 0 ? 8 : 7;
      for (let c = 0; c < colsInRow; c++) {
        row.push(r < 3 ? 'blue' : null);
      }
      initial.push(row);
    }
    return initial;
  });

  const tools = [
    { key: 'red', label: 'Red', color: '#ef4444' },
    { key: 'blue', label: 'Blue', color: '#3b82f6' },
    { key: 'green', label: 'Green', color: '#10b981' },
    { key: 'yellow', label: 'Yellow', color: '#f59e0b' },
    { key: 'purple', label: 'Purple', color: '#8b5cf6' },
    { key: 'orange', label: 'Orange', color: '#f97316' },
    { key: 'bomb', label: 'Bomb', icon: '💣' },
    { key: 'rainbow', label: 'Rainbow', icon: '🌈' },
    { key: 'rescue', label: 'Rescue', icon: '⭐' },
    { key: 'target', label: 'Target', icon: '🎯' },
    { key: 'empty', label: 'Erase', icon: '✖' },
  ];

  const handleCellClick = (r, c) => {
    soundManager.playPop(1.5);
    setGrid((prev) => {
      const next = prev.map((row) => [...row]);
      next[r][c] = selectedTool === 'empty' ? null : selectedTool;
      return next;
    });
  };

  const handleTestLevel = () => {
    soundManager.playClick();
    const board = grid.map((row, r) => {
      return row.map((cell, c) => {
        if (!cell) return null;
        const isRescue = cell === 'rescue';
        const isTarget = cell === 'target';
        const special = cell === 'bomb' ? 'bomb' : cell === 'rainbow' ? 'rainbow' : null;
        const color = isRescue ? 'yellow' : isTarget ? 'purple' : special ? 'red' : cell;
        return {
          row: r,
          col: c,
          color,
          isRescue,
          isTarget,
          special,
        };
      }).filter(Boolean);
    });

    const customLevel = {
      id: 'custom-sandbox',
      name: 'Custom Sandbox Level',
      difficulty: 'expert',
      objective: {
        type: objectiveType,
        target: targetVal,
        label: objectiveType === 'rescue' ? `Rescue ${targetVal} Sprites` :
               objectiveType === 'drop_targets' ? `Drop ${targetVal} Targets` : 'Clear all bubbles',
      },
      shots,
      colors: ['red', 'blue', 'green', 'yellow', 'purple', 'orange'],
      board,
      targetScore: 2500,
      starThresholds: [1000, 1800, 2500],
      availableBoosters: ['bomb', 'rainbow', 'aimGuide', 'extraShot', 'shuffle'],
    };

    setLevel(customLevel);
    navigate('/game/custom-sandbox');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 max-w-5xl mx-auto">
      {/* Title */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Advanced Bonus Feature</span>
        </div>
        <h1 className="text-3xl font-black bg-gradient-to-r from-amber-300 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
          {GAME_NAME} — Visual Level Editor
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Paint custom hexagonal formations, place bombs & rescue sprites, and test play immediately!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Toolbox & Controls */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-5">
          <div>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
              Select Palette Element
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {tools.map((t) => (
                <button
                  key={t.key}
                  onClick={() => {
                    setSelectedTool(t.key);
                    soundManager.playClick();
                  }}
                  className={`p-2.5 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                    selectedTool === t.key
                      ? 'bg-indigo-600 text-white ring-2 ring-indigo-400 scale-105 shadow-md'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                  }`}
                >
                  {t.color ? (
                    <div className="w-5 h-5 rounded-full shadow-inner" style={{ backgroundColor: t.color }} />
                  ) : (
                    <span className="text-lg">{t.icon}</span>
                  )}
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-slate-800 text-xs">
            <div>
              <label className="font-bold text-slate-300 block mb-1">Max Shots: {shots}</label>
              <input
                type="range"
                min="10"
                max="45"
                value={shots}
                onChange={(e) => setShots(parseInt(e.target.value, 10))}
                className="w-full accent-indigo-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">Objective Type</label>
              <select
                value={objectiveType}
                onChange={(e) => setObjectiveType(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-slate-200"
              >
                <option value="clear_all">Clear All Bubbles</option>
                <option value="rescue">Rescue Star Sprites</option>
                <option value="drop_targets">Drop Target Orbs</option>
              </select>
            </div>

            {objectiveType !== 'clear_all' && (
              <div>
                <label className="font-bold text-slate-300 block mb-1">Target Count: {targetVal}</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={targetVal}
                  onChange={(e) => setTargetVal(parseInt(e.target.value, 10) || 1)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-slate-200"
                />
              </div>
            )}
          </div>

          <div className="pt-2">
            <button
              onClick={handleTestLevel}
              className="w-full py-3 px-4 rounded-xl font-black text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer transition-transform transform active:scale-95"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>TEST PLAY CUSTOM LEVEL</span>
            </button>
          </div>
        </div>

        {/* Visual Hex Canvas Grid Area */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 flex flex-col items-center justify-center">
          <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-4">
            Click Any Hex Cell to Paint with Selected Tool ({selectedTool.toUpperCase()})
          </div>

          <div className="flex flex-col gap-1.5 p-4 bg-slate-950 rounded-2xl border border-slate-800 shadow-inner">
            {grid.map((row, r) => (
              <div
                key={r}
                className={`flex gap-1.5 ${r % 2 !== 0 ? 'ml-5' : ''}`}
              >
                {row.map((cell, c) => (
                  <button
                    key={c}
                    onClick={() => handleCellClick(r, c)}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-slate-700/80 flex items-center justify-center text-sm shadow-md transition-transform transform hover:scale-110 active:scale-95"
                    style={{
                      backgroundColor: cell === 'red' ? '#ef4444' :
                        cell === 'blue' ? '#3b82f6' :
                        cell === 'green' ? '#10b981' :
                        cell === 'yellow' ? '#f59e0b' :
                        cell === 'purple' ? '#8b5cf6' :
                        cell === 'orange' ? '#f97316' : '#1e293b'
                    }}
                  >
                    {cell === 'bomb' ? '💣' : cell === 'rainbow' ? '🌈' : cell === 'rescue' ? '⭐' : cell === 'target' ? '🎯' : ''}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
