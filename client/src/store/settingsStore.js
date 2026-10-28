// Settings Store with Web Audio sync
import { create } from 'zustand';
import soundManager from '../game/audioEngine';

export const useSettingsStore = create((set, get) => ({
  soundEnabled: soundManager.soundEnabled,
  musicEnabled: soundManager.musicEnabled,
  vibrationEnabled: true,
  reducedMotion: false,

  toggleSound: () => {
    const next = !get().soundEnabled;
    soundManager.setSoundEnabled(next);
    if (next) soundManager.playClick();
    set({ soundEnabled: next });
  },

  toggleMusic: () => {
    const next = !get().musicEnabled;
    soundManager.setMusicEnabled(next);
    set({ musicEnabled: next });
  },

  toggleVibration: () => {
    const next = !get().vibrationEnabled;
    try {
      localStorage.setItem('bba_vibration', JSON.stringify(next));
    } catch (e) {}
    set({ vibrationEnabled: next });
  },

  toggleReducedMotion: () => {
    const next = !get().reducedMotion;
    try {
      localStorage.setItem('bba_reduced_motion', JSON.stringify(next));
    } catch (e) {}
    set({ reducedMotion: next });
  },
}));

