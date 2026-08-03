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
  playStaticNoise: (vol?: number) => void;
  stopStaticNoise: () => void;
  playBreathing: () => void;
  stopBreathing: () => void;
  playVoiceClick: (speaker?: string) => void;
  setAudioDucking: (isDucked: boolean) => void;
  threatLevel: 'exploration' | 'tension' | 'combat';
  setThreatLevel: (level: 'exploration' | 'tension' | 'combat') => void;
}

let ambientOsc1: OscillatorNode | null = null;
let ambientOsc2: OscillatorNode | null = null;
let lfoNode: OscillatorNode | null = null;

// Keep references to noise and breathing nodes
let noiseSource: AudioBufferSourceNode | null = null;
let noiseGainNode: GainNode | null = null;
let breathSource: AudioBufferSourceNode | null = null;
let breathGainNode: GainNode | null = null;
let breathInterval: any = null;

function createNoiseBuffer(ctx: AudioContext): AudioBuffer {
  const bufferSize = ctx.sampleRate * 2; // 2 seconds
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}


export const useAudioStore = create<AudioStore>((set, get) => ({
  isInitialized: false,
  isMuted: false,
  volume: 0.7,
  filterFreq: 800,
  audioCtx: null,
  masterGain: null,
  ambientGain: null,
  filterNode: null,
  threatLevel: 'exploration',

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
      ambientGain.gain.value = 0.0; // Keep background hum truly subtle
      ambientGain.connect(filterNode);

      // 2. Synthesize Procedural Ambient Reactor Hum (Aether Core background)
      // Osc 1: Deep sub-harmonic sine
      ambientOsc1 = ctx.createOscillator();
      ambientOsc1.type = 'sine';
      ambientOsc1.frequency.value = 55; // A1 note

      // Osc 2: Smooth sine octave for a deep, non-buzzing hum
      ambientOsc2 = ctx.createOscillator();
      ambientOsc2.type = 'sine';
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

  playStaticNoise: (vol = 0.05) => {
    const ctx = get().audioCtx;
    const master = get().masterGain;
    if (!ctx || !master) return;
    
    if (noiseSource) {
      try { noiseSource.stop(); } catch (e) {}
    }
    
    const buffer = createNoiseBuffer(ctx);
    noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;
    
    noiseGainNode = ctx.createGain();
    noiseGainNode.gain.setValueAtTime(vol, ctx.currentTime);
    
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 1000;
    
    noiseSource.connect(lowpass);
    lowpass.connect(noiseGainNode);
    noiseGainNode.connect(master);
    
    noiseSource.start();
  },
  
  stopStaticNoise: () => {
    if (noiseSource) {
      try { noiseSource.stop(); } catch (e) {}
      noiseSource = null;
    }
  },
  
  playBreathing: () => {
    const ctx = get().audioCtx;
    const master = get().masterGain;
    if (!ctx || !master) return;
    
    if (breathSource) return;
    
    const buffer = createNoiseBuffer(ctx);
    breathSource = ctx.createBufferSource();
    breathSource.buffer = buffer;
    breathSource.loop = true;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 250;
    filter.Q.value = 1.5;
    
    breathGainNode = ctx.createGain();
    breathGainNode.gain.value = 0.0;
    
    breathSource.connect(filter);
    filter.connect(breathGainNode);
    breathGainNode.connect(master);
    breathSource.start();
    
    const runCycle = () => {
      if (!breathGainNode || !filter) return;
      const now = ctx.currentTime;
      
      breathGainNode.gain.cancelScheduledValues(now);
      breathGainNode.gain.linearRampToValueAtTime(0.04, now + 1.8);
      filter.frequency.cancelScheduledValues(now);
      filter.frequency.exponentialRampToValueAtTime(450, now + 1.8);
      
      breathGainNode.gain.setValueAtTime(0.04, now + 2.0);
      breathGainNode.gain.linearRampToValueAtTime(0.0, now + 4.0);
      filter.frequency.setValueAtTime(450, now + 2.0);
      filter.frequency.exponentialRampToValueAtTime(200, now + 4.0);
    };
    
    runCycle();
    breathInterval = setInterval(runCycle, 4000);
  },
  
  stopBreathing: () => {
    if (breathSource) {
      try { breathSource.stop(); } catch (e) {}
      breathSource = null;
    }
    if (breathInterval) {
      clearInterval(breathInterval);
      breathInterval = null;
    }
  },

  playVoiceClick: (speaker = 'aurelia') => {
    const ctx = get().audioCtx;
    const filter = get().filterNode;
    if (!ctx || ctx.state === 'suspended' || !filter) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    let baseFreq = 1200;
    if (speaker === 'hesper' || speaker === 'vance') baseFreq = 680;
    else if (speaker === 'kaelen' || speaker === 'valkyrie' || speaker === 'cyra') baseFreq = 1550;
    else if (speaker === 'lyra' || speaker === 'solene') baseFreq = 980;

    osc.type = (speaker === 'kaelen' || speaker === 'valkyrie') ? 'sawtooth' : 'sine';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.5, now + 0.03);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    osc.connect(gain);
    gain.connect(filter);

    osc.start(now);
    osc.stop(now + 0.035);
  },

  setAudioDucking: (isDucked) => {
    const targetFreq = isDucked ? 320 : 800;
    get().setFilterFrequency(targetFreq, isDucked ? 0.2 : 0.5);
  },

  setThreatLevel: (level) => {
    const oldLevel = get().threatLevel;
    if (oldLevel === level) return;
    
    set({ threatLevel: level });
    
    const { audioCtx, ambientGain } = get();
    if (!audioCtx) return;
    
    const now = audioCtx.currentTime;
    
    if (level === 'exploration') {
      if (ambientGain) {
        ambientGain.gain.cancelScheduledValues(now);
        ambientGain.gain.linearRampToValueAtTime(0.01, now + 3);
      }
      stopTensionPulses();
      stopCombatSiren();
    } else if (level === 'tension') {
      if (ambientGain) {
        ambientGain.gain.cancelScheduledValues(now);
        ambientGain.gain.linearRampToValueAtTime(0.04, now + 2);
      }
      startTensionPulses(audioCtx, 1600);
      stopCombatSiren();
    } else if (level === 'combat') {
      if (ambientGain) {
        ambientGain.gain.cancelScheduledValues(now);
        ambientGain.gain.linearRampToValueAtTime(0.07, now + 1);
      }
      startTensionPulses(audioCtx, 800);
      startCombatSiren(audioCtx);
    }
  },
}));

let tensionInterval: any = null;
let sirenOsc: OscillatorNode | null = null;
let sirenLfo: OscillatorNode | null = null;
let sirenGainNode: GainNode | null = null;

function startTensionPulses(ctx: AudioContext, intervalMs: number) {
  stopTensionPulses();
  
  const triggerPulse = () => {
    try {
      const { filterNode, isMuted, volume } = useAudioStore.getState();
      if (!filterNode || isMuted) return;
      
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(65, now);
      osc.frequency.exponentialRampToValueAtTime(32, now + 0.7);
      
      gain.gain.setValueAtTime(0.12 * volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      
      osc.connect(gain);
      gain.connect(filterNode);
      
      osc.start(now);
      osc.stop(now + 0.8);
    } catch (e) {}
  };
  
  triggerPulse();
  tensionInterval = setInterval(triggerPulse, intervalMs);
}

function stopTensionPulses() {
  if (tensionInterval) {
    clearInterval(tensionInterval);
    tensionInterval = null;
  }
}

function startCombatSiren(ctx: AudioContext) {
  stopCombatSiren();
  
  try {
    const { filterNode, isMuted, volume } = useAudioStore.getState();
    if (!filterNode || isMuted) return;
    
    const now = ctx.currentTime;
    sirenOsc = ctx.createOscillator();
    sirenLfo = ctx.createOscillator();
    
    const lfoGain = ctx.createGain();
    sirenGainNode = ctx.createGain();
    
    sirenOsc.type = 'triangle';
    sirenOsc.frequency.setValueAtTime(450, now);
    
    sirenLfo.type = 'sine';
    sirenLfo.frequency.setValueAtTime(0.6, now);
    lfoGain.gain.setValueAtTime(100, now);
    
    sirenGainNode.gain.setValueAtTime(0.015 * volume, now);
    
    sirenLfo.connect(lfoGain);
    lfoGain.connect(sirenOsc.frequency);
    
    sirenOsc.connect(sirenGainNode);
    sirenGainNode.connect(filterNode);
    
    sirenOsc.start(now);
    sirenLfo.start(now);
  } catch (e) {}
}

function stopCombatSiren() {
  if (sirenOsc) {
    try { sirenOsc.stop(); } catch (e) {}
    sirenOsc = null;
  }
  if (sirenLfo) {
    try { sirenLfo.stop(); } catch (e) {}
    sirenLfo = null;
  }
  sirenGainNode = null;
}
export default useAudioStore;
