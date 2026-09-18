import { create } from 'zustand';
import { sound } from '../utils/audioSynth';
import { usePreferences } from './preferencesStore';

// Compatibility for legacy modules: all cues now go through the same audio bus.
export const useAudioStore = create(() => ({
  initializeAudio: sound.initialize,
  playUiClick: sound.playClick,
  playSuccessChime: sound.playSuccess,
  playFailureSweep: sound.playWarning,
  setVolume: (volume: number) => { usePreferences.getState().update({ master: Math.max(0, Math.min(1, volume)) }); sound.sync(); },
  toggleMute: () => { sound.muted = !sound.muted; },
  setThreatLevel: sound.setThreat,
  playStaticNoise: sound.playDiagnosticScan,
  stopStaticNoise: () => {},
  playBreathing: () => sound.setThreat('tension'),
  stopBreathing: () => sound.setThreat('exploration'),
  setFilterFrequency: () => {},
}));
export default useAudioStore;
