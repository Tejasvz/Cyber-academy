import { usePreferences } from '../store/preferencesStore';

/** One cinematic mix: filtered mechanical transients, low resonances, no arcade arpeggios. */
class SoundManager {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private effects: GainNode | null = null;
  private ambient: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private last = new Map<string, number>();
  private tension = false;
  get muted() { return usePreferences.getState().muted; }
  set muted(value: boolean) { usePreferences.getState().update({ muted: value }); this.sync(); }

  initialize = () => {
    if (typeof window === 'undefined' || !window.AudioContext) return;
    if (!this.ctx) {
      this.ctx = new AudioContext();
      const ctx = this.ctx;
      const limiter = ctx.createDynamicsCompressor();
      limiter.threshold.value = -18; limiter.knee.value = 12; limiter.ratio.value = 8;
      limiter.attack.value = .003; limiter.release.value = .25;
      this.master = ctx.createGain(); this.master.connect(limiter); limiter.connect(ctx.destination);
      this.effects = ctx.createGain(); this.effects.connect(this.master);
      this.ambient = ctx.createGain(); this.ambient.connect(this.master);
      this.noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const samples = this.noise.getChannelData(0);
      let brown = 0;
      for (let i = 0; i < samples.length; i++) { brown = (brown + (Math.random() * 2 - 1) * .025) / 1.025; samples[i] = brown * 3.5; }
      // A quiet, slightly beating reactor bed. The ambience bus never receives UI effects.
      for (const frequency of [48, 48.35, 96.1]) {
        const osc = ctx.createOscillator(); const gain = ctx.createGain();
        osc.frequency.value = frequency; gain.gain.value = .018;
        osc.connect(gain); gain.connect(this.ambient); osc.start();
      }
    }
    this.sync();
    if (!document.hidden && this.ctx.state === 'suspended') void this.ctx.resume().catch(() => {});
  };
  sync = () => {
    if (!this.ctx || !this.master || !this.effects || !this.ambient) return;
    const p = usePreferences.getState(), now = this.ctx.currentTime;
    this.master.gain.setTargetAtTime(p.muted ? 0 : p.master, now, .04);
    this.effects.gain.setTargetAtTime(p.synth ? p.effectsVolume : 0, now, .04);
    this.ambient.gain.setTargetAtTime(p.ambient ? p.ambientVolume * (this.tension ? 1.5 : 1) : 0, now, .5);
  };
  visibility = () => {
    if (!this.ctx) return;
    if (document.hidden) void this.ctx.suspend().catch(() => {});
    else void this.ctx.resume().catch(() => {});
  };
  setThreat = (level: string) => { this.tension = level !== 'exploration'; this.sync(); };
  private cue(name: string, cooldown = 100) {
    const prefs = usePreferences.getState();
    if (prefs.muted || !prefs.synth || document.hidden) return false;
    this.initialize();
    const now = performance.now();
    if (now - (this.last.get(name) ?? -Infinity) < cooldown) return false;
    this.last.set(name, now); return Boolean(this.ctx && this.effects);
  }
  private tone(frequency: number, duration: number, volume: number, delay = 0, endFrequency = frequency) {
    const ctx = this.ctx!; const osc = ctx.createOscillator(); const gain = ctx.createGain();
    const now = ctx.currentTime + delay;
    osc.type = 'sine'; osc.frequency.setValueAtTime(frequency, now);
    osc.frequency.exponentialRampToValueAtTime(endFrequency, now + duration);
    gain.gain.setValueAtTime(0, now); gain.gain.linearRampToValueAtTime(volume, now + Math.min(.025, duration / 4));
    gain.gain.exponentialRampToValueAtTime(.0001, now + duration);
    osc.connect(gain); gain.connect(this.effects!);
    osc.onended = () => { osc.disconnect(); gain.disconnect(); };
    osc.start(now); osc.stop(now + duration + .02);
  }
  private texture(duration: number, volume: number, frequency: number) {
    const ctx = this.ctx!, now = ctx.currentTime;
    const source = ctx.createBufferSource(), filter = ctx.createBiquadFilter(), gain = ctx.createGain();
    source.buffer = this.noise; filter.type = 'bandpass'; filter.frequency.value = frequency; filter.Q.value = .7;
    gain.gain.setValueAtTime(0, now); gain.gain.linearRampToValueAtTime(volume, now + .008);
    gain.gain.exponentialRampToValueAtTime(.0001, now + duration);
    source.connect(filter); filter.connect(gain); gain.connect(this.effects!);
    source.onended = () => { source.disconnect(); filter.disconnect(); gain.disconnect(); };
    source.start(now); source.stop(now + duration + .02);
  }
  playClick = () => { if (this.cue('click', 90)) { this.texture(.055, .2, 950); this.tone(145, .07, .09, 0, 105); } };
  playKeypress = () => { if (this.cue('key', 45)) this.texture(.035, .12, 1300); };
  playDiagnosticScan = () => { if (this.cue('scan', 800)) { this.texture(.85, .16, 580); this.tone(84, .8, .08, 0, 110); } };
  playAureliaPulse = () => { if (this.cue('link', 450)) { this.tone(174, .5, .08); this.tone(261, .6, .035, .07); } };
  playWarning = () => { if (this.cue('warning', 450)) { this.tone(95, .3, .14, 0, 72); this.texture(.23, .19, 320); } };
  playDeploy = () => { if (this.cue('deploy', 700)) { this.texture(1.1, .28, 440); this.tone(70, 1.3, .15, .1, 42); } };
  playSuccess = () => { if (this.cue('success', 900)) { this.texture(.5, .1, 750); [130.81, 155.56, 196].forEach(f => this.tone(f, 1.6, .065)); } };
}
export const sound = new SoundManager();
