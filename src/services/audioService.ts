/**
 * Web Audio API Procedural Sound Engine
 * Section 73: Fully self-contained procedural synthesizer with zero external asset dependencies.
 */

class AudioService {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private sfxVolume: number = 0.7;
  private bgmVolume: number = 0.4;
  private bgmOscillator: OscillatorNode | null = null;
  private bgmInterval: any = null;
  private isBgmPlaying: boolean = false;

  constructor() {
    // Load persisted preferences
    try {
      const savedMute = localStorage.getItem("odyssey_audio_muted");
      if (savedMute !== null) this.isMuted = savedMute === "true";
      const savedSfx = localStorage.getItem("odyssey_audio_sfx");
      if (savedSfx !== null) this.sfxVolume = parseFloat(savedSfx);
      const savedBgm = localStorage.getItem("odyssey_audio_bgm");
      if (savedBgm !== null) this.bgmVolume = parseFloat(savedBgm);
    } catch (e) {
      // Ignore
    }
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    try {
      localStorage.setItem("odyssey_audio_muted", String(muted));
    } catch (e) {}
    if (muted && this.isBgmPlaying) {
      this.stopBGM();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setSfxVolume(vol: number) {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
    try {
      localStorage.setItem("odyssey_audio_sfx", String(this.sfxVolume));
    } catch (e) {}
  }

  public getSfxVolume(): number {
    return this.sfxVolume;
  }

  public setBgmVolume(vol: number) {
    this.bgmVolume = Math.max(0, Math.min(1, vol));
    try {
      localStorage.setItem("odyssey_audio_bgm", String(this.bgmVolume));
    } catch (e) {}
  }

  public getBgmVolume(): number {
    return this.bgmVolume;
  }

  // --- Sound Effects ---

  public playLaser(pitch: number = 880) {
    if (this.isMuted || this.sfxVolume <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(pitch, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.15 * this.sfxVolume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  }

  public playEnemyLaser() {
    if (this.isMuted || this.sfxVolume <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(450, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.12 * this.sfxVolume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  public playExplosion(large: boolean = false) {
    if (this.isMuted || this.sfxVolume <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    const dur = large ? 0.6 : 0.25;
    const bufferSize = Math.floor(this.ctx.sampleRate * dur);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(large ? 400 : 800, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + dur);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime((large ? 0.4 : 0.25) * this.sfxVolume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    whiteNoise.start();
  }

  public playPickup() {
    if (this.isMuted || this.sfxVolume <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(523.25, this.ctx.currentTime); // C5
    osc.frequency.setValueAtTime(659.25, this.ctx.currentTime + 0.06); // E5
    osc.frequency.setValueAtTime(783.99, this.ctx.currentTime + 0.12); // G5
    osc.frequency.setValueAtTime(1046.5, this.ctx.currentTime + 0.18); // C6

    gain.gain.setValueAtTime(0.18 * this.sfxVolume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.35);
  }

  public playShield() {
    if (this.isMuted || this.sfxVolume <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(200, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.2);

    gain.gain.setValueAtTime(0.25 * this.sfxVolume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.4);
  }

  public playBossAlarm() {
    if (this.isMuted || this.sfxVolume <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    for (let i = 0; i < 3; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(300, now + i * 0.25);
      osc.frequency.linearRampToValueAtTime(550, now + i * 0.25 + 0.18);

      gain.gain.setValueAtTime(0.22 * this.sfxVolume, now + i * 0.25);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.25 + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + i * 0.25);
      osc.stop(now + i * 0.25 + 0.22);
    }
  }

  public playVictory() {
    if (this.isMuted || this.sfxVolume <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [440, 554.37, 659.25, 880]; // A major fanfare
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + idx * 0.12);

      gain.gain.setValueAtTime(0.2 * this.sfxVolume, this.ctx!.currentTime + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + idx * 0.12 + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(this.ctx!.currentTime + idx * 0.12);
      osc.stop(this.ctx!.currentTime + idx * 0.12 + 0.4);
    });
  }

  public playDefeat() {
    if (this.isMuted || this.sfxVolume <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [300, 260, 220, 160];
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + idx * 0.15);

      gain.gain.setValueAtTime(0.18 * this.sfxVolume, this.ctx!.currentTime + idx * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + idx * 0.15 + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(this.ctx!.currentTime + idx * 0.15);
      osc.stop(this.ctx!.currentTime + idx * 0.15 + 0.35);
    });
  }

  public playClick() {
    if (this.isMuted || this.sfxVolume <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.08 * this.sfxVolume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.04);
  }

  // --- Background Synth Loop ---
  public startBGM() {
    if (this.isMuted || this.bgmVolume <= 0 || this.isBgmPlaying) return;
    this.initContext();
    if (!this.ctx) return;

    this.isBgmPlaying = true;
    const chords = [
      [110, 164.81, 220], // A minor
      [98, 146.83, 196],  // G
      [87.31, 130.81, 174.61], // F
      [82.41, 123.47, 164.81], // E
    ];
    let chordIdx = 0;

    this.bgmInterval = setInterval(() => {
      if (!this.isBgmPlaying || this.isMuted || !this.ctx) return;

      const chord = chords[chordIdx % chords.length];
      chordIdx++;

      chord.forEach((freq) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq * 1.5, this.ctx!.currentTime);

        const dur = 1.8;
        gain.gain.setValueAtTime(0.02 * this.bgmVolume, this.ctx!.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0005, this.ctx!.currentTime + dur);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start();
        osc.stop(this.ctx!.currentTime + dur);
      });
    }, 1800);
  }

  public stopBGM() {
    this.isBgmPlaying = false;
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }
}

export const audio = new AudioService();
