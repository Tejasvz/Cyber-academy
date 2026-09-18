import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Preferences {
  muted: boolean; synth: boolean; ambient: boolean; voice: boolean;
  master: number; effectsVolume: number; ambientVolume: number; voiceVolume: number;
  scanlines: boolean; reducedMotion: boolean;
}
export const defaultPreferences: Preferences = {
  muted: false, synth: true, ambient: true, voice: true,
  master: .55, effectsVolume: .65, ambientVolume: .3, voiceVolume: .8,
  scanlines: true, reducedMotion: false,
};
export const usePreferences = create<Preferences & { update: (patch: Partial<Preferences>) => void }>()(persist((set) => ({
  ...defaultPreferences,
  update: patch => set(patch),
}), { name: 'project-veil:preferences', version: 1 }));
