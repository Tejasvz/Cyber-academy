import { create } from 'zustand';

interface AudioStore {
  isInitialized: boolean;
  isMuted: boolean;
  volume: number; // 0 to 1
  filterFreq: number; // Hz

  // Core Audio Nodes (kept outside React state to avoid re-renders)
  audioCtx: AudioContext | null;
  masterGain: GainNode | null;
  ambientGain: GainNode | null;
  filterNode: BiquadFilterNode | null;

  // Actions
  initializeAudio: () => void;
  playUiClick: () => void;
  playSuccessChime: () => void;
  playFailureSweep: () => void;
  setFilterFrequency: (freq: number, rampDuration?: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
}

// Keep references to osc nodes for disposal
let ambientOsc1: OscillatorNode | null = null;
let ambientOsc2: OscillatorNode | null = null;
let lfoNode: OscillatorNode | null = null;

export const useAudioStore = create<AudioStore>((set, get) => ({
  isInitialized: false,
  isMuted: false,
  volume: 0.7,
  filterFreq: 800,
  audioCtx: null,
  masterGain: null,
  ambientGain: null,
  filterNode: null,

  initializeAudio: () => {
    if (get().isInitialized) return;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      
      // 1. Create Nodes
      const masterGain = ctx.createGain();
      masterGain.gain.value = get().volume;
      masterGain.connect(ctx.destination);

      // Biquad filter for sweeping sci-fi muffled/distorted states
      const filterNode = ctx.createBiquadFilter();
      filterNode.type = 'lowpass';
      filterNode.frequency.value = get().filterFreq;
      filterNode.Q.value = 1.0;
      filterNode.connect(masterGain);

      const ambientGain = ctx.createGain();
      ambientGain.gain.value = 0.25; // Keep background hum subtle
      ambientGain.connect(filterNode);

      // 2. Synthesize Procedural Ambient Reactor Hum (Aether Core background)
      // Osc 1: Deep sub-harmonic sine
      ambientOsc1 = ctx.createOscillator();
      ambientOsc1.type = 'sine';
      ambientOsc1.frequency.value = 55; // A1 note

      // Osc 2: Triangle for mechanical texture
      ambientOsc2 = ctx.createOscillator();
      ambientOsc2.type = 'triangle';
      ambientOsc2.frequency.value = 110; // A2 octave

      // LFO filter sweep (modulates local lowpass filter node slowly)
      const lfoFilter = ctx.createBiquadFilter();
      lfoFilter.type = 'lowpass';
      lfoFilter.frequency.value = 150;
      lfoFilter.Q.value = 2.0;

      // Slow filter sweeper LFO
      lfoNode = ctx.createOscillator();
      lfoNode.type = 'sine';
      lfoNode.frequency.value = 0.12; // 12 seconds per cycle

      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 45; // Modulates filter between 105Hz and 195Hz

      lfoNode.connect(lfoGain);
      lfoGain.connect(lfoFilter.frequency);

      ambientOsc1.connect(lfoFilter);
      ambientOsc2.connect(lfoFilter);
      lfoFilter.connect(ambientGain);

      // Start background hum
      ambientOsc1.start(0);
      ambientOsc2.start(0);
      lfoNode.start(0);

      set({
        audioCtx: ctx,
        masterGain,
        ambientGain,
        filterNode,
        isInitialized: true,
      });

      console.log('Procedural Web Audio Engine initialized.');
    } catch (e) {
      console.error('Failed to initialize Web Audio API Context:', e);
    }
  },

  playUiClick: () => {
    const ctx = get().audioCtx;
    const filter = get().filterNode;
    if (!ctx || ctx.state === 'suspended' || !filter) return;

    // Procedural short click synthesizer
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(filter);

    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  },

  playSuccessChime: () => {
    const ctx = get().audioCtx;
    const filter = get().filterNode;
    if (!ctx || ctx.state === 'suspended' || !filter) return;

    // Procedural digital success arpeggio
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.value = freq;

      const noteStart = now + idx * 0.08;
      gain.gain.setValueAtTime(0, noteStart);
      gain.gain.linearRampToValueAtTime(0.12, noteStart + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.22);

      osc.connect(gain);
      gain.connect(filter);

      osc.start(noteStart);
      osc.stop(noteStart + 0.25);
    });
  },

  playFailureSweep: () => {
    const ctx = get().audioCtx;
    const filter = get().filterNode;
    if (!ctx || ctx.state === 'suspended' || !filter) return;

    // Procedural network breach warning sweep
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.linearRampToValueAtTime(70, now + 0.35);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.14, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

    // Dynamic bandpass overlay for alert texture
    const warningFilter = ctx.createBiquadFilter();
    warningFilter.type = 'bandpass';
    warningFilter.frequency.value = 250;
    warningFilter.Q.value = 2.0;

    osc.connect(warningFilter);
    warningFilter.connect(gain);
    gain.connect(filter);

    osc.start();
    osc.stop(now + 0.4);
  },

  setFilterFrequency: (freq, rampDuration = 0.5) => {
    const { filterNode, audioCtx } = get();
    if (!filterNode) return;

    set({ filterFreq: freq });

    if (audioCtx) {
      const now = audioCtx.currentTime;
      filterNode.frequency.cancelScheduledValues(now);
      filterNode.frequency.setValueAtTime(filterNode.frequency.value, now);
      filterNode.frequency.exponentialRampToValueAtTime(freq, now + rampDuration);
    } else {
      filterNode.frequency.value = freq;
    }
  },

  setVolume: (vol) => {
    const { masterGain, isMuted } = get();
    const targetVolume = Math.max(0, Math.min(1, vol));
    
    set({ volume: targetVolume });
    if (masterGain && !isMuted) {
      masterGain.gain.value = targetVolume;
    }
  },

  toggleMute: () => {
    const { masterGain, isMuted, volume } = get();
    const nextMuted = !isMuted;
    
    set({ isMuted: nextMuted });
    if (masterGain) {
      masterGain.gain.value = nextMuted ? 0 : volume;
    }
  },
}));
export default useAudioStore;
