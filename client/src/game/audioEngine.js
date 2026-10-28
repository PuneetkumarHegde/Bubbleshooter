// Procedural High-Fidelity Web Audio & Haptic Engine for Bubble Blast Adventure
// Generates responsive, zero-latency cartoon sound effects, color-pitched chimes, and upbeat arcade BGM.

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.soundEnabled = true;
    this.musicEnabled = true;
    this.vibrationEnabled = true;
    this.sfxVolume = 0.7;
    this.musicVolume = 0.32;
    this.bgmTimer = null;
    this.isBgmPlaying = false;

    // Load persisted preferences
    try {
      const savedSound = localStorage.getItem('bba_sound_enabled');
      const savedMusic = localStorage.getItem('bba_music_enabled');
      const savedVib = localStorage.getItem('bba_vibration');
      if (savedSound !== null) this.soundEnabled = JSON.parse(savedSound);
      if (savedMusic !== null) this.musicEnabled = JSON.parse(savedMusic);
      if (savedVib !== null) this.vibrationEnabled = JSON.parse(savedVib);
    } catch (e) {}
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  triggerHaptic(pattern = [25]) {
    if (!this.vibrationEnabled) return;
    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(pattern);
      }
    } catch (e) {}
  }

  setSoundEnabled(enabled) {
    this.soundEnabled = enabled;
    try {
      localStorage.setItem('bba_sound_enabled', JSON.stringify(enabled));
    } catch (e) {}
  }

  setMusicEnabled(enabled) {
    this.musicEnabled = enabled;
    try {
      localStorage.setItem('bba_music_enabled', JSON.stringify(enabled));
    } catch (e) {}
    if (!enabled) {
      this.stopBGM();
    } else {
      this.startBGM();
    }
  }

  playClick() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(this.sfxVolume * 0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  playAim() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(520, this.ctx.currentTime + 0.04);
    gain.gain.setValueAtTime(this.sfxVolume * 0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.04);
  }

  playLaunch() {
    this.triggerHaptic([35]);
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(250, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(680, this.ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(this.sfxVolume * 0.45, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  }

  playCollision() {
    this.triggerHaptic([15]);
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(180, this.ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(this.sfxVolume * 0.35, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  // Harmonic color-pitched bubble pop sound
  playPop(pitchScale = 1.0, colorKey = null) {
    this.triggerHaptic([20]);
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    // Harmonic pentatonic pitch mapping per color
    const colorNotes = {
      red: 261.63,     // C4
      blue: 293.66,    // D4
      green: 329.63,   // E4
      yellow: 392.00,  // G4
      purple: 440.00,  // A4
      orange: 523.25,  // C5
      pink: 587.33,    // D5
      cyan: 659.25,    // E5
    };

    const baseFreq = (colorKey && colorNotes[colorKey])
      ? colorNotes[colorKey] * pitchScale
      : 480 * Math.max(0.5, Math.min(2.5, pitchScale));

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 2.2, t + 0.09);
    gain.gain.setValueAtTime(this.sfxVolume * 0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.09);
  }

  playMultiPop(count = 3, colorKey = null) {
    if (!this.soundEnabled) return;
    for (let i = 0; i < Math.min(count, 8); i++) {
      setTimeout(() => {
        this.playPop(1.0 + i * 0.12, colorKey);
      }, i * 35);
    }
  }

  playFloatingFall() {
    this.triggerHaptic([20, 20]);
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(700, t);
    osc.frequency.exponentialRampToValueAtTime(200, t + 0.18);
    gain.gain.setValueAtTime(this.sfxVolume * 0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.18);
  }

  playCombo(comboCount = 2) {
    this.triggerHaptic([30, 40]);
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const notes = [392, 440, 523, 587, 659, 783, 880, 1046];
    const noteIdx = Math.min(comboCount - 1, notes.length - 1);
    const freq = notes[Math.max(0, noteIdx)];

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, t + 0.22);
    gain.gain.setValueAtTime(this.sfxVolume * 0.55, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.22);
  }

  playBomb() {
    this.triggerHaptic([80, 50, 120]);
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    // White noise explosion with lowpass sweep
    const bufferSize = this.ctx.sampleRate * 0.4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(900, t);
    filter.frequency.exponentialRampToValueAtTime(70, t + 0.4);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(this.sfxVolume * 0.85, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    whiteNoise.start(t);
    whiteNoise.stop(t + 0.4);
  }

  playRainbow() {
    this.triggerHaptic([30, 30, 30, 40]);
    if (!this.soundEnabled) return;
    const arpeggio = [523.25, 659.25, 783.99, 1046.5];
    arpeggio.forEach((f, idx) => {
      setTimeout(() => {
        if (!this.soundEnabled || !this.ctx) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, t);
        gain.gain.setValueAtTime(this.sfxVolume * 0.4, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.15);
      }, idx * 60);
    });
  }

  playRescue() {
    this.triggerHaptic([40, 40, 80]);
    if (!this.soundEnabled) return;
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((f, idx) => {
      setTimeout(() => {
        if (!this.soundEnabled || !this.ctx) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, t);
        gain.gain.setValueAtTime(this.sfxVolume * 0.5, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.2);
      }, idx * 75);
    });
  }

  playBooster() {
    this.triggerHaptic([40]);
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.exponentialRampToValueAtTime(950, t + 0.2);
    gain.gain.setValueAtTime(this.sfxVolume * 0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  playStar(starNum = 1) {
    this.triggerHaptic([50]);
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;
    const baseFreqs = [523.25, 659.25, 783.99];
    const freq = baseFreqs[Math.min(starNum - 1, 2)];
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, t + 0.3);
    gain.gain.setValueAtTime(this.sfxVolume * 0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.3);
  }

  playLevelComplete() {
    this.triggerHaptic([60, 40, 100]);
    if (!this.soundEnabled) return;
    const fanFare = [
      { f: 523.25, d: 0.12 },
      { f: 659.25, d: 0.12 },
      { f: 783.99, d: 0.12 },
      { f: 1046.50, d: 0.4 },
    ];
    let offset = 0;
    fanFare.forEach(note => {
      setTimeout(() => {
        if (!this.soundEnabled || !this.ctx) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(note.f, t);
        gain.gain.setValueAtTime(this.sfxVolume * 0.4, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + note.d);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + note.d);
      }, offset);
      offset += note.d * 1000 + 30;
    });
  }

  playLevelFailed() {
    this.triggerHaptic([80, 80]);
    if (!this.soundEnabled) return;
    const sadNotes = [440, 392, 349, 293.66];
    let offset = 0;
    sadNotes.forEach(freq => {
      setTimeout(() => {
        if (!this.soundEnabled || !this.ctx) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(this.sfxVolume * 0.35, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.25);
      }, offset);
      offset += 220;
    });
  }

  startBGM() {
    if (!this.musicEnabled || this.isBgmPlaying) return;
    this.init();
    if (!this.ctx) return;
    this.isBgmPlaying = true;

    // Upbeat Cartoon Melodic Chords Loop
    const melody = [
      { f: 261.63, b: 130.81 },
      { f: 329.63, b: 130.81 },
      { f: 392.00, b: 130.81 },
      { f: 523.25, b: 130.81 },
      { f: 392.00, b: 146.83 },
      { f: 329.63, b: 146.83 },
      { f: 293.66, b: 146.83 },
      { f: 369.99, b: 146.83 },
      { f: 440.00, b: 164.81 },
      { f: 587.33, b: 164.81 },
      { f: 440.00, b: 164.81 },
      { f: 369.99, b: 164.81 },
      { f: 329.63, b: 174.61 },
      { f: 392.00, b: 174.61 },
      { f: 493.88, b: 174.61 },
      { f: 659.25, b: 174.61 },
    ];
    let step = 0;

    const playNextNote = () => {
      if (!this.musicEnabled || !this.isBgmPlaying || !this.ctx) return;
      const note = melody[step % melody.length];
      const t = this.ctx.currentTime;

      // Soft synth bell melody
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.f, t);

      // Low pass to keep melody silky smooth in background
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, t);

      gain.gain.setValueAtTime(this.musicVolume * 0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.28);

      // Warm bass pulse every 2 steps
      if (step % 2 === 0) {
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = 'triangle';
        bassOsc.frequency.setValueAtTime(note.b, t);
        bassGain.gain.setValueAtTime(this.musicVolume * 0.28, t);
        bassGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
        bassOsc.connect(bassGain);
        bassGain.connect(this.ctx.destination);
        bassOsc.start(t);
        bassOsc.stop(t + 0.4);
      }

      step++;
      this.bgmTimer = setTimeout(playNextNote, 280);
    };

    playNextNote();
  }

  stopBGM() {
    this.isBgmPlaying = false;
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }
}

export const soundManager = new AudioEngine();
export default soundManager;
