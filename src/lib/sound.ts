export type SfxName =
  | "pop"
  | "sparkle"
  | "click"
  | "heartbeat"
  | "envelope"
  | "celebrate"
  | "whoosh"
  | "blow"
  | "soft";

const NOTES = [523.25, 587.33, 659.25, 783.99, 880, 698.46, 987.77];

class SoundManager {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicTimer: ReturnType<typeof setInterval> | null = null;
  private phrase = 0;
  unlocked = false;
  muted = false;
  musicOn = false;

  async unlock() {
    if (this.unlocked) return;
    const Ctx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    this.ctx = new Ctx();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.72;
    this.master.connect(this.ctx.destination);

    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = 0;
    this.musicGain.connect(this.master);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.value = 0.9;
    this.sfxGain.connect(this.master);

    this.unlocked = true;
    if (this.ctx.state === "suspended") await this.ctx.resume();
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (!this.master || !this.ctx) return;
    this.master.gain.cancelScheduledValues(this.ctx.currentTime);
    this.master.gain.linearRampToValueAtTime(muted ? 0 : 0.72, this.ctx.currentTime + 0.16);
  }

  async setMusic(on: boolean) {
    this.musicOn = on;
    if (!this.unlocked) await this.unlock();
    if (!this.musicGain || !this.ctx) return;
    this.musicGain.gain.cancelScheduledValues(this.ctx.currentTime);
    this.musicGain.gain.linearRampToValueAtTime(on ? 0.16 : 0, this.ctx.currentTime + 0.5);
    if (on) this.startLoop();
    else this.stopLoop();
  }

  play(name: SfxName) {
    if (!this.unlocked || this.muted || !this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    switch (name) {
      case "click":
        this.tone(880, t, 0.07, "sine", 0.08);
        break;
      case "soft":
        this.tone(698.46, t, 0.12, "sine", 0.05);
        break;
      case "sparkle":
        this.tone(1318.5, t, 0.12, "triangle", 0.06);
        this.tone(1760, t + 0.05, 0.1, "sine", 0.04);
        break;
      case "pop":
        this.noise(t, 0.08, 0.12);
        this.tone(420, t, 0.09, "sine", 0.1);
        break;
      case "heartbeat":
        this.tone(140, t, 0.09, "sine", 0.18);
        this.tone(120, t + 0.16, 0.12, "sine", 0.14);
        break;
      case "envelope":
        this.noise(t, 0.16, 0.05);
        this.tone(392, t + 0.04, 0.22, "triangle", 0.07);
        break;
      case "whoosh":
        this.noise(t, 0.18, 0.04);
        this.tone(523.25, t, 0.18, "sine", 0.05);
        break;
      case "blow":
        this.noise(t, 0.28, 0.08);
        this.tone(196, t, 0.2, "sine", 0.06);
        break;
      case "celebrate":
        [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
          this.tone(f, t + i * 0.09, 0.22, "triangle", 0.09);
        });
        break;
    }
  }

  private startLoop() {
    if (this.musicTimer || !this.ctx || !this.musicGain) return;
    this.playPhrase();
    this.musicTimer = setInterval(() => this.playPhrase(), 2400);
  }

  private stopLoop() {
    if (this.musicTimer) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }

  private playPhrase() {
    if (!this.ctx || !this.musicGain || this.muted || !this.musicOn) return;
    const t = this.ctx.currentTime;
    const root = this.phrase % 2 === 0 ? 0 : 2;
    const pattern = [0, 2, 4, 2, 3, 1, 4, 0];
    pattern.forEach((step, i) => {
      const freq = NOTES[(root + step) % NOTES.length];
      this.musicNote(freq, t + i * 0.28, 0.55);
    });
    this.pad(this.phrase % 2 === 0 ? 261.63 : 220, t, 2.2);
    this.phrase += 1;
  }

  private musicNote(freq: number, time: number, dur: number) {
    if (!this.ctx || !this.musicGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.045, time + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
    osc.connect(gain);
    gain.connect(this.musicGain);
    osc.start(time);
    osc.stop(time + dur + 0.02);
  }

  private pad(freq: number, time: number, dur: number) {
    if (!this.ctx || !this.musicGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "triangle";
    osc.frequency.value = freq / 2;
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.03, time + 0.4);
    gain.gain.linearRampToValueAtTime(0.001, time + dur);
    osc.connect(gain);
    gain.connect(this.musicGain);
    osc.start(time);
    osc.stop(time + dur + 0.02);
  }

  private tone(
    freq: number,
    time: number,
    dur: number,
    type: OscillatorType,
    volume: number,
  ) {
    if (!this.ctx || !this.sfxGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(volume, time + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(time);
    osc.stop(time + dur + 0.02);
  }

  private noise(time: number, dur: number, volume: number) {
    if (!this.ctx || !this.sfxGain) return;
    const length = Math.floor(this.ctx.sampleRate * dur);
    const buffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
    const src = this.ctx.createBufferSource();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();
    filter.type = "highpass";
    filter.frequency.value = 700;
    src.buffer = buffer;
    gain.gain.setValueAtTime(volume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    src.start(time);
  }
}

export const sound = new SoundManager();
