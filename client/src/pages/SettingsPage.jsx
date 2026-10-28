import React from 'react';
import { GAME_NAME } from '../config/gameConfig';
import { useSettingsStore } from '../store/settingsStore';
import soundManager from '../game/audioEngine';
import { Volume2, VolumeX, Music, Smartphone, Eye, Sparkles, Check } from 'lucide-react';

export default function SettingsPage() {
  const {
    soundEnabled,
    musicEnabled,
    vibrationEnabled,
    reducedMotion,
    toggleSound,
    toggleMusic,
    toggleVibration,
    toggleReducedMotion,
  } = useSettingsStore();

  const handleTestSfx = (type) => {
    switch (type) {
      case 'pop': soundManager.playPop(1.2); break;
      case 'combo': soundManager.playCombo(4); break;
      case 'bomb': soundManager.playBomb(); break;
      case 'rainbow': soundManager.playRainbow(); break;
      case 'star': soundManager.playStar(3); break;
      case 'complete': soundManager.playLevelComplete(); break;
      default: soundManager.playClick(); break;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      <div className="text-center max-w-xl mx-auto mb-8">
        <h1 className="text-3xl font-black bg-gradient-to-r from-amber-300 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
          {GAME_NAME} Settings
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Customize audio, graphics, controls, and gameplay preferences.
        </p>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        {/* Audio Controls */}
        <div>
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span>🔊</span>
            <span>Audio & Sound Preferences</span>
          </h3>

          <div className="space-y-4">
            {/* Sound Effects Toggle */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${soundEnabled ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-500'}`}>
                  {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-100">Sound Effects (SFX)</h4>
                  <p className="text-xs text-slate-400">Pops, bounces, explosions, combos, and victory fanfares</p>
                </div>
              </div>
              <button
                onClick={toggleSound}
                className={`w-14 h-8 rounded-full transition-colors relative p-1 cursor-pointer ${
                  soundEnabled ? 'bg-indigo-600' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                    soundEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Background Music Toggle */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${musicEnabled ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-800 text-slate-500'}`}>
                  <Music className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-100">Background Music (BGM)</h4>
                  <p className="text-xs text-slate-400">Playful upbeat synthesized cartoon arcade theme</p>
                </div>
              </div>
              <button
                onClick={toggleMusic}
                className={`w-14 h-8 rounded-full transition-colors relative p-1 cursor-pointer ${
                  musicEnabled ? 'bg-indigo-600' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                    musicEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Live Audio Test Buttons */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-xs font-bold text-slate-400 block mb-2">Live SFX Test Palette:</span>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Pop Bubble', type: 'pop' },
                  { label: 'Combo x4', type: 'combo' },
                  { label: 'Bomb Blast', type: 'bomb' },
                  { label: 'Rainbow', type: 'rainbow' },
                  { label: 'Star Award', type: 'star' },
                  { label: 'Fanfare', type: 'complete' },
                ].map((b) => (
                  <button
                    key={b.type}
                    onClick={() => handleTestSfx(b.type)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Accessibility & Device Options */}
        <div className="pt-4 border-t border-slate-800">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span>⚙️</span>
            <span>Accessibility & Controls</span>
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-slate-800 text-slate-400">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-100">Haptic Feedback / Vibration</h4>
                  <p className="text-xs text-slate-400">Vibrate on bubble pops and explosions on mobile</p>
                </div>
              </div>
              <button
                onClick={toggleVibration}
                className={`w-14 h-8 rounded-full transition-colors relative p-1 cursor-pointer ${
                  vibrationEnabled ? 'bg-indigo-600' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                    vibrationEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-slate-800 text-slate-400">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-100">Reduced Motion Mode</h4>
                  <p className="text-xs text-slate-400">Disable floating particle bursts and camera shakes</p>
                </div>
              </div>
              <button
                onClick={toggleReducedMotion}
                className={`w-14 h-8 rounded-full transition-colors relative p-1 cursor-pointer ${
                  reducedMotion ? 'bg-indigo-600' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                    reducedMotion ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

