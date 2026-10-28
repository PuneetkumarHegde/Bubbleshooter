// Procedural High-Fidelity Web Audio Engine for Bubble Blast Adventure
// Generates responsive, zero-latency cartoon sound effects and upbeat arcade BGM.

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.soundEnabled = true;
    this.musicEnabled = true;
    this.sfxVolume = 0.7;
    this.musicVolume = 0.35;
    this.bgmTimer = null;
    this.isBgmPlaying = false;

    // Load persisted preferences
    try {
      const savedSound = localStorage.getItem('bba_sound_enabled');
      const savedMusic = localStorage.getItem('bba_music_enabled');
      if (savedSound !== null) this.soundEnabled = JSON.parse(savedSound);
      if (savedMusic !== null) this.musicEnabled = JSON.parse(savedMusic);
    } catch (e) {
      // fallback to defaults
    }
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
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(250, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(650, this.ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(this.sfxVolume * 0.45, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  }

  playCollision() {
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

  playPop(pitchScale = 1.0) {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    const baseFreq = 480 * Math.max(0.5, Math.min(2.5, pitchScale));
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 2.2, t + 0.09);
    gain.gain.setValueAtTime(this.sfxVolume * 0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.09);
  }

  playMultiPop(count = 3) {
    if (!this.soundEnabled) return;
    for (let i = 0; i < Math.min(count, 8); i++) {
      setTimeout(() => {
        this.playPop(1.0 + i * 0.15);
      }, i * 35);
    }
  }

  playFloatingFall() {
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
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    // White noise explosion
    const bufferSize = this.ctx.sampleRate * 0.35;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, t);
    filter.frequency.exponentialRampToValueAtTime(80, t + 0.35);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(this.sfxVolume * 0.8, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    whiteNoise.start(t);
    whiteNoise.stop(t + 0.35);
  }

  playRainbow() {
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
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.exponentialRampToValueAtTime(900, t + 0.2);
    gain.gain.setValueAtTime(this.sfxVolume * 0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  playStar(starNum = 1) {
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

  playHighScore() {
    this.playLevelComplete();
    setTimeout(() => {
      this.playRainbow();
    }, 600);
  }

  startBGM() {
    if (!this.musicEnabled || this.isBgmPlaying) return;
    this.init();
    if (!this.ctx) return;
    this.isBgmPlaying = true;

    // Upbeat Cartoon Melodic Loop
    const melody = [
      261.63, 329.63, 392.00, 523.25, 392.00, 329.63,
      293.66, 369.99, 440.00, 587.33, 440.00, 369.99,
      329.63, 392.00, 493.88, 659.25, 493.88, 392.00,
      261.63, 329.63, 392.00, 523.25, 659.25, 523.25,
    ];
    let step = 0;

    const playNextNote = () => {
      if (!this.musicEnabled || !this.isBgmPlaying || !this.ctx) return;
      const freq = melody[step % melody.length];
      const t = this.ctx.currentTime;

      // Soft synth bell
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      // Low pass to keep music cozy and in background
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, t);

      gain.gain.setValueAtTime(this.musicVolume * 0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.28);

      step++;
      this.bgmTimer = setTimeout(playNextNote, 300);
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
